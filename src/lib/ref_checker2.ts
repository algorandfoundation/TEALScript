/* eslint-disable no-console */
/* eslint-disable no-use-before-define */

import * as ts from 'ts-morph';
import path from 'path';
import { getExpressionChain } from './utils';

const LIB_DIR = path.normalize(__dirname);
const TYPES_DIR = path.normalize(path.join(__dirname, '..', '..', 'types'));

const AVM_OBJECT_TYPES = ['Address', 'AppID', 'AssetID', 'ECDSAPubKey', 'Txn[]'];

function isArrayOrObject(node: ts.Node) {
  const type = node.getType();
  const typeText = type.getText();

  if (AVM_OBJECT_TYPES.includes(typeText)) return false;

  return type.isArray() || type.isObject();
}

function throwError(
  ref: ts.Node,
  staleRef: ts.Node,
  aliases: ts.Node[],
  mutation: ts.Node,
  access: ts.Node,
  strPath: string,
  mutationType: 'function' | 'assignment'
) {
  const mutationLine = getNodeLines(mutation, strPath);
  const accessLine = getNodeLines(access, strPath);

  if (mutationType === 'assignment') {
    const refRhs =
      staleRef.getFirstAncestorByKind(ts.SyntaxKind.BinaryExpression)?.getRight() ??
      ref.getFirstAncestorByKind(ts.SyntaxKind.BinaryExpression)?.getRight() ??
      ref.getParentIfKind(ts.SyntaxKind.VariableDeclaration)?.getInitializer();

    if (refRhs === undefined) {
      throw Error(
        `Attempted to access "${access.getText()}" which may have been mutated.\nMutation: ${mutationLine}\nAccessed: ${accessLine}`
      );
    }

    const aliasInRef = refRhs.isKind(ts.SyntaxKind.Identifier)
      ? refRhs
      : refRhs.getDescendants().find((d) => aliases.map((a) => a.getText()).includes(d.getText()))!;
    const staleRefLine = getNodeLines(aliasInRef!, strPath);
    throw Error(
      `Attempted to access "${access.getText()}" which may have been mutated. You might want to use clone in the initial assignment\nAssignment: ${staleRefLine} Suggestion: clone(${aliasInRef.getText()})\nMutation: ${mutationLine}\nAccessed: ${accessLine}`
    );
  }

  if (mutationType === 'function') {
    throw Error(
      `Attempted to access "${access.getText()}" after it was passed to a function. You probably want to use clone in the function call\nFunction Call: ${mutationLine} Suggestion: clone(${access.getText()})\nAccessed: ${accessLine}`
    );
  }
}

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
  const nonTrimmedLine = node.getSourceFile().getFullText().split('\n')[node.getStartLineNumber() - 1];
  const refFullLine = nonTrimmedLine.trim();
  const char = ts.ts.getLineAndCharacterOfPosition(
    node.getSourceFile().compilerNode,
    node.getNonWhitespaceStart()
  ).character;
  const nodeOffset = char - (nonTrimmedLine.length - refFullLine.length);

  return `${pathStr}:${node.getStartLineNumber()}:${char}\n  ${refFullLine}\n  ${' '.repeat(nodeOffset)}${'^'.repeat(
    node.getText().length
  )}`;
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

function referencesInAssignment(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];
  methodBody.getDescendantsOfKind(ts.SyntaxKind.BinaryExpression).forEach((assignment) => {
    if (assignment.getOperatorToken().getText() !== '=') return;

    const rhs = assignment.getRight();
    const lhs = assignment.getLeft();

    let lhsBase: ts.Node = lhs;

    if (lhs.isKind(ts.SyntaxKind.PropertyAccessExpression) || lhs.isKind(ts.SyntaxKind.ElementAccessExpression)) {
      const chain = getExpressionChain(lhs);
      lhsBase = chain.base;
      if (lhsBase.getText() === 'this') {
        [lhsBase] = chain.chain;
      }
    }

    if (!isArrayOrObject(rhs)) return;
    if (includesNode(rhs, node)) {
      nodes.push(lhsBase);
    }
  });

  return nodes;
}

