/* eslint-disable max-classes-per-file */
import * as fs from 'fs';
import * as parser from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import path from 'path';
import * as langspec from './langspec.json';

function capitalizeFirstChar(str: string) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

const TYPES = {
  global: {
    minTxnFee: 'uint64',
    minBalance: 'uint64',
    maxTxnLife: 'uint64',
    zeroAddress: 'Account',
    groupSize: 'uint64',
    logicSigVersion: 'uint64',
    round: 'uint64',
    latestTimestamp: 'uint64',
    currentApplication: 'Application',
    creatorAddress: 'Account',
    currentApplicationAddress: 'Account',
    groupID: 'bytes',
    groupIndex: 'uint64',
    opcodeBudget: 'uint64',
    callerApplication: 'Application',
    callerApplicationAddress: 'Account',
  },
  txn: {
    fee: 'uint64',
    sender: 'Account',
    rekeyTo: 'Account',
    note: 'bytes',
    applicationID: 'Application',
    onComplete: 'bytes',
    approvalProgram: 'bytes',
    clearStateProgram: 'bytes',
    globalNumByteSlice: 'uint64',
    globalNumUint: 'uint64',
    localNumByteSlice: 'uint64',
    localNumUint: 'uint64',
    amount: 'uint64',
    receiver: 'Account',
    closeRemainderTo: 'Account',
  },
  itxn: {
    createdApplicationID: 'Application',
  },
};

interface OpSpec {
  Opcode: number;
  Name: string;
  Size: number;
  Doc: string;
  Groups: string[];
  Args: string;
  Returns: string;
  DocExtra: string;
  ImmediateNote: string;
  ArgEnum: string[];
  ArgEnumTypes: string;
}

interface StorageProp {
  type: string
  key?: string
  defaultSize?: number
  keyType: string
  valueType: string
}

interface Subroutine {
  name: string
  returnType: string
}
export class Compiler {
  teal: any[];

  scratch: any;

  scratchIndex: number;

  ifCount: number;

  filename: string;

  content: string;

  processErrorNodes: any[];

  frame: any;

  currentSubroutine: Subroutine;

  abi: any;

  storageProps: {[key: string]: StorageProp};

  lastType: string | undefined;

  constructor(filename: string, className: string) {
    this.filename = filename;
    this.content = fs.readFileSync(this.filename, 'utf-8');
    this.teal = ['#pragma version 8', 'b main'];
    this.scratch = {};
    this.scratchIndex = 0;
    this.ifCount = 0;
    this.processErrorNodes = [];
    this.frame = {};
    this.currentSubroutine = { name: '', returnType: '' };
    this.storageProps = {};

    const tree = parser.parse(this.content, { range: true, loc: true });

    tree.body.forEach((body: any) => {
      if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract' && body.id.name === className) {
        this.abi = { name: body.id.name, desc: '', methods: [] };

        this.processNode(body);
      }
    });

