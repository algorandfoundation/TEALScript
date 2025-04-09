import * as ts from 'ts-morph';

export type ExpressionChainNode = ts.ElementAccessExpression | ts.PropertyAccessExpression | ts.CallExpression;

/**
 *
 * @param node The top level node to process
 * @param chain The existing expression chain to add to
 * @returns The base expression and reversed expression chain `this.txn.sender` ->
 * `{ chain: [this.txn, this.txn.sender], base: [this] }`
 */
export function getExpressionChain(
  node: ExpressionChainNode,
  chain: ExpressionChainNode[] = []
): { chain: ExpressionChainNode[]; base: ts.Node } {
  chain.push(node);

  /**
   * The expression on the given node
   * `this.txn.sender` -> `this.txn`
   */
  let expr: ts.Expression = node.getExpression();

  /* this.txn.applicationArgs! -> this.txn.applicationArgs */
  if (expr.isKind(ts.SyntaxKind.NonNullExpression)) {
    expr = expr.getExpression();
  }

  if (
    expr.isKind(ts.SyntaxKind.ElementAccessExpression) ||
    expr.isKind(ts.SyntaxKind.PropertyAccessExpression) ||
    expr.isKind(ts.SyntaxKind.CallExpression)
  ) {
    return getExpressionChain(expr, chain);
  }

  chain.reverse();
  return { base: expr, chain };
}
