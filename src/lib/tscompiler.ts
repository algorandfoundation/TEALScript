import * as ts from 'typescript';

export default class TsCompiler {
  nodes: ts.Node[] = [];

  constructor(src: ts.SourceFile) {
    // eslint-disable-next-line no-restricted-syntax
    for (const stmt of src.statements) {
      this.processNode(stmt);
    }
  }

  processNode(n: ts.Node) {
    console.log(n);
    this.nodes.push(n);
  }
}
