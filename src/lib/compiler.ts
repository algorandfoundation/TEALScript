/* eslint-disable no-plusplus */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import fetch from 'node-fetch';
import * as vlq from 'vlq';
import ts from 'typescript';
import sourceMap from 'source-map';
import path from 'path';
import * as langspec from '../langspec.json';

export type CompilerOptions = {
  filename?: string,
  disableWarnings?: boolean,
  algodServer?: string,
  algodToken?: string,
  algodPort?: number,
}

export type SourceInfo = {
  filename: string;
  start: ts.LineAndCharacter;
  end: ts.LineAndCharacter;
};

// eslint-disable-next-line no-use-before-define
class TupleElement extends Array<TupleElement> {
  type!: string;

  headOffset!: number;

  arrayType: 'tuple' | 'dynamic' | 'static' | undefined;

  staticLength: number = 0;

  id!: number;

  // eslint-disable-next-line no-use-before-define
  parent?: TupleElement;

  static idCounter = 0;

  constructor(type: string, headOffset: number) {
    super();

    if (typeof type === 'number') return;

    this.id = TupleElement.idCounter;
    this.type = type;
    this.headOffset = headOffset;

    TupleElement.idCounter += 1;

    if (type.match(/\[\d+]$/)) {
      this.arrayType = 'static';
      this.staticLength = parseInt(type.match(/\[\d+]$/)![0].match(/\d+/)![0], 10);
    } else if (type.endsWith('[]')) {
      this.arrayType = 'dynamic';
    } else if (type.startsWith('[') || type.startsWith('{')) {
      this.arrayType = 'tuple';
    }
  }

  add(...elements: TupleElement[]) {
    elements.forEach((e: TupleElement) => { e.parent = this; });
    return this.push(...elements);
  }
}

function stringToExpression(str: string): ts.Expression {
  if (str.startsWith('{')) {
    const srcFile = ts.createSourceFile('', `const dummy: ${str}`, ts.ScriptTarget.ES2019, true);

    const types: string[] = [];
    srcFile.statements[0].forEachChild((n) => {
      if (!ts.isVariableDeclarationList(n)) throw new Error();
      n.declarations.forEach((d) => {
        if (!ts.isTypeLiteralNode(d.type!)) throw new Error();

        d.type.members.forEach((m, i) => {
          if (!ts.isPropertySignature(m)) throw new Error();
          types.push(m.type!.getText());
        });
      });
    });

    return stringToExpression(`[${types.join(',')}]`);
  } {
    const srcFile = ts.createSourceFile('', str, ts.ScriptTarget.ES2019, true);
    return (srcFile.statements[0] as ts.ExpressionStatement).expression;
  }
}

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
  Asset = 'asset',
  Address = 'address',
  Application = 'application',
}

const TXN_TYPES = [
  'txn',
  'pay',
  'keyreg',
  'acfg',
  'axfer',
  'afrz',
  'appl',
];

const TXN_METHODS = [
  'sendPayment',
  'sendAppCall',
  'sendMethodCall',
  'sendAssetTransfer',
  'sendAssetCreation',
  'sendAssetFreeze',
  'sendAssetConfig',
  'sendOnlineKeyRegistration',
  'sendOfflineKeyRegistration',
];

const CONTRACT_SUBCLASS = 'Contract';

const PARAM_TYPES: { [param: string]: string } = {
  // Account
  AcctAuthAddr: ForeignType.Address,
  // Application
  AppCreator: ForeignType.Address,
  AppAddress: ForeignType.Address,
  AssetManager: ForeignType.Address,
  AssetReserve: ForeignType.Address,
  AssetFreeze: ForeignType.Address,
  AssetClawback: ForeignType.Address,
  AssetCreator: ForeignType.Address,
  // Global
  ZeroAddress: ForeignType.Address,
  CurrentApplicationID: ForeignType.Application,
  CreatorAddress: ForeignType.Address,
  CurrentApplicationAddress: ForeignType.Address,
  CallerApplicationID: ForeignType.Application,
  CallerApplicationAddress: ForeignType.Address,
  // Txn
  Sender: ForeignType.Address,
  Receiver: ForeignType.Address,
  CloseRemainderTo: ForeignType.Address,
  XferAsset: ForeignType.Asset,
  AssetSender: ForeignType.Address,
  AssetReceiver: ForeignType.Address,
  AssetCloseTo: ForeignType.Address,
  ApplicationID: ForeignType.Application,
  RekeyTo: ForeignType.Address,
  ConfigAsset: ForeignType.Asset,
  ConfigAssetManager: ForeignType.Address,
  ConfigAssetReserve: ForeignType.Address,
  ConfigAssetFreeze: ForeignType.Address,
  ConfigAssetClawback: ForeignType.Address,
  FreezeAsset: ForeignType.Asset,
  FreezeAssetAccount: ForeignType.Address,
  CreatedAssetID: ForeignType.Asset,
  CreatedApplicationID: ForeignType.Application,
  ApplicationArgs: `ImmediateArray: ${StackType.bytes}`,
  Applications: `ImmediateArray: ${ForeignType.Application}`,
  Assets: `ImmediateArray: ${ForeignType.Asset}`,
  Accounts: `ImmediateArray: ${ForeignType.Address}`,
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
  keyType: string;
  valueType: string;
  dynamicSize?: boolean;
  prefix?: string;
}

interface Subroutine {
  name: string;
  returnType: string;
  decorators?: string[];
}

// These should probably be types rather than strings?
function isNumeric(t: string): boolean {
  return ['uint64', 'asset', 'application'].includes(t);
}

function isRefType(t: string): boolean {
  return ['account', 'asset', 'application'].includes(t);
}

const scratch = {
  fullArray: '0 // full array',
  elementStart: '1 // element start',
  elementLength: '2 // element length',
  newElement: '3 // new element',
  elementHeadOffset: '4 // element head offset',
  lengthDifference: '5 // length difference',
  subtractHeadDifference: '7 // subtract head difference',
  spliceStart: '12 // splice start',
  spliceByteLength: '13 // splice byte length',
};

export default class Compiler {
  teal: string[] = ['#pragma version 8', 'b main'];

  clearTeal: string[] = ['#pragma version 8'];

  generatedTeal: string = '';

  generatedClearTeal: string = '';

  private frameInfo: {
    [name: string]: {
      start: number,
      end: number,
      frame: {
        [index: number]: {
          name: string,
          type: string,
        }
      }
    }
  } = {};

  private lastNode!: ts.Node;

  private mapKeyTypes: {
    global: string[]
    local: string[]
    box: string[]
  } = { global: [], local: [], box: [] };

  private rawSrcMap: {source: SourceInfo, teal: number, pc: number}[] = [];

  srcMaps?: {
    pc: sourceMap.RawSourceMap,
    teal: sourceMap.RawSourceMap,
  };

  private customTypes: {[name: string] : string} = {};

  private frameIndex: number = 0;

  private frameSize: {[methodName: string]: number} = {};

  private subroutines: {[methodName: string]: {returnType: string, args: number}} = {};

  private clearStateCompiled: boolean = false;

  private compilingApproval: boolean = true;

  private ifCount: number = -1;

  private ternaryCount: number = 0;

  private whileCount: number = 0;

  private forCount: number = 0;

  filename: string;

  content: string;

  private processErrorNodes: ts.Node[] = [];

  private frame: {[name: string] :{
    index?: number
    framePointer?:string
    type: string
    accessors?: (ts.Expression | string)[]
    storageExpression?: ts.CallExpression
    storageKeyFrame?: string
    storageAccountFrame?: string
    }
  } = {};

  private currentSubroutine: Subroutine = { name: '', returnType: '' };

  private bareOnCompletes: string[] = [];

  private bareCreate: boolean = false;

  private handledActions: {[method: string]: string[]} = {};

  abi: {
    name: string,
    desc: string,
    methods: {
      name: string,
      desc: string,
      args: {name: string, type: string, desc: string}[],
      returns: {type: string, desc: string},
      }[],
    } = {
      name: '', desc: '', methods: [],
    };

  private storageProps: { [key: string]: StorageProp } = {};

  private lastType: string = 'void';

  private contractClasses: string[] = [];

  name: string;

  pcToLine: { [key: number]: number } = {};

  lineToPc: { [key: number]: number[] } = {};

  private lastSourceCommentRange: [number, number] = [-1, -1];

  private comments: number[] = [];

  private typeHint?: string;

  private constants: {[name: string]: ts.Node};

  private readonly OP_PARAMS: {
    [type: string]: {name: string, type?: string, args: number, fn: (node: ts.Node) => void}[]
  } = {
      account: [
        ...this.getOpParamObjects('acct_params_get'),
        ...this.getOpParamObjects('asset_holding_get'),
      ],
      application: [
        ...this.getOpParamObjects('app_params_get'),
        {
          name: 'Global',
          type: 'any',
          args: 2,
          fn: (node: ts.Node) => {
            this.maybeValue(node, 'app_global_get_ex', StackType.any);
          },
        },
      ],
      txn: this.getOpParamObjects('txn'),
      global: this.getOpParamObjects('global'),
      itxn: this.getOpParamObjects('itxn'),
      gtxns: this.getOpParamObjects('gtxns'),
      asset: this.getOpParamObjects('asset_params_get'),
    };

  private checkDecoding(node: ts.Node, type: string) {
    if (type === 'bool') {
      this.pushLines(node, 'int 0', 'getbit');
    } else if (this.isDynamicArrayOfStaticType(type)) {
      this.pushVoid(node, 'extract 2 0');
    }
  }

