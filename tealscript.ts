import * as fs from 'fs';
import * as parser from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

// TODO import opcode spec
const OPCODES = ['log', 'itob'];

export class Account {
  balance: number;

  hasBalance: number;
}

export class Contract {
  box: {[key: string]: string};

  btoi(bytes: string | Account): number {
    return 0;
  }

  itob(int: number): string {
    return '';
  }

  log(bytes: string | Account): void {}
}

export class Compiler {
  teal = [];

  scratch = {};

  scratchIndex = 0;

  unprocessedNodes = [];

  functionReturnType = 'string';

  ifCount = 0;

  constructor(filename: string) {
    const tree = parser.parse(fs.readFileSync(filename, 'utf-8'), { loc: true });

    tree.body.forEach((body: any) => {
      if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract') {
        this.processNode(body);
      }
    });
  }

  private maybeValue(opcode: string) {
    this.teal.push(opcode);
    this.teal.push('swap');
    this.teal.push('pop');
  }

  private hasMaybeValue(opcode: string) {
    this.teal.push(opcode);
    this.teal.push('pop');
  }

  private readonly TYPE_FUNCTIONS = {
    Account: {
      balance: () => {
        this.maybeValue('acct_params_get AcctBalance');
      },
      hasBalance: () => {
        this.hasMaybeValue('acct_params_get AcctBalance');
      },
    },
  };

  private processIfStatement(node: any, elseIfCount: number = 0) {
    if (elseIfCount === 0) {
      this.teal.push(`if${this.ifCount}_condition:`);
    } else {
      this.teal.push(`if${this.ifCount}_elseif${elseIfCount}_condition:`);
    }

    this.processNode(node.test);

    if (node.alternate == null) {
      this.teal.push(`bz if${this.ifCount}_end`);
      this.processNode(node.consequent);
    } else if (node.alternate.type === AST_NODE_TYPES.IfStatement) {
      this.teal.push(`bz if${this.ifCount}_elseif${elseIfCount + 1}_condition`);
      this.processNode(node.consequent);
      this.teal.push(`b if${this.ifCount}_end`);
      this.processIfStatement(node.alternate, elseIfCount + 1);
    } else {
      this.teal.push(`bz if${this.ifCount}_end`);
      this.processNode(node.alternate);
    }

    if (elseIfCount === 0) {
      this.teal.push(`if${this.ifCount}_end:`);
      this.ifCount += 1;
    }
  }

  private processFunction(fn: any) {
    let argCount = -1;
    fn.params.forEach((p: any) => {
      this.teal.push(`txna ApplicationArgs ${argCount += 1}`);
      let type = 'any';

      switch (p.typeAnnotation.typeAnnotation.type) {
        case 'TSNumberKeyword':
          type = 'uint64';
          this.teal.push('btoi');
          break;
        default:
          type = p.typeAnnotation.typeAnnotation.typeName.name;
          if (['Account', 'Asset', 'App'].includes(type)) this.teal.push(`txnas ${type}s`);
          break;
      }

      this.teal.push(`store ${this.scratchIndex} // ${p.name}: ${type}`);
      this.scratch[p.name] = {};
      this.scratch[p.name].index = this.scratchIndex;
      this.scratch[p.name].type = type;
      this.scratchIndex += 1;
    });

    this.functionReturnType = fn.returnType.typeAnnotation.type;
    this.processNode(fn.body);
    this.functionReturnType = 'string';
  }

  private processNode(node: any) {
    switch (node.type) {
      case AST_NODE_TYPES.MethodDefinition:
        this.teal.push(`${node.key.name}:`);
        this.processNode(node.value);
        break;
      case AST_NODE_TYPES.ClassBody:
        node.body.forEach((b: any) => { this.processNode(b); });
        break;
      case AST_NODE_TYPES.ClassDeclaration:
        this.processNode(node.body);
        break;
      case AST_NODE_TYPES.FunctionExpression:
        this.processFunction(node);
        break;
      case AST_NODE_TYPES.BlockStatement:
        node.body.forEach((b: any) => { this.processNode(b); });
        break;
      case AST_NODE_TYPES.ReturnStatement:
        this.processNode(node.argument);
        if (['TSNumberKeyword', 'Asset', 'App'].includes(this.functionReturnType)) this.teal.push('itob');

        this.teal.push('byte 0x151f7c75');
        this.teal.push('swap');
        this.teal.push('concat');
        break;
      case AST_NODE_TYPES.BinaryExpression:
        this.processNode(node.left);
        this.processNode(node.right);
        this.teal.push(node.operator.replace('===', '=='));

        break;
      case AST_NODE_TYPES.LogicalExpression:
        this.processNode(node.left);
        this.processNode(node.right);
        this.teal.push(node.operator);
        break;
      case AST_NODE_TYPES.Identifier:
        const { type, index } = this.scratch[node.name];
        this.teal.push(`load ${index} // ${node.name}: ${type}`);
        break;
      case AST_NODE_TYPES.VariableDeclaration:
        node.declarations.forEach((d: any) => { this.processNode(d); });
        break;
      case AST_NODE_TYPES.VariableDeclarator:
        const { name } = node.id;

        let varType: string = typeof node.init.value;
        this.processNode(node.init);

        const numberTypes = [AST_NODE_TYPES.LogicalExpression, AST_NODE_TYPES.BinaryExpression];
        if (numberTypes.includes(node.init.type)) {
          varType = 'uint64';
        }

        varType = varType.replace('string', 'bytes').replace('number', 'uint64');

        this.scratch[name] = {
          index: this.scratchIndex,
          type: varType,
        };

        this.teal.push(`store ${this.scratchIndex} // ${name}: ${varType}`);
        break;
      case AST_NODE_TYPES.ExpressionStatement:
        this.processNode(node.expression);
        break;
      case AST_NODE_TYPES.CallExpression:
        node.arguments.forEach((a) => this.processNode(a));

        if (node.callee.object.type === AST_NODE_TYPES.ThisExpression) {
          if (OPCODES.includes(node.callee.property.name)) {
            this.teal.push(node.callee.property.name);
          } else {
            this.unprocessedNodes.push(node);
          }
        } else {
          this.unprocessedNodes.push(node);
        }
        break;
      case AST_NODE_TYPES.MemberExpression:
        const s = this.scratch[node.object.name];
        this.teal.push(`load ${s.index} // ${node.object.name}: ${s.type}`);
        this.TYPE_FUNCTIONS[this.scratch[node.object.name].type][node.property.name]();
        break;
      case AST_NODE_TYPES.Literal:
        const litType = typeof node.value;
        if (litType === 'string') {
          this.teal.push(`byte "${node.value}"`);
        } else {
          this.teal.push(`int ${node.value}`);
        }
        break;
      case AST_NODE_TYPES.IfStatement:
        this.processIfStatement(node);
        break;

      default:
        this.unprocessedNodes.push(node);
        break;
    }
  }
}
