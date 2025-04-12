/* eslint-disable no-console */

import * as ts from 'ts-morph';
import { getExpressionChain } from './utils';

function includesNode(haystack: ts.Node, needle: ts.Node): boolean {
  if (haystack.getText() === needle.getText()) return true;
  if (haystack.isKind(ts.SyntaxKind.ArrayLiteralExpression)) {
    return haystack.getElements().some((e) => {
      return includesNode(e, needle);
    });
  }

  if (haystack.isKind(ts.SyntaxKind.ObjectLiteralExpression)) {
    return haystack.getProperties().some((p) => {
      // TODO:(puya) Support short-hand
      if (!p.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
      const val = p.getInitializer();
      return val && includesNode(val, needle);
    });
  }

  if (
    !haystack.isKind(ts.SyntaxKind.PropertyAccessExpression) &&
    !haystack.isKind(ts.SyntaxKind.ElementAccessExpression)
  )
    return false;

  const chain = getExpressionChain(haystack);

  return [chain.base, ...chain.chain].some((e) => {
    return e.getText() === needle.getText();
  });
}

function getNodeLines(node: ts.Node, pathStr: string) {
  const refFullLine = node.getSourceFile().getFullText().split('\n')[node.getStartLineNumber() - 1].trim();

  return `${pathStr}:${node.getStartLineNumber()}:${
    ts.ts.getLineAndCharacterOfPosition(node.getSourceFile().compilerNode, node.getPos()).character
  }\n  ${refFullLine}`;
}

function getAliases(node: ts.Node, methodBody: ts.Node) {
  const aliases: ts.Node[] = [node];
  methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).forEach((variable) => {
    const init = variable.getInitializer();
    if (init && node.getText() === init.getText()) {
      aliases.push(variable.getNameNode());
    }
  });
  return aliases;
}

function referencesInObjectLiterals(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).forEach((variable) => {
    if (variable.getInitializer()?.isKind(ts.SyntaxKind.ObjectLiteralExpression)) {
      const obj = variable.getInitializer() as ts.ObjectLiteralExpression;
      obj.getProperties().forEach((p) => {
        // TODO:(puya) Support short-hand
        if (!p.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
        const val = p.getInitializer();
        if (val && includesNode(val, node)) {
          nodes.push(variable.getNameNode());
        }
      });
    }
  });

  return nodes;
}

function referencesInArrayLiterals(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).forEach((variable) => {
    if (variable.getInitializer()?.isKind(ts.SyntaxKind.ArrayLiteralExpression)) {
      const array = variable.getInitializer() as ts.ArrayLiteralExpression;
      array.getElements().forEach((element) => {
        if (includesNode(element, node)) {
          nodes.push(variable.getNameNode());
        }
      });
    }
  });
  return nodes;
}

function mutationByAssignment(node: ts.Node, methodBody: ts.Node) {
  const mutations: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.BinaryExpression).forEach((n) => {
    if (n.getOperatorToken().getText() !== '=') return;
    if (includesNode(n.getLeft(), node)) {
      mutations.push(n);
    }
  });

  return mutations;
}

function isAlias(a: ts.Node, b: ts.Node, methodBody: ts.Node) {
  return getAliases(a, methodBody).includes(b) || getAliases(b, methodBody).includes(a);
}

export function checkRefs(file: ts.SourceFile, pathStr: string) {
  file.getDescendantsOfKind(ts.SyntaxKind.MethodDeclaration).forEach((method) => {
    const methodBody = method.getBody();
    if (!methodBody) return;
    const variables = methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration);
    variables.forEach((variable) => {
      const aliases = getAliases(variable.getNameNode(), methodBody);
      const refs: ts.Node[] = [];

      aliases.forEach((alias) => {
        refs.push(
          ...[...referencesInArrayLiterals(alias, methodBody), ...referencesInObjectLiterals(alias, methodBody)]
        );
      });

      const mutations: ts.Node[] = [];

      [...aliases, ...refs].forEach((ref) => {
        const refMutations = mutationByAssignment(ref, methodBody);

        refMutations.forEach((m) => {
          // All non-alias references that came before the mutation are now stale
          const staleRefs = [...aliases, ...refs].filter(
            (r) => r !== ref && r.getPos() < m.getPos() && !isAlias(r, ref, methodBody)
          );

          staleRefs.forEach((r) => {
            methodBody.getDescendantsOfKind(r.getKind()).forEach((d) => {
              if (d.getPos() >= m.getPos() && d.getText() === r.getText()) throw Error(getNodeLines(d, pathStr));
            });
          });
        });
        mutations.push(...refMutations);
      });
    });
  });
}