    if (!this.teal.includes('main:')) {
      this.teal.push('main:');
      this.routeAbiMethods();
    }
  }

  private routeAbiMethods() {
    this.abi.methods.forEach((m: any) => {
      const abiSignature = `${m.name}(${m.args.map((a: any) => a.type.toLowerCase()).join(',')})${m.returns.type.toLowerCase()}`;
      this.teal.push(`method "${abiSignature}"`);
    });
    this.teal.push('txna ApplicationArgs 0');
    this.teal.push(`match ${this.abi.methods.map((m: any) => `abi_route_${m.name}`).join(' ')}`);
  }

  private maybeValue(opcode: string) {
    this.teal.push(opcode);
    this.teal.push('assert');
  }

  private hasMaybeValue(opcode: string) {
    this.teal.push(opcode);
    this.teal.push('swap');
    this.teal.push('pop');
  }

  private readonly TEAL_FUNCTIONS = {
    Account: {
      balance: {
        fn: () => {
          this.maybeValue('acct_params_get AcctBalance');
        },
        type: 'uint64',
      },
      hasBalance: {
        fn: () => {
          this.hasMaybeValue('acct_params_get AcctBalance');
        },
        type: 'uint64',
      },
      assetBalance: {
        fn: () => {
          this.maybeValue('asset_holding_get AssetBalance');
        },
        type: 'uint64',
        args: true,
      },
      minBalance: {
        fn: () => {
          this.maybeValue('acct_params_get AcctMinBalance');
        },
        type: 'uint64',
      },
      assets: {
        fn: () => {
          this.maybeValue('acct_params_get AcctTotalAssets');
        },
        type: 'uint64',
      },
    },
    Application: {
      address: {
        fn: () => {
          this.maybeValue('app_params_get AppAddress');
        },
        type: 'Account',
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

  private processPropertyDefinition(node: any) {
    const klass = node.value.callee.name as string;

    if (['BoxMap', 'GlobalMap'].includes(klass)) {
      const props: StorageProp = {
        type: klass.toLocaleLowerCase().replace('map', ''),
        keyType: this.getTypeFromAnnotation(node.value.typeParameters.params[0]),
        valueType: this.getTypeFromAnnotation(node.value.typeParameters.params[1]),
      };

      if (node.value.arguments[0]) {
        const sizeProp = node.value.arguments[0].properties.find((p: any) => p.key.name === 'defaultSize');
        if (sizeProp) props.defaultSize = sizeProp.value.value;
      }

      this.storageProps[node.key.name] = props;
    } else if (['Box', 'Global'].includes(klass)) {
      const keyProp = node.value.arguments[0].properties.find((p: any) => p.key.name === 'key');

      const props: StorageProp = {
        type: klass.toLowerCase(),
        key: keyProp.value.value,
        keyType: 'string',
        valueType: this.getTypeFromAnnotation(node.value.typeParameters.params[0]),
      };

      const sizeProp = node.value.arguments[0].properties.find((p: any) => p.key.name === 'defaultSize');
      if (sizeProp) props.defaultSize = sizeProp.value.value;

      this.storageProps[node.key.name] = props;
    } else {
      throw new Error();
    }
  }

  private processSubroutine(fn: any, abi: boolean = false) {
    this.teal.push(`${this.currentSubroutine.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.frame));
    this.frame = {};

    this.teal.push(`proto ${fn.params.length} ${(this.currentSubroutine.returnType === 'void') || abi ? 0 : 1}`);
    let frameIndex = 0;
    fn.params.forEach((p: any) => {
      const type = this.getTypeFromAnnotation(p.typeAnnotation.typeAnnotation);

      frameIndex -= 1;
      this.frame[p.name] = {};
      this.frame[p.name].index = frameIndex;
      this.frame[p.name].type = type;
    });

    this.processNode(fn.body);
    this.teal.push('retsub');
    this.frame = lastFrame;
  }

  private processAbiMethod(fn: any) {
    let argCount = 0;
    this.teal.push(`abi_route_${this.currentSubroutine.name}:`);
    const args: any[] = [];

    let gtxnIndex = fn.params.filter((p: any) => this.getTypeFromAnnotation(p.typeAnnotation.typeAnnotation).includes('Txn')).length;
    gtxnIndex += 1;

    fn.params.forEach((p: any) => {
      const type = this.getTypeFromAnnotation(p.typeAnnotation.typeAnnotation);
      let abiType = type;

      if (type.includes('Txn')) {
        switch (type) {
          case ('PayTxn'):
            abiType = 'pay';
            break;
          case 'AssetTransferTxn':
            abiType = 'axfer';
            break;
          default:
            break;
        }
      } else {
        this.teal.push(`txna ApplicationArgs ${argCount += 1}`);
      }

      if (type === 'uint64') {
        this.teal.push('btoi');
      } else if (['Account', 'Asset', 'App'].includes(type)) {
        this.teal.push(`txnas ${type}s`);
      } else if (type.includes('Txn')) {
        this.teal.push('global GroupIndex');
        this.teal.push(`int ${gtxnIndex -= 1}`);
        this.teal.push('-');
      }

      args.push({ name: p.name, type: abiType, desc: '' });
    });

    this.abi.methods.push({
      name: this.currentSubroutine.name, args, desc: '', returns: { type: this.currentSubroutine.returnType, desc: '' },
    });

    this.teal.push(`callsub ${this.currentSubroutine.name}`);
    this.teal.push('int 1');
    this.teal.push('return');
    this.processSubroutine(fn, true);
  }

  // eslint-disable-next-line class-methods-use-this
  private getTypeFromAnnotation(typeAnnotation: any) {
    let type = 'any';

    switch (typeAnnotation.type) {
      case 'TSNumberKeyword':
        type = 'uint64';
        break;
      case 'TSStringKeyword':
        type = 'string';
        break;
      case 'TSVoidKeyword':
        type = 'void';
        break;
      default:
        type = typeAnnotation.typeName.name;
        break;
    }

    return type;
  }

  private processMethodDefinition(node: any) {
    this.currentSubroutine.name = node.key.name;
    this.currentSubroutine.returnType = this.getTypeFromAnnotation(
      node.value.returnType.typeAnnotation,
    );

    if (node.accessibility === 'private') {
      this.processSubroutine(node.value);
    } else {
      this.processAbiMethod(node.value);
    }
  }

  private processClassBody(node: any) {
    node.body.forEach((b: any) => { this.processNode(b); });
  }

  private processClassDeclaration(node: any) {
    this.processNode(node.body);
  }

  private processNode(node: any) {
    try {
      // @ts-ignore
      (this[`process${node.type}`])(node);
    } catch (e: any) {
      if ((e instanceof TypeError) && e.message.includes('this[node.type] is not a function')) {
        this.processErrorNodes.push(node);
        const errNode = this.processErrorNodes[0];
        e.message = `TEALScript can not process ${errNode.type} at ${this.filename}:${errNode.loc.start.line}:${errNode.loc.start.column}\n ${this.content.substring(errNode.range[0], errNode.range[1])}`;
      }
      throw e;
    }
  }

  private processBlockStatement(node: any) {
    node.body.forEach((b: any) => { this.processNode(b); });
  }

  private processReturnStatement(node: any) {
    this.processNode(node.argument);
    if (['uint64', 'Asset', 'App'].includes(this.currentSubroutine.returnType)) this.teal.push('itob');

    this.teal.push('byte 0x151f7c75');
    this.teal.push('swap');
    this.teal.push('concat');
  }

  private processBinaryExpression(node: any) {
    this.processNode(node.left);
    this.processNode(node.right);
    this.teal.push(node.operator.replace('===', '=='));
  }

  private processLogicalExpression(node: any) {
    this.processNode(node.left);
    this.processNode(node.right);
    this.teal.push(node.operator);
  }

  private processIdentifier(node: any) {
    const target = this.frame[node.name] || this.scratch[node.name];
    const opcode = this.frame[node.name] ? 'frame_dig' : 'load';

    this.teal.push(`${opcode} ${target.index} // ${node.name}: ${target.type}`);
  }

  private processVariableDeclaration(node: any) {
    node.declarations.forEach((d: any) => { this.processNode(d); });
  }

  private processNewExpression(node: any) {
    node.arguments.forEach((a: any) => { this.processNode(a); });
  }

  private processTSAsExpression(node: any) {
    this.processNode(node.expression);
  }

  private processVariableDeclarator(node: any) {
    const { name } = node.id;

    this.processNode(node.init);
    let varType: string = typeof node.init.value;
    if (varType === 'undefined' && this.lastType) varType = this.lastType;

    this.lastType = undefined;

    const numberTypes = [AST_NODE_TYPES.LogicalExpression, AST_NODE_TYPES.BinaryExpression];
    if (numberTypes.includes(node.init.type)) {
      varType = 'uint64';
    } else if (node.init.type === AST_NODE_TYPES.NewExpression) {
      varType = node.init.callee.name;
    } else if (node.init.type === AST_NODE_TYPES.TSAsExpression) {
      varType = this.getTypeFromAnnotation(node.init.typeAnnotation);
    }

    varType = varType.replace('number', 'uint64');

    this.scratch[name] = {
      index: this.scratchIndex,
      type: varType,
    };

    this.teal.push(`store ${this.scratchIndex} // ${name}: ${varType}`);
    this.scratchIndex += 1;
  }

  private processExpressionStatement(node: any) {
    this.processNode(node.expression);
  }

  private processOpcode(node: any) {
    const opSpec = langspec.Ops.find((o) => o.Name === node.callee.name) as OpSpec;
    let line: string[] = [node.callee.name];

    if (opSpec.Size === 1) {
      node.arguments.forEach((a: any) => this.processNode(a));
    } else if (opSpec.Size === 0) {
      line = line.concat(node.arguments.map((a: any) => a.value));
    } else {
      line = line.concat(node.arguments.slice(0, opSpec.Size - 1).map((a: any) => a.value));
    }

    this.teal.push(line.join(' '));
  }

  private processStorageCall(node: any) {
    const op = node.callee.property.name;
    const {
      type, valueType, keyType, key,
    } = this.storageProps[node.callee.object.property.name] as StorageProp;

    if (op === 'get') {
      if (key) {
        this.teal.push(`bytes "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Account', 'Asset', 'App', 'uint64'].includes(keyType)) this.teal.push('itob');
      }

      switch (type) {
        case ('global'):
          this.teal.push('app_global_get');
          break;
        case ('box'):
          this.maybeValue('box_get');
          break;
        default:
          throw new Error();
      }

      if (type === 'box' && ['Account', 'Asset', 'App', 'uint64'].includes(valueType)) this.teal.push('btoi');
    } else if (op === 'delete') {
      if (key) {
        this.teal.push(`bytes "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Account', 'Asset', 'App', 'uint64'].includes(keyType)) this.teal.push('itob');
      }

      switch (type) {
        case ('global'):
          this.teal.push('app_global_del');
          break;
        case ('box'):
          this.teal.push('box_del');
          break;
        default:
          throw new Error();
      }
    } else if (op === 'put') {
      if (key) {
        this.teal.push(`bytes "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Account', 'Asset', 'App', 'uint64'].includes(keyType)) this.teal.push('itob');
      }

      this.processNode(node.arguments[key ? 0 : 1]);
      if (type === 'box' && ['Account', 'Asset', 'App', 'uint64'].includes(valueType)) this.teal.push('itob');

      switch (type) {
        case ('global'):
          this.teal.push('app_global_put');
          break;
        case ('box'):
          this.teal.push('box_put');
          break;
        default:
          throw new Error();
      }
    } else if (op === 'exists') {
      if (type === 'global') this.teal.push('txna Applications 0');

      if (key) {
        this.teal.push(`bytes "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Account', 'Asset', 'App', 'uint64'].includes(keyType)) this.teal.push('itob');
      }

      switch (type) {
        case ('global'):
          this.hasMaybeValue('app_global_get_ex');
          break;
        case ('box'):
          this.hasMaybeValue('box_get');
          break;
        default:
          throw new Error();
      }
    }
  }

  private processTransaction(node: any) {
    let txnType = '';

    switch (node.callee.name) {
      case ('sendPayment'):
        txnType = 'pay';
        break;
      case ('sendAssetTransfer'):
        txnType = 'axfer';
        break;
      case ('sendMethodCall'):
      case ('sendAppCall'):
        txnType = 'appl';
        break;
      default:
        break;
    }

    this.teal.push('itxn_begin');
    this.teal.push(`int ${txnType}`);
    this.teal.push('itxn_field TypeEnum');

    const nameProp = node.arguments[0].properties.find((p: any) => p.key.name === 'name');

    if (nameProp) {
      const argTypes = node.typeParameters.params[0].elementTypes
        .map((t: any) => this.getTypeFromAnnotation(t));
      const returnType = this.getTypeFromAnnotation(node.typeParameters.params[1]);
      this.teal.push(`method "${nameProp.value.value}(${argTypes.join(',').toLowerCase()})${returnType.toLowerCase()}"`);
      this.teal.push('itxn_field ApplicationArgs');
    }

    node.arguments[0].properties.forEach((p: any) => {
      const key = p.key.name;

      if (key === 'name') {
        // do nothing
      } else if (key === 'methodArgs') {
        const argTypes = node.typeParameters.params[0].elementTypes
          .map((t: any) => this.getTypeFromAnnotation(t));
        let accountIndex = 1;
        let appIndex = 1;
        let assetIndex = 0;

        p.value.elements.forEach((e: any, i: number) => {
          if (argTypes[i] === 'Account') {
            this.processNode(e);
            this.teal.push('txn_field Accounts');
            this.teal.push(`int ${accountIndex}`);
            this.teal.push('itob');
            accountIndex += 1;
          } else if (argTypes[i] === 'Asset') {
            this.processNode(e);
            this.teal.push('txn_field Assets');
            this.teal.push(`int ${assetIndex}`);
            this.teal.push('itob');
            assetIndex += 1;
          } else if (argTypes[i] === 'App') {
            this.processNode(e);
            this.teal.push('txn_field Applications');
            this.teal.push(`int ${appIndex}`);
            this.teal.push('itob');
            appIndex += 1;
          } else if (argTypes[i] === 'uint64') {
            this.processNode(e);
            this.teal.push('itob');
          } else {
            this.processNode(e);
          }
          this.teal.push('itxn_field ApplicationArgs');
        });
      } else if (p.value.type === AST_NODE_TYPES.ArrayExpression) {
        p.value.elements.forEach((e: any) => {
          this.processNode(e);
          this.teal.push(`itxn_field ${capitalizeFirstChar(key)}`);
        });
      } else {
        this.processNode(p.value);
        this.teal.push(`itxn_field ${capitalizeFirstChar(key)}`);
      }
    });

    this.teal.push('itxn_submit');
  }

  private processCallExpression(node: any) {
    const opcodeNames = langspec.Ops.map((o) => o.Name);
    const methodName = node.callee?.property?.name || node.callee.name;

    if (node.callee.object === undefined) {
      if (opcodeNames.includes(methodName)) {
        this.processOpcode(node);
      } else if (['sendPayment', 'sendAppCall', 'sendMethodCall', 'sendAssetTransfer'].includes(methodName)) {
        this.processTransaction(node);
      } else if (['addr'].includes(methodName)) {
        this.teal.push(`addr ${node.arguments[0].value}`);
      }
    } else if (node.callee.object.type === AST_NODE_TYPES.ThisExpression) {
      node.arguments.forEach((a: any) => this.processNode(a));
      this.teal.push(`callsub ${methodName}`);
    } else if (Object.keys(this.storageProps).includes(node.callee.object.property?.name)) {
      this.processStorageCall(node);
    } else {
      if (node.callee.object.type === AST_NODE_TYPES.Identifier) {
        this.processNode(node.callee);
      } else {
        this.processNode(node.callee.object);
      }
      node.arguments.forEach((a: any) => this.processNode(a));
      // @ts-ignore
      this.tealFunction(this.lastType, node.callee.property.name);
    }
  }

  private processStorageExpression(node: any): string {
    const target = this.frame[node.object.name] || this.scratch[node.object.name];
    const opcode = this.frame[node.object.name] ? 'frame_dig' : 'load';

    this.teal.push(`${opcode} ${target.index} // ${node.object.name}: ${target.type}`);

    this.tealFunction(target.type, node.property.name, true);

    return target.type;
  }

  private processMemberExpression(node: any, nodes: any[] = []) {
    nodes.push(node);

    if (node.object.type === AST_NODE_TYPES.MemberExpression) {
      this.processMemberExpression(node.object, nodes);
    } else {
      const prevProps: {name: string, type?: string}[] = [];

      nodes.reverse().forEach((n: any) => {
        let type: string | undefined;
        // global calls won't have a prevProp
        const obj = prevProps.at(-1) || { name: n.object.name, type: undefined };

        if (['global', 'txn', 'itxn'].includes(obj.name)) {
          this.teal.push(`${obj.name} ${capitalizeFirstChar(n.property.name)}`);
          // @ts-ignore
          type = TYPES[obj.name][n.property.name];
        } else if (['txnGroup'].includes(obj.name)) {
          this.processNode(n.property);
          type = 'GroupTxn';
        } else if (['app'].includes(obj.name)) {
          this.teal.push('txna Applications 0');
          this.maybeValue(`app_params_get ${capitalizeFirstChar(n.property.name)}`);
        } else if (obj.type) {
          // @ts-ignore
          type = this.tealFunction(obj.type, n.property.name);
        } else if (this.frame[n.object.name] || this.scratch[n.object.name]) {
          type = this.processStorageExpression(node);
        }

        this.lastType = type;
        prevProps.push({ name: n.property.name, type });
      });
    }
  }

  private tealFunction(type: string, name: string, checkArgs: boolean = false) {
    if (type.includes('Txn')) {
      this.teal.push(`gtxns ${capitalizeFirstChar(name)}`);

      // @ts-ignore
      return TYPES.txn[name];
    }

    if (name === 'global') {
      this.maybeValue('app_global_get_ex');
      return 'any';
    }

    // @ts-ignore
    const typeFunction = this.TEAL_FUNCTIONS[type][name];

    if (checkArgs) {
      if (!typeFunction.args) typeFunction.fn();
    } else {
      typeFunction.fn();
    }

    return typeFunction.type;
  }

  private processLiteral(node: any) {
    const litType = typeof node.value;
    if (litType === 'string') {
      this.teal.push(`byte "${node.value}"`);
    } else {
      this.teal.push(`int ${node.value}`);
    }
  }
}

export class TEALScript {
  constructor(filename: string) {
    const tree = parser.parse(fs.readFileSync(filename, 'utf-8'), { range: true, loc: true });
    const dir = path.dirname(filename);

    tree.body.forEach((body: any) => {
      if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract') {
        const tealPath = path.join(dir, `${body.id.name}.teal`);
        const abiPath = path.join(dir, `${body.id.name}.json`);

        if (fs.existsSync(tealPath)) fs.rmSync(tealPath);
        if (fs.existsSync(abiPath)) fs.rmSync(abiPath);

        const compiler = new Compiler(filename, body.id.name);

        fs.writeFileSync(tealPath, compiler.teal.join('\n'));
        fs.writeFileSync(abiPath, JSON.stringify(compiler.abi, null, 2));
      }
    });
  }
}
