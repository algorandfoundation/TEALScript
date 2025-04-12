import * as ts from 'ts-morph';
import { getExpressionChain } from './utils';

/** Compare two nodes to see if they both access the same data */
function nodesAccessSameData(aNode: ts.Node, bNode: ts.Node): boolean {
  if (aNode === bNode) return false;
  if (aNode.getText() === bNode.getText()) return true;

  let aChain: ts.Node[];
  let bChain: ts.Node[];

  if (aNode.isKind(ts.SyntaxKind.ElementAccessExpression) || aNode.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
    const chain = getExpressionChain(aNode);
    aChain = [chain.base, ...chain.chain];
  } else {
    aChain = [aNode];
  }

  if (bNode.isKind(ts.SyntaxKind.ElementAccessExpression) || bNode.isKind(ts.SyntaxKind.ElementAccessExpression)) {
    const chain = getExpressionChain(bNode);
    bChain = [chain.base, ...chain.chain];
  } else {
    bChain = [bNode];
  }

  const aTextChain = aChain.map((a) => a.getText());
  const bTextChain = bChain.map((b) => b.getText());

  const hasMatch =
    aTextChain.some((a) => {
      return bTextChain.includes(a);
    }) ||
    bTextChain.some((b) => {
      return aTextChain.includes(b);
    });

  return hasMatch;
}

/** Expressions that access (read or write) the array */
function arrayOrObjAccess(node: ts.Node, methodBody: ts.Node) {
  const elementExpr = methodBody.getDescendantsOfKind(ts.SyntaxKind.ElementAccessExpression);
  const propExpr = methodBody.getDescendantsOfKind(ts.SyntaxKind.PropertyAccessExpression);

  const nodes: ts.Node[] = [];
  [...elementExpr, ...propExpr].forEach((n) => {
    const chain = getExpressionChain(n);

    [chain.base, ...chain.chain].forEach((e) => {
      if (nodesAccessSameData(e, node)) {
        nodes.push(e);
      }
    });
  });

  return nodes;
}

const AVM_OBJECT_TYPES = ['Address', 'AppID', 'AssetID'];

function isArrayOrObject(node: ts.Node) {
  const type = node.getType();
  const typeText = type.getText();

  if (AVM_OBJECT_TYPES.includes(typeText)) return false;

  return type.isArray() || type.isObject();
}

/** References to the node created in an array literal expression */
function referencesInArrayLiteral(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.ArrayLiteralExpression).forEach((n) => {
    n.getElements().forEach((e) => {
      if (!isArrayOrObject(e)) return;
      if (nodesAccessSameData(e, node)) {
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
      if (value && !isArrayOrObject(value)) return;
      if (value && nodesAccessSameData(node, value)) {
        nodes.push(value);
      }
    });
  });

  return nodes;
}

/** References to the node created by a variable declaration */
function referencesInVariableDeclaration(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).forEach((n) => {
    const val = n.getInitializer();
    const valType = val?.getType();

    if (!valType?.isArray() && !valType?.isObject()) {
      return;
    }

    if (val && nodesAccessSameData(val, node)) {
      nodes.push(val);
    }
  });

  return nodes;
}

/** References to the node in value assignment */
function referencesInAssignment(node: ts.Node, methodBody: ts.Node) {
  const nodes: ts.Node[] = [];

  methodBody.getDescendantsOfKind(ts.SyntaxKind.BinaryExpression).forEach((n) => {
    if (n.getOperatorToken().getText() !== '=') return;

    if (nodesAccessSameData(n.getRight(), node)) {
      nodes.push(n.getRight());
    }
  });

  methodBody.getDescendantsOfKind(ts.SyntaxKind.VariableDeclaration).forEach((n) => {
    const val = n.getInitializer();

    if (val && nodesAccessSameData(val, node)) {
      nodes.push(val);
    }
  });

  return nodes;
}

function getNodeLines(node: ts.Node, pathStr: string) {
  const refFullLine = node.getSourceFile().getFullText().split('\n')[node.getStartLineNumber() - 1].trim();

  return `${pathStr}:${node.getStartLineNumber()}:${
    ts.ts.getLineAndCharacterOfPosition(node.getSourceFile().compilerNode, node.getPos()).character
  }\n  ${refFullLine}`;
}

function checkFunctionArgs(node: ts.Node, methodBody: ts.Node, pathStr: string) {
  const calls = methodBody.getDescendantsOfKind(ts.SyntaxKind.CallExpression);

  calls.forEach((c) => {
    c.getArguments().forEach((a) => {
      if (nodesAccessSameData(a, node)) {
        const callParent = a.getParentIfKind(ts.SyntaxKind.CallExpression);
        const expr = callParent?.getExpressionIfKind(ts.SyntaxKind.Identifier);

        if (callParent && expr?.getText() === 'clone') {
          return;
        }

        throw Error(
          `Cannot pass reference to a function. Use clone to create a deep copy: clone(${node.getText()})\n${getNodeLines(
            a,
            pathStr
          )}`
        );
      }
    });
  });
}

/** Given a node, return the non-dynamic chain. For example, `arr[0][i]` returns `arr[0]`.
 * This is required because we want to be pessimistic about dynamic array access
 * */
function getNonDynamicNode(node: ts.Node): ts.Node {
  if (!node.isKind(ts.SyntaxKind.ElementAccessExpression) && !node.isKind(ts.SyntaxKind.CallExpression)) {
    return node;
  }

  const chain = getExpressionChain(node);
  let currentNode = chain.base;
  let foundDynamic = false;

  chain.chain.forEach((e) => {
    if (foundDynamic) return;
    if (!e.isKind(ts.SyntaxKind.ElementAccessExpression)) {
      currentNode = e;
      return;
    }

    const arg = e.getArgumentExpression()?.getText() ?? Number.NaN;

    if (Number.isNaN(Number(arg))) {
      foundDynamic = true;
    }
  });

  return currentNode;
}

const TEALSCRIPT_STATE_TYPES = ['GlobalStateValue', 'BoxValue'];
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
      .map(getNonDynamicNode)
      .filter((n) => {
        if (AVM_OBJECT_TYPES.includes(n.getType().getText())) return false;

        // eslint-disable-next-line
        for (const t of TEALSCRIPT_STATE_TYPES) {
          if (n.getType().getText().startsWith(`${t}<`)) return false;
        }

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
      checkFunctionArgs(n, body, pathStr);
      const accessNodes = arrayOrObjAccess(n, body).map(getNonDynamicNode);

      const referenceNodes = [
        ...referencesInArrayLiteral(n, body),
        ...referencesInObjectLiteral(n, body),
        ...referencesInVariableDeclaration(n, body),
        ...referencesInAssignment(n, body),
      ]
        .filter((r) => !AVM_OBJECT_TYPES.includes(r.getType().getText()))
        .map(getNonDynamicNode);

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
