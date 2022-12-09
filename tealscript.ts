/* eslint-disable max-classes-per-file */
import * as fs from 'fs';
import * as parser from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as langspec from './langspec.json';

export type uint64 = number;
export type bytes = string;

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

export class BoxMap<KeyType, ValueType> {
  // @ts-ignore
  constructor(options?: { defaultSize?: number }) {}

  // @ts-ignore
  get(key: KeyType): ValueType {}

  // @ts-ignore
  put(key: KeyType, value: ValueType): void {}
}

export class Box<ValueType> {
  // @ts-ignore
  constructor(options?: { defaultSize?: number, key?: string }) {}

  // @ts-ignore
  get(): ValueType {}

  // @ts-ignore
  put(value: ValueType): void {}
}

export class Global<ValueType> {
  // @ts-ignore
  constructor(options?: { key?: string }) {}

  // @ts-ignore
  get(): ValueType {}

  // @ts-ignore
  put(value: ValueType): void {}
}

export class GlobalMap<KeyType, ValueType> {
  // @ts-ignore
  constructor() {}

  // @ts-ignore
  get(key: KeyType): ValueType {}

  // @ts-ignore
  put(key: KeyType, value: ValueType): void {}
}

interface Function {
  name: string
  returnType: string
}
export class Account {
  // @ts-ignore
  constructor(id: uint64) {}

  // @ts-ignore
  readonly balance: uint64;

  // @ts-ignore
  readonly hasBalance: uint64;
}

export class Asset {}
export class Application {}

interface CommonTransactionParams {
  fee: uint64
  sender?: Account
  rekeyTo?: Account
  note?: string
}

interface PaymentParams extends CommonTransactionParams {
  amount: uint64
  receiver: Account
  closeRemainderTo?: Account
}

interface AppParams extends CommonTransactionParams {
  applicationID: uint64
  onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' | 'CreateApplication'
  accounts?: Account[]
  approvalProgram?: bytes
  applicationArgs?: bytes[]
  clearStateProgram?: bytes
  apps?: Array<uint64 | Application>
  assets?: Array<uint64 | Asset>
  globalNumByteSlice?: uint64
  globalNumUint?: uint64
  localNumByteSlice?: uint64
  localNumUint?: uint64
}

interface MethodCallParams<ArgsType> extends AppParams {
  methodArgs: ArgsType
  name: string
}

type BytesLike = bytes | Account
type IntLike = uint64 | Asset | Application

export class Contract {
  // @ts-ignore
  box: BoxMap<string, bytes>;

  // @ts-ignore
  sendPayment(params: PaymentParams): void {}

  // @ts-ignore
  sendAppCall(params: AppParams): void {}

  // @ts-ignore
  sendMethodCall<ArgsType, ReturnType>(params: MethodCallParams<ArgsType>): ReturnType {}

  // @ts-ignore
  btoi(bytes: BytesLike): uint64 {}

  // @ts-ignore
  itob(int: IntLike): bytes {}

  // @ts-ignore
  log(content: BytesLike): void {}

  // @ts-ignore
  err() {}

  // @ts-ignore
  sha256(arg0: ByteLike) {}

  // @ts-ignore
  keccak256(arg0: ByteLike) {}

  // @ts-ignore
  sha512_256(arg0: ByteLike) {}

  // @ts-ignore
  ed25519verify(arg0: ByteLike, arg1: ByteLike, arg2: ByteLike) {}

  // @ts-ignore
  len(arg0: ByteLike) {}

  // @ts-ignore
  mulw(arg0: IntLike, arg1: IntLike) {}

  // @ts-ignore
  addw(arg0: IntLike, arg1: IntLike) {}

  // @ts-ignore
  divmodw(arg0: IntLike, arg1: IntLike, arg2: IntLike, arg3: IntLike) {}

  // @ts-ignore
  assert(arg0: IntLike) {}

  // @ts-ignore
  concat(arg0: ByteLike, arg1: ByteLike) {}

  // @ts-ignore
  substring3(arg0: ByteLike, arg1: IntLike, arg2: IntLike) {}

  // @ts-ignore
  getbit(arg0: ByteLike, arg1: IntLike) {}

  // @ts-ignore
  setbit(arg0: ByteLike, arg1: IntLike, arg2: IntLike) {}

  // @ts-ignore
  getbyte(arg0: ByteLike, arg1: IntLike) {}

  // @ts-ignore
  setbyte(arg0: ByteLike, arg1: IntLike, arg2: IntLike) {}

  // @ts-ignore
  extract3(arg0: ByteLike, arg1: IntLike, arg2: IntLike) {}

  // @ts-ignore
  extract_uint16(arg0: ByteLike, arg1: IntLike) {}

  // @ts-ignore
  extract_uint32(arg0: ByteLike, arg1: IntLike) {}

  // @ts-ignore
  extract_uint64(arg0: ByteLike, arg1: IntLike) {}

  // @ts-ignore
  replace3(arg0: ByteLike, arg1: IntLike, arg2: ByteLike) {}

