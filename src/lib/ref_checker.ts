import * as ts from 'ts-morph';
import path from 'path';
import { getExpressionChain } from './compiler';

/** Expressions that access (read or write) the array */
function arrayOrObjAccess(node: ts.Node, methodBody: ts.Node) {
  const elementExpr = methodBody.getDescendantsOfKind(ts.SyntaxKind.ElementAccessExpression);
  const propExpr = methodBody.getDescendantsOfKind(ts.SyntaxKind.PropertyAccessExpression);

  const nodes: ts.Node[] = [];
  [...elementExpr, ...propExpr].forEach((n) => {
    const chain = getExpressionChain(n);

    [chain.base, ...chain.chain].forEach((e) => {
      if (e.getText() === node.getText() && e.getPos() !== node.getPos()) {
        nodes.push(e);
      }
    });
  });

  return nodes;
}

/** References to the node created in an array literal expression */
function referencesInArrayLiteral(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.ArrayLiteralExpression).forEach((n) => {
    n.getElements().forEach((e) => {
      if (e.getText() === node.getText() && e !== node) {
        nodes.push(e);
      }
    });
  });

  return nodes;
}

/** References to the node created in an object literal expression */
function referencesInObjectLiteral(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression).forEach((n) => {
    n.getProperties().forEach((e) => {
      // TODO: Support short-hand
      if (!e.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
      const value = e.getInitializer();
      if (value?.getText() === node.getText() && value !== node) {
        nodes.push(value);
      }
    });
  });

  return nodes;
}

const AVM_OBJECT_TYPES = ['Address', 'AppID', 'AssetID'];

/** References to the node created by a variable declaration */
function referencesInVariableDeclaration(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).forEach((n) => {
    const val = n.getInitializer();
    const valType = val?.getType();

    if (!valType?.isArray() && !valType?.isObject()) {
      return;
    }

    if (val?.getText() === node.getText() && val !== node) {
      nodes.push(val);
    }
  });

  return nodes;
}

function getNodeLines(node: ts.Node, pathStr: string) {
  const refFullLine = node.getSourceFile().getFullText().split('\n')[node.getStartLineNumber() - 1].trim();

  return `${pathStr}:${node.getStartLineNumber()}:\n  ${refFullLine}`;
}

function isCloned(node: ts.Node) {
  const callParent = node.getParentIfKind(ts.SyntaxKind.CallExpression);
  const expr = callParent?.getExpressionIfKind(ts.SyntaxKind.Identifier);
  return callParent && expr?.getText() === 'clone';
}

export function checkRefs(file: ts.SourceFile, pathStr: string) {
  file.getDescendantsOfKind(ts.SyntaxKind.MethodDeclaration).forEach((m) => {
    const body = m.getBody()!;
    const mutableValues = [
      // TODO: We get variables from declaration, but also need to support destructuring
      ...body.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).map((v) => v.getNameNode()),
      ...body.getDescendantsOfKind(ts.SyntaxKind.PropertyAccessExpression),
      ...body.getDescendantsOfKind(ts.SyntaxKind.ElementAccessExpression),
    ]
      .filter((n) => n.getType().isArray() || n.getType().isObject())
      .filter((n) => {
        if (n.isKind(ts.SyntaxKind.Identifier)) {
          const callParent = n.getFirstAncestorByKind(ts.SyntaxKind.CallExpression);
          const expr = callParent?.getExpression();

          // filter out function names in property access expressions
          if (expr?.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
            return expr.getNameNode() !== n;
          }

          // filter out function names
          if (expr?.isKind(ts.SyntaxKind.Identifier)) {
            return expr !== n;
          }
        }

        // filter out function calls on property access expressions
        if (n.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          const callParent = n.getFirstAncestorByKind(ts.SyntaxKind.CallExpression);
          const expr = callParent?.getExpression();

          return expr !== n;
        }

        return true;
      });

    mutableValues.forEach((n) => {
      const accessNodes = arrayOrObjAccess(n, body);

      accessNodes.forEach((a) => {
        if (
          a.getParentIfKind(ts.SyntaxKind.CallExpression) &&
          !isCloned(a) &&
          !AVM_OBJECT_TYPES.includes(a.getType().getText())
        ) {
          throw Error(
            `Cannot pass reference to a function. Use clone to create a deep copy: clone(${n.getText()})\n${getNodeLines(
              a,
              pathStr
            )}`
          );
        }
      });

      const referenceNodes = [
        ...referencesInArrayLiteral(n, body),
        ...referencesInObjectLiteral(n, body),
        ...referencesInVariableDeclaration(n, body),
      ].filter((r) => !AVM_OBJECT_TYPES.includes(r.getType().getText()));

      referenceNodes.forEach((ref) => {
        const violator = [...referenceNodes, ...accessNodes].find((v) => v.getPos() > ref.getPos());

        if (violator !== undefined) {
          const refLines = `Initial reference at ${getNodeLines(ref, pathStr)}`;
          const violatorIsReference = referenceNodes.includes(violator);
          const violatorLines = `${violatorIsReference ? 'Second reference' : 'Access'} at ${getNodeLines(
            violator,
            pathStr
          )}`;

          throw new Error(
            `Cannot access or create a reference to an mutable type (${n
              .getType()
              .getText()}) that already has multiple references. You might want to use "clone" to create a deep copy instead of creating a reference to the same array: clone(${ref.getText()}).\n\n${refLines}\n${violatorLines}`
          );
        }
      });
    });
  });
}