  private storageFunctions: {[type: string]: {[f: string]: Function}} = {
    global: {
      get: (node: ts.CallExpression, storageKeyFrame?: string) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          valueType, keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else if (storageKeyFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageKeyFrame].index} // ${storageKeyFrame}`);
        } else {
          if (prefix) this.pushVoid(node.expression, `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.push(node.expression, 'app_global_get', valueType);
        if (valueType !== StackType.bytes) this.checkDecoding(node, valueType);
      },
      set: (node: ts.CallExpression, storageKeyFrame?: string) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          valueType, keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else if (storageKeyFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageKeyFrame].index} // ${storageKeyFrame}`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        if (node.arguments[key ? 0 : 1]) {
          this.processNode(node.arguments[key ? 0 : 1]);
          if (valueType !== StackType.bytes) {
            this.checkEncoding(node.arguments[key ? 0 : 1], this.lastType);
          }
        } else {
          this.pushVoid(node.expression, 'swap'); // Used when updating storage array
          if (valueType !== StackType.bytes) {
            this.checkEncoding(node, valueType);
          }
        }

        this.push(node.expression, 'app_global_put', valueType);
      },
      delete: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.pushVoid(node.expression, 'app_global_del');
      },
      exists: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        this.pushVoid(node.expression, 'txna Applications 0');

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.hasMaybeValue(node.expression, 'app_global_get_ex');
      },
    },
    local: {
      get: (node: ts.CallExpression, storageKeyFrame?: string, storageAccountFrame?: string) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          valueType, keyType, key, prefix,
        } = this.storageProps[name];

        if (storageAccountFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageAccountFrame].index} // ${storageAccountFrame}`);
        } else {
          this.processNode(node.arguments[0]);
        }

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else if (storageKeyFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageKeyFrame].index} // ${storageKeyFrame}`);
        } else {
          if (prefix) this.pushVoid(node.arguments[1], `byte "${prefix}"`);
          this.processNode(node.arguments[1]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[1], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[1], 'itob');
          if (prefix) this.pushVoid(node.arguments[1], 'concat');
        }

        this.push(node.expression, 'app_local_get', valueType);
        if (valueType !== StackType.bytes) this.checkDecoding(node, valueType);
      },
      set: (node: ts.CallExpression, storageKeyFrame?: string, storageAccountFrame?: string) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          valueType, keyType, key, prefix,
        } = this.storageProps[name];

        if (storageAccountFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageAccountFrame].index} // ${storageAccountFrame}`);
        } else {
          this.processNode(node.arguments[0]);
        }

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else if (storageKeyFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageKeyFrame].index} // ${storageKeyFrame}`);
        } else {
          if (prefix) this.pushVoid(node.arguments[1], `byte "${prefix}"`);
          this.processNode(node.arguments[1]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[1], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[1], 'itob');
          if (prefix) this.pushVoid(node.arguments[1], 'concat');
        }

        if (node.arguments[key ? 1 : 2]) {
          this.processNode(node.arguments[key ? 1 : 2]);
          if (valueType !== StackType.bytes) {
            this.checkEncoding(node.arguments[key ? 1 : 2], this.lastType);
          }
        } else {
          this.pushVoid(node.expression, 'uncover 2'); // Used when updating storage array
          if (valueType !== StackType.bytes) {
            this.checkEncoding(node, valueType);
          }
        }

        this.push(node.expression, 'app_local_put', valueType);
      },
      delete: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        this.processNode(node.arguments[0]);

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[1], `byte "${prefix}"`);
          this.processNode(node.arguments[1]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[1], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[1], 'itob');
          if (prefix) this.pushVoid(node.arguments[1], 'concat');
        }

        this.pushVoid(node.expression, 'app_local_del');
      },
      exists: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];
        this.processNode(node.arguments[0]);
        this.pushVoid(node.expression, 'txna Applications 0');

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[1], `byte "${prefix}"`);
          this.processNode(node.arguments[1]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[1], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[1], 'itob');
          if (prefix) this.pushVoid(node.arguments[1], 'concat');
        }

        this.hasMaybeValue(node.expression, 'app_local_get_ex');
      },
    },
    box: {
      create: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();

        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.processNode(node.arguments[key ? 0 : 1]);

        this.pushVoid(node.expression, 'box_create');
      },
      extract: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();

        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.processNode(node.arguments[key ? 0 : 1]);
        this.processNode(node.arguments[key ? 1 : 2]);

        this.push(node.expression, 'box_extract', StackType.bytes);
      },
      replace: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();

        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.processNode(node.arguments[key ? 0 : 1]);
        this.processNode(node.arguments[key ? 1 : 2]);

        this.pushVoid(node.expression, 'box_replace');
      },
      size: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();

        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.maybeValue(node.expression, 'box_len', StackType.uint64);
      },
      get: (node: ts.CallExpression, storageKeyFrame?: string) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          valueType, keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else if (storageKeyFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageKeyFrame].index} // ${storageKeyFrame}`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.maybeValue(node.expression, 'box_get', valueType);
        if (isNumeric(valueType)) this.push(node.expression, 'btoi', valueType);
        if (valueType !== StackType.bytes) this.checkDecoding(node, valueType);
      },
      set: (node: ts.CallExpression, storageKeyFrame?: string) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          valueType, keyType, key, dynamicSize, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else if (storageKeyFrame) {
          this.pushVoid(node.expression, `frame_dig ${this.frame[storageKeyFrame].index} // ${storageKeyFrame}`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        if (dynamicSize) this.pushLines(node.expression, 'dup', 'box_del', 'pop');

        if (node.arguments[key ? 0 : 1]) {
          this.processNode(node.arguments[key ? 0 : 1]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[key ? 0 : 1], this.lastType);
          }
        } else {
          this.pushVoid(node.expression, 'swap'); // Used when updating storage array
          if (valueType !== StackType.bytes) {
            this.checkEncoding(node, valueType);
          }
        }

        if (isNumeric(valueType)) this.pushVoid(node.expression, 'itob');

        this.push(node.expression, 'box_put', valueType);
      },
      delete: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.pushVoid(node.expression, 'box_del');
      },
      exists: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
        if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();
        const name = node.expression.expression.name.getText();

        const {
          keyType, key, prefix,
        } = this.storageProps[name];

        if (key) {
          this.pushVoid(node.expression, `byte "${key}"`);
        } else {
          if (prefix) this.pushVoid(node.arguments[0], `byte "${prefix}"`);
          this.processNode(node.arguments[0]);

          if (keyType !== StackType.bytes) {
            this.checkEncoding(node.arguments[0], this.lastType);
          }

          if (isNumeric(keyType)) this.pushVoid(node.arguments[0], 'itob');
          if (prefix) this.pushVoid(node.arguments[0], 'concat');
        }

        this.hasMaybeValue(node.expression, 'box_len');
      },
    },
  };

  private andCount: number = 0;

  private orCount: number = 0;

  private sourceFile: ts.SourceFile;

  private nodeDepth: number = 0;

  private topLevelNode!: ts.Node;

  private multiplyWideRatioFactors(node: ts.Node, factors: ts.Expression[]) {
    if (factors.length === 1) {
      this.pushVoid(node, 'int 0');
      this.processNode(factors[0]);
    } else {
      this.processNode(factors[0]);
      this.processNode(factors[1]);
      this.pushVoid(node, 'mulw');
    }

    factors.slice(2).forEach((f) => {
      this.processNode(f);

      /*
      https://github.com/algorand/pyteal/blob/d117f99c07a64cddf6de21b72232df12b53fdbbb/pyteal/ast/widemath.py#LL12C8-L12C8

      stack is [..., A, B, C], where C is current factor
      need to pop all A,B,C from stack and push X,Y, where X and Y are:
            X * 2**64 + Y = (A * 2**64 + B) * C
      <=>   X * 2**64 + Y = A * C * 2**64 + B * C
      <=>   X = A * C + highword(B * C)
            Y = lowword(B * C)

      TealOp(expr, Op.uncover, 2),  # stack: [..., B, C, A]
      TealOp(expr, Op.dig, 1),  # stack: [..., B, C, A, C]
      TealOp(expr, Op.mul),  # stack: [..., B, C, A*C]
      TealOp(expr, Op.cover, 2),  # stack: [..., A*C, B, C]
      TealOp(
          expr, Op.mulw
      ),  # stack: [..., A*C, highword(B*C), lowword(B*C)]
      TealOp(
          expr, Op.cover, 2
      ),  # stack: [..., lowword(B*C), A*C, highword(B*C)]
      TealOp(
          expr, Op.add
      ),  # stack: [..., lowword(B*C), A*C+highword(B*C)]
      TealOp(
          expr, Op.swap
      ),  # stack: [..., A*C+highword(B*C), lowword(B*C)]
      */

      this.pushLines(
        node,
        'uncover 2',
        'dig 1',
        '*',
        'cover 2',
        'mulw',
        'cover 2',
        '+',
        'swap',
      );
    });
  }

  private customMethods: { [methodName: string]: (node: ts.CallExpression) => void } = {
    wideRatio: (node: ts.CallExpression) => {
      if (
        node.arguments.length !== 2
        || !ts.isArrayLiteralExpression(node.arguments[0])
        || !ts.isArrayLiteralExpression(node.arguments[1])
      ) throw new Error();

      this.multiplyWideRatioFactors(node, new Array(...node.arguments[0].elements));
      this.multiplyWideRatioFactors(node, new Array(...node.arguments[1].elements));

      this.pushLines(
        node,
        'divmodw',
        'pop',
        'pop',
        'swap',
        '!',
        'assert',
      );

      this.lastType = 'uint64';
    },
    hex: (node: ts.CallExpression) => {
      if (node.arguments.length !== 1) throw new Error();
      if (!ts.isStringLiteral(node.arguments[0])) throw new Error();

      this.push(node.arguments[0], `byte 0x${node.arguments[0].text.replace(/^0x/, '')}`, StackType.bytes);
    },

  };

  private disableWarnings: boolean;

  private algodServer: string;

  private algodPort: number;

  private algodToken: string;

  constructor(
    content: string,
    className: string,
    options?: CompilerOptions,
  ) {
    this.disableWarnings = options?.disableWarnings || false;
    this.algodServer = options?.algodServer || 'http://localhost';
    this.algodPort = options?.algodPort || 4001;
    this.algodToken = options?.algodToken || 'a'.repeat(64);
    this.filename = options?.filename || '';

    this.content = content;
    this.name = className;
    this.sourceFile = ts.createSourceFile(
      this.filename,
      this.content,
      ts.ScriptTarget.ES2019,
      true,
    );
    this.constants = {};
  }

  static compileAll(content: string, options: CompilerOptions): Promise<Compiler>[] {
    const src = ts.createSourceFile(options.filename || '', content, ts.ScriptTarget.ES2019, true);
    const compilers = src.statements
      .filter((body) => ts.isClassDeclaration(body) && body.heritageClauses?.[0]?.types[0].expression.getText() === 'Contract')
      .map(async (body) => {
        if (!ts.isClassDeclaration(body)) throw Error();
        const name = body.name!.text;

        const compiler = new Compiler(content, name, options);
        await compiler.compile();
        await compiler.algodCompile();

        return compiler;
      });

    return compilers;
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
        fn = (node: ts.Node) => this.push(node, `${op} ${arg}`, type);
      } else {
        fn = (node: ts.Node) => this.maybeValue(node, `${op} ${arg}`, type);
      }
      return {
        name: arg,
        args: opSpec.Args?.length || 0,
        fn,
      };
    });
  }

  private isDynamicType(type: string): boolean {
    if (this.customTypes[type]) return this.isDynamicType(this.customTypes[type]);

    return type.includes('[]') || type.includes('string') || type.includes('bytes');
  }

  private getTypeLength(inputType: string): number {
    if (inputType === '[]') return 0;

    const type = this.getABIType(inputType);

    const typeNode = stringToExpression(type) as ts.Expression;
    if (type.toLowerCase().startsWith('staticarray')) {
      if (ts.isExpressionWithTypeArguments(typeNode)) {
        const innerType = typeNode!.typeArguments![0];
        const length = this.getStaticArrayLength(typeNode);

        return length * this.getTypeLength(innerType.getText());
      }
    }

    if (type.match(/^bool\[\d+\]$/)) {
      const lenStr = type.match(/\[\d+]$/)![0].match(/\d+/)![0];
      const length = parseInt(lenStr, 10);

      return Math.ceil(length / 8);
    }

    if (type.match(/\[\d+]$/)) {
      const lenStr = type.match(/\[\d+]$/)![0].match(/\d+/)![0];
      const length = parseInt(lenStr, 10);
      const innerType = type.replace(/\[\d+]$/, '');
      return this.getTypeLength(innerType) * length;
    }

    if (type.startsWith('[')) {
      const tNode = stringToExpression(type);
      if (!ts.isArrayLiteralExpression(tNode)) throw new Error();
      let totalLength = 0;
      let consecutiveBools = 0;

      tNode.elements.forEach((t) => {
        const typeString = t.getText();
        if (typeString === 'bool') {
          consecutiveBools += 1;
        } else {
          if (consecutiveBools > 0) {
            totalLength += Math.ceil(consecutiveBools / 8);
          }

          totalLength += this.getTypeLength(typeString);

          consecutiveBools = 0;
        }
      });

      totalLength += Math.ceil(consecutiveBools / 8);

      return totalLength;
    }

    if (type.match(/<\d+>$/)) {
      return parseInt(type.match(/<\d+>$/)![0].match(/\d+/)![0], 10) * this.getTypeLength(type.match(/\w+/)![0]);
    }

    if (type.match(/uint\d+$/)) {
      return parseInt(type.slice(4), 10) / 8;
    }

    if (type.startsWith('{')) {
      const types = Object.values(this.getObjectTypes(type));
      let totalLength = 0;
      let consecutiveBools = 0;
      types.forEach((t) => {
        if (t === 'bool') {
          consecutiveBools += 1;
        } else {
          if (consecutiveBools > 0) {
            totalLength += Math.ceil(consecutiveBools / 8);
          }

          totalLength += this.getTypeLength(t);

          consecutiveBools = 0;
        }
      });

      totalLength += Math.ceil(consecutiveBools / 8);

      return totalLength;
    }

    switch (type) {
      case 'asset':
      case 'application':
        return 8;
      case 'byte':
      case 'string':
      case 'bytes':
        return 1;
      case 'address':
      case 'account':
        return 32;
      default:
        throw new Error(`Unknown type ${JSON.stringify(type, null, 2)}`);
    }
  }

  private getStaticArrayLength(node: ts.ExpressionWithTypeArguments): number {
    if (node.typeArguments === undefined || node.typeArguments.length !== 2) throw new Error();
    const lengthNode = node.typeArguments[1];

    if (ts.isLiteralTypeNode(lengthNode)) return parseInt(lengthNode.getText(), 10);
    if (ts.isTypeQueryNode(lengthNode)) {
      const value = this.constants[lengthNode.exprName.getText()];
      return parseInt(value.getText(), 10);
    }

    throw Error(ts.SyntaxKind[lengthNode.kind]);
  }

  private getABIType(type: string): string {
    const abiType = this.customTypes[type] ? this.customTypes[type] : type.replace(/\s+/g, ' ');

    if (abiType.endsWith('}')) return abiType;

    const txnTypes: Record<string, string> = {
      Transaction: 'txn',
      AppCallTxn: 'appl',
      AssetConfigTxn: 'acfg',
      AssetFreezeTxn: 'afrz',
      AssetTransferTxn: 'axfer',
      KeyRegTxn: 'keyreg',
      PayTxn: 'pay',
    };

    if (txnTypes[type]) return txnTypes[type];

    if (type === 'boolean') return 'bool';
    if (type === 'number') return 'uint64';

    const typeNode = stringToExpression(abiType) as ts.Expression;

    if (abiType.startsWith('Static')) {
      if (!ts.isExpressionWithTypeArguments(typeNode)) throw new Error();
      const innerType = typeNode!.typeArguments![0];
      const length = this.getStaticArrayLength(typeNode);

      return `${this.getABIType(innerType.getText())}[${length}]`;
    }

    if (abiType.match(/\[\]$/)) {
      const baseType = abiType.replace(/\[\]$/, '');
      return `${this.getABIType(baseType)}[]`;
    }

    if (abiType.match(/\[\d+\]$/)) {
      const baseType = abiType.replace(/\[\d+\]$/, '');
      return `${this.getABIType(baseType)}${abiType.match(/\[\d+\]$/)![0]}`;
    }

    if (abiType.startsWith('[')) {
      if (!ts.isArrayLiteralExpression(typeNode)) throw new Error();

      return `[${typeNode.elements.map((t) => this.getABIType(t.getText())).join(',')}]`;
    }

    if (abiType.match(/>$/)) {
      return abiType.replace(/ /g, '').replace(',', 'x').replace('<', '').replace('>', '');
    }

    return abiType.toLowerCase();
  }

  // This is seperate from this.getABIType because the bracket notation
  // is useful for parsing, but the ABI/appspec JSON need the parens
  private getABITupleString(str: string) {
    let tupleStr = str;

    if (tupleStr.startsWith('{')) {
      const types = Object.values(this.getObjectTypes(tupleStr))
        .map((t) => this.getABIType(t))
        .map((t) => this.getABITupleString(t));

      tupleStr = `(${types.join(',')})`;
    }

    const trailingBrakcet = /(?<!\[\d*)]/g;
    const leadingBracket = /\[(?!\d*])/g;

    return tupleStr.replace(trailingBrakcet, ')').replace(leadingBracket, '(').toLocaleLowerCase();
  }

  private getObjectTypes(givenType: string): Record<string, string> {
    let type = givenType;

    if (this.customTypes[type]) {
      type = this.customTypes[type];
    }

    const typeAliasDeclaration = ts.createSourceFile('', `type Dummy = ${type};`, ts.ScriptTarget.ES2019, true).statements[0];

    if (!ts.isTypeAliasDeclaration(typeAliasDeclaration)) throw new Error();
    if (!ts.isTypeLiteralNode(typeAliasDeclaration.type)) throw new Error();

    const types: Record<string, string> = {};
    typeAliasDeclaration.type.members.forEach((m) => {
      if (!ts.isPropertySignature(m)) throw new Error();

      types[m.name.getText()] = m.type!.getText();
    });

    return types;
  }

  async compile() {
    this.sourceFile.statements.forEach((body) => {
      if (ts.isTypeAliasDeclaration(body)) {
        this.customTypes[body.name.getText()] = body.type.getText();
      }

      if (ts.isVariableStatement(body)) {
        if (body.declarationList.flags !== ts.NodeFlags.Const) throw new Error('Top-level variables must be constants');
        body.declarationList.declarations.forEach((d) => {
          this.constants[d.name.getText()] = d.initializer!;
        });
      }

      if (!ts.isClassDeclaration(body)) return;

      this.lastNode = body;

      if (
        body.heritageClauses === undefined
        || !ts.isIdentifier(body.heritageClauses[0].types[0].expression)
      ) return;

      if (body.heritageClauses[0].types[0].expression.text === CONTRACT_SUBCLASS) {
        const className = body.name!.text;
        this.contractClasses.push(className);

        if (className === this.name) {
          this.abi = {
            name: className, desc: '', methods: [],
          };

          this.processNode(body);
        }
      }
    });

    this.pushVoid(this.lastNode, 'main:');
    this.routeAbiMethods();

    Object.keys(this.compilerSubroutines).forEach((sub) => {
      if (this.teal.includes(`callsub ${sub}`)) {
        this.teal.push(...this.compilerSubroutines[sub]());
      }
    });

    this.teal = (await Promise.all(
      this.teal.map(async (t) => {
        if (t.startsWith('PENDING_COMPILE')) {
          const c = new Compiler(this.content, t.split(' ')[1], {
            filename: this.filename,
            algodPort: this.algodPort,
            algodServer: this.algodServer,
            algodToken: this.algodToken,
            disableWarnings: this.disableWarnings,
          });
          await c.compile();
          const program = await c.algodCompile();
          return `byte b64 ${program}`;
        }

        if (t.startsWith('PENDING_DUPN')) {
          const method = t.split(' ')[1];
          const nonArgFrameSize = this.frameSize[method] - this.subroutines[method].args;

          if (nonArgFrameSize === 0) return '// no dupn needed';

          if (nonArgFrameSize === 1) return 'byte 0x';
          if (nonArgFrameSize === 2) return 'byte 0x; dup';
          return ['byte 0x', `dupn ${this.frameSize[method] - this.subroutines[method].args - 1}`];
        }

        if (t.startsWith('PENDING_PROTO')) {
          const method = t.split(' ')[1];
          const isAbi = this.abi.methods.map((m) => m.name).includes(method);
          return `proto ${this.frameSize[method]} ${this.subroutines[method].returnType === 'void' || isAbi ? 0 : 1}`;
        }

        return t;
      }),
    )).flat();

    this.abi.methods = this.abi.methods.map((m) => ({
      ...m,
      args: m.args.map((a) => ({ ...a, type: this.getABITupleString(a.type) })),
      returns: { ...m.returns, type: this.getABITupleString(m.returns.type) },
    }));
  }

  private push(node: ts.Node, teal: string, type: string) {
    this.rawSrcMap.push({
      source: {
        filename: this.filename,
        start: ts.getLineAndCharacterOfPosition(this.sourceFile, node.getStart()),
        end: ts.getLineAndCharacterOfPosition(this.sourceFile, node.getEnd()),
      },
      teal: this.teal.length,
      pc: 0,
    });

    this.lastNode = node;

    if (this.compilingApproval) {
      this.teal.push(teal);
      if (type !== 'void') this.lastType = type;
    } else {
      this.clearTeal.push(teal);
      if (type !== 'void') this.lastType = type;
    }
  }

  private pushVoid(node: ts.Node, teal: string) {
    this.push(node, teal, 'void');
  }

  private pushMethod(name: string, args: string[], returns: string) {
    const abiArgs = args.map((a) => this.getABITupleString(a));

    let abiReturns = returns;

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

    const sig = `${name}(${abiArgs.join(',')})${this.getABITupleString(abiReturns)}`;
    this.pushVoid(this.lastNode, `method "${sig}"`);
  }

  private routeAbiMethods() {
    this.pushVoid(this.lastNode, 'txn NumAppArgs');
    this.pushVoid(this.lastNode, 'bnz route_abi');

    if (this.bareCreate) {
      this.pushLines(this.lastNode, 'txn ApplicationID', 'int 0', '==', 'bnz bare_route_create');
    }

    // Route the bare methods with no args
    if (this.bareOnCompletes.length > 0) {
      this.bareOnCompletes.forEach((oc) => {
        this.pushLines(this.lastNode, 'txn OnCompletion', `int ${oc}`, '==');
      });

      this.pushVoid(this.lastNode, 'int 1');

      this.pushVoid(this.lastNode, `match ${this.bareOnCompletes.map((oc) => `bare_route_${oc}`).join(' ')}`);
    } else if (!Object.values(this.handledActions).flat().includes('createApplication')) {
      this.pushLines(
        this.lastNode,
        '// default createApplication',
        'txn ApplicationID',
        'int 0',
        '==',
        'txn OnCompletion',
        'int NoOp',
        '==',
        '&&',
        'return',
      );
    }

    this.pushVoid(this.lastNode, 'route_abi:');
    // Route the abi methods with args
    this.abi.methods.forEach((m) => {
      this.pushMethod(
        m.name,
        m.args.map((a) => a.type),
        m.returns.type,
      );
    });
    this.pushVoid(this.lastNode, 'txna ApplicationArgs 0');
    this.pushVoid(
      this.lastNode,
      `match ${this.abi.methods
        .map((m) => `abi_route_${m.name}`)
        .join(' ')}`,
    );

    this.pushVoid(this.lastNode, 'err');
  }

  private maybeValue(node: ts.Node, opcode: string, type: string) {
    this.pushVoid(node, opcode);
    this.push(node, 'assert', type);
  }

  private hasMaybeValue(node: ts.Node, opcode: string) {
    this.pushVoid(node, opcode);
    this.pushVoid(node, 'swap');
    this.push(node, 'pop', StackType.uint64);
  }

  private pushComments(node: ts.Node) {
    const commentRanges = [
      ...(ts.getLeadingCommentRanges(this.sourceFile.text, node.pos) || []),
      ...(ts.getTrailingCommentRanges(this.sourceFile.text, node.pos) || []),
    ];
    commentRanges.forEach((c) => {
      const comment = this.sourceFile.text.slice(c.pos, c.end);
      if (comment.startsWith('///') && !this.comments.includes(c.pos)) {
        this.pushVoid(this.lastNode, comment.replace('///', '//'));
        this.comments.push(c.pos);
      }
    });
  }

  private processThrowStatement(node: ts.ThrowStatement) {
    if (!ts.isCallExpression(node.expression)) throw Error('Must throw Error');
    if (node.expression.expression.getText() !== 'Error') throw Error('Must throw Error');

    if (node.expression.arguments.length) this.pushVoid(node, `err // ${node.expression.arguments[0].getText()}`);
    else this.pushVoid(node, 'err');
  }

  private processWhileStatement(node: ts.WhileStatement) {
    this.pushVoid(node, `while_${this.whileCount}:`);
    this.processNode(node.expression);
    this.pushVoid(node, `bz while_${this.whileCount}_end`);

    this.processNode(node.statement);
    this.pushVoid(node, `b while_${this.whileCount}`);
    this.pushVoid(node, `while_${this.whileCount}_end:`);

    this.whileCount += 1;
  }

  private processForStatement(node: ts.ForStatement) {
    this.processNode(node.initializer!);

    this.pushVoid(node, `for_${this.forCount}:`);
    this.processNode(node.condition!);
    this.pushVoid(node, `bz for_${this.forCount}_end`);

    this.processNode(node.statement);

    this.processNode(node.incrementor!);
    this.pushVoid(node, `b for_${this.forCount}`);
    this.pushVoid(node, `for_${this.forCount}_end:`);

    this.forCount += 1;
  }

  private processNode(node: ts.Node) {
    this.pushComments(node);

    let isTopLevelNode = false;

    if (
      !ts.isClassDeclaration(node)
      && !ts.isMethodDeclaration(node)
      && !ts.isBlock(node)
      && !ts.isExpressionStatement(node)
      && !ts.isNonNullExpression(node)
    ) {
      if (this.nodeDepth === 0) {
        this.topLevelNode = node;
        isTopLevelNode = true;
      }
      this.nodeDepth += 1;
    }

    try {
      if (ts.isClassDeclaration(node)) this.processClassDeclaration(node);
      else if (ts.isPropertyDeclaration(node)) this.processPropertyDefinition(node);
      else if (ts.isMethodDeclaration(node)) this.processMethodDefinition(node);
      else if (ts.isPropertyAccessExpression(node)) this.processMemberExpression(node);
      else if (ts.isAsExpression(node)) this.processTSAsExpression(node);
      else if (ts.isNewExpression(node)) this.processNewExpression(node);
      else if (ts.isArrayLiteralExpression(node)) this.processArrayLiteralExpression(node);
      else if (ts.isNonNullExpression(node)) this.processNode(node.expression);
      else if (ts.isObjectLiteralExpression(node)) this.processObjectLiteralExpression(node);
      else if (node.kind === 108) this.lastType = 'this';
      else if (ts.isThrowStatement(node)) this.processThrowStatement(node);
      else if (ts.isWhileStatement(node)) this.processWhileStatement(node);
      else if (ts.isForStatement(node)) this.processForStatement(node);

      // Vars/Consts
      else if (ts.isIdentifier(node)) this.processIdentifier(node);
      else if (ts.isVariableDeclarationList(node)) this.processVariableDeclaration(node);
      else if (ts.isVariableDeclaration(node)) this.processVariableDeclarator(node);
      else if (ts.isNumericLiteral(node) || ts.isStringLiteral(node)) this.processLiteral(node);

      // Logical
      else if (ts.isBlock(node)) this.processBlockStatement(node);
      else if (ts.isIfStatement(node)) this.processIfStatement(node);
      else if (ts.isPrefixUnaryExpression(node)) this.processUnaryExpression(node);
      else if (ts.isBinaryExpression(node)) this.processBinaryExpression(node);
      else if (ts.isCallExpression(node)) this.processCallExpression(node);
      else if (ts.isExpressionStatement(node)) this.processExpressionStatement(node);
      else if (ts.isReturnStatement(node)) this.processReturnStatement(node);
      else if (ts.isParenthesizedExpression(node)) this.processNode((node).expression);
      else if (ts.isVariableStatement(node)) this.processNode((node).declarationList);
      else if (ts.isElementAccessExpression(node)) this.processElementAccessExpression(node);
      else if (ts.isConditionalExpression(node)) this.processConditionalExpression(node);
      else if (node.kind === ts.SyntaxKind.TrueKeyword) this.pushVoid(node, 'int 1');
      else if (node.kind === ts.SyntaxKind.FalseKeyword) this.pushVoid(node, 'int 0');
      else throw new Error(`Unknown node type: ${ts.SyntaxKind[node.kind]} (${node.kind})`);
    } catch (e) {
      if (!(e instanceof Error)) throw e;

      this.processErrorNodes.push(node);

      const errNode = this.processErrorNodes[0];
      const loc = ts.getLineAndCharacterOfPosition(this.sourceFile, errNode.pos);
      const lines: string[] = [];
      errNode.getText().split('\n').forEach((l: string, i: number) => {
        lines.push(`${this.filename}:${loc.line + i + 1}: ${l}`);
      });

      const msg = `TEALScript can not process ${ts.SyntaxKind[errNode.kind]} at ${this.filename}:${loc.line}:${loc.character}\n    ${lines.join('\n    ')}\n`;

      e.message = `${e.message.replace(`\n${msg}`, '')}\n${msg}`;

      throw e;
    }

    if (isTopLevelNode) this.nodeDepth = 0;
  }

  private processObjectLiteralExpression(node: ts.ObjectLiteralExpression) {
    const type = this.typeHint;
    if (type === undefined) throw new Error();
    const elements: ts.Expression[] = [];

    const objTypes = this.getObjectTypes(type);

    node.properties.forEach((p) => {
      if (!ts.isPropertyAssignment(p)) throw new Error();
      elements[Object.keys(objTypes).indexOf(p.name.getText())] = p.initializer;
    });

    this.processArrayElements(elements, node);
  }

  private processConditionalExpression(node: ts.ConditionalExpression) {
    this.processNode(node.condition);
    this.pushVoid(node, `bz ternary${this.ternaryCount}_false`);
    this.processNode(node.whenTrue);
    this.pushVoid(node, `b ternary${this.ternaryCount}_end`);
    this.pushVoid(node, `ternary${this.ternaryCount}_false:`);
    this.processNode(node.whenFalse);
    this.pushVoid(node, `ternary${this.ternaryCount}_end:`);

    this.ternaryCount += 1;
  }

  private pushLines(node: ts.Node, ...lines: string[]) {
    lines.forEach((l) => this.push(node, l, 'void'));
  }

  private getarrayElementTypes(elements: number): string[] {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    const typeHintNode = stringToExpression(this.getABIType(this.typeHint));

    if (ts.isElementAccessExpression(typeHintNode)) {
      const type = typeHintNode.expression.getText().replace(/\[\]$/, '');

      return new Array(elements).fill(type);
    }

    if (ts.isArrayLiteralExpression(typeHintNode)) {
      return typeHintNode.elements.map((e) => this.getABIType(e.getText()));
    }

    if (ts.isIdentifier(typeHintNode)) {
      return new Array(elements).fill(this.typeHint);
    }

    throw new Error(typeHintNode.getText());
  }

  private processBools(
    nodes: ts.Node[] | ts.NodeArray<ts.Expression>,
    isDynamicArray: boolean = false,
  ) {
    const boolByteLength = Math.ceil(nodes.length / 8);

    if (isDynamicArray) this.pushVoid(nodes[0], `byte 0x${nodes.length.toString(16).padStart(4, '0')}`);
    this.pushVoid(nodes[0], `byte 0x${'00'.repeat(boolByteLength)}`);

    nodes.forEach((n, i) => {
      this.pushVoid(n, `int ${i}`);
      this.processNode(n);
      this.pushVoid(n, 'setbit');
    });

    if (isDynamicArray) this.pushVoid(nodes[0], 'concat');
  }

  private processTuple(
    elements: ts.Expression[] | ts.NodeArray<ts.Expression>,
    parentNode: ts.Node,
  ) {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    let { typeHint } = this;

    if (!this.getABIType(typeHint).includes(']')) typeHint = `${typeHint}[]`;

    const types = this.getarrayElementTypes(elements.length);

    const dynamicTypes = types.filter((t) => this.isDynamicType(t));
    const staticTypes = types.filter((t) => !this.isDynamicType(t));
    const headLength = this.getTypeLength(`[${staticTypes.join(',')}]`) + dynamicTypes.length * 2;

    let consecutiveBools: ts.Node[] = [];
    elements.forEach((e, i) => {
      if (i === 0) {
        this.pushLines(parentNode, 'byte 0x // initial head', 'byte 0x // initial tail', `byte 0x${headLength.toString(16).padStart(4, '0')} // initial head offset`);
      }

      if (types[i] === 'bool') {
        consecutiveBools.push(e);
        return;
      }

      if (consecutiveBools.length > 0) {
        this.processBools(consecutiveBools);
        this.pushVoid(e, 'callsub process_static_tuple_element');
        consecutiveBools = [];
      }

      this.typeHint = types[i];

      this.processNode(e);

      this.checkEncoding(e, types[i]);

      if (isNumeric(this.lastType)) this.pushVoid(e, 'itob');
      if (this.lastType.match(/uint\d+$/) && this.lastType !== types[i]) this.fixBitWidth(e, parseInt(types[i].match(/\d+$/)![0], 10), !ts.isNumericLiteral(e));

      if (this.isDynamicType(types[i])) {
        this.pushVoid(e, 'callsub process_dynamic_tuple_element');
      } else {
        this.pushVoid(e, 'callsub process_static_tuple_element');
      }
    });

    if (consecutiveBools.length > 0) {
      this.processBools(consecutiveBools);
      this.pushVoid(parentNode, 'callsub process_static_tuple_element');
    }

    this.pushLines(parentNode, 'pop // pop head offset', 'concat // concat head and tail');
  }

  private checkEncoding(node: ts.Node, type: string) {
    const abiType = this.getABIType(type);
    if (this.isDynamicArrayOfStaticType(type)) {
      const baseType = type.replace(/\[\]$/, '');
      if (baseType === 'bool') return;
      const length = this.getTypeLength(baseType);

      this.pushLines(
        node,
        'dup',
        'len',
      );
      if (length > 1) {
        this.pushLines(
          node,
          `int ${length}`,
          '/',
        );
      }
      this.pushLines(
        node,
        'itob',
        'extract 6 2',
        'swap',
        'concat',
      );
    } else if (abiType === 'bool') {
      this.pushLines(node, 'byte 0x00', 'int 0', 'uncover 2', 'setbit');
    }
  }

  private getTupleElement(type: string): TupleElement {
    const expr = stringToExpression(type);

    const elem: TupleElement = new TupleElement(this.getABIType(type), 0);

    let offset = 0;
    let consecutiveBools = 0;

    if (ts.isArrayLiteralExpression(expr)) {
      expr.elements.forEach((e) => {
        const abiType = this.getABIType(e.getText());

        if (abiType === 'bool') {
          consecutiveBools += 1;
          elem.add(new TupleElement('bool', offset));
          return;
        } if (consecutiveBools) {
          offset += Math.ceil(consecutiveBools / 8);
        }

        if (ts.isArrayLiteralExpression(e)) {
          const t = new TupleElement(abiType, offset);
          t.add(...this.getTupleElement(abiType));
          elem.add(t);
        } else if (abiType.match(/\[\d*\]$/)) {
          const baseType = abiType.replace(/\[\d*\]$/, '');
          const t = new TupleElement(abiType, offset);
          t.add(this.getTupleElement(baseType));
          elem.add(t);
        } else elem.add(new TupleElement(abiType, offset));

        if (this.isDynamicType(abiType)) {
          offset += 2;
        } else {
          offset += this.getTypeLength(abiType);
        }
      });
    } else if (type.match(/\[\d*\]$/)) {
      const baseType = type.replace(/\[\d*\]$/, '');
      elem.add(this.getTupleElement(baseType));
    }

    return elem;
  }

  private processArrayElements(
    elements: ts.Expression[] | ts.NodeArray<ts.Expression>,
    parentNode: ts.Node,
  ) {
    const { typeHint } = this;
    if (typeHint === undefined) throw Error('Type hint must be provided to process object or array');

    const baseType = typeHint.replace(/\[\d*\]$/, '');

    if (this.isDynamicType(baseType) || (typeHint.startsWith('[') && !typeHint.match(/\[\d*\]$/))) {
      this.processTuple(elements, parentNode);
      if (this.getABIType(typeHint).endsWith('[]')) {
        this.pushLines(parentNode, `byte 0x${elements.length.toString(16).padStart(4, '0')}`, 'swap', 'concat');
      }
      this.lastType = this.getABIType(typeHint);
      return;
    }

    const types = this.getarrayElementTypes(elements.length);
    const arrayTypeHint = typeHint;

    if (arrayTypeHint.match(/bool\[\d*\]$/)) {
      this.processBools(elements, arrayTypeHint.endsWith('[]'));
    } else {
      elements.forEach((e, i) => {
        this.typeHint = types[i];
        this.processNode(e);
        if (isNumeric(this.lastType)) this.pushVoid(e, 'itob');
        if (this.lastType.match(/uint\d+$/) && this.lastType !== types[i]) this.fixBitWidth(e, parseInt(types[i].match(/\d+$/)![0], 10), !ts.isNumericLiteral(e));
        if (i) this.pushVoid(parentNode, 'concat');
      });
    }

    const abiArrayType = this.getABIType(arrayTypeHint);

    if (abiArrayType.match(/\[\d+\]$/)) {
      const length = parseInt(abiArrayType.match(/\[\d+\]$/)![0].match(/\d+/)![0], 10);

      if (length && elements.length < length) {
        const typeLength = this.getTypeLength(baseType);
        this.pushVoid(parentNode, `byte 0x${'00'.repeat(typeLength * (length - elements.length))}`);

        if (elements.length > 0) this.pushVoid(parentNode, 'concat');
      }
    }

    this.lastType = this.getABIType(typeHint);
  }

  private processArrayLiteralExpression(node: ts.ArrayLiteralExpression) {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    const { typeHint } = this;

    if (this.getABIType(typeHint).endsWith('[]') && node.elements.length === 0) {
      this.push(node, 'byte 0x', this.getABIType(this.typeHint));
      return;
    }

    this.processArrayElements(node.elements, node);
  }

  private getAccessChain(
    node: ts.ElementAccessExpression,
    chain: ts.ElementAccessExpression[] = [],
  ) {
    chain.push(node);

    if (ts.isElementAccessExpression(node.expression)) {
      this.getAccessChain(node.expression, chain);
    }

    return chain;
  }

  private processFrame(
    node: ts.Node,
    inputName: string,
    load: boolean,
  ): {
    accessors: (ts.Expression | string)[],
    name: string,
    type: 'frame' | 'storage',
    storageExpression?: ts.CallExpression,
    storageKeyFrame?: string
    storageAccountFrame?: string
  } {
    let name = inputName;
    let currentFrame = this.frame[inputName];
    let type: 'frame' | 'storage' = 'frame';
    let storageExpression: ts.CallExpression | undefined;

    const accessors: (ts.Expression | string)[][] = [];

    while (currentFrame.framePointer !== undefined) {
      if (currentFrame.accessors) accessors.push(currentFrame.accessors);

      name = currentFrame.framePointer!;
      currentFrame = this.frame[name];
    }

    if (currentFrame.storageExpression !== undefined) {
      if (currentFrame.accessors) accessors.push(currentFrame.accessors);
      // eslint-disable-next-line prefer-destructuring
      name = currentFrame.storageExpression.getText().split('.')[1];
      type = 'storage';
      storageExpression = currentFrame.storageExpression;
    }

    if (!load) {
      return {
        name,
        type,
        accessors: accessors.reverse().flat(),
        storageExpression,
        storageKeyFrame: currentFrame.storageKeyFrame,
        storageAccountFrame: currentFrame.storageAccountFrame,
      };
    }

    if (currentFrame.storageExpression !== undefined) {
      this.storageFunctions[this.storageProps[name].type].get(
        currentFrame.storageExpression,
        currentFrame.storageKeyFrame,
        currentFrame.storageAccountFrame,
      );
    } else {
      this.push(
        node,
        `frame_dig ${currentFrame.index!} // ${name}: ${currentFrame.type}`,
        currentFrame.type,
      );
    }

    return { name, type, accessors: accessors.reverse().flat() };
  }

  private updateValue(node: ts.Node) {
    // Add back to frame/storage if necessary
    if (ts.isIdentifier(node)) {
      const name = node.getText();
      const frameObj = this.frame[name];

      if (frameObj.index !== undefined) {
        const { index, type } = this.frame[name];
        this.pushVoid(node, `frame_bury ${index} // ${name}: ${type}`);
      } else {
        const processedFrame = this.processFrame(node, name, false);

        if (processedFrame.type === 'frame') {
          const frame = this.frame[processedFrame.name];
          this.pushVoid(node, `frame_bury ${frame.index} // ${name}: ${frame.type}`);
        } else {
          const { type } = this.storageProps[processedFrame.name];
          this.storageFunctions[type].set(
            processedFrame.storageExpression,
            processedFrame.storageKeyFrame,
            processedFrame.storageAccountFrame,
          );
        }
      }
    } else if (
      ts.isCallExpression(node)
                && ts.isPropertyAccessExpression(node.expression)
                && ts.isPropertyAccessExpression(node.expression.expression)
                && Object.keys(this.storageProps).includes(
                  node.expression.expression?.name?.getText(),
                )
    ) {
      const storageProp = this.storageProps[
        node.expression.expression.name.getText()
      ];

      this.storageFunctions[storageProp.type].set(node);
    } else {
      throw new Error(`Can't update ${ts.SyntaxKind[node.kind]} array`);
    }
  }

  private compilerSubroutines: {[name: string]: () => string[]} = {

    process_static_tuple_element: () => {
      const tupleHead = '-4 // tuple head';
      const tupleTail = '-3 // tuple tail';
      const headOffset = '-2 // head offset';
      const element = '-1 // element';

      return [
        'process_static_tuple_element:',
        'proto 4 3',
        `frame_dig ${tupleHead}`,
        `frame_dig ${element}`,
        'concat',

        `frame_dig ${tupleTail}`,
        `frame_dig ${headOffset}`,
        'retsub',
      ];
    },

    process_dynamic_tuple_element: () => {
      const tupleHead = '-4 // tuple head';
      const tupleTail = '-3 // tuple tail';
      const headOffset = '-2 // head offset';
      const element = '-1 // element';

      return [
        'process_dynamic_tuple_element:',
        'proto 4 3',
        `frame_dig ${tupleHead}`,
        `frame_dig ${headOffset}`, 'concat', `frame_bury ${tupleHead}`,
        `frame_dig ${element}`,
        'dup',
        'len',
        `frame_dig ${headOffset}`,
        'btoi',
        '+',
        'itob',
        'extract 6 2',
        `frame_bury ${headOffset}`,
        `frame_dig ${tupleTail}`,
        'swap',
        'concat',
        `frame_bury ${tupleTail}`,

        `frame_dig ${tupleHead}`,
        `frame_dig ${tupleTail}`,
        `frame_dig ${headOffset}`,
        'retsub',
      ];
    },

    // -2: length difference
    // -1: offset
    update_dynamic_head: () => [
      'update_dynamic_head:',
      'proto 2 0',
      'frame_dig -2 // length difference',
      `load ${scratch.fullArray}`,
      'frame_dig -1 // dynamic array offset',
      'extract_uint16 // extract dynamic array offset',

      `load ${scratch.subtractHeadDifference}`,
      'bz subtract_head_difference',
      '+ // add difference to offset',
      'b end_calc_new_head',

      'subtract_head_difference:',
      'swap',
      '- // subtract difference from offet',

      'end_calc_new_head:',

      'itob // convert to bytes',
      'extract 6 2 // convert to uint16',
      `load ${scratch.fullArray}`,
      'swap',
      'frame_dig -1 // offset',
      'swap',
      'replace3 // update offset',
      `store ${scratch.fullArray}`,
      'retsub',
    ],

    get_length_difference: () => [
      'get_length_difference:',
      // Get new element length
      `load ${scratch.newElement}`,
      'len // length of new element',
      `load ${scratch.elementLength}`,
      '<',

      'bnz swapped_difference',
      `load ${scratch.newElement}`,
      'len // length of new element',
      `load ${scratch.elementLength}`,
      'int 1',
      `store ${scratch.subtractHeadDifference}`,
      'b get_difference',

      'swapped_difference:',
      `load ${scratch.elementLength}`,
      `load ${scratch.newElement}`,
      'len // length of new element',
      'int 0',
      `store ${scratch.subtractHeadDifference}`,

      'get_difference:',
      '- // get length difference',
      `store ${scratch.lengthDifference}`,
      'retsub',
    ],
  };

  private getElementHead(
    topLevelTuple: TupleElement,
    accessors: (ts.Expression | string)[],
    node: ts.Node,
  ) {
    let previousTupleElement = topLevelTuple;
    let previousElemIsBool = false;

    // At the end of this forEach, the stack will contain the HEAD offset of the accessed element
    accessors.forEach((acc, i) => {
      if (typeof (acc) === 'string') {
        const elem = previousTupleElement[0];

        const frame = this.frame[acc];

        this.push(node, `frame_dig ${frame.index} // saved accessor: ${acc}`, StackType.uint64);

        this.pushLines(
          node,
          // `int ${accNumber * this.getTypeLength(elem.type)} // acc * typeLength`,
          `int ${this.getTypeLength(elem.type)}`,
          '* // acc * typeLength',
          '+',
        );

        previousTupleElement = elem;
        return;
      }

      const accNumber = parseInt(acc.getText(), 10);

      const elem: TupleElement = Number.isNaN(accNumber)
        ? previousTupleElement[0] : previousTupleElement[accNumber] || previousTupleElement[0];

      if (elem.type === 'bool' && !previousElemIsBool) {
        this.pushLines(
          acc,
          `int ${elem.headOffset} // headOffset`,
          '+',
        );

        previousElemIsBool = true;
      } else if (previousTupleElement.arrayType === 'tuple') {
        this.pushLines(
          acc,
          `int ${elem.headOffset} // headOffset`,
          '+',
        );
      // Dynamic element in static or dynamic array
      } else if (this.isDynamicType(elem.type)) {
        this.processNode(acc);
        this.pushLines(
          acc,
          // `int ${accNumber * 2} // acc * 2`,
          'int 2',
          '* // acc * 2',
          '+',
        );
      // Static element in array
      } else if (!previousElemIsBool) {
        this.processNode(acc);

        this.pushLines(
          acc,
          // `int ${accNumber * this.getTypeLength(elem.type)} // acc * typeLength`,
          `int ${this.getTypeLength(elem.type)}`,
          '* // acc * typeLength',
          '+',
        );
      }

      if (
        previousTupleElement.arrayType === 'dynamic'
        && !(i === 0 && this.isDynamicArrayOfStaticType(previousTupleElement.type))
      ) {
        this.pushLines(
          acc,
          'int 2',
          '+ // add two for length',
        );
      }

      if (this.isDynamicType(elem.type) && i !== accessors.length - 1) {
        this.pushLines(
          acc,
          `load ${scratch.fullArray}`,
          'swap',
          'extract_uint16',
        );
      }

      previousTupleElement = elem;
    });

    return previousTupleElement;
  }

  private processArrayAccess(node: ts.ElementAccessExpression, newValue?: ts.Node): void {
    const chain = this.getAccessChain(node).reverse();

    const accessors: (ts.Expression | string)[] = [];

    const frame = this.frame[chain[0].expression.getText()];

    if (frame && frame.index === undefined) {
      const frameFollow = this.processFrame(
        chain[0].expression,
        chain[0].expression.getText(),
        true,
      );

      frameFollow.accessors.forEach((e) => accessors.push(e));
    } else this.processNode(chain[0].expression);

    chain.forEach((e) => accessors.push(e.argumentExpression));

    this.processParentArrayAccess(node, accessors, chain[0].expression, newValue);
  }

  private processParentArrayAccess(
    node: ts.Node,
    accessors: (ts.Expression | string)[],
    parentExpression: ts.Node,
    newValue?: ts.Node,
  ): void {
    const parentType = this.getABIType(this.lastType);

    this.pushLines(node, `store ${scratch.fullArray}`, 'int 0 // initial offset');

    const topLevelTuple = this.getTupleElement(parentType);

    const element = this.getElementHead(topLevelTuple, accessors, node);

    const baseType = element.type.replace(/\[\d*\]/, '');

    if (this.isDynamicType(element.type)) {
      if (!['string', 'bytes'].includes(element.type) && this.isDynamicType(baseType)) {
        throw new Error(`Cannot access nested dynamic array element: ${element.type}`);
      }

      if (newValue) {
        this.pushLines(
          node,
          'dup',
          `store ${scratch.elementHeadOffset}`,
        );
      }

      this.pushLines(
        node,
        `load ${scratch.fullArray}`,
        `load ${scratch.fullArray}`,
        'uncover 2',
        'extract_uint16',
      );

      if (element.parent!.type.endsWith('[]')) {
        this.pushLines(
          node,
          'int 2',
          '+ // add two for length',
        );
      }

      if (newValue) {
        this.pushLines(
          node,
          'dup',
          `store ${scratch.elementStart}`,
        );
      }

      this.pushLines(
        node,
        'dup // duplicate start of element',
        `load ${scratch.fullArray}`,
        'swap',
        'extract_uint16 // get number of elements',
        `int ${this.getTypeLength(baseType)} // get type length`,
        '* // multiply by type length',
        'int 2',
        '+ // add two for length',
      );

      this.pushVoid(node, newValue ? `store ${scratch.elementLength}` : 'extract3');
    }

    if (newValue) {
      if (this.isDynamicType(element.type)) {
        if (element.parent?.arrayType !== 'tuple') {
          throw new Error(
            'Updating nested dynamic array elements not yet supported. The entire array must be overwritten to change a value',
          );
        }
        // Get pre element
        this.pushLines(
          node,
          `load ${scratch.fullArray}`,
          'int 0',
          `load ${scratch.elementStart}`,
          'substring3',
        );

        // Get new element
        this.processNode(newValue);
        if (isNumeric(this.lastType)) this.pushVoid(newValue, 'itob');

        this.checkEncoding(newValue, this.lastType);

        this.pushLines(newValue, 'dup', `store ${scratch.newElement}`);

        // Get post element
        this.pushLines(
          node,
          `load ${scratch.fullArray}`,
          `load ${scratch.elementStart}`,
          `load ${scratch.elementLength}`,
          '+ // get end of Element',
          `load ${scratch.fullArray}`,
          'len',
          'substring3',
        );

        // Form new tuple
        this.pushLines(node, 'concat', 'concat', `store ${scratch.fullArray}`);

        // Get length difference
        this.pushLines(node, 'callsub get_length_difference');

        const elementIndex = element.parent!.findIndex((e) => e.id === element.id);

        const nextDynamicSiblings = element.parent!
          .slice(elementIndex + 1)
          .filter((e) => this.isDynamicType(e.type));

        const headDiffs = nextDynamicSiblings.map((e) => e.headOffset - element.headOffset);

        headDiffs.forEach((diff) => {
          this.pushLines(
            node,
            `load ${scratch.lengthDifference}`,
            `load ${scratch.elementHeadOffset}`,
            `int ${diff}`,
            '+ // head ofset',
            'callsub update_dynamic_head',
          );
        });

        this.pushVoid(node, `load ${scratch.fullArray}`);
      } else if (element.type === 'bool') {
        if (!ts.isElementAccessExpression(node)) throw new Error();

        this.pushLines(node.argumentExpression, 'int 8', '* // get bit offset');
        this.processNode(node.argumentExpression);
        this.pushLines(node.argumentExpression, '+ // add accessor bits');
        if (element.parent!.arrayType === 'dynamic') {
          this.pushLines(node.argumentExpression, 'int 16', '+ // 16 bits for length prefix');
        }
        this.pushLines(node.argumentExpression, `load ${scratch.fullArray}`, 'swap');
        this.processNode(newValue);

        this.pushVoid(node.argumentExpression, 'setbit');
      } else {
        this.pushLines(
          node,
          `load ${scratch.fullArray}`,
          'swap',
        );
        this.processNode(newValue);
        if (isNumeric(this.lastType)) this.pushVoid(newValue, 'itob');
        this.pushVoid(node, 'replace3');
      }

      this.updateValue(parentExpression);
    } else {
      if (element.type === 'bool') {
        if (!ts.isElementAccessExpression(node)) throw new Error();

        this.pushLines(node.argumentExpression, 'int 8', '*');
        this.processNode(node.argumentExpression);
        this.pushLines(node.argumentExpression, '+', `load ${scratch.fullArray}`, 'swap', 'getbit');

        this.lastType = 'bool';
        return;
      }

      if (!this.isDynamicType(element.type)) {
        this.pushLines(node, `load ${scratch.fullArray}`, 'swap', `int ${this.getTypeLength(element.type)}`, 'extract3');
      }

      if (isNumeric(element.type)) this.pushVoid(node, 'btoi');

      this.checkDecoding(node, element.type);

      this.lastType = element.type.replace('string', 'bytes');
    }
  }

  private processElementAccessExpression(node: ts.ElementAccessExpression) {
    const baseType = this.getStackTypeFromNode(node.expression);
    if (baseType === 'txnGroup') {
      this.processNode(node.expression);
      this.processNode(node.argumentExpression);
      this.lastType = 'txn';
      return;
    }

    if (baseType.startsWith('ImmediateArray')) {
      this.processNode(node.expression);
      this.push(node.argumentExpression, `${this.teal.pop()} ${node.argumentExpression.getText()}`, baseType.replace('ImmediateArray: ', ''));
      return;
    }

    if (['string', 'bytes', 'byte[]'].includes(baseType)) {
      this.processNode(node.expression);
      this.processNode(node.argumentExpression);
      this.pushVoid(node, 'int 1');
      this.pushVoid(node, 'extract3');
      this.lastType = StackType.bytes;
      return;
    }

    this.processArrayAccess(node);
  }

  private processMethodDefinition(node: ts.MethodDeclaration) {
    if (!ts.isIdentifier(node.name)) throw new Error('method name must be identifier');
    this.currentSubroutine.name = node.name.getText();

    const returnType = this.getABIType(node.type!.getText());
    if (returnType === undefined) throw new Error(`A return type annotation must be defined for ${node.name.getText()}`);
    this.currentSubroutine.returnType = returnType;

    this.subroutines[this.currentSubroutine.name] = { returnType, args: node.parameters.length };

    if (!node.body) throw new Error(`A method body must be defined for ${node.name.getText()}`);

    if (node.modifiers && node.modifiers[0].kind === ts.SyntaxKind.PrivateKeyword) {
      this.processSubroutine(node);
      return;
    }

    this.handledActions[this.currentSubroutine.name] = [];
    this.currentSubroutine.decorators = (ts.getDecorators(node) || []).map(
      (d) => {
        const err = new Error(`Unknown decorator ${d.expression.getText()}`);
        if (!ts.isPropertyAccessExpression(d.expression)) throw err;
        if (d.expression.expression.getText() !== 'handle') throw err;

        const handledAction = d.expression.name.getText();
        if (Object.values(this.handledActions).flat().includes(handledAction)) throw new Error(`Action ${handledAction} is already handled by another method`);

        this.handledActions[this.currentSubroutine.name].push(handledAction);
        return handledAction;
      },
    );

    this.processRoutableMethod(node);
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
    const { returnType, name } = this.currentSubroutine;

    if (returnType === 'void') {
      this.pushVoid(node, 'retsub');
      return;
    }

    this.typeHint = returnType;

    this.processNode(node.expression!);

    const isAbiMethod = this.abi.methods.find((m) => m.name === name);

    // Automatically convert to larger int IF the types dont match
    if (returnType !== this.lastType) {
      if (this.lastType?.match(/uint\d+$/)) {
        const returnBitWidth = parseInt(returnType.replace('uint', ''), 10);
        const lastBitWidth = parseInt(this.lastType.replace('uint', ''), 10);
        if (lastBitWidth > returnBitWidth) throw new Error(`Value (${this.lastType}) too large for return type (${returnType})`);

        if (this.lastType === 'uint64') this.pushVoid(node.expression!, 'itob');

        this.pushVoid(node.expression!, `byte 0x${'FF'.repeat(returnBitWidth / 8)}`);
        this.pushVoid(node.expression!, 'b&');

        // eslint-disable-next-line no-console
        if (!this.disableWarnings) console.warn(`WARNING: Converting ${name} return value from ${this.lastType} to ${returnType}`);
      } else this.typeComparison(this.lastType, returnType);
    } else if (isNumeric(returnType) && isAbiMethod) {
      this.pushVoid(node.expression!, 'itob');
    } else if (
      (returnType.match(/uint\d+$/) && returnType !== StackType.uint64)
      || (returnType.match(/ufixed\d+x\d+$/))
    ) {
      const returnBitWidth = parseInt(returnType.match(/\d+/)![0], 10);
      this.pushVoid(node.expression!, `byte 0x${'FF'.repeat(returnBitWidth / 8)}`);
      this.pushVoid(node.expression!, 'b&');
    }

    if (isAbiMethod) {
      this.checkEncoding(node, returnType);
      this.pushLines(node, 'byte 0x151f7c75', 'swap', 'concat', 'log', 'retsub');
    } else {
      this.pushVoid(node, 'retsub');
    }

    this.typeHint = undefined;
  }

  private fixBitWidth(node: ts.Node, desiredWidth: number, warn: boolean = true) {
    const lastBitWidth = parseInt(this.lastType.match(/\d+/)![0], 10);

    // eslint-disable-next-line no-console
    if (lastBitWidth > desiredWidth && warn && !this.disableWarnings) console.warn(`WARNING: Converting value from ${this.lastType} to uint${desiredWidth} may result in loss of precision`);

    if (lastBitWidth < desiredWidth) {
      this.pushLines(node, `byte 0x${'FF'.repeat(desiredWidth / 8)}`, 'b&');
    } else {
      this.pushVoid(node, `extract ${lastBitWidth / 8 - desiredWidth / 8} 0`);
    }
  }

  private getStackTypeFromNode(node: ts.Node) {
    const preSrcMap = this.rawSrcMap;
    const preType = this.lastType;
    const preTeal = new Array(...this.teal);
    this.processNode(node);
    const type = this.lastType;
    this.lastType = preType;
    this.teal = preTeal;
    this.rawSrcMap = preSrcMap;
    return this.customTypes[type] || type;
  }

  private typeComparison(inputType: string, expectedType: string): void {
    const abiInputType = this.getABIType(inputType);
    const abiExpectedType = this.getABIType(expectedType);

    const sameTypes = [
      ['address', 'account'],
      ['bytes', 'string'],
    ];

    let typeEquality = false;

    sameTypes.forEach((t) => {
      if (t.includes(abiInputType) && t.includes(abiExpectedType)) {
        typeEquality = true;
      }
    });

    if (typeEquality) return;

    if (abiInputType !== abiExpectedType) throw Error(`Type mismatch: got ${inputType} expected ${expectedType}`);
  }

  private processBinaryExpression(node: ts.BinaryExpression) {
    if (node.operatorToken.getText() === '=') {
      this.addSourceComment(node);

      const leftType = this.getStackTypeFromNode(node.left);
      this.typeHint = leftType;

      if (ts.isIdentifier(node.left)) {
        const name = node.left.getText();
        const processedFrame = this.processFrame(node.left, name, false);
        const target = this.frame[processedFrame.name];

        this.processNode(node.right);
        this.pushVoid(node, `frame_bury ${target.index} // ${name}: ${target.type}`);
      } else if (ts.isElementAccessExpression(node.left)) {
        this.processArrayAccess(node.left, node.right);
      } else if (ts.isPropertyAccessExpression(node.left)) {
        const expressionType = this.getStackTypeFromNode(node.left.expression);
        const index = Object
          .keys(this.getObjectTypes(expressionType)).indexOf(node.left.name.getText());

        this.processNode(node.left.expression);
        this.processParentArrayAccess(
          node,
          [stringToExpression(index.toString())],
          node.left.expression,
          node.right,
        );
      }

      // TODO: Type check

      this.typeHint = undefined;
      return;
    }

    if (['&&', '||'].includes(node.operatorToken.getText())) {
      this.processLogicalExpression(node);
      return;
    }

    this.processNode(node.left);
    const leftType = this.lastType;
    this.processNode(node.right);

    if (node.operatorToken.getText() === '+' && (leftType === StackType.bytes || leftType.match(/byte\[\d+\]$/))) {
      this.push(node.operatorToken, 'concat', StackType.bytes);
      return;
    }

    this.typeComparison(leftType, this.lastType);

    const operator = node.operatorToken.getText().replace('===', '==').replace('!==', '!=');
    if (this.lastType === StackType.uint64) {
      this.push(node.operatorToken, operator, StackType.uint64);
    } else if (this.lastType.match(/uint\d+$/) || this.lastType.match(/ufixed\d+x\d+$/)) {
      // TODO: Overflow check?
      this.push(node.operatorToken, `b${operator}`, leftType);
    } else {
      this.push(node.operatorToken, operator, StackType.uint64);
    }

    if (operator === '==' || operator === '!=') {
      this.lastType = 'bool';
    }
  }

  private processLogicalExpression(node: ts.BinaryExpression) {
    this.processNode(node.left);

    let label: string;

    if (node.operatorToken.getText() === '&&') {
      label = `skip_and${this.andCount}`;
      this.andCount += 1;

      this.pushVoid(node.operatorToken, 'dup');
      this.pushVoid(node.operatorToken, `bz ${label}`);
    } else if (node.operatorToken.getText() === '||') {
      label = `skip_or${this.orCount}`;
      this.orCount += 1;

      this.pushVoid(node.operatorToken, 'dup');
      this.pushVoid(node.operatorToken, `bnz ${label}`);
    }

    this.processNode(node.right);
    this.push(node.operatorToken, node.operatorToken.getText(), StackType.uint64);
    this.pushVoid(node.operatorToken, `${label!}:`);
  }

  private processIdentifier(node: ts.Identifier) {
    // should only be true when calling getStackTypeFromNode
    if (node.getText() === 'globals') {
      this.lastType = 'globals';
      return;
    }

    if (this.contractClasses.includes(node.getText())) {
      this.pushVoid(node, `PENDING_COMPILE: ${node.getText()}`);
      return;
    }

    if (this.constants[node.getText()]) {
      this.processNode(this.constants[node.getText()]);
      return;
    }

    const processedFrame = this.processFrame(node, node.getText(), true);

    if (processedFrame.accessors.length > 0) {
      this.processParentArrayAccess(
        node,
        processedFrame.accessors,
        node,
      );
    }
  }

  private processNewExpression(node: ts.NewExpression) {
    (node.arguments || []).forEach((a) => {
      this.processNode(a);
    });

    this.lastType = this.getABIType(node.expression.getText());
  }

  private processTSAsExpression(node: ts.AsExpression) {
    this.typeHint = this.getABIType(node.type.getText());
    this.processNode(node.expression);

    if (this.lastType === 'any') {
      this.lastType = node.type.getText();
      return;
    }

    const type = this.getABIType(node.type.getText());
    if ((type.match(/uint\d+$/) || type.match(/ufixed\d+x\d+$/)) && type !== this.lastType) {
      const typeBitWidth = parseInt(type.replace('uint', ''), 10);

      if (this.lastType === 'uint64') this.pushVoid(node, 'itob');
      this.fixBitWidth(node, typeBitWidth, !ts.isNumericLiteral(node.expression));
    }

    this.typeHint = undefined;
    this.lastType = type;
  }

  private processVariableDeclaration(node: ts.VariableDeclarationList) {
    node.declarations.forEach((d) => {
      this.typeHint = d.type?.getText();
      this.processNode(d);
      this.typeHint = undefined;
    });
  }

  private initializeStorageFrame(
    node: ts.Node,
    name: string,
    storageExpression: ts.CallExpression,
    type: string,
    accessors?:(string | ts.Expression)[],
  ) {
    this.frame[name] = {
      accessors,
      storageExpression,
      type,
    };

    const storageName = storageExpression.expression.getText().split('.')[1];

    const storageProp = this.storageProps[storageName];

    const keyNode = storageExpression.arguments[storageProp.type === 'local' ? 1 : 0];

    if (keyNode !== undefined && !ts.isLiteralExpression(keyNode)) {
      this.addSourceComment(node, true);

      if (storageProp.prefix) this.pushVoid(keyNode, `byte "${storageProp.prefix}"`);

      this.processNode(keyNode);

      if (storageProp.keyType !== StackType.bytes) {
        this.checkEncoding(keyNode, this.lastType);
      }

      if (isNumeric(storageProp.keyType)) this.pushVoid(keyNode, 'itob');
      if (storageProp.prefix) this.pushVoid(keyNode, 'concat');

      const keyFrameName = `storage key//${name}`;

      this.pushVoid(keyNode, `frame_bury ${this.frameIndex} // ${keyFrameName}`);

      this.frame[keyFrameName] = {
        index: this.frameIndex,
        type: StackType.uint64,
      };

      this.frameIndex -= 1;

      this.frame[name].storageKeyFrame = keyFrameName;
    }

    if (storageProp.type === 'local') {
      const accountNode = storageExpression.arguments[0];
      const accountFrameName = `storage account//${name}`;

      this.addSourceComment(node, true);
      this.processNode(accountNode);

      this.pushVoid(accountNode, `frame_bury ${this.frameIndex} // ${accountFrameName}`);

      this.frame[accountFrameName] = {
        index: this.frameIndex,
        type: StackType.uint64,
      };

      this.frameIndex -= 1;

      this.frame[name].storageAccountFrame = accountFrameName;
    }
  }

  private processVariableDeclarator(node: ts.VariableDeclaration) {
    const name = node.name.getText();

    if (node.initializer) {
      let initializerType = this.typeHint || this.getStackTypeFromNode(node.initializer);

      if (!this.customTypes[initializerType]) initializerType = this.getABIType(initializerType);

      let lastFrameAccess: string | undefined;

      const isArray = initializerType.endsWith(']') || initializerType.endsWith('}');

      if (
        ts.isIdentifier(node.initializer)
        && !this.constants[node.initializer.getText()]
        && isArray
      ) {
        lastFrameAccess = node.initializer.getText();

        this.frame[name] = {
          framePointer: lastFrameAccess,
          type: initializerType,
        };

        return;
      }

      if (ts.isElementAccessExpression(node.initializer) && isArray) {
        const accessChain = this.getAccessChain(node.initializer);
        lastFrameAccess = accessChain[0].expression.getText();

        const type = this.getStackTypeFromNode(accessChain[0].expression);

        if (type.endsWith(']') || type.endsWith('}')) {
          // Only add source comments if there will be generated TEAL
          if (accessChain.find((e) => ts.isNumericLiteral(e.argumentExpression))) {
            this.addSourceComment(node);
          }
          const accessors = accessChain.map((e, i) => {
            if (ts.isNumericLiteral(e.argumentExpression)) return e.argumentExpression;

            this.processNode(e.argumentExpression);
            const accName = `accessor//${i}//${name}`;
            this.pushVoid(node.initializer!, `frame_bury ${this.frameIndex} // accessor: ${accName}`);

            this.frame[accName] = {
              index: this.frameIndex,
              type: StackType.uint64,
            };

            this.frameIndex -= 1;

            return accName;
          });

          if (lastFrameAccess.startsWith('this.')) {
            if (!ts.isCallExpression(accessChain[0].expression)) throw new Error('Expected call expression');
            this.initializeStorageFrame(
              node,
              name,
              accessChain[0].expression,
              initializerType,
              accessors,
            );
          } else {
            this.frame[name] = {
              accessors,
              framePointer: lastFrameAccess,
              type: initializerType,
            };
          }

          return;
        }
      }

      if (ts.isPropertyAccessExpression(node.initializer) && isArray) {
        // const chain = this.getChain(node.initializer);

        lastFrameAccess = node.initializer.expression.getText();

        const type = this.getStackTypeFromNode(node.initializer.expression);
        if (type.endsWith(']') || type.endsWith('}')) {
          const index = Object.keys(this.getObjectTypes(type))
            .indexOf(node.initializer.name.getText());

          if (lastFrameAccess.startsWith('this.')) {
            if (!ts.isCallExpression(node.initializer.expression)) throw new Error('Expected call expression');

            this.initializeStorageFrame(
              node,
              name,
              node.initializer.expression,
              initializerType,
              [stringToExpression(index.toString())],
            );
          } else {
            this.frame[name] = {
              accessors: [stringToExpression(index.toString())],
              framePointer: lastFrameAccess,
              type: initializerType,
            };
          }

          return;
        }
      }

      if (
        ts.isCallExpression(node.initializer)
      && isArray
      && ts.isPropertyAccessExpression(node.initializer.expression)
      && ts.isPropertyAccessExpression(node.initializer.expression.expression)
      && Object.keys(this.storageProps).includes(
        node.initializer.expression.expression?.name?.getText(),
      )) {
        this.initializeStorageFrame(node, name, node.initializer, initializerType);

        return;
      }

      this.frame[name] = {
        index: this.frameIndex,
        type: initializerType,
      };

      this.addSourceComment(node);

      this.typeHint = initializerType;
      this.processNode(node.initializer);
      this.pushVoid(node, `frame_bury ${this.frameIndex} // ${name}: ${initializerType}`);
    } else {
      if (!node.type) throw new Error('Uninitialized variables must have a type');
      this.frame[name] = {
        index: this.frameIndex,
        type: this.getABIType(node.type.getText()),
      };
    }

    this.frameIndex -= 1;
  }

  private processExpressionStatement(node: ts.ExpressionStatement) {
    this.processNode(node.expression);
  }

  private isDynamicArrayOfStaticType(type: string) {
    const baseType = type.replace(/\[\]$/, '');

    return ['string', 'bytes'].includes(type) || (type.endsWith('[]') && !this.isDynamicType(baseType));
  }

  private processCallExpression(node: ts.CallExpression) {
    this.addSourceComment(node);
    const opcodeNames = langspec.Ops.map((o) => o.Name);
    if (!(ts.isPropertyAccessExpression(node.expression) || ts.isIdentifier(node.expression))) throw new Error(`Only property access expressions are supported (given ${ts.SyntaxKind[node.expression.kind]})`);

    let methodName = '';

    if (ts.isPropertyAccessExpression(node.expression)) {
      methodName = node.expression.name.getText();
    } else if (ts.isIdentifier(node.expression)) {
      methodName = node.expression.getText();
    }

    if (!ts.isPropertyAccessExpression(node.expression)) {
      if (opcodeNames.includes(methodName)) {
        this.processOpcode(node);
      } else if (TXN_METHODS.includes(methodName)) {
        this.processTransaction(node);
      } else if (['addr'].includes(methodName)) {
        // TODO: add pseudo op type parsing/assertion to handle this
        // not currently exported in langspeg.json
        if (!ts.isStringLiteral(node.arguments[0])) throw new Error('addr() argument must be a string literal');
        this.push(node.arguments[0], `addr ${node.arguments[0].text}`, ForeignType.Address);
      } else if (['method'].includes(methodName)) {
        if (!ts.isStringLiteral(node.arguments[0])) throw new Error('method() argument must be a string literal');
        this.push(node.arguments[0], `method "${node.arguments[0].text}"`, StackType.bytes);
      } else if (this.customMethods[methodName]) {
        this.customMethods[methodName](node);
      }
    } else if (methodName === 'fromIndex') {
      this.processNode(node.arguments[0]);
      this.lastType = this.getABIType(node.expression.expression.getText());
    } else if (methodName === 'push') {
      const preType = this.lastType;
      this.processNode(node.expression.expression);
      if (!this.lastType.endsWith('[]')) throw new Error('Can only push to dynamic array');
      if (!this.isDynamicArrayOfStaticType(this.lastType)) throw new Error('Cannot push to dynamic array of dynamic types');
      this.processNode(node.arguments[0]);
      if (isNumeric(this.lastType)) this.pushVoid(node.arguments[0], 'itob');
      this.pushVoid(node, 'concat');

      this.updateValue(node.expression.expression);

      this.lastType = preType;
    } else if (methodName === 'pop') {
      this.processNode(node.expression.expression);
      const poppedType = this.lastType.replace(/\[\]$/, '');
      if (!this.lastType.endsWith('[]')) throw new Error('Can only pop from dynamic array');
      if (this.isDynamicType(poppedType)) throw new Error('Cannot pop from dynamic array of dynamic types');

      const typeLength = this.getTypeLength(this.lastType.replace(/\[\]$/, ''));
      this.pushLines(
        node.expression,
        'dup',
        'len',
        `int ${typeLength}`,
        '-',
        'int 0',
        'swap',
        'extract3',
      );

      // only get the popped element if we're expecting a return value
      if (this.topLevelNode !== node) {
        this.pushLines(
          node.expression,
          'dup',
          'len',
          `int ${typeLength}`,
        );

        this.processNode(node.expression.expression);

        this.pushLines(
          node.expression,
          'cover 2',
          'extract3',
          'swap',
        );
      }

      this.updateValue(node.expression.expression);

      this.lastType = poppedType;
    } else if (methodName === 'splice') {
      this.processNode(node.expression.expression);
      if (!this.lastType.endsWith('[]')) throw new Error(`Can only splice dynamic array (got ${this.lastType})`);
      if (!this.isDynamicArrayOfStaticType(this.lastType)) throw new Error('Cannot splice a dynamic array of dynamic types');

      const elementType = this.lastType.replace(/\[\]$/, '');

      // `int ${parseInt(node.arguments[1].getText(), 10)}`
      this.processNode(node.arguments[1]);

      // TODO: Optimize for literals
      // const spliceIndex = parseInt(node.arguments[0].getText(), 10);
      // const spliceStart = spliceIndex * this.getTypeLength(elementType);
      this.processNode(node.arguments[0]);
      this.pushLines(
        node,
        `int ${this.getTypeLength(elementType)}`,
        '*',
        `store ${scratch.spliceStart}`,
      );

      // const spliceElementLength = parseInt(node.arguments[1].getText(), 10);
      // const spliceByteLength = (spliceElementLength + 1) * this.getTypeLength(elementType);
      this.processNode(node.arguments[1]);
      this.pushLines(
        node,
        `int ${this.getTypeLength(elementType)}`,
        '*',
        `int ${this.getTypeLength(elementType)}`,
        '+',
        `store ${scratch.spliceByteLength}`,
      );

      // extract first part
      this.processNode(node.expression.expression);
      this.pushLines(
        node,
        'int 0',
        `load ${scratch.spliceStart}`,
        'substring3',
      );

      // extract second part
      this.processNode(node.expression.expression);
      this.pushLines(
        node,
        // get end
        'dup',
        'len',
        // get start (end of splice)
        `load ${scratch.spliceStart}`,
        `load ${scratch.spliceByteLength}`,
        '+',
        `int ${this.getTypeLength(elementType)}`,
        '-',
        'swap',
        // extract second part
        'substring3',
        // concat everything
        'concat',
      );

      if (this.topLevelNode !== node) {
        // this.pushLines(`byte 0x${spliceElementLength.toString(16).padStart(4, '0')}`);

        this.processNode(node.expression.expression);
        this.pushLines(
          node,
          `load ${scratch.spliceStart}`,
          // `int ${spliceByteLength - this.getTypeLength(elementType)}`,
          `load ${scratch.spliceByteLength}`,
          `int ${this.getTypeLength(elementType)}`,
          '-',
          'extract3',
          'swap',
        );
      }

      this.updateValue(node.expression.expression);
      this.lastType = `${elementType}[]`;
    } else if (methodName === 'forEach') {
      throw Error('forEach not yet supported. Use for loop instead');
    } else if (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
      const preArgsType = this.lastType;
      this.pushVoid(node, `PENDING_DUPN: ${methodName}`);
      new Array(...node.arguments).reverse().forEach((a) => this.processNode(a));
      this.lastType = preArgsType;
      this.push(node.expression, `callsub ${methodName}`, this.subroutines[methodName].returnType);
    } else if (
      ts.isPropertyAccessExpression(node.expression.expression)
      && Object.keys(this.storageProps).includes(node.expression.expression?.name?.getText())
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

      this.tealFunction(node.expression, this.lastType, node.expression.name.getText());
    }
  }

  private processIfStatement(node: ts.IfStatement, elseIfCount: number = 0) {
    let labelPrefix: string;

    if (elseIfCount === 0) this.ifCount += 1;
    const { ifCount } = this;

    if (elseIfCount === 0) {
      labelPrefix = `if${ifCount}`;
      this.pushVoid(node, `// ${labelPrefix}_condition`);
    } else {
      labelPrefix = `if${ifCount}_elseif${elseIfCount}`;
      this.pushVoid(node, `${labelPrefix}_condition:`);
    }

    this.addSourceComment(node.expression);
    this.processNode(node.expression);

    if (node.elseStatement == null) {
      this.pushVoid(node, `bz if${ifCount}_end`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
    } else if (ts.isIfStatement(node.elseStatement)) {
      this.pushVoid(node, `bz if${ifCount}_elseif${elseIfCount + 1}_condition`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
      this.pushVoid(node, `b if${ifCount}_end`);
      this.processIfStatement(node.elseStatement, elseIfCount + 1);
    } else if (node.thenStatement.kind === ts.SyntaxKind.Block) {
      this.pushVoid(node, `bz if${ifCount}_else`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
      this.pushVoid(node, `b if${ifCount}_end`);
      this.pushVoid(node, `if${ifCount}_else:`);
      this.processNode(node.elseStatement);
    } else {
      this.pushVoid(node, `bz if${ifCount}_end`);
      this.processNode(node.elseStatement);
    }

    if (elseIfCount === 0) {
      this.pushVoid(node, `if${ifCount}_end:`);
    }
  }

  private processUnaryExpression(node: ts.PrefixUnaryExpression) {
    this.processNode(node.operand);
    switch (node.operator) {
      case 53:
        this.pushVoid(node.operand, '!');
        break;
      default:
        throw new Error(`Unsupported unary operator ${node.operator}`);
    }
  }

  private processPropertyDefinition(node: ts.PropertyDeclaration) {
    if (node.initializer === undefined || !ts.isNewExpression(node.initializer)) throw new Error();

    const klass = node.initializer.expression.getText();

    if (['BoxMap', 'GlobalStateMap', 'LocalStateMap', 'BoxKey', 'GlobalStateKey', 'LocalStateKey'].includes(klass)) {
      let props: StorageProp;
      const type = klass.toLocaleLowerCase().replace('state', '').replace('map', '').replace('key', '');
      const typeArgs = node.initializer.typeArguments;

      if (typeArgs === undefined) {
        throw new Error('Type arguments must be specified for storage properties');
      }

      if (klass.includes('Map')) {
        if (typeArgs.length !== 2) throw new Error(`Expected 2 type arguments for ${klass}`);
        props = {
          type,
          keyType: this.getABIType(typeArgs[0].getText()),
          valueType: this.getABIType(typeArgs[1].getText()),
        };
      } else {
        if (typeArgs.length !== 1) throw new Error(`Expected a type argument for ${klass}`);

        props = {
          type,
          keyType: 'bytes',
          valueType: this.getABIType(typeArgs[0].getText()),
        };
      }

      if (props.type === 'box' && this.isDynamicType(props.valueType)) {
        props.dynamicSize = true;
      }

      if (node.initializer?.arguments?.[0] !== undefined) {
        if (!ts.isObjectLiteralExpression(node.initializer.arguments[0])) throw new Error('Expected object literal');

        node.initializer.arguments[0].properties.forEach((p) => {
          if (!ts.isPropertyAssignment(p)) throw new Error();
          const name = p.name?.getText();

          switch (name) {
            case 'key':
              if (klass.includes('Map')) throw new Error(`${name} only applies to storage keys`);
              if (!ts.isStringLiteral(p.initializer)) throw new Error('Storage key must be string');
              props.key = p.initializer.text;
              break;
            case 'dynamicSize':
              if (props.type !== 'box') throw new Error(`${name} only applies to box storage`);
              if (!this.isDynamicType(props.valueType)) throw new Error(`${name} only applies to dynamic types`);

              props.dynamicSize = p.initializer.getText() === 'true';
              break;
            case 'prefix':
              if (!klass.includes('Map')) throw new Error(`${name} only applies to storage maps`);
              if (!ts.isStringLiteral(p.initializer)) throw new Error('Storage prefix must be string');
              props.prefix = p.initializer.text;
              break;
            default:
              throw new Error(`Unknown property ${name}`);
          }
        });
      }

      if (!props.key && klass.includes('Key')) {
        props.key = node.name.getText();
      }

      if (klass.includes('Map') && !props.prefix) {
        const keyTypes = this.mapKeyTypes[type as ('box' | 'local' | 'global')];
        if (keyTypes.includes(props.keyType)) throw Error(`Duplicate key type ${props.keyType} for ${type} map. To prevent key collision, use the prefix argument in the constructor.`);
        keyTypes.push(props.keyType);
      }

      this.storageProps[node.name.getText()] = props;
    } else {
      throw new Error();
    }
  }

  private processLiteral(node: ts.StringLiteral | ts.NumericLiteral) {
    if (this.typeHint?.startsWith('ufixed')) {
      const match = this.typeHint.match(/\d+/g)!;
      const n = parseInt(match[0], 10);
      const m = parseInt(match[1], 10);

      const numDecimals = node.getText().match(/(?<=\.)\d+/)![0].length;
      const value = parseFloat(node.getText());

      if (numDecimals > m) throw Error(`Value ${value} cannot be represented as ${this.typeHint}. A more precise type is required.`);

      const fixedValue = Math.round(value * 10 ** m);

      this.push(node, `byte 0x${fixedValue.toString(16).padStart(n / 2, '0')}`, this.typeHint);
      return;
    }

    if (node.kind === ts.SyntaxKind.StringLiteral) {
      this.push(node, `byte "${node.text}"`, StackType.bytes);
    } else {
      this.push(node, `int ${node.getText()}`, StackType.uint64);
    }
  }

  private processMemberExpression(node: ts.PropertyAccessExpression) {
    if (node.expression.getText() === 'TransactionType') {
      const enums: {[key: string]: string} = {
        Unknown: 'unknown',
        Payment: 'pay',
        KeyRegistration: 'keyreg',
        AssetConfig: 'acfg',
        AssetTransfer: 'axfer',
        AssetFreeze: 'afrz',
        ApplicationCall: 'appl',
      };

      if (!enums[node.name.getText()]) throw new Error(`Unknown transaction type ${node.name.getText()}`);
      this.pushVoid(node, `int ${enums[node.name.getText()]}`);
      return;
    }

    const chain = this.getChain(node).reverse();

    chain.push(node);

    chain.forEach((n) => {
      if (ts.isElementAccessExpression(n)) {
        this.processNode(n);
        if (this.lastType === 'txn') this.lastType = 'gtxns';
        return;
      }

      if (ts.isPropertyAccessExpression(n) && ['Account', 'Asset', 'Application', 'Address'].includes(n.expression.getText())) {
        if (n.name.getText() === 'zeroIndex') {
          this.push(n.name, 'int 0', this.getABIType(n.expression.getText()));
        } else if (n.name.getText() === 'zeroAddress') {
          this.push(n.name, 'global ZeroAddress', 'Address');
        } else if (n.name.getText() !== 'fromIndex') throw new Error();
        return;
      }

      if (ts.isPropertyAccessExpression(n) && n.name.getText() === 'length') {
        if (n.expression.getText() === 'this.txnGroup') {
          this.push(n, 'global GroupSize', StackType.uint64);
          return;
        }

        this.processNode(n.expression);
        if (this.lastType === StackType.bytes || this.lastType === 'string') {
          this.push(n.name, 'len', StackType.uint64);
          return;
        }

        if (this.isDynamicArrayOfStaticType(this.lastType)) {
          this.pushLines(n.name, 'len', `int ${this.getTypeLength(this.lastType.replace(/\[\]$/, ''))}`, '/');
          this.lastType = StackType.uint64;
          return;
        }

        if (!this.lastType.endsWith('[]')) throw new Error(`Can only splice dynamic array (got ${this.lastType})`);
        this.pushLines(n.name, 'extract 0 2', 'btoi');
        this.lastType = StackType.uint64;
        return;
      }

      if (n.kind === ts.SyntaxKind.CallExpression) {
        this.processNode(n);
        return;
      }

      const expressionType = this.getStackTypeFromNode(n.expression);
      if (expressionType.startsWith('{') || this.customTypes[expressionType]?.startsWith('{')) {
        const index = Object.keys(this.getObjectTypes(expressionType)).indexOf(n.name.getText());
        this.processNode(n.expression);
        this.processParentArrayAccess(n, [stringToExpression(index.toString())], n.expression);
        return;
      }

      if (n.expression.getText() === 'globals') {
        this.tealFunction(n.expression, 'global', n.name.getText());
        return;
      }

      if (this.frame[n.expression.getText()]) {
        this.processStorageExpression(n);
        return;
      }

      if (n.expression.kind === ts.SyntaxKind.ThisKeyword) {
        switch (n.name.getText()) {
          case 'app':
            this.lastType = 'application';
            this.pushVoid(n, 'txna Applications 0');
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

      this.tealFunction(n.name, this.lastType, n.name.getText(), false, n.expression.getText().startsWith('this.'));
    });
  }

  private processSubroutine(fn: ts.MethodDeclaration) {
    const frameStart = this.teal.length;

    this.pushVoid(fn, `${this.currentSubroutine.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.frame));
    this.frame = {};

    this.pushVoid(fn, `PENDING_PROTO: ${this.currentSubroutine.name}`);

    this.frameIndex = -1;
    const params = new Array(...fn.parameters);
    params.forEach((p) => {
      if (p.type === undefined) throw new Error();

      let type = this.getABIType(p.type.getText());

      if (type.startsWith('Static')) {
        type = this.getABIType(type);
      }

      this.frame[p.name.getText()] = { index: this.frameIndex, type: type.replace(/^string/, 'bytes') };
      this.frameIndex -= 1;
    });

    this.processNode(fn.body!);

    if (!['retsub', 'err'].includes(this.teal.at(-1)!.split(' ')[0])) this.pushVoid(fn, 'retsub');

    this.frameInfo[this.currentSubroutine.name] = {
      start: frameStart,
      end: this.teal.length,
      frame: {},
    };

    const currentFrame = this.frame;
    const currentFrameInfo = this.frameInfo[this.currentSubroutine.name];

    Object.keys(this.frame).forEach((name) => {
      currentFrameInfo.frame[currentFrame[name].index!] = { name, type: currentFrame[name].type };
    });

    this.frame = lastFrame;
    this.frameSize[this.currentSubroutine.name] = this.frameIndex * -1 - 1;
  }

  private processClearState(fn: ts.MethodDeclaration) {
    if (this.clearStateCompiled) throw Error('duplicate clear state decorator defined');

    this.compilingApproval = false;
    this.processNode(fn.body!);
    this.clearStateCompiled = true;
    this.compilingApproval = true;
  }

  private processRoutableMethod(fn: ts.MethodDeclaration) {
    let allowCreate: boolean = false;
    let isClearState: boolean = false;
    const allowedOnCompletes: string[] = [];

    this.currentSubroutine.decorators?.forEach((d, i) => {
      switch (d) {
        case 'createApplication':
          allowCreate = true;
          break;
        case 'noOp':
          allowedOnCompletes.push('NoOp');
          break;
        case 'optIn':
          allowedOnCompletes.push('OptIn');
          break;
        case 'closeOut':
          allowedOnCompletes.push('CloseOut');
          break;
        case 'updateApplication':
          allowedOnCompletes.push('UpdateApplication');
          break;
        case 'deleteApplication':
          allowedOnCompletes.push('DeleteApplication');
          break;
        case 'clearState':
          isClearState = true;
          break;
        default:
          throw new Error(`Unknown decorator: ${d}`);
      }
    });

    if (isClearState) {
      this.processClearState(fn);
      return;
    }

    const argCount = fn.parameters.length;

    const bareMethod: boolean = argCount === 0
      && !!this.currentSubroutine.decorators?.length
      && this.currentSubroutine.returnType === 'void';

    // bare method
    if (bareMethod) {
      allowedOnCompletes.forEach((oc, i) => {
        this.bareOnCompletes.push(oc);
        this.pushVoid(fn, `bare_route_${oc}:`);
      });

      if (allowCreate) {
        this.bareCreate = true;
        this.pushVoid(fn, 'bare_route_create:');
      }
    } else this.pushVoid(fn, `abi_route_${this.currentSubroutine.name}:`);

    if (allowedOnCompletes.length === 0) allowedOnCompletes.push('NoOp');

    allowedOnCompletes.forEach((oc, i) => {
      this.pushLines(fn, 'txn OnCompletion', `int ${oc}`, '==');
      if (i > 0) this.pushVoid(fn, '||');
    });

    // if not a create, dont allow it
    this.pushLines(fn, 'txn ApplicationID', 'int 0');
    this.pushVoid(fn, allowCreate ? '==' : '!=');
    if (allowedOnCompletes.length > 0) this.pushVoid(fn, '&&');
    this.pushVoid(fn, 'assert');

    const args: {name: string, type: string, desc: string}[] = [];
    this.pushVoid(fn, `PENDING_DUPN: ${this.currentSubroutine.name}`);

    let nonTxnArgCount = argCount - fn.parameters.filter((p) => p.type?.getText().includes('Txn')).length + 1;
    let gtxnIndex = 0;

    new Array(...fn.parameters).reverse().forEach((p) => {
      const type = this.getABIType(p!.type!.getText());
      const abiType = type;

      if (!TXN_TYPES.includes(type)) {
        this.pushVoid(p, `txna ApplicationArgs ${nonTxnArgCount -= 1}`);
      }

      if (type === StackType.uint64) {
        this.pushVoid(p, 'btoi');
      } else if (isRefType(type)) {
        this.pushVoid(p, 'btoi');
        this.pushVoid(p, `txnas ${capitalizeFirstChar(type)}s`);
      } else if (TXN_TYPES.includes(type)) {
        this.pushVoid(p, 'txn GroupIndex');
        this.pushVoid(p, `int ${(gtxnIndex += 1)}`);
        this.pushVoid(p, '-');
      } else this.checkDecoding(p, type);

      args.push({ name: p.name.getText(), type: this.getABIType(abiType).replace('bytes', 'byte[]'), desc: '' });
    });

    const returnType = this.currentSubroutine.returnType
      .replace(/asset|application/, 'uint64')
      .replace('account', 'address');

    if (!bareMethod) {
      this.abi.methods.push({
        name: this.currentSubroutine.name,
        args: args.reverse(),
        desc: '',
        returns: { type: returnType, desc: '' },
      });
    }

    this.pushVoid(fn, `callsub ${this.currentSubroutine.name}`);
    this.pushVoid(fn, 'int 1');
    this.pushVoid(fn, 'return');
    this.processSubroutine(fn);
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

    let returnType = opSpec.Returns?.replace('U', 'uint64').replace('B', 'bytes');

    if (opSpec.Name.endsWith('256')) returnType = 'byte[32]';

    this.push(node.expression, line.join(' '), returnType);
  }

  private processStorageCall(node: ts.CallExpression) {
    if (!ts.isPropertyAccessExpression(node.expression)) throw new Error();
    if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error();

    const op = node.expression.name.getText();
    const { type, valueType } = this.storageProps[node.expression.expression.name.getText()];

    this.typeHint = valueType;

    this.storageFunctions[type][op](node);

    this.typeHint = undefined;
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
      case 'sendAssetCreation':
      case 'sendAssetConfig':
        txnType = TransactionType.AssetConfigTx;
        break;
      case 'sendAssetFreeze':
        txnType = TransactionType.AssetFreezeTx;
        break;
      case 'sendOfflineKeyRegistration':
      case 'sendOnlineKeyRegistration':
        txnType = TransactionType.KeyRegistrationTx;
        break;
      default:
        throw new Error(`Invalid transaction call ${node.expression.getText()}`);
    }

    this.pushVoid(node, 'itxn_begin');
    this.pushVoid(node, `int ${txnType}`);
    this.pushVoid(node, 'itxn_field TypeEnum');

    if (!ts.isObjectLiteralExpression(node.arguments[0])) throw new Error('Transaction call argument must be an object');

    const nameProp = node.arguments[0].properties.find(
      (p) => p.name?.getText() === 'name',

    );

    if (nameProp && txnType === TransactionType.ApplicationCallTx) {
      if (!ts.isPropertyAssignment(nameProp) || !ts.isStringLiteral(nameProp.initializer)) throw new Error('Method call name key must be a string');

      if (node.typeArguments === undefined || !ts.isTupleTypeNode(node.typeArguments[0])) throw new Error('Transaction call type arguments[0] must be a tuple type');

      const argTypes = node.typeArguments[0].elements.map(
        (t) => this.getABITupleString(this.getABIType(t.getText())),
      );

      let returnType = node.typeArguments![1].getText();

      returnType = returnType.toLowerCase()
        .replace('asset', 'uint64')
        .replace('account', 'address')
        .replace('application', 'uint64');

      this.pushVoid(nameProp, `method "${nameProp.initializer.text}(${argTypes.join(',')})${returnType}"`);
      this.pushVoid(nameProp, 'itxn_field ApplicationArgs');
    }

    node.arguments[0].properties.forEach((p) => {
      const key = p.name?.getText();

      if (key === undefined) throw new Error('Key must be defined');

      if (key === 'name' && txnType === TransactionType.ApplicationCallTx) {
        return;
      }

      this.addSourceComment(p, true);
      this.pushComments(p);

      if (key === 'onCompletion') {
        if (!ts.isPropertyAssignment(p) || !ts.isStringLiteral(p.initializer)) throw new Error('OnCompletion key must be a string');
        this.pushVoid(p.initializer, `int ${p.initializer.text}`);
        this.pushVoid(p, 'itxn_field OnCompletion');
      } else if (key === 'methodArgs') {
        if (node.typeArguments === undefined || !ts.isTupleTypeNode(node.typeArguments[0])) throw new Error('Transaction call type arguments[0] must be a tuple type');
        const argTypes = node.typeArguments[0].elements.map(
          (t) => this.getABIType(t.getText()),
        );

        let accountIndex = 1;
        let appIndex = 1;
        let assetIndex = 0;

        if (!ts.isPropertyAssignment(p) || !ts.isArrayLiteralExpression(p.initializer)) throw new Error('methodArgs must be an array');

        p.initializer.elements.forEach((e, i: number) => {
          if (argTypes[i] === 'account') {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Accounts');
            this.pushVoid(e, `int ${accountIndex}`);
            this.pushVoid(e, 'itob');
            accountIndex += 1;
          } else if (argTypes[i] === ForeignType.Asset) {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Assets');
            this.pushVoid(e, `int ${assetIndex}`);
            this.pushVoid(e, 'itob');
            assetIndex += 1;
          } else if (argTypes[i] === ForeignType.Application) {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Applications');
            this.pushVoid(e, `int ${appIndex}`);
            this.pushVoid(e, 'itob');
            appIndex += 1;
          } else if (argTypes[i] === StackType.uint64) {
            this.processNode(e);
            this.pushVoid(e, 'itob');
          } else {
            this.processNode(e);
            this.checkEncoding(e, argTypes[i]);
          }
          this.pushVoid(e, 'itxn_field ApplicationArgs');
        });
      } else if (ts.isPropertyAssignment(p) && ts.isArrayLiteralExpression(p.initializer)) {
        p.initializer.elements.forEach((e) => {
          this.processNode(e);
          this.pushVoid(e, `itxn_field ${capitalizeFirstChar(key)}`);
        });
      } else if (ts.isPropertyAssignment(p)) {
        this.processNode(p.initializer);
        this.pushVoid(p, `itxn_field ${capitalizeFirstChar(key)}`);
      } else {
        throw new Error(`Cannot process transaction property: ${p.getText()}`);
      }
    });

    this.pushVoid(node, 'itxn_submit');

    if (node.expression.getText() === 'sendMethodCall' && node.typeArguments![1].getText() !== 'void') {
      this.pushLines(
        node.expression,
        'itxn NumLogs',
        'int 1',
        '-',
        'itxnas Logs',
        'extract 4 0',
      );

      const returnType = this.getABIType(node.typeArguments![1].getText());
      if (isNumeric(returnType)) this.pushVoid(node.typeArguments![1], 'btoi');
      this.lastType = returnType;
    } else if (node.expression.getText() === 'sendAssetCreation') {
      this.push(node.expression, 'itxn CreatedAssetID', 'asset');
    }
  }

  private processStorageExpression(node: ts.PropertyAccessExpression) {
    const name = node.expression.getText();
    const target = this.frame[name];

    this.push(
      node,
      `frame_dig ${target.index} // ${name}: ${target.type}`,
      target.type,
    );

    this.tealFunction(node.name, target.type, node.name.getText(), true);
  }

  private getChain(
    node: ts.PropertyAccessExpression,
    chain: (ts.PropertyAccessExpression | ts.CallExpression | ts.ElementAccessExpression)[] = [],
  ): (ts.PropertyAccessExpression | ts.CallExpression | ts.ElementAccessExpression)[] {
    if (ts.isPropertyAccessExpression(node.expression)) {
      chain.push(node.expression);
      return this.getChain(node.expression, chain);
    }
    if (ts.isCallExpression(node.expression) || ts.isElementAccessExpression(node.expression)) {
      chain.push(node.expression);
      if (!ts.isPropertyAccessExpression(node.expression.expression)) throw new Error('Invalid call chain');
      return this.getChain(
        node.expression.expression,
        chain,
      );
    }
    return chain;
  }

  private tealFunction(
    node: ts.Node,
    calleeType: string,
    name: string,
    checkArgs: boolean = false,
    thisTxn: boolean = false,
  ): void {
    let type = calleeType;
    if (TXN_TYPES.includes(type) && !thisTxn) {
      type = 'gtxns';
    } else if (type === ForeignType.Address) {
      type = 'account';
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
        paramObj.fn(node);
      }
      return;
    }

    switch (name) {
      case 'hasBalance':
        this.hasMaybeValue(node, 'acct_params_get AcctBalance');
        return;
      case 'hasAsset':
        if (!checkArgs) {
          this.hasMaybeValue(node, 'asset_holding_get AssetBalance');
        }
        return;
      default:
        throw new Error(`Unknown method: ${type}.${name}`);
    }
  }

  async algodCompile(): Promise<string> {
    const response = await fetch(
      `${this.algodServer}:${this.algodPort}/v2/teal/compile?sourcemap=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'X-Algo-API-Token': this.algodToken,
        },
        body: this.approvalProgram(),
      },
    );

    const json = await response.json();

    if (response.status !== 200) {
      // eslint-disable-next-line no-console
      console.warn(this.approvalProgram().split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'));

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

      // eslint-disable-next-line no-loop-func
      const srcLine = this.rawSrcMap.find((s) => s.teal === lastLine);

      if (srcLine) srcLine.pc = pc;
      this.pcToLine[pc] = lastLine;
    }

    const tealSrcMap = new sourceMap.SourceMapGenerator({
      file: `${this.name}.approval.teal`,
      sourceRoot: '',
    });

    const pcSrcMap = new sourceMap.SourceMapGenerator({
      file: `${this.name}.approval.teal`,
      sourceRoot: '',
    });

    this.rawSrcMap.forEach((s) => {
      // TODO: Figure out what causes these 0s
      if (s.source.start.line === 0 || s.pc === 0) return;
      tealSrcMap.addMapping({
        source: path.basename(this.filename),
        original: { line: s.source.start.line, column: s.source.start.character },
        generated: { line: s.teal, column: 0 },
      });

      pcSrcMap.addMapping({
        source: path.basename(this.filename),
        original: { line: s.source.start.line, column: s.source.start.character },
        generated: { line: s.pc, column: 0 },
      });
    });

    this.srcMaps = {
      pc: pcSrcMap.toJSON(),
      teal: tealSrcMap.toJSON(),
    };

    return json.result;
  }

  private addSourceComment(node: ts.Node, force: boolean = false) {
    if (
      !force
      && node.getStart() >= this.lastSourceCommentRange[0]
      && node.getEnd() <= this.lastSourceCommentRange[1]
    ) { return; }

    const lineNum = ts.getLineAndCharacterOfPosition(this.sourceFile, node.getStart()).line + 1;

    if (this.filename.length > 0) { this.pushVoid(node, `// ${this.filename}:${lineNum}`); }
    this.pushVoid(node, `// ${node.getText().replace(/\n/g, '\n//').split('\n')[0]}`);

    this.lastSourceCommentRange = [node.getStart(), node.getEnd()];
  }

  appSpec(): object {
    const approval = Buffer.from(this.approvalProgram()).toString('base64');
    const clear = Buffer.from(this.clearProgram()).toString('base64');

    const globalDeclared: Record<string, object> = {};
    const localDeclared: Record<string, object> = {};

    const state = {
      global: {
        num_byte_slices: 0,
        num_uints: 0,
      },
      local: {
        num_byte_slices: 0,
        num_uints: 0,
      },
    };
    // eslint-disable-next-line no-restricted-syntax
    for (const [k, v] of Object.entries(this.storageProps)) {
      // eslint-disable-next-line default-case
      // TODO; Proper global/local types?
      switch (v.type) {
        case 'global':
          if (isNumeric(v.valueType)) {
            state.global.num_uints += 1;
            globalDeclared[k] = { type: 'uint64', key: k };
          } else {
            globalDeclared[k] = { type: 'bytes', key: k };
            state.global.num_byte_slices += 1;
          }

          break;
        case 'local':
          if (isNumeric(v.valueType)) {
            state.local.num_uints += 1;
            localDeclared[k] = { type: 'uint64', key: k };
          } else {
            state.local.num_byte_slices += 1;
            localDeclared[k] = { type: 'bytes', key: k };
          }
          break;
        default:
          // TODO: boxes?
          break;
      }
    }

    const hints: {[signature: string]: {'call_config': {[action: string]: string}}} = {};
    const bareCallConfig: {[action: string]: string} = {};

    const appSpec = {
      hints,
      bare_call_config: bareCallConfig,
      schema: {
        local: { declared: localDeclared, reserved: {} },
        global: { declared: globalDeclared, reserved: {} },
      },
      state,
      source: { approval, clear },
      contract: this.abi,
    };

    this.abi.methods.forEach((m) => {
      const signature = `${m.name}(${m.args.map((a) => a.type).join(',')})${m.returns.type}`;

      hints[signature] = {
        call_config: {},
      };

      if (this.handledActions[m.name].length === 0) {
        hints[signature].call_config.no_op = 'CALL';
      } else {
        this.handledActions[m.name].forEach((a) => {
          if (a === 'createApplication') hints[signature].call_config.no_op = 'CREATE';
          else hints[signature].call_config[a] = 'CALL';
        });
      }
    });

    this.bareOnCompletes.forEach((oc) => {
      if (oc === 'DeleteApplication') bareCallConfig.delete_application = 'CALL';
      if (oc === 'UpdateApplication') bareCallConfig.update_application = 'CALL';
      if (oc === 'CloseOut') bareCallConfig.close_out = 'CALL';
      if (oc === 'OptIn') bareCallConfig.opt_in = 'CALL';
    });

    if (this.bareCreate || !Object.values(this.handledActions).flat().includes('createApplication')) bareCallConfig.no_op = 'CREATE';

    return appSpec;
  }

  approvalProgram(): string {
    if (this.generatedTeal !== '') return this.generatedTeal;

    const output = this.prettyTeal(this.teal);
    this.generatedTeal = output.join('\n');

    return this.generatedTeal;
  }

  clearProgram(): string {
    if (this.generatedClearTeal !== '') return this.generatedClearTeal;

    const output = this.prettyTeal(this.clearTeal);
    // if no clear state, just default approve
    if (!this.clearStateCompiled) {
      output.push('int 1');
      output.push('return');
    }
    this.generatedClearTeal = output.join('\n');

    return this.generatedClearTeal;
  }

  // eslint-disable-next-line class-methods-use-this
  prettyTeal(teal: string[]): string[] {
    const output: string[] = [];
    let comments: string[] = [];

    let lastIsLabel: boolean = false;

    teal.forEach((t, i) => {
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

      const thisLine = this.rawSrcMap.find((s) => s.teal === i);
      if (thisLine) {
        thisLine!.teal = output.length;
      }
    });

    return output;
  }

  /* These are some methods that were started to get the end of a nested tuple element
  private getParentChain(elem: TupleElement, chain: TupleElement[] = []) {
    chain.push(elem);

    if (elem.parent) {
      this.getParentChain(elem.parent, chain);
    }

    return chain.reverse();
  }

  private getNextElement(elem: TupleElement): TupleElement | undefined {
    const { parent } = elem;

    if (parent === undefined) return undefined;

    const grandParent = parent.parent;

    if (grandParent === undefined) return undefined;

    const parentIndex = grandParent.findIndex((e) => e.id === parent.id);
    const nextUncle = grandParent.slice(parentIndex)[0];

    if (!nextUncle) return this.getNextElement(parent);

    return nextUncle;
  }

  private getElementEnd(elem: TupleElement, accessors: number[]) {
    const parent = elem.parent!;

    if (parent.arrayType === 'tuple') {
      const elemIndex = parent.findIndex((e) => e.id === elem.id);
      const dynamicSibling = parent.slice(elemIndex).find((e) => this.isDynamicType(e.type));

      if (dynamicSibling) {
        // eslint-disable-next-line no-param-reassign
        accessors[accessors.length - 1] += 1;
        this.getElementEnd(dynamicSibling, accessors);
        return;
      }
    } else if (parent.arrayType === 'dynamic') {
      // get the head of the parent, extract_uint16
      this.getElementHead(parent, accessors.slice(0, accessors.length - 1));
      // extract uint16 to get the length
      this.pushLines('extract_uint16, extract_uint16 // get length', 'btoi');
      // see if acc is less than length
      // if so, add two to current head and extract_uint16
      // else TBD
    } else if (parent.arrayType === 'static') {
      // if acc < elem.staticLength, add two to current head and extract_uint16
      // else TBD
    }

    const nextElement = this.getNextElement(elem);
  }
  */
}
