import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as parser from '@typescript-eslint/typescript-estree';
import fetch from 'node-fetch';
import * as vlq from 'vlq';
import * as langspec from '../langspec.json';

function capitalizeFirstChar(str: string) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

const TXN_METHODS = ['sendPayment', 'sendAppCall', 'sendMethodCall', 'sendAssetTransfer'];

const PARAM_TYPES: {[param: string]: string} = {
  // Account
  AcctAuthAddr: 'Account',
  // Application
  AppCreator: 'Account',
  AppAddress: 'Account',
  AssetManager: 'Account',
  AssetReserve: 'Account',
  AssetFreeze: 'Account',
  AssetClawback: 'Account',
  AssetCreator: 'Account',
  // Global
  ZeroAddress: 'Account',
  CurrentApplicationID: 'Application',
  CreatorAddress: 'Account',
  CurrentApplicationAddress: 'Account',
  CallerApplicationID: 'Application',
  CallerApplicationAddress: 'Account',
  // Txn
  Sender: 'Account',
  Receiver: 'Account',
  CloseRemainderTo: 'Account',
  XferAsset: 'Asset',
  AssetSender: 'Account',
  AssetReceiver: 'Account',
  AssetCloseTo: 'Account',
  ApplicationID: 'Application',
  RekeyTo: 'Account',
  ConfigAsset: 'Asset',
  ConfigAssetManager: 'Account',
  ConfigAssetReserve: 'Account',
  ConfigAssetFreeze: 'Account',
  ConfigAssetClawback: 'Account',
  FreezeAsset: 'Asset',
  FreezeAssetAccount: 'Account',
  CreatedAssetID: 'Asset',
  CreatedApplicationID: 'Application',
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
  decorators?: string[]
}
export default class Compiler {
  teal: string[];

  private scratch: any;

  private scratchIndex: number;

  private ifCount: number;

  filename?: string;

  content: string;

  private processErrorNodes: any[];

  private frame: any;

  private currentSubroutine: Subroutine;

  abi: any;

  private storageProps: {[key: string]: StorageProp};

  private lastType: string | undefined;

  private contractClasses: string[];

  name: string;

  pcToLine: {[key: number]: number};

  lineToPc: {[key: number]: number[]};

  private lastSourceCommentRange: [number, number];

  constructor(content: string, className: string, filename?: string) {
    this.filename = filename;
    this.content = content;
    this.teal = ['#pragma version 8', 'b main'];
    this.scratch = {};
    this.scratchIndex = 0;
    this.ifCount = 0;
    this.processErrorNodes = [];
    this.frame = {};
    this.currentSubroutine = { name: '', returnType: '' };
    this.storageProps = {};
    this.contractClasses = [];
    this.name = className;
    this.pcToLine = {};
    this.lineToPc = {};
    this.lastSourceCommentRange = [0, 0];
  }

  getOpParamObjects(op: string) {
    const opSpec = langspec.Ops.find((o) => o.Name === op);
    if (opSpec === undefined) {
      throw new Error(`Unknown op ${op}`);
    }

    return opSpec.ArgEnum!.map((arg, i) => {
      let fn;
      const type = PARAM_TYPES[arg] || opSpec.ArgEnumTypes![i].replace('B', 'bytes').replace('U', 'uint64');

      if (['txn', 'global', 'itxn', 'gtxns'].includes(op)) {
        fn = () => this.push(`${op} ${arg}`, type);
      } else {
        fn = () => this.maybeValue(`${op} ${arg}`, type);
      }
      return {
        name: arg,
        args: opSpec.Args?.length || 0,
        fn,
      };
    });
  }

  private readonly OP_PARAMS: {[type: string]: any[]} = {
    Account: [
      ...this.getOpParamObjects('acct_params_get'),
      ...this.getOpParamObjects('asset_holding_get'),
    ],
    Application: [
      ...this.getOpParamObjects('app_params_get'),
      {
        name: 'Global',
        type: 'any',
        args: 2,
        fn: () => {
          this.maybeValue('app_global_get_ex', 'bytes');
        },
      },
    ],
    txn: this.getOpParamObjects('txn'),
    global: this.getOpParamObjects('global'),
    itxn: this.getOpParamObjects('itxn'),
    gtxns: this.getOpParamObjects('gtxns'),
  };

  private push(teal: string, type: string) {
    this.teal.push(teal);
    this.lastType = type;
  }