function isFromCompiler(node: ts.Node): boolean {
  return (
    node
      .getType()
      .getSymbol()
      ?.getDeclarations()
      .some((m) => {
        const declPath = path.normalize(m.getSourceFile().getFilePath());
        return declPath.includes(LIB_DIR) || declPath.includes(TYPES_DIR);
      }) || false
  );
}

function mutationByFunction(node: ts.Node, methodBody: ts.Node) {
  const args: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.CallExpression).forEach((call) => {
    if (call.getExpression().getText() === 'clone') return;
    if (isFromCompiler(call.getExpression())) return;
    call.getArguments().forEach((arg) => {
      if (!isArrayOrObject(arg)) return;
      if (includesNode(arg, node)) {
        args.push(arg);
      }
    });
  });

  return args;
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

function checkArrayFunctions(methodBody: ts.Node, pathStr: string) {
  methodBody.getDescendantsOfKind(ts.SyntaxKind.CallExpression).forEach((c) => {
    const expr = c.getExpression();
    if (expr.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
      const propExpr = expr.getExpression();
      if (propExpr.getType().isArray() && expr.getName() === 'push') {
        const arg = c.getArguments()[0];
        if (isArrayOrObject(arg) && !arg.getText().startsWith('clone(')) {
          const msg = `Mutable objects must be cloned via "clone" before being pushed into an array`;
          throw Error(`${msg}\n${getNodeLines(arg, pathStr)} Suggestion: clone(${arg.getText()})`);
        }
      }
    }
  });
}

export function checkRefs(file: ts.SourceFile, pathStr: string) {
  file.getDescendantsOfKind(ts.SyntaxKind.MethodDeclaration).forEach((method) => {
    const methodBody = method.getBody();
    if (!methodBody) return;

    checkArrayFunctions(methodBody, pathStr);
    const variables = methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration);
    variables.forEach((variable) => {
      if (!isArrayOrObject(variable)) return;
      const aliases = getAliases(variable.getNameNode(), methodBody);
      const refs: ts.Node[] = [];

      aliases.forEach((alias) => {
        refs.push(
          ...[
            ...referencesInArrayLiterals(alias, methodBody),
            ...referencesInObjectLiterals(alias, methodBody),
            ...referencesInAssignment(alias, methodBody),
          ]
        );
      });

      const mutations: ts.Node[] = [];

      [...aliases, ...refs].forEach((originalRef) => {
        const refMutations = mutationByAssignment(originalRef, methodBody);

        refMutations.forEach((mutation) => {
          // All non-alias references that came before the mutation are now stale
          const staleRefs = [...aliases, ...refs].filter((r) => {
            return (
              r !== originalRef &&
              r.getPos() < mutation.getPos() &&
              originalRef.getPos() < mutation.getPos() &&
              !isAlias(r, originalRef, methodBody)
            );
          });

          staleRefs.forEach((staleRef) => {
            methodBody.getDescendantsOfKind(staleRef.getKind()).forEach((access) => {
              if (access.getPos() > mutation.getEnd() && access.getText() === staleRef.getText()) {
                throwError(originalRef, staleRef, [...aliases, ...refs], mutation, access, pathStr, 'assignment');
              }
            });
          });
        });

        const functionMutations = mutationByFunction(originalRef, methodBody);
        functionMutations.forEach((mutation) => {
          // All non-alias references that came before the mutation are now stale
          const staleRefs = [...aliases, ...refs].filter((r) => r.getPos() < mutation.getPos());

          staleRefs.forEach((staleRef) => {
            methodBody.getDescendantsOfKind(staleRef.getKind()).forEach((access) => {
              if (access.getPos() > mutation.getPos() && access.getText() === staleRef.getText())
                throwError(originalRef, staleRef, [...aliases, ...refs], mutation, access, pathStr, 'function');
            });
          });
        });
        mutations.push(...refMutations);
      });
    });
  });
}
