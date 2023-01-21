/* eslint-disable class-methods-use-this */
import * as ts from 'typescript';

export default class TsCompiler {
  teal: string[] = [];

  constructor(src: ts.SourceFile) {
    // eslint-disable-next-line no-restricted-syntax
    for (const stmt of src.statements) {
      const translated = this.translateNode(stmt);
      this.teal.push(...translated);
    }
  }

  translateNode(n: ts.Node): string[] {
    // https://github.com/microsoft/TypeScript/blob/7c14aff09383f3814d7aae1406b5b2707b72b479/lib/typescript.d.ts#L78
    let translatedTeal: string[] = [];
    switch (n.kind) {
      case ts.SyntaxKind.NumericLiteral:
        translatedTeal = this.translateNumericLiteral(n as ts.NumericLiteral);
        break;
      case ts.SyntaxKind.ClassDeclaration:
        translatedTeal = this.translateClassDeclaration(n as ts.ClassDeclaration);
        break;
      case ts.SyntaxKind.BinaryExpression:
        translatedTeal = this.translateBinaryExpression(n as ts.BinaryExpression);
        break;
      case ts.SyntaxKind.VariableStatement:
        translatedTeal = this.translateVariableStatement(n as ts.VariableStatement);
        break;
      case ts.SyntaxKind.VariableDeclaration:
        translatedTeal = this.translateVariableDeclaration(n as ts.VariableDeclaration);
        break;
      case ts.SyntaxKind.VariableDeclarationList:
        translatedTeal = this.translateVariableDeclarationList(n as ts.VariableDeclarationList);
        break;
      case ts.SyntaxKind.PlusToken:
        translatedTeal = ['+'];
        break;
      default:
        console.log('no translator for : ', n.kind);
        break;
    }
    return translatedTeal;
  }

  translateNumericLiteral(n: ts.NumericLiteral): string[] {
    return [`int ${n.text}`];
  }

  translateVariableStatement(n: ts.VariableStatement): string[] {
    // Raise error? just init a scratch var?
    const init = this.translateNode(n.declarationList);
    return [...init];
  }

  translateVariableDeclarationList(n: ts.VariableDeclarationList): string[] {
    const teal: string[] = [];
    n.declarations.forEach((d) => {
      teal.push(...this.translateNode(d));
    });
    return teal;
  }

  translateVariableDeclaration(n: ts.VariableDeclaration): string[] {
    // Raise error? just init a scratch var?
    if (n.initializer === undefined) return [];
    const init = this.translateNode(n.initializer);
    return [...init];
  }

  translateBinaryExpression(n: ts.BinaryExpression): string[] {
    const left = this.translateNode(n.left);
    const right = this.translateNode(n.right);
    const op = this.translateNode(n.operatorToken);
    return [...left, ...right, ...op];
  }

  translateClassDeclaration(n: ts.ClassDeclaration): string[] {
    console.log(n);
    return [];
  }
}
