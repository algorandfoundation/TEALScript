/* eslint-disable no-unused-vars */
import * as parser from '@typescript-eslint/typescript-estree';
import fetch from 'node-fetch';
import * as vlq from 'vlq';
import * as ts from 'typescript';

import * as langspec from '../langspec.json';

function capitalizeFirstChar(str: string) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

// Represents the stack types available in the AVM
// eslint-disable-next-line no-shadow
enum StackType {
  none = 'void',
  uint64 = 'uint64',
  bytes = 'bytes',
  any = 'any',
}

// TODO: add VirtualType for things like tuple/array but distinct from ABI types?

// Represents the type_enum for a transaction
// eslint-disable-next-line no-shadow
enum TransactionType {
  PaymentTx = 'pay',
  KeyRegistrationTx = 'keyreg',
  AssetConfigTx = 'acfg',
  AssetTransferTx = 'axfer',
  AssetFreezeTx = 'afrz',
  ApplicationCallTx = 'appl',
  StateProofTx = 'stpf',
}

// eslint-disable-next-line no-shadow
enum ForeignType {
  Asset = 'Asset',
  Account = 'Account',
  Application = 'Application',
}

const TXN_METHODS = [
  'sendPayment',
  'sendAppCall',
  'sendMethodCall',
  'sendAssetTransfer',
];

const CONTRACT_SUBCLASS = 'Contract';

const PARAM_TYPES: { [param: string]: string } = {
  // Account
  AcctAuthAddr: ForeignType.Account,
  // Application
  AppCreator: ForeignType.Account,
  AppAddress: ForeignType.Account,
  AssetManager: ForeignType.Account,
  AssetReserve: ForeignType.Account,
  AssetFreeze: ForeignType.Account,
  AssetClawback: ForeignType.Account,
  AssetCreator: ForeignType.Account,
  // Global
  ZeroAddress: ForeignType.Account,
  CurrentApplicationID: ForeignType.Application,
  CreatorAddress: ForeignType.Account,
  CurrentApplicationAddress: ForeignType.Account,
  CallerApplicationID: ForeignType.Application,
  CallerApplicationAddress: ForeignType.Account,
  // Txn
  Sender: ForeignType.Account,
  Receiver: ForeignType.Account,
  CloseRemainderTo: ForeignType.Account,
  XferAsset: ForeignType.Asset,
  AssetSender: ForeignType.Account,
  AssetReceiver: ForeignType.Account,
  AssetCloseTo: ForeignType.Account,
  ApplicationID: ForeignType.Application,
  RekeyTo: ForeignType.Account,
  ConfigAsset: ForeignType.Asset,
  ConfigAssetManager: ForeignType.Account,
  ConfigAssetReserve: ForeignType.Account,
  ConfigAssetFreeze: ForeignType.Account,
  ConfigAssetClawback: ForeignType.Account,
  FreezeAsset: ForeignType.Asset,
  FreezeAssetAccount: ForeignType.Account,
  CreatedAssetID: ForeignType.Asset,
  CreatedApplicationID: ForeignType.Application,
  ApplicationArgs: `${StackType.bytes}[]`,
  Applications: `${ForeignType.Application}[]`,
  Assets: `${ForeignType.Asset}[]`,
  Accounts: `${ForeignType.Account}[]`,
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
  type: string;
  key?: string;
  defaultSize?: number;
  keyType: string;
  valueType: string;
}

interface Subroutine {
  name: string;
  returnType: string;
  decorators?: string[];
}

// These should probably be types rather than strings?
function isNumeric(t: string): boolean {
  return ['uint64', 'Asset', 'Application'].includes(t);
}

function isRefType(t: string): boolean {
  return ['Account', 'Asset', 'Application'].includes(t);
}

export default class Compiler {
  teal: string[];

  private scratch: any;

  private scratchIndex: number;

  private ifCount: number;

  filename?: string;

  content: string;

  private processErrorNodes: any[] = [];

  private frame: any;

  private currentSubroutine: Subroutine;

  abi: any;

  private storageProps: { [key: string]: StorageProp };

  private lastType: string | undefined;

  private contractClasses: string[];

  name: string;

  pcToLine: { [key: number]: number };

  lineToPc: { [key: number]: number[] };

  private lastSourceCommentRange: [number, number];