  private pushVoid(teal: string) {
    this.teal.push(teal);
  }

  async compile() {
    const tree = parser.parse(this.content, { range: true, loc: true });

    tree.body.forEach((body: any) => {
      if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract') {
        this.contractClasses.push(body.id.name);
      }

      if (body.type === AST_NODE_TYPES.ClassDeclaration && body.superClass.name === 'Contract' && body.id.name === this.name) {
        this.abi = { name: body.id.name, desc: '', methods: [] };

        this.processNode(body);
      }
    });

    if (!this.teal.includes('main:')) {
      this.pushVoid('main:');
      this.routeAbiMethods();
    }

    this.teal = await Promise.all(this.teal.map((async (t) => {
      if (t.includes('PENDING_COMPILE: ')) {
        const c = new Compiler(this.content, t.split(' ')[1], this.filename);
        await c.compile();
        const program = await c.algodCompile();
        return `byte b64 ${program}`;
      }
      return t;
    })));
  }

  prettyTeal() {
    const output: string[] = [];
    let comments: string[] = [];

    let lastIsLabel: boolean = false;

    this.teal.forEach((t) => {
      if (t.startsWith('//')) {
        comments.push(t);
        return;
      }

      const isLabel = t.split('//')[0].endsWith(':');

      if ((!lastIsLabel && comments.length !== 0) || isLabel) output.push('');

      if (isLabel || t.startsWith('#')) {
        comments.forEach((c) => output.push(c));
        comments = [];
        output.push(t);
        lastIsLabel = true;
      } else {
        comments.forEach((c) => output.push(`\t${c.replace(/\n/g, '\n\t')}`));
        comments = [];
        output.push(`\t${t}`);
        lastIsLabel = false;
      }
    });

    return output.join('\n');
  }

  private pushMethod(name: string, args: string[], returns: string) {
    const abiArgs = args.map((a) => a.toLowerCase());

    let abiReturns = returns.toLowerCase();

    switch (abiReturns) {
      case 'application':
        abiReturns = 'uint64';
        break;
      case 'account':
        abiReturns = 'address';
        break;
      default:
        break;
    }

    const sig = `${name}(${abiArgs.join(',')})${abiReturns}`;
    this.pushVoid(`method "${sig}"`);
  }

  private routeAbiMethods() {
    this.abi.methods.forEach((m: any) => {
      this.pushMethod(m.name, m.args.map((a: any) => a.type), m.returns.type);
    });
    this.pushVoid('txna ApplicationArgs 0');
    this.pushVoid(`match ${this.abi.methods.map((m: any) => `abi_route_${m.name}`).join(' ')}`);
  }

  private maybeValue(opcode: string, type: string) {
    this.pushVoid(opcode);
    this.push('assert', type);
  }

  private hasMaybeValue(opcode: string) {
    this.pushVoid(opcode);
    this.pushVoid('swap');
    this.push('pop', 'uint64');
  }

  private processIfStatement(node: any, elseIfCount: number = 0) {
    let labelPrefix: string;

    if (elseIfCount === 0) {
      labelPrefix = `if${this.ifCount}`;
      this.pushVoid(`// ${labelPrefix}_condition`);
    } else {
      labelPrefix = `if${this.ifCount}_elseif${elseIfCount}`;
      this.pushVoid(`${labelPrefix}_condition:`);
    }

    this.addSourceComment(node.test);
    this.processNode(node.test);

    if (node.alternate == null) {
      this.pushVoid(`bz if${this.ifCount}_end`);
      this.pushVoid(`// ${labelPrefix}_consequent`);
      this.processNode(node.consequent);
    } else if (node.alternate.type === AST_NODE_TYPES.IfStatement) {
      this.pushVoid(`bz if${this.ifCount}_elseif${elseIfCount + 1}_condition`);
      this.pushVoid(`// ${labelPrefix}_consequent`);
      this.processNode(node.consequent);
      this.pushVoid(`b if${this.ifCount}_end`);
      this.processIfStatement(node.alternate, elseIfCount + 1);
    } else {
      this.pushVoid(`bz if${this.ifCount}_end`);
      this.processNode(node.alternate);
    }

    if (elseIfCount === 0) {
      this.pushVoid(`if${this.ifCount}_end:`);
      this.ifCount += 1;
    }
  }

  private processUnaryExpression(node: any) {
    this.processNode(node.argument);
    this.push(node.operator, 'uint64');
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
    } else if (['Box', 'GlobalValue'].includes(klass)) {
      const keyProp = node.value.arguments[0].properties.find((p: any) => p.key.name === 'key');

      const props: StorageProp = {
        type: klass.toLowerCase().replace('value', ''),
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
    this.pushVoid(`${this.currentSubroutine.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.frame));
    this.frame = {};

    this.pushVoid(`proto ${fn.params.length} ${(this.currentSubroutine.returnType === 'void') || abi ? 0 : 1}`);
    let frameIndex = 0;
    fn.params.reverse().forEach((p: any) => {
      const type = this.getTypeFromAnnotation(p.typeAnnotation.typeAnnotation);

      frameIndex -= 1;
      this.frame[p.name] = {};
      this.frame[p.name].index = frameIndex;
      this.frame[p.name].type = type;
    });

    this.processNode(fn.body);
    this.pushVoid('retsub');
    this.frame = lastFrame;
  }

  private processAbiMethod(fn: any) {
    let argCount = 0;
    this.pushVoid(`abi_route_${this.currentSubroutine.name}:`);
    const args: any[] = [];

    if (this.currentSubroutine.decorators) {
      this.currentSubroutine.decorators.forEach((d, i) => {
        switch (d) {
          case 'createApplication':
            this.pushVoid('txn ApplicationID');
            this.pushVoid('int 0');
            break;
          case 'noOp':
            this.pushVoid('int NoOp');
            this.pushVoid('txn OnCompletion');
            break;
          case 'optIn':
            this.pushVoid('int OptIn');
            this.pushVoid('txn OnCompletion');
            break;
          case 'closeOut':
            this.pushVoid('int CloseOut');
            this.pushVoid('txn OnCompletion');
            break;
          case 'updateApplication':
            this.pushVoid('int UpdateApplication');
            this.pushVoid('txn OnCompletion');
            break;
          case 'deleteApplication':
            this.pushVoid('int DeleteApplication');
            this.pushVoid('txn OnCompletion');
            break;
          default:
            throw new Error(`Unknown decorator: ${d}`);
        }

        this.pushVoid('==');
        if (i > 0) this.pushVoid('||');
      });

      this.pushVoid('assert');
    } else {
      this.pushVoid('txn OnCompletion');
      this.pushVoid('int NoOp');
      this.pushVoid('==');
      this.pushVoid('assert');
    }

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
        this.pushVoid(`txna ApplicationArgs ${argCount += 1}`);
      }

      if (type === 'uint64') {
        this.pushVoid('btoi');
      } else if (['Account', 'Asset', 'Application'].includes(type)) {
        this.pushVoid('btoi');
        this.pushVoid(`txnas ${type}s`);
      } else if (type.includes('Txn')) {
        this.pushVoid('txn GroupIndex');
        this.pushVoid(`int ${gtxnIndex -= 1}`);
        this.pushVoid('-');
      }

      args.push({ name: p.name, type: abiType.toLocaleLowerCase(), desc: '' });
    });

    const returnType = this.currentSubroutine.returnType
      .toLocaleLowerCase()
      .replace(/asset|application/, 'uint64')
      .replace('account', 'address');

    this.abi.methods.push({
      name: this.currentSubroutine.name, args, desc: '', returns: { type: returnType, desc: '' },
    });

    this.pushVoid(`callsub ${this.currentSubroutine.name}`);
    this.pushVoid('int 1');
    this.pushVoid('return');
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
      this.currentSubroutine.decorators = node.decorators?.map((d: any) => d.expression.name);
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
      ((this as any)[`process${node.type}`])(node);
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
    this.addSourceComment(node);
    this.processNode(node.argument);
    if (['uint64', 'Asset', 'Application'].includes(this.currentSubroutine.returnType)) this.pushVoid('itob');

    this.pushVoid('byte 0x151f7c75');
    this.pushVoid('swap');
    this.pushVoid('concat');
    this.pushVoid('log');
  }

  private processBinaryExpression(node: any) {
    this.processNode(node.left);
    this.processNode(node.right);
    this.push(node.operator.replace('===', '=='), 'uint64');
  }

  private processLogicalExpression(node: any) {
    this.processNode(node.left);
    this.processNode(node.right);
    this.push(node.operator, 'uint64');
  }

  private processIdentifier(node: any) {
    if (this.contractClasses.includes(node.name)) {
      this.pushVoid(`PENDING_COMPILE: ${node.name}`);
      return;
    }
    const target = this.frame[node.name] || this.scratch[node.name];
    const opcode = this.frame[node.name] ? 'frame_dig' : 'load';

    this.push(`${opcode} ${target.index} // ${node.name}: ${target.type}`, target.type);
  }

  private processVariableDeclaration(node: any) {
    node.declarations.forEach((d: any) => { this.processNode(d); });
  }

  private processNewExpression(node: any) {
    node.arguments.forEach((a: any) => { this.processNode(a); });
    this.lastType = node.callee.name;
  }

  private processTSAsExpression(node: any) {
    this.processNode(node.expression);
  }

  private processVariableDeclarator(node: any) {
    this.addSourceComment(node);
    const { name } = node.id;

    this.processNode(node.init);
    let varType: string = typeof node.init.value;
    if (varType === 'undefined' && this.lastType) varType = this.lastType;

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

    this.pushVoid(`store ${this.scratchIndex} // ${name}: ${varType}`);
    this.scratchIndex += 1;
  }

  private processExpressionStatement(node: any) {
    this.processNode(node.expression);
  }

  private processOpcode(node: any) {
    const opSpec = langspec.Ops.find((o) => o.Name === node.callee.name) as OpSpec;
    let line: string[] = [node.callee.name];

    if (opSpec.Size === 1) {
      const preArgsType = this.lastType;
      node.arguments.forEach((a: any) => this.processNode(a));
      this.lastType = preArgsType;
    } else if (opSpec.Size === 0) {
      line = line.concat(node.arguments.map((a: any) => a.value));
    } else {
      line = line.concat(node.arguments.slice(0, opSpec.Size - 1).map((a: any) => a.value));
    }

    this.pushVoid(line.join(' '));
  }

  private processStorageCall(node: any) {
    const op = node.callee.property.name;
    const {
      type, valueType, keyType, key,
    } = this.storageProps[node.callee.object.property.name] as StorageProp;

    if (op === 'get') {
      if (key) {
        this.pushVoid(`byte "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Asset', 'Application', 'uint64'].includes(keyType)) this.pushVoid('itob');
      }

      switch (type) {
        case ('global'):
          this.push('app_global_get', valueType);
          break;
        case ('box'):
          this.maybeValue('box_get', valueType);
          break;
        default:
          throw new Error();
      }

      if (type === 'box' && ['Asset', 'Application', 'uint64'].includes(valueType)) this.pushVoid('btoi');
    } else if (op === 'delete') {
      if (key) {
        this.pushVoid(`byte "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Asset', 'Application', 'uint64'].includes(keyType)) this.pushVoid('itob');
      }

      switch (type) {
        case ('global'):
          this.pushVoid('app_global_del');
          break;
        case ('box'):
          this.pushVoid('box_del');
          break;
        default:
          throw new Error();
      }
    } else if (op === 'put') {
      if (key) {
        this.pushVoid(`byte "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Asset', 'Application', 'uint64'].includes(keyType)) this.pushVoid('itob');
      }

      this.processNode(node.arguments[key ? 0 : 1]);
      if (type === 'box' && ['Asset', 'Application', 'uint64'].includes(valueType)) this.pushVoid('itob');

      switch (type) {
        case ('global'):
          this.pushVoid('app_global_put');
          break;
        case ('box'):
          this.pushVoid('box_put');
          break;
        default:
          throw new Error();
      }
    } else if (op === 'exists') {
      if (type === 'global') this.pushVoid('txna Applications 0');

      if (key) {
        this.pushVoid(`byte "${key}"`);
      } else {
        this.processNode(node.arguments[0]);
        if (['Asset', 'Application', 'uint64'].includes(keyType)) this.pushVoid('itob');
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

    this.pushVoid('itxn_begin');
    this.pushVoid(`int ${txnType}`);
    this.pushVoid('itxn_field TypeEnum');

    const nameProp = node.arguments[0].properties.find((p: any) => p.key.name === 'name');

    if (nameProp) {
      const argTypes = node.typeParameters.params[0].elementTypes
        .map((t: any) => this.getTypeFromAnnotation(t));
      const returnType = this.getTypeFromAnnotation(node.typeParameters.params[1]);
      this.pushVoid(`method "${nameProp.value.value}(${argTypes.join(',').toLowerCase()})${returnType.toLowerCase()}"`);
      this.pushVoid('itxn_field ApplicationArgs');
    }

    node.arguments[0].properties.forEach((p: any) => {
      const key = p.key.name;
      if (key !== 'name') this.addSourceComment(p);

      if (key === 'name') {
        // do nothing
      } else if (key === 'OnCompletion') {
        this.pushVoid(`int ${p.value.value}`);
        this.pushVoid('itxn_field OnCompletion');
      } else if (key === 'methodArgs') {
        const argTypes = node.typeParameters.params[0].elementTypes
          .map((t: any) => this.getTypeFromAnnotation(t));
        let accountIndex = 1;
        let appIndex = 1;
        let assetIndex = 0;

        p.value.elements.forEach((e: any, i: number) => {
          if (argTypes[i] === 'Account') {
            this.processNode(e);
            this.pushVoid('itxn_field Accounts');
            this.pushVoid(`int ${accountIndex}`);
            this.pushVoid('itob');
            accountIndex += 1;
          } else if (argTypes[i] === 'Asset') {
            this.processNode(e);
            this.pushVoid('itxn_field Assets');
            this.pushVoid(`int ${assetIndex}`);
            this.pushVoid('itob');
            assetIndex += 1;
          } else if (argTypes[i] === 'Application') {
            this.processNode(e);
            this.pushVoid('itxn_field Applications');
            this.pushVoid(`int ${appIndex}`);
            this.pushVoid('itob');
            appIndex += 1;
          } else if (argTypes[i] === 'uint64') {
            this.processNode(e);
            this.pushVoid('itob');
          } else {
            this.processNode(e);
          }
          this.pushVoid('itxn_field ApplicationArgs');
        });
      } else if (p.value.type === AST_NODE_TYPES.ArrayExpression) {
        p.value.elements.forEach((e: any) => {
          this.processNode(e);
          this.pushVoid(`itxn_field ${capitalizeFirstChar(key)}`);
        });
      } else {
        this.processNode(p.value);
        this.pushVoid(`itxn_field ${capitalizeFirstChar(key)}`);
      }
    });

    this.pushVoid('itxn_submit');
  }

  private processCallExpression(node: any) {
    this.addSourceComment(node);
    const opcodeNames = langspec.Ops.map((o) => o.Name);
    const methodName = node.callee?.property?.name || node.callee.name;

    if (node.callee.object === undefined) {
      if (opcodeNames.includes(methodName)) {
        this.processOpcode(node);
      } else if (TXN_METHODS.includes(methodName)) {
        this.processTransaction(node);
      } else if (['addr'].includes(methodName)) {
        this.push(`addr ${node.arguments[0].value}`, 'Account');
      }
    } else if (node.callee.object.type === AST_NODE_TYPES.ThisExpression) {
      const preArgsType = this.lastType;
      node.arguments.forEach((a: any) => this.processNode(a));
      this.lastType = preArgsType;
      this.pushVoid(`callsub ${methodName}`);
    } else if (Object.keys(this.storageProps).includes(node.callee.object.property?.name)) {
      this.processStorageCall(node);
    } else {
      if (node.callee.object.type === AST_NODE_TYPES.Identifier) {
        this.processNode(node.callee);
      } else {
        this.processNode(node.callee.object);
      }
      const preArgsType = this.lastType;
      node.arguments.forEach((a: any) => this.processNode(a));
      this.lastType = preArgsType;

      this.tealFunction(this.lastType!, node.callee.property.name)();
    }
  }

  private processStorageExpression(node: any) {
    const target = this.frame[node.object.name] || this.scratch[node.object.name];
    const opcode = this.frame[node.object.name] ? 'frame_dig' : 'load';

    this.push(`${opcode} ${target.index} // ${node.object.name}: ${target.type}`, target.type);

    this.tealFunction(target.type, node.property.name, true)();

    this.lastType = target.type;
  }

  private getChain(node: any, chain: any[] = []): any[] {
    if (node.object.type === AST_NODE_TYPES.MemberExpression) {
      chain.push(node.object);
      return this.getChain(node.object, chain);
    } if (node.object.type === AST_NODE_TYPES.CallExpression) {
      chain.push(node.object);
      return this.getChain(node.object.callee, chain);
    }
    return chain;
  }

  private processMemberExpression(node: any) {
    const chain = this.getChain(node).reverse();

    chain.push(node);

    chain.forEach((n: any) => {
      if (n.type === AST_NODE_TYPES.CallExpression) {
        this.processCallExpression(n);
        return;
      }

      if (n.object?.name === 'globals') {
        this.tealFunction('global', n.property.name)();
        return;
      }

      if (this.frame[n.object?.name] || this.scratch[n.object?.name]) {
        this.processStorageExpression(n);
        return;
      }

      if (n.object?.type === AST_NODE_TYPES.ThisExpression) {
        switch (n.property.name) {
          case 'txnGroup':
            this.lastType = 'GroupTxn';
            break;
          case 'app':
            this.lastType = 'Application';
            this.pushVoid('txna Applications 0');
            break;
          default:
            this.lastType = n.property.name;
            break;
        }

        return;
      }

      if (n.property.type !== AST_NODE_TYPES.Identifier) {
        const prevType = this.lastType;
        this.processNode(n.property);
        this.lastType = prevType;
        return;
      }

      const { name } = n.property;

      this.tealFunction(this.lastType!, name)();
    });
  }

  private tealFunction(calleeType: string, name: string, checkArgs: boolean = false) {
    let type = calleeType;
    if (type.includes('Txn')) {
      type = 'gtxns';
    }

    if (!name.startsWith('has')) {
      if (this.OP_PARAMS[type] === undefined) return undefined;
      const paramObj = this.OP_PARAMS[type].find((p) => {
        let paramName = p.name.replace(/^Acct/, '');

        if (type === 'Application') paramName = paramName.replace(/^App/, '');
        if (type === 'Asset') paramName = paramName.replace(/^Asset/, '');
        return paramName === capitalizeFirstChar(name);
      });

      if (!paramObj) throw new Error(`Unknown method: ${type}.${name}`);

      if (!checkArgs || paramObj.args === 1) {
        return paramObj.fn;
      }
      return () => {};
    }

    switch (name) {
      case 'hasBalance':
        return () => this.hasMaybeValue('acct_params_get AcctBalance');
      case 'hasAsset':
        if (!checkArgs) {
          return () => this.hasMaybeValue('asset_holding_get AssetBalance');
        }
        return () => {};
      default:
        throw new Error(`Unknown method: ${type}.${name}`);
    }
  }

  private processLiteral(node: any) {
    const litType = typeof node.value;
    if (litType === 'string') {
      this.push(`byte "${node.value}"`, 'bytes');
    } else {
      this.push(`int ${node.value}`, 'uint64');
    }
  }

  async algodCompile(): Promise<string> {
    const response = await fetch('https://mainnet-api.algonode.cloud/v2/teal/compile?sourcemap=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-API-Key': 'a'.repeat(64),
      },
      body: this.prettyTeal(),
    });

    const json = await response.json();

    if (response.status !== 200) {
      throw new Error(`${response.statusText}: ${json.message}`);
    }

    const pcList = json.sourcemap.mappings.split(';').map((m: string) => {
      const decoded = vlq.decode(m);
      if (decoded.length > 2) return decoded[2];
      return undefined;
    });

    let lastLine = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const [pc, lineDelta] of pcList.entries()) {
      // If the delta is not undefined, the lastLine should be updated with
      // lastLine + the delta
      if (lineDelta !== undefined) {
        lastLine += lineDelta;
      }

      if (!(lastLine in this.lineToPc)) this.lineToPc[lastLine] = [];

      this.lineToPc[lastLine].push(pc);
      this.pcToLine[pc] = lastLine;
    }

    return json.result;
  }

  addSourceComment(node: any) {
    if (
      node.range[0] >= this.lastSourceCommentRange[0]
      && node.range[0] <= this.lastSourceCommentRange[1]
    ) return;

    const methodName = node.callee?.property?.name || node.callee?.name;
    let content = this.content.substring(node.range[0], node.range[1]).replace(/\n/g, '\n//');

    if (TXN_METHODS.includes(methodName)) {
      [content] = content.split('\n');
    } else {
      this.lastSourceCommentRange = node.range;
    }

    if (this.filename) this.pushVoid(`// ${this.filename}:${node.loc.start.line}`);
    this.pushVoid(`// ${content}`);
  }
}