  // @ts-ignore
  ed25519verify_bare(arg0: ByteLike, arg1: ByteLike, arg2: ByteLike) {}

  // @ts-ignore
  sqrt(arg0: IntLike) {}

  // @ts-ignore
  bitlen(arg0: ByteLike) {}

  // @ts-ignore
  exp(arg0: IntLike, arg1: IntLike) {}

  // @ts-ignore
  expw(arg0: IntLike, arg1: IntLike) {}

  // @ts-ignore
  bsqrt(arg0: ByteLike) {}

  // @ts-ignore
  divw(arg0: IntLike, arg1: IntLike, arg2: IntLike) {}

  // @ts-ignore
  sha3_256(arg0: ByteLike) {}
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

  currentFunction: Function;

  abi: any;

  storageProps: {[key: string]: StorageProp};

  constructor(filename: string) {
    this.filename = filename;
    this.content = fs.readFileSync(this.filename, 'utf-8');
    this.teal = ['#pragma version 8', 'b main'];
    this.scratch = {};
    this.scratchIndex = 0;
    this.ifCount = 0;
    this.processErrorNodes = [];
    this.frame = {};
    this.currentFunction = { name: '', returnType: '' };
    this.storageProps = {
      box: {
        type: 'box',
        keyType: 'bytes',
        valueType: 'bytes',
      },
    };

    const tree = parser.parse(this.content, { range: true, loc: true });

    tree.body.forEach((body: any) => {
      if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract') {
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
    this.teal.push(`${this.currentFunction.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.frame));
    this.frame = {};

    this.teal.push(`proto ${fn.params.length} ${(this.currentFunction.returnType === 'void') || abi ? 0 : 1}`);
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
    this.teal.push(`abi_route_${this.currentFunction.name}:`);
    const args: any[] = [];

    fn.params.forEach((p: any) => {
      this.teal.push(`txna ApplicationArgs ${argCount += 1}`);
      const type = this.getTypeFromAnnotation(p.typeAnnotation.typeAnnotation);
      args.push({ name: p.name, type, desc: '' });

      if (type === 'uint64') {
        this.teal.push('btoi');
      } else if (['Account', 'Asset', 'App'].includes(type)) {
        this.teal.push(`txnas ${type}s`);
      }
    });

    this.abi.methods.push({
      name: this.currentFunction.name, args, desc: '', returns: { type: this.currentFunction.returnType, desc: '' },
    });

    this.teal.push(`callsub ${this.currentFunction.name}`);
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
    this.currentFunction.name = node.key.name;
    this.currentFunction.returnType = this.getTypeFromAnnotation(
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
    if (['uint64', 'Asset', 'App'].includes(this.currentFunction.returnType)) this.teal.push('itob');

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

    let varType: string = typeof node.init.value;
    this.processNode(node.init);

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
    const opSpec = langspec.Ops.find((o) => o.Name === node.callee.property.name) as OpSpec;
    let line: string[] = [node.callee.property.name];

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
          this.teal.push('box_get');
          break;
        default:
          throw new Error();
      }

      if (type === 'box' && ['Account', 'Asset', 'App', 'uint64'].includes(valueType)) this.teal.push('btoi');
    } else {
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
    }
  }

  private processTransaction(node: any) {
    let txnType = '';

    switch (node.callee.property.name) {
      case ('sendPayment'):
        txnType = 'pay';
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
          this.teal.push(`itxn_field ${key.charAt(0).toUpperCase() + key.slice(1)}`);
        });
      } else {
        this.processNode(p.value);
        this.teal.push(`itxn_field ${key.charAt(0).toUpperCase() + key.slice(1)}`);
      }
    });

    this.teal.push('itxn_submit');
  }

  private processCallExpression(node: any) {
    const opcodeNames = langspec.Ops.map((o) => o.Name);
    const methodName = node.callee.property.name;

    if (node.callee.object.type === AST_NODE_TYPES.ThisExpression) {
      if (opcodeNames.includes(methodName)) {
        this.processOpcode(node);
      } else if (['sendPayment', 'sendAppCall', 'sendMethodCall'].includes(methodName)) {
        this.processTransaction(node);
      } else {
        node.arguments.forEach((a: any) => this.processNode(a));
        this.teal.push(`callsub ${methodName}`);
      }
    } else if (Object.keys(this.storageProps).includes(node.callee.object.property.name)) {
      this.processStorageCall(node);
    } else {
      throw (new Error(`TEALScript can not process ${methodName} at ${this.filename}:${node.loc.start.line}:${node.loc.start.column}`));
    }
  }

  private processMemberExpression(node: any) {
    if (node.object.property?.name === 'box') {
      this.teal.push(`box_get ${node.property.name}`);
    } else {
      const target = this.frame[node.object.name] || this.scratch[node.object.name];
      const opcode = this.frame[node.object.name] ? 'frame_dig' : 'load';

      this.teal.push(`${opcode} ${target.index} // ${node.object.name}: ${target.type}`);

      // @ts-ignore
      this.TYPE_FUNCTIONS[target.type][node.property.name]();
    }
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