  private readonly OP_PARAMS: { [type: string]: any[] } = {
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
          this.maybeValue('app_global_get_ex', StackType.bytes);
        },
      },
    ],
    txn: this.getOpParamObjects('txn'),
    global: this.getOpParamObjects('global'),
    itxn: this.getOpParamObjects('itxn'),
    gtxns: this.getOpParamObjects('gtxns'),
  };

  private storageFunctions: {[type: string]: {[f: string]: Function}} = {
    global: {
      get: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.push('app_global_get', valueType);
      },
      put: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.processNode(node.arguments[key ? 0 : 1]);

        this.push('app_global_put', valueType);
      },
      delete: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.pushVoid('app_global_del');
      },
      exists: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        this.pushVoid('txna Applications 0');

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.hasMaybeValue('app_global_get_ex');
      },
    },
    local: {
      get: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        this.processNode(node.arguments[0]);

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[1]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.push('app_local_get', valueType);
      },
      put: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        this.processNode(node.arguments[0]);

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[1]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.processNode(node.arguments[key ? 1 : 2]);

        this.push('app_local_put', valueType);
      },
      delete: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        this.processNode(node.arguments[0]);

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[1]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.pushVoid('app_local_del');
      },
      exists: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;
        this.processNode(node.arguments[0]);
        this.pushVoid('txna Applications 0');

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[1]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.hasMaybeValue('app_local_get_ex');
      },
    },
    box: {
      get: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.maybeValue('box_get', valueType);
        if (isNumeric(valueType)) this.pushVoid('btoi');
      },
      put: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.processNode(node.arguments[key ? 0 : 1]);
        if (isNumeric(valueType)) this.pushVoid('itob');

        this.push('box_put', valueType);
      },
      delete: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.pushVoid('box_del');
      },
      exists: (node: ts.CallExpression) => {
        // @ts-ignore
        const name = node.expression.expression.name.getText();
        const {
          valueType, keyType, key,
        } = this.storageProps[name] as StorageProp;

        if (key) {
          this.pushVoid(`byte "${key}"`);
        } else {
          this.processNode(node.arguments[0]);
          if (isNumeric(keyType)) this.pushVoid('itob');
        }

        this.hasMaybeValue('box_get');
      },
    },
  };

  private andCount: number = 0;

  private orCount: number = 0;

  private sourceFile!: ts.SourceFile;

  constructor(content: string, className: string, filename?: string) {
    this.filename = filename;
    this.content = content;
    this.teal = ['#pragma version 8', 'b main'];
    this.scratch = {};
    this.scratchIndex = 0;
    this.ifCount = 0;
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
      const type = PARAM_TYPES[arg]
        || opSpec.ArgEnumTypes![i].replace('B', StackType.bytes).replace('U', StackType.uint64);

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

  async compile() {
    const src = ts.createSourceFile(this.filename || '', this.content, ts.ScriptTarget.ES2019, true);
    this.sourceFile = src;

    src.statements.forEach((body) => {
      if (!ts.isClassDeclaration(body)) return;

      if (
        body.heritageClauses === undefined
        || !ts.isIdentifier(body.heritageClauses[0].types[0].expression)
      ) return;

      if (body.heritageClauses[0].types[0].expression.text === CONTRACT_SUBCLASS) {
        const className = body.name!.text;
        this.contractClasses.push(className);

        if (className === this.name) {
          // TODO: Comments
          this.abi = { name: className, desc: '', methods: [] };

          this.processNode(body);
        }
      }
    });

    if (!this.teal.includes('main:')) {
      this.pushVoid('main:');
      this.routeAbiMethods();
    }

    this.teal = await Promise.all(
      this.teal.map(async (t) => {
        if (t.includes('PENDING_COMPILE: ')) {
          const c = new Compiler(this.content, t.split(' ')[1], this.filename);
          await c.compile();
          const program = await c.algodCompile();
          return `byte b64 ${program}`;
        }
        return t;
      }),
    );
  }

  private push(teal: string, type: string) {
    this.teal.push(teal);
    if (type !== 'void') this.lastType = type;
  }

  private pushVoid(teal: string) {
    this.push(teal, 'void');
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
      this.pushMethod(
        m.name,
        m.args.map((a: any) => a.type),
        m.returns.type,
      );
    });
    this.pushVoid('txna ApplicationArgs 0');
    this.pushVoid(
      `match ${this.abi.methods
        .map((m: any) => `abi_route_${m.name}`)
        .join(' ')}`,
    );
  }

  private maybeValue(opcode: string, type: string) {
    this.pushVoid(opcode);
    this.push('assert', type);
  }

  private hasMaybeValue(opcode: string) {
    this.pushVoid(opcode);
    this.pushVoid('swap');
    this.push('pop', StackType.uint64);
  }

  private processNode(node: ts.Node) {
    // TODO: this.popComments(node.loc.start.line);

    try {
      switch (node.kind) {
        // Contract organizational
        case ts.SyntaxKind.ClassDeclaration:
          this.processClassDeclaration(node as ts.ClassDeclaration);
          break;
        case ts.SyntaxKind.PropertyDeclaration:
          this.processPropertyDefinition(node as ts.PropertyDeclaration);
          break;
        case ts.SyntaxKind.MethodDeclaration:
          this.processMethodDefinition(node as ts.MethodDeclaration);
          break;
        case ts.SyntaxKind.PropertyAccessExpression:
          this.processMemberExpression(node as ts.PropertyAccessExpression);
          break;
        case ts.SyntaxKind.AsExpression:
          this.processTSAsExpression(node as ts.AsExpression);
          break;
        case ts.SyntaxKind.NewExpression:
          this.processNewExpression(node as ts.NewExpression);
          break;

        // Vars/Consts
        case ts.SyntaxKind.Identifier:
          this.processIdentifier(node as ts.Identifier);
          break;
        case ts.SyntaxKind.VariableDeclarationList:
          this.processVariableDeclaration(node as ts.VariableDeclarationList);
          break;
        case ts.SyntaxKind.VariableDeclaration:
          this.processVariableDeclarator(node as ts.VariableDeclaration);
          break;
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NumericLiteral:
          this.processLiteral(node as ts.StringLiteral | ts.NumericLiteral);
          break;

        // Logical
        case ts.SyntaxKind.Block:
          this.processBlockStatement(node as ts.Block);
          break;
        case ts.SyntaxKind.IfStatement:
          this.processIfStatement(node as ts.IfStatement);
          break;
        case ts.SyntaxKind.PrefixUnaryExpression:
          this.processUnaryExpression(node as ts.PrefixUnaryExpression);
          break;
        case ts.SyntaxKind.BinaryExpression:
          this.processBinaryExpression(node as ts.BinaryExpression);
          break;
        case ts.SyntaxKind.CallExpression:
          this.processCallExpression(node as ts.CallExpression);
          break;
        case ts.SyntaxKind.ExpressionStatement:
          this.processExpressionStatement(node as ts.ExpressionStatement);
          break;
        case ts.SyntaxKind.ReturnStatement:
          this.processReturnStatement(node as ts.ReturnStatement);
          break;
        case ts.SyntaxKind.HeritageClause:
          break;
        case ts.SyntaxKind.ParenthesizedExpression:
          this.processNode((node as ts.ParenthesizedExpression).expression);
          break;
        case ts.SyntaxKind.VariableStatement:
          this.processNode((node as ts.VariableStatement).declarationList);
          break;
        case ts.SyntaxKind.ElementAccessExpression:
          this.processElementAccessExpression(node as ts.ElementAccessExpression);
          break;

        // unhandled
        default:
          throw new Error(`Unknown node type: ${node.kind}`);
      }
    } catch (e: any) {
      if (
        e instanceof TypeError
        && e.message.includes('this[node.type] is not a function')
      ) {
        this.processErrorNodes.push(node);

        const errNode = this.processErrorNodes[0];
        e.message = `TEALScript can not process ${errNode.type} at ${
          this.filename
        }:${errNode.loc.start.line}:${
          errNode.loc.start.column
        }\n ${this.content.substring(errNode.range[0], errNode.range[1])}`;
      }
      throw e;
    }
  }

  private processElementAccessExpression(node: ts.ElementAccessExpression) {
    switch ((node.expression as ts.PropertyAccessExpression).name.getText()) {
      case 'txnGroup':
        this.processNode(node.argumentExpression);
        this.lastType = 'GroupTxn';
        break;
      default:
        this.processNode(node.expression);
        this.push(`${this.teal.pop()} ${(node.argumentExpression as ts.NumericLiteral).text}`, this.lastType!.replace('[]', ''));
        break;
    }
  }

  private processMethodDefinition(node: ts.MethodDeclaration) {
    // TODO: raise exception?
    if (!ts.isIdentifier(node.name)) return;
    this.currentSubroutine.name = node.name.getText();

    // TODO: raise exception for no return val?
    const returnType = node.type?.getText();
    if (returnType === undefined) return;
    this.currentSubroutine.returnType = returnType;

    // TODO: Error here
    if (!node.body) return;

    if (node.modifiers && node.modifiers[0].kind === ts.SyntaxKind.PrivateKeyword) {
      this.processSubroutine(node);
      return;
    }

    this.currentSubroutine.decorators = (ts.getDecorators(node) || []).map(
      (d) => d.expression.getText(),
    );

    // TODO: error
    this.processAbiMethod(node);
  }

  private processClassDeclaration(node: ts.ClassDeclaration) {
    node.members.forEach((m) => {
      this.processNode(m);
    });
  }

  private processBlockStatement(node: ts.Block) {
    node.statements.forEach((s) => {
      this.processNode(s);
    });
  }

  private processReturnStatement(node: ts.ReturnStatement) {
    this.addSourceComment(node);
    if (node.expression !== undefined) this.processNode(node.expression);

    if (isNumeric(this.currentSubroutine.returnType)) { this.pushVoid('itob'); }

    this.pushVoid('byte 0x151f7c75');
    this.pushVoid('swap');
    this.pushVoid('concat');
    this.pushVoid('log');
  }

  private processBinaryExpression(node: ts.BinaryExpression) {
    if (['&&', '||'].includes(node.operatorToken.getText())) {
      this.processLogicalExpression(node);
      return;
    }

    this.processNode(node.left);
    const leftType = this.lastType!;
    this.processNode(node.right);

    if (leftType !== this.lastType) throw new Error(`Type mismatch (${leftType} !== ${this.lastType}`);

    const operator = node.operatorToken.getText().replace('===', '==').replace('!==', '!=');
    if (this.lastType === StackType.uint64) {
      this.push(operator, StackType.uint64);
    } else if (this.lastType.startsWith('uint') || this.lastType.startsWith('uifxed')) {
      this.push(`b${operator}`, leftType);
    } else {
      this.push(operator, StackType.uint64);
    }
  }

  private processLogicalExpression(node: ts.BinaryExpression) {
    this.processNode(node.left);

    let label: string;

    if (node.operatorToken.getText() === '&&') {
      label = `skip_and${this.andCount}`;
      this.andCount += 1;

      this.pushVoid('dup');
      this.pushVoid(`bz ${label}`);
    } else if (node.operatorToken.getText() === '||') {
      label = `skip_or${this.orCount}`;
      this.orCount += 1;

      this.pushVoid('dup');
      this.pushVoid(`bnz ${label}`);
    }

    this.processNode(node.right);
    this.push(node.operatorToken.getText(), StackType.uint64);
    this.pushVoid(`${label!}:`);
  }

  private processIdentifier(node: ts.Identifier) {
    if (this.contractClasses.includes(node.getText())) {
      this.pushVoid(`PENDING_COMPILE: ${node.getText()}`);
      return;
    }
    const target = this.frame[node.getText()] || this.scratch[node.getText()];
    const opcode = this.frame[node.getText()] ? 'frame_dig' : 'load';

    this.push(
      `${opcode} ${target.index} // ${node.getText()}: ${target.type}`,
      target.type,
    );
  }

  private processNewExpression(node: ts.NewExpression) {
    (node.arguments || []).forEach((a) => {
      this.processNode(a);
    });

    this.lastType = node.expression.getText();
  }

  private processTSAsExpression(node: ts.AsExpression) {
    this.processNode(node.expression);

    const type = node.type.getText();
    if (type.startsWith('uint') && type !== this.lastType) {
      const typeBitWidth = parseInt(type.replace('uint', ''), 10);
      const lastBitWidth = parseInt(this.lastType!.replace('uint', ''), 10);

      // eslint-disable-next-line no-console
      if (lastBitWidth > typeBitWidth) console.warn('WARNING: Converting value from ', this.lastType, 'to ', type, 'may result in loss of precision');

      if (this.lastType === 'uint64') this.pushVoid('itob');
      this.pushVoid(`byte 0x${'FF'.repeat(typeBitWidth / 8)}`);
      this.pushVoid('b&');
    }

    this.lastType = type;
  }

  private processVariableDeclaration(node: ts.VariableDeclarationList) {
    node.declarations.forEach((d) => {
      this.processNode(d);
    });
  }

  private processVariableDeclarator(node: ts.VariableDeclaration) {
    this.addSourceComment(node);
    const name = node.name.getText();

    // TODO: Error if no initializer?
    if (!node.initializer) return;

    this.processNode(node.initializer);

    this.scratch[name] = {
      index: this.scratchIndex,
      type: this.lastType,
    };

    this.pushVoid(`store ${this.scratchIndex} // ${name}: ${this.lastType}`);
    this.scratchIndex += 1;
  }

  private processExpressionStatement(node: ts.ExpressionStatement) {
    this.processNode(node.expression);
  }

  private processCallExpression(node: ts.CallExpression) {
    this.addSourceComment(node);
    const opcodeNames = langspec.Ops.map((o) => o.Name);
    const methodName = (node.expression as ts.PropertyAccessExpression).name?.getText()
    || node.expression.getText();

    if (!ts.isPropertyAccessExpression(node.expression)) {
      if (opcodeNames.includes(methodName)) {
        this.processOpcode(node);
      } else if (TXN_METHODS.includes(methodName)) {
        this.processTransaction(node);
      } else if (['addr'].includes(methodName)) {
        this.push(`addr ${(node.arguments[0] as ts.StringLiteral).text}`, ForeignType.Account);
      } else if (['method'].includes(methodName)) {
        this.push(`method "${(node.arguments[0] as ts.StringLiteral).text}"`, StackType.bytes);
      }
    } else if (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
      const preArgsType = this.lastType;
      node.arguments.forEach((a) => this.processNode(a));
      this.lastType = preArgsType;
      this.pushVoid(`callsub ${methodName}`);
    } else if (
      Object.keys(this.storageProps)
        .includes((node.expression.expression as ts.PropertyAccessExpression)?.name?.getText())
    ) {
      this.processStorageCall(node);
    } else {
      if (node.expression.expression.kind === ts.SyntaxKind.Identifier) {
        this.processNode(node.expression);
      } else {
        this.processNode(node.expression.expression);
      }
      const preArgsType = this.lastType;
      node.arguments.forEach((a) => this.processNode(a));
      this.lastType = preArgsType;

      this.tealFunction(this.lastType!, node.expression.name.getText());
    }
  }

  private processIfStatement(node: ts.IfStatement, elseIfCount: number = 0) {
    let labelPrefix: string;

    if (elseIfCount === 0) {
      labelPrefix = `if${this.ifCount}`;
      this.pushVoid(`// ${labelPrefix}_condition`);
    } else {
      labelPrefix = `if${this.ifCount}_elseif${elseIfCount}`;
      this.pushVoid(`${labelPrefix}_condition:`);
    }

    this.addSourceComment(node.expression);
    this.processNode(node.expression);

    if (node.elseStatement == null) {
      this.pushVoid(`bz if${this.ifCount}_end`);
      this.pushVoid(`// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
    } else if (node.elseStatement.kind === ts.SyntaxKind.IfStatement) {
      this.pushVoid(`bz if${this.ifCount}_elseif${elseIfCount + 1}_condition`);
      this.pushVoid(`// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
      this.pushVoid(`b if${this.ifCount}_end`);
      this.processIfStatement(node.elseStatement as ts.IfStatement, elseIfCount + 1);
    } else if (node.thenStatement.kind === ts.SyntaxKind.Block) {
      this.pushVoid(`bz if${this.ifCount}_else`);
      this.pushVoid(`// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
      this.pushVoid(`b if${this.ifCount}_end`);
      this.pushVoid(`if${this.ifCount}_else:`);
      this.processNode(node.elseStatement);
    } else {
      this.pushVoid(`bz if${this.ifCount}_end`);
      this.processNode(node.elseStatement);
    }

    if (elseIfCount === 0) {
      this.pushVoid(`if${this.ifCount}_end:`);
      this.ifCount += 1;
    }
  }

  private processUnaryExpression(node: ts.PrefixUnaryExpression) {
    this.processNode(node.operand);
    switch (node.operator) {
      case 53:
        this.pushVoid('!');
        break;
      default:
        throw new Error(`Unsupported unary operator ${node.operator}`);
    }
  }

  private processPropertyDefinition(node: ts.PropertyDeclaration) {
    if (node.initializer === undefined || !ts.isNewExpression(node.initializer)) throw new Error();

    const klass = node.initializer.expression.getText();

    if (['BoxMap', 'GlobalMap', 'LocalMap'].includes(klass)) {
      const props: StorageProp = {
        type: klass.toLocaleLowerCase().replace('map', ''),
        keyType: node.initializer.typeArguments![0].getText(),
        valueType: node.initializer.typeArguments![1].getText(),
      };

      if (node.initializer?.arguments?.[0] !== undefined) {
        const arg = node.initializer.arguments[0] as ts.ObjectLiteralExpression;
        const sizeProp = arg.properties.find(
          (p) => p.name?.getText() === 'defaultSize',
        );
        if (sizeProp) props.defaultSize = parseInt(sizeProp.name!.getText(), 10);
      }

      this.storageProps[node.name.getText()] = props;
    } else if (['BoxReference', 'GlobalReference', 'LocalReference'].includes(klass)) {
      if (node.initializer?.arguments?.[0] === undefined) throw new Error();
      const arg = node.initializer.arguments[0] as ts.ObjectLiteralExpression;
      const keyProp = arg.properties.find(
        (p) => p.name?.getText() === 'key',
      );

      const props: StorageProp = {
        type: klass.toLowerCase().replace('reference', ''),
        key: ((keyProp as ts.PropertyAssignment).initializer as ts.StringLiteral).text,
        keyType: 'string',
        valueType: node.initializer.typeArguments![0].getText(),
      };

      const sizeProp = arg.properties.find(
        (p) => p.name?.getText() === 'defaultSize',
      );
      if (sizeProp) props.defaultSize = parseInt(sizeProp.name!.getText(), 10);

      this.storageProps[node.name.getText()] = props;
    } else {
      throw new Error();
    }
  }

  private processLiteral(node: ts.StringLiteral | ts.NumericLiteral) {
    if (node.kind === ts.SyntaxKind.StringLiteral) {
      this.push(`byte "${node.text}"`, StackType.bytes);
    } else {
      this.push(`int ${node.text}`, StackType.uint64);
    }
  }

  private processMemberExpression(node: ts.PropertyAccessExpression) {
    const chain = this.getChain(node).reverse();

    chain.push(node);

    chain.forEach((n) => {
      if (this.lastType?.endsWith('[]')) {
        // this.push(`${this.teal.pop()} ${(n).argumentExpression.value}`, this.lastType.replace('[]', ''));
        return;
      }

      if (n.kind === ts.SyntaxKind.CallExpression) {
        this.processNode(n);
        return;
      }

      if (n.expression.getText() === 'globals') {
        this.tealFunction('global', n.name.getText());
        return;
      }

      if (this.frame[n.expression.getText()] || this.scratch[n.expression.getText()]) {
        this.processStorageExpression(n);
        return;
      }

      if (n.expression.kind === ts.SyntaxKind.ThisKeyword) {
        switch (n.name.getText()) {
          case 'app':
            this.lastType = 'Application';
            this.pushVoid('txna Applications 0');
            break;
          default:
            this.lastType = n.name.getText();
            break;
        }

        return;
      }

      if (n.name.kind !== ts.SyntaxKind.Identifier) {
        const prevType = this.lastType;
        this.processNode(n.name);
        this.lastType = prevType;
        return;
      }

      this.tealFunction(this.lastType!, n.name.getText());
    });
  }

  private processSubroutine(fn: ts.MethodDeclaration, abi: boolean = false) {
    this.pushVoid(`${this.currentSubroutine.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.frame));
    this.frame = {};

    this.pushVoid(
      `proto ${fn.parameters.length} ${
        this.currentSubroutine.returnType === 'void' || abi ? 0 : 1
      }`,
    );
    let frameIndex = 0;
    const params = new Array(...fn.parameters);
    params.reverse().forEach((p) => {
      if (p.type === undefined) throw new Error();

      const type = p.type.getText();

      frameIndex -= 1;
      this.frame[p.name.getText()] = {};
      this.frame[p.name.getText()].index = frameIndex;
      this.frame[p.name.getText()].type = type;
    });

    this.processNode(fn.body!);

    this.pushVoid('retsub');
    this.frame = lastFrame;
  }

  private processAbiMethod(fn: ts.MethodDeclaration) {
    let argCount = 0;
    this.pushVoid(`abi_route_${this.currentSubroutine.name}:`);
    const args: any[] = [];

    if (this.currentSubroutine.decorators?.length) {
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

    let gtxnIndex = fn.parameters.filter((p) => p.type?.getText().includes('Txn')).length;

    gtxnIndex += 1;

    fn.parameters.forEach((p) => {
      const type = p!.type!.getText();
      let abiType = type;

      if (type.includes('Txn')) {
        switch (type) {
          case 'PayTxn':
            abiType = TransactionType.PaymentTx;
            break;
          case 'AssetTransferTxn':
            abiType = TransactionType.AssetTransferTx;
            break;
          default:
            break;
        }
      } else {
        this.pushVoid(`txna ApplicationArgs ${(argCount += 1)}`);
      }

      if (type === StackType.uint64) {
        this.pushVoid('btoi');
      } else if (isRefType(type)) {
        this.pushVoid('btoi');
        this.pushVoid(`txnas ${type}s`);
      } else if (type.includes('Txn')) {
        this.pushVoid('txn GroupIndex');
        this.pushVoid(`int ${(gtxnIndex -= 1)}`);
        this.pushVoid('-');
      }

      args.push({ name: p.name.getText(), type: abiType.toLocaleLowerCase(), desc: '' });
    });

    const returnType = this.currentSubroutine.returnType
      .toLocaleLowerCase()
      .replace(/asset|application/, 'uint64')
      .replace('account', 'address');

    this.abi.methods.push({
      name: this.currentSubroutine.name,
      args,
      desc: '',
      returns: { type: returnType, desc: '' },
    });

    this.pushVoid(`callsub ${this.currentSubroutine.name}`);
    this.pushVoid('int 1');
    this.pushVoid('return');
    this.processSubroutine(fn, true);
  }

  private processOpcode(node: ts.CallExpression) {
    const opSpec = langspec.Ops.find(
      (o) => o.Name === node.expression.getText(),
    ) as OpSpec;
    let line: string[] = [node.expression.getText()];

    if (opSpec.Size === 1) {
      const preArgsType = this.lastType;
      node.arguments.forEach((a) => this.processNode(a));
      this.lastType = preArgsType;
    } else if (opSpec.Size === 0) {
      line = line.concat(node.arguments.map((a) => a.getText()));
    } else {
      line = line.concat(
        node.arguments.slice(0, opSpec.Size - 1).map((a) => a.getText()),
      );
    }

    this.pushVoid(line.join(' '));
  }

  private processStorageCall(node: ts.CallExpression) {
    // @ts-ignore
    const op = node.expression.name.getText();
    // @ts-ignore
    const { type } = this.storageProps[node.expression.expression.name.getText()] as StorageProp;

    this.storageFunctions[type][op](node);
  }

  private processTransaction(node: ts.CallExpression) {
    let txnType = '';

    switch (node.expression.getText()) {
      case 'sendPayment':
        txnType = TransactionType.PaymentTx;
        break;
      case 'sendAssetTransfer':
        txnType = TransactionType.AssetTransferTx;
        break;
      case 'sendMethodCall':
      case 'sendAppCall':
        txnType = TransactionType.ApplicationCallTx;
        break;
      default:
        break;
    }

    this.pushVoid('itxn_begin');
    this.pushVoid(`int ${txnType}`);
    this.pushVoid('itxn_field TypeEnum');

    const nameProp = (node.arguments[0] as ts.ObjectLiteralExpression).properties.find(
      (p) => p.name?.getText() === 'name',

    );

    if (nameProp) {
      const argTypes = (node.typeArguments![0] as ts.TupleTypeNode).elements.map(
        (t) => t.getText(),
      );
      const returnType = node.typeArguments![1].getText();

      this.pushVoid(
        `method "${((nameProp as ts.PropertyAssignment).initializer as ts.StringLiteral).text}(${argTypes
          .join(',')
          .toLowerCase()})${returnType.toLowerCase()}"`,
      );
      this.pushVoid('itxn_field ApplicationArgs');
    }

    ((node.arguments[0] as ts.ObjectLiteralExpression)
      .properties as unknown as ts.PropertyAssignment[])
      .forEach((p) => {
        const key = p.name?.getText();

        if (key === 'name') {
          return;
        }

        this.addSourceComment(p, true);

        if (key === 'OnCompletion') {
          this.pushVoid(`int ${(p.initializer as ts.StringLiteral).text}`);
          this.pushVoid('itxn_field OnCompletion');
        } else if (key === 'methodArgs') {
          const argTypes = (node.typeArguments![0] as ts.TupleTypeNode).elements.map(
            (t) => t.getText(),
          );
          let accountIndex = 1;
          let appIndex = 1;
          let assetIndex = 0;

          (p.initializer as ts.ArrayLiteralExpression).elements.forEach((e, i: number) => {
            if (argTypes[i] === ForeignType.Account) {
              this.processNode(e);
              this.pushVoid('itxn_field Accounts');
              this.pushVoid(`int ${accountIndex}`);
              this.pushVoid('itob');
              accountIndex += 1;
            } else if (argTypes[i] === ForeignType.Asset) {
              this.processNode(e);
              this.pushVoid('itxn_field Assets');
              this.pushVoid(`int ${assetIndex}`);
              this.pushVoid('itob');
              assetIndex += 1;
            } else if (argTypes[i] === ForeignType.Application) {
              this.processNode(e);
              this.pushVoid('itxn_field Applications');
              this.pushVoid(`int ${appIndex}`);
              this.pushVoid('itob');
              appIndex += 1;
            } else if (argTypes[i] === StackType.uint64) {
              this.processNode(e);
              this.pushVoid('itob');
            } else {
              this.processNode(e);
            }
            this.pushVoid('itxn_field ApplicationArgs');
          });
        } else if (p.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
          (p.initializer as ts.ArrayLiteralExpression).elements.forEach((e) => {
            this.processNode(e);
            this.pushVoid(`itxn_field ${capitalizeFirstChar(key)}`);
          });
        } else {
          this.processNode(p.initializer);
          this.pushVoid(`itxn_field ${capitalizeFirstChar(key)}`);
        }
      });

    this.pushVoid('itxn_submit');
  }

  private processStorageExpression(node: ts.PropertyAccessExpression) {
    const name = node.expression.getText();
    const target = this.frame[name] || this.scratch[name];
    const opcode = this.frame[name] ? 'frame_dig' : 'load';

    this.push(
      `${opcode} ${target.index} // ${name}: ${target.type}`,
      target.type,
    );

    this.tealFunction(target.type, node.name.getText(), true);
  }

  private getChain(
    node: ts.PropertyAccessExpression,
    chain: (ts.PropertyAccessExpression | ts.CallExpression)[] = [],
  ): (ts.PropertyAccessExpression | ts.CallExpression)[] {
    if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
      chain.push(node.expression as ts.PropertyAccessExpression);
      return this.getChain(node.expression as ts.PropertyAccessExpression, chain);
    }
    if (node.expression.kind === ts.SyntaxKind.CallExpression) {
      chain.push(node.expression as ts.CallExpression);
      return this.getChain(
        (node.expression as ts.CallExpression).expression as ts.PropertyAccessExpression,
        chain,
      );
    }
    return chain;
  }

  private tealFunction(calleeType: string, name: string, checkArgs: boolean = false): void {
    let type = calleeType;
    if (type.includes('Txn')) {
      type = 'gtxns';
    }

    if (!name.startsWith('has')) {
      const paramObj = this.OP_PARAMS[type].find((p) => {
        let paramName = p.name.replace(/^Acct/, '');

        if (type === ForeignType.Application) paramName = paramName.replace(/^App/, '');
        if (type === ForeignType.Asset) paramName = paramName.replace(/^Asset/, '');
        return paramName === capitalizeFirstChar(name);
      });

      if (!paramObj) throw new Error(`Unknown method: ${type}.${name}`);

      if (!checkArgs || paramObj.args === 1) {
        paramObj.fn();
      }
      return;
    }

    switch (name) {
      case 'hasBalance':
        this.hasMaybeValue('acct_params_get AcctBalance');
        return;
      case 'hasAsset':
        if (!checkArgs) {
          this.hasMaybeValue('asset_holding_get AssetBalance');
        }
        return;
      default:
        throw new Error(`Unknown method: ${type}.${name}`);
    }
  }

  async algodCompile(): Promise<string> {
    const response = await fetch(
      'https://mainnet-api.algonode.cloud/v2/teal/compile?sourcemap=true',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'X-API-Key': 'a'.repeat(64),
        },
        body: this.prettyTeal(),
      },
    );

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

  private addSourceComment(node: ts.Node, force: boolean = false) {
    if (
      !force
      && node.getStart() >= this.lastSourceCommentRange[0]
      && node.getEnd() <= this.lastSourceCommentRange[1]
    ) { return; }

    const lineNum = ts.getLineAndCharacterOfPosition(this.sourceFile, node.getStart()).line + 1;

    if (this.filename) { this.pushVoid(`// ${this.filename}:${lineNum}`); }
    this.pushVoid(`// ${node.getText().replace(/\n/g, '\n//').split('\n')[0]}`);

    this.lastSourceCommentRange = [node.getStart(), node.getEnd()];
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
}
