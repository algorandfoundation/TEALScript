/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import fetch from 'node-fetch';
import * as vlq from 'vlq';
import * as tsdoc from '@microsoft/tsdoc';
import { Project } from 'ts-morph';
import * as ts from 'ts-morph';
// eslint-disable-next-line camelcase
import { sha512_256 } from 'js-sha512';
import path from 'path';
import langspec from '../static/langspec.json';
import { VERSION } from '../version';
import { optimizeTeal } from './optimize';
import { type ARC56Contract, type StructField } from '../types/arc56.d';

const MULTI_OUTPUT_TYPES = ['split uint128', 'divmodw output', 'vrf return values', 'ecdsa pubkey'];

type ExpressionChainNode = ts.ElementAccessExpression | ts.PropertyAccessExpression | ts.CallExpression;

type OnComplete = 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication';
const ON_COMPLETES: ['NoOp', 'OptIn', 'CloseOut', 'ClearState', 'UpdateApplication', 'DeleteApplication'] = [
  'NoOp',
  'OptIn',
  'CloseOut',
  'ClearState',
  'UpdateApplication',
  'DeleteApplication',
];

type StorageType = 'global' | 'local' | 'box';

export type CompilerOptions = {
  /** The path in the ts-morph Project that contains the source file to compile */
  srcPath: string;
  /** The name of the contract class to use as an entry point */
  className: string;
  /** The ts-morph Project containing all of the source files and TEALScript */
  project: Project;
  /**
   * The path to use as a current working directory.
   * This is used when writing source locations in the TEAL and when generating error messages.
   */
  cwd: string;
  /** TEALScript will console.warn compiler warnings unless this is set to true */
  disableWarnings?: boolean;
  /** The algod server to use when compiling and getting the source map */
  algodServer?: string;
  /** The algod token to use when compiling and getting the source map */
  algodToken?: string;
  /** The port to use when compiling and getting the source map */
  algodPort?: number;
  /** Disables overflow checks for numeric operations. This is NOT safe but does save some opcodes */
  disableOverflowChecks?: boolean;
  /**
   * Disables the type checker. This is NOT safe but does save some compile time.
   * Generally this should NEVER be used and instead the developer should use ts-expect-error
   */
  disableTypeScript?: boolean;
  /**
   * The path in the ts-morph Project that contains the TEALScript lib directory.
   * This should only need to be provided when used in a browser.
   */
  tealscriptLibDir?: string;
  /**
   * The path in the ts-morph Project that contains the TEALScript types directory.
   * This should only need to be provided when used in a browser.
   */
  tealscriptTypesDir?: string;
  /**
   * Skip algod compilation. This results in no source mapping and no algod assebmler error checking.
   */
  skipAlgod?: boolean;
};

export type SourceInfo = {
  filename: string;
  start: ts.ts.LineAndCharacter;
  end: ts.ts.LineAndCharacter;
};

type TypeInfo =
  | {
      kind: 'tuple';
      elements: TypeInfo[];
    }
  | {
      kind: 'object';
      properties: { [key: string]: TypeInfo };
    }
  | {
      kind: 'base';
      type: string;
    }
  | {
      kind: 'dynamicArray';
      base: TypeInfo;
    }
  | {
      kind: 'staticArray';
      base: TypeInfo;
      length: number;
    }
  | {
      kind: 'method';
      args: TypeInfo[];
      returns: TypeInfo;
      name?: string;
    };

type Event = {
  name: string;
  args: { name: string; type: TypeInfo; desc: string }[];
  desc: string;
  argTupleType: TypeInfo;
};

async function getSourceMap(vlqMappings: string) {
  const pcList = vlqMappings.split(';').map((m: string) => {
    const decoded = vlq.decode(m);
    if (decoded.length > 2) return decoded[2];
    return undefined;
  });

  let lastLine = 0;

  const mappings: {
    pcToLine: Record<number, number>;
    lineToPc: Record<number, number[]>;
  } = {
    pcToLine: {},
    lineToPc: {},
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [pc, lineDelta] of pcList.entries()) {
    // If the delta is not undefined, the lastLine should be updated with
    // lastLine + the delta
    if (lineDelta !== undefined) {
      lastLine += lineDelta;
    }

    if (!(lastLine in mappings.lineToPc)) mappings.lineToPc[lastLine] = [];

    mappings.lineToPc[lastLine].push(pc);

    mappings.pcToLine[pc] = lastLine;
  }
  return mappings;
}

function typeInfoToABIString(typeInfo: TypeInfo, convertRefs: boolean = false): string {
  if (typeInfo.kind === 'base') {
    if (convertRefs && ['appreference', 'assetreference'].includes(typeInfo.type)) {
      return 'uint64';
    }

    if (convertRefs && typeInfo.type === 'accountreference') {
      return 'address';
    }

    return typeInfo.type
      .replace('bytes', 'byte[]')
      .replace('assetid', 'uint64')
      .replace('appid', 'uint64')
      .replace(/^accountreference$/, 'account')
      .replace(/^appreference$/, 'application')
      .replace(/^assetreference$/, 'asset');
  }

  if (typeInfo.kind === 'tuple') {
    return `(${typeInfo.elements.map((e) => typeInfoToABIString(e, convertRefs)).join(',')})`;
  }

  if (typeInfo.kind === 'dynamicArray') {
    return `${typeInfoToABIString(typeInfo.base, convertRefs)}[]`;
  }

  if (typeInfo.kind === 'staticArray') {
    return `${typeInfoToABIString(typeInfo.base, convertRefs)}[${typeInfo.length}]`;
  }

  if (typeInfo.kind === 'object') {
    return `(${Object.values(typeInfo.properties)
      .map((p) => typeInfoToABIString(p, convertRefs))
      .join(',')})`;
  }

  if (typeInfo.kind === 'method') {
    return 'appl';
  }

  throw Error();
}

function equalTypes(a: TypeInfo, b: TypeInfo, ignoreUnsafe: boolean = false) {
  if (b.kind === 'base' && b.type === 'byteslike') {
    return (
      // eslint-disable-next-line no-use-before-define
      isBytes(a) ||
      // eslint-disable-next-line no-use-before-define
      (a.kind === 'staticArray' && isBytes(a.base)) ||
      // eslint-disable-next-line no-use-before-define
      (a.kind === 'dynamicArray' && isBytes(a.base)) ||
      (a.kind === 'base' && a.type === 'address')
    );
  }

  if (b.kind === 'base' && b.type === 'intlike') {
    return (
      // eslint-disable-next-line no-use-before-define
      isNumeric(a)
    );
  }

  if (ignoreUnsafe) {
    return typeInfoToABIString(a).replace('unsafe ', '') === typeInfoToABIString(b).replace('unsafe ', '');
  }
  return typeInfoToABIString(a) === typeInfoToABIString(b);
}

// TODO: Merge this functionality directly into TypeInfo
// eslint-disable-next-line no-use-before-define
class TupleElement extends Array<TupleElement> {
  type!: TypeInfo;

  headOffset!: number;

  arrayType: 'tuple' | 'dynamic' | 'static' | undefined;

  staticLength: number = 0;

  id!: number;

  // eslint-disable-next-line no-use-before-define
  parent?: TupleElement;

  static idCounter = 0;

  constructor(type: TypeInfo, headOffset: number) {
    super();

    if (typeof type === 'number') return;

    this.id = TupleElement.idCounter;
    this.type = type;
    this.headOffset = headOffset;

    TupleElement.idCounter += 1;

    if (type.kind === 'staticArray') {
      this.arrayType = 'static';
      this.staticLength = type.length;
    } else if (type.kind === 'dynamicArray') {
      this.arrayType = 'dynamic';
    } else if (type.kind === 'tuple' || type.kind === 'object') {
      this.arrayType = 'tuple';
    }
  }

  add(...elements: TupleElement[]) {
    elements.forEach((e: TupleElement) => {
      e.parent = this;
    });
    return this.push(...elements);
  }
}

function getStorageName(node: ts.PropertyAccessExpression | ts.CallExpression) {
  const thisNode = node.getFirstDescendantByKind(ts.SyntaxKind.ThisKeyword);
  const propNode = thisNode?.getParentIfKind(ts.SyntaxKind.PropertyAccessExpression);

  return propNode?.getName();
}

function getDocNodeAsString(node: tsdoc.DocNode): string {
  if (node instanceof tsdoc.DocPlainText) {
    return node.text;
  }
  if (node instanceof tsdoc.DocSoftBreak) {
    return '\n';
  }
  if (node instanceof tsdoc.DocParagraph) {
    return `${node.getChildNodes().map(getDocNodeAsString).join('')}\n`;
  }
  // Handle other types of nodes if needed
  return '';
}

function renderDocNode(docNode: tsdoc.DocNode): string {
  let result: string = '';
  if (docNode) {
    // eslint-disable-next-line no-restricted-syntax
    for (const childNode of docNode.getChildNodes()) {
      result += getDocNodeAsString(childNode);
    }
  }
  return result.trim();
}

function stringToExpression(str: string): ts.ts.Expression | ts.ts.TypeNode {
  if (str.startsWith('{')) {
    const srcFile = ts.ts.createSourceFile('', `type Foo = ${str}`, ts.ScriptTarget.ES2022, true);

    const typeAlias = srcFile.statements[0] as ts.ts.TypeAliasDeclaration;

    return typeAlias.type;
  }

  const srcFile = ts.ts.createSourceFile('', str, ts.ScriptTarget.ES2019, true);
  return (srcFile.statements[0] as ts.ts.ExpressionStatement).expression;
}

function capitalizeFirstChar(str: string) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

// Represents the stack types available in the AVM
const StackType = {
  void: { kind: 'base', type: 'void' } as TypeInfo,
  uint64: { kind: 'base', type: 'uint64' } as TypeInfo,
  bytes: { kind: 'base', type: 'bytes' } as TypeInfo,
  any: { kind: 'base', type: 'any' } as TypeInfo,
};

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

const ForeignType = {
  Asset: { kind: 'base', type: 'assetid' } as TypeInfo,
  Address: { kind: 'base', type: 'address' } as TypeInfo,
  Application: { kind: 'base', type: 'appid' } as TypeInfo,
};

const TXN_TYPES = ['txn', 'pay', 'keyreg', 'acfg', 'axfer', 'afrz', 'appl'];

const TXN_METHODS = [
  'Payment',
  'AppCall',
  'MethodCall',
  'AssetTransfer',
  'AssetCreation',
  'AssetFreeze',
  'AssetConfig',
  'OnlineKeyRegistration',
  'OfflineKeyRegistration',
].flatMap((m) => [`send${m}`, `add${m}`]);

const CONTRACT_CLASS = 'Contract';
const LSIG_CLASS = 'LogicSig';

const PARAM_TYPES: { [param: string]: string } = {
  // Global
  CurrentApplicationID: 'appid',
  // Txn
  XferAsset: 'assetid',
  ApplicationID: 'appid',
  ConfigAsset: 'assetid',
  FreezeAsset: 'assetid',
  CreatedAssetID: 'assetid',
  CreatedApplicationID: 'appid',
  ApplicationArgs: `ImmediateArray: bytes`,
  Applications: `ImmediateArray: appid`,
  Assets: `ImmediateArray: assetid`,
  Accounts: `ImmediateArray: address`,
};

interface StorageProp {
  name: string;
  type: StorageType;
  key?: string;
  keyType: TypeInfo;
  valueType: TypeInfo;
  initNode: ts.CallExpression;
  /** If true, always do a box_del before a box_put incase the size of the value changed */
  dynamicSize?: boolean;
  prefix?: string;
  maxKeys?: number;
  allowPotentialCollisions?: boolean;
}

interface ABIMethod {
  name: string;
  readonly?: boolean;
  desc: string;
  args: { name: string; type: TypeInfo; desc: string }[];
  returns: { type: TypeInfo; desc: string };
  events: string[];
}

interface Subroutine extends ABIMethod {
  allows: {
    create: ('NoOp' | 'OptIn' | 'DeleteApplication')[];
    call: OnComplete[];
  };
  nonAbi: {
    create: string[];
    call: string[];
  };
  node: ts.MethodDeclaration | ts.ClassDeclaration;
}
// These should probably be types rather than strings?
function isNumeric(t: TypeInfo): boolean {
  return t.kind === 'base' && ['uint64', 'assetid', 'appid'].includes(t.type);
}

function isBytes(t: TypeInfo): boolean {
  return t.kind === 'base' && ['bytes', 'byte[]', 'string', 'byte'].includes(t.type);
}

function isRefType(t: TypeInfo): boolean {
  return t.kind === 'base' && ['accountreference', 'assetreference', 'appreference'].includes(t.type);
}

function getObjectTypes(givenType: TypeInfo): Record<string, TypeInfo> {
  if (givenType.kind !== 'object') throw Error();

  return givenType.properties;
}

function isArrayType(type: TypeInfo) {
  return type.kind !== 'base';
}

function typeComparison(inputType: TypeInfo, expectedType: TypeInfo, ignoreUnsafe: boolean = false): void {
  if (equalTypes(expectedType, StackType.any)) return;
  if (equalTypes(inputType, expectedType, ignoreUnsafe)) return;
  if (inputType.kind === 'base' && expectedType.kind === 'base') {
    if (expectedType.type === 'txn' && TXN_TYPES.includes(inputType.type)) return;
    const sameTypes = [
      ['address', 'account'],
      ['bytes', 'string', 'byte[]', 'byte'],
    ];

    let typeEquality = false;

    sameTypes.forEach((t) => {
      if (t.includes(inputType.type) && t.includes(expectedType.type)) {
        typeEquality = true;
      }
    });

    if (typeEquality) return;
  }

  throw Error(`Type mismatch: got ${typeInfoToABIString(inputType)} expected ${typeInfoToABIString(expectedType)}`);
}

function isSmallNumber(type: TypeInfo) {
  const abiType = typeInfoToABIString(type);

  if (!(abiType.match(/uint\d+$/) || abiType.match(/ufixed\d+x\d+$/))) return false;
  const width = Number(abiType.match(/\d+/)![0]);
  if (abiType.startsWith('ufixed64')) return true;

  return width < 64;
}

const compilerScratch = {
  fullArray: '255 // full array',
  elementStart: '254 // element start',
  elementLength: '253 // element length',
  newElement: '252 // new element',
  elementHeadOffset: '251 // element head offset',
  lengthDifference: '250 // length difference',
  subtractHeadDifference: '249 // subtract head difference',
  verifyTxnIndex: '248 // verifyTxn index',
  spliceStart: '247 // splice start',
  spliceByteLength: '246 // splice byte length',
  assignmentValue: '245 // assignment value',
};

export type TEALInfo = {
  node: ts.Node;
  teal: string;
  errorMessage?: string;
};

/** @internal */
export default class Compiler {
  private pendingSubroutines: ts.FunctionDeclaration[] = [];

  static diagsRan: string[] = [''];

  private scratch: { [name: string]: { slot?: number; type: TypeInfo; initNode: ts.CallExpression } } = {};

  private currentProgram: 'approval' | 'clear' | 'lsig' = 'approval';

  teal: {
    approval: TEALInfo[];
    clear: TEALInfo[];
    lsig: TEALInfo[];
  } = {
    approval: [],
    clear: [],
    lsig: [],
  };

  generatedTeal: string = '';

  generatedClearTeal: string = '';

  private frameInfo: {
    [name: string]: {
      start: number;
      end: number;
      frame: {
        [index: number]: {
          name: string;
          type: TypeInfo;
        };
      };
    };
  } = {};

  private lastNode!: ts.Node;

  private mapKeyTypes: {
    global: string[];
    local: string[];
    box: string[];
  } = { global: [], local: [], box: [] };

  private classNode!: ts.ClassDeclaration;

  sourceInfo: {
    source: string;
    teal: number;
    pc?: number[];
    errorMessage?: string;
  }[] = [];

  private frameIndex: number = 0;

  private frameSize: { [methodName: string]: number } = {};

  private subroutines: Subroutine[] = [];

  private clearStateCompiled: boolean = false;

  private ifCount: number = -1;

  private ternaryCount: number = 0;

  private whileCount: number = 0;

  private doWhileCount: number = 0;

  private forCount: number = 0;

  srcPath: string;

  private processErrorNodes: ts.Node[] = [];

  private localVariables: {
    [name: string]: {
      /** The index of the value in the current frame */
      index?: number;

      /**
       * The name of the frame that this object is pointing to. For example:
       * ```ts
       * const x = y
       * ```
       *
       * results in
       *
       * ```ts
       * this.localVariables.x.framePointer === 'y'
       * ```
       */
      framePointer?: string;

      /**
       * The type to show in the emitted TEAL.
       * For example, if the type is an alias, show the alias symbol rather than the actual type
       */
      typeString: string;

      /** The type of the value in the variable */
      type: TypeInfo;

      /**
       * The accessors used to access the underlying array. For example,
       * ```ts
       * const x = a[1][2]
       * ```
       *
       * Results in
       *
       * ```ts
       * this.localVariables.x.accessors === [1,2]
       * ```
       */
      accessors?: (ts.Expression | string)[];

      /** The storage property expression if this object is accessing storage */
      storageExpression?: ts.PropertyAccessExpression;

      /**
       * If this variable is accessing a storage map, then this is the name of the saved key in `this.localVariables`.
       * For example:
       * ```ts
       * const x = this.myMap('foo').value
       *```
       *
       * Results in
       *
       * ```ts
       * this.localVariables.x.storageKeyFrame === 'storage key//x'
       * ```
       */
      storageKeyFrame?: string;

      /**
       * If this variable is accessing local storage, then this is the name of the saved account in `this.localVariables`. For example:
       * ```ts
       * const x = this.localValue(this.txn.sender).value
       * ```
       *
       * Results in
       *
       * ```ts
       * this.localVariables.x.storageKeyFrame === 'storage account//x'
       * ```
       */
      storageAccountFrame?: string;

      /**
       * The comment to use when using frame_bury/dig
       */
      comment?: string;
    };
  } = {};

  private currentSubroutine!: Subroutine;

  private bareCallConfig: {
    NoOp?: { action: 'CALL' | 'CREATE' | 'NEVER'; method: string };
    OptIn?: { action: 'CALL' | 'CREATE'; method: string };
    CloseOut?: { action: 'CALL' | 'CREATE'; method: string };
    ClearState?: { action: 'CALL' | 'CREATE'; method: string };
    UpdateApplication?: { action: 'CALL' | 'CREATE'; method: string };
    DeleteApplication?: { action: 'CALL' | 'CREATE'; method: string };
  } = {};

  abi: {
    name: string;
    desc: string;
    methods: ABIMethod[];
  } = {
    name: '',
    desc: '',
    methods: [],
  };

  private storageProps: { [key: string]: StorageProp } = {};

  private lastType: TypeInfo = { kind: 'base', type: 'void' };

  name: string;

  pcToLine: { [key: number]: number } = {};

  lineToPc: { [key: number]: number[] } = {};

  private lastSourceCommentRange: [number, number] = [-1, -1];

  private comments: number[] = [];

  private typeHint?: TypeInfo;

  private readonly OP_PARAMS: {
    [type: string]: { name: string; type?: string; args: number; fn: (node: ts.Node) => void }[];
  } = {
    account: [...this.getOpParamObjects('acct_params_get'), ...this.getOpParamObjects('asset_holding_get')],
    application: [
      ...this.getOpParamObjects('app_params_get'),
      {
        name: 'GlobalStateExists',
        type: 'any',
        args: 1,
        fn: (node: ts.Node) => {
          this.hasMaybeValue(node, 'app_global_get_ex');
        },
      },
      {
        name: 'LocalStateExists',
        type: 'any',
        args: 2,
        fn: (node: ts.Node) => {
          this.pushLines(node, 'swap', 'cover 2');
          this.hasMaybeValue(node, 'app_local_get_ex');
        },
      },
      {
        name: 'GlobalState',
        type: 'any',
        args: 1,
        fn: (node: ts.Node) => {
          this.assertMaybeValue(
            node,
            'app_global_get_ex',
            StackType.any,
            `global state value does not exist: ${node
              .getText()
              .split('\n')
              .map((l) => l.trim())
              .join(' ')}`
          );
        },
      },
      {
        name: 'LocalState',
        type: 'any',
        args: 2,
        fn: (node: ts.Node) => {
          this.pushLines(node, 'swap', 'cover 2');
          this.assertMaybeValue(
            node,
            'app_local_get_ex',
            StackType.any,
            `local state value does not exist: ${node
              .getText()
              .split('\n')
              .map((l) => l.trim())
              .join(' ')}`
          );
        },
      },
    ],
    txn: this.getOpParamObjects('txn'),
    global: this.getOpParamObjects('global'),
    itxn: this.getOpParamObjects('itxn'),
    gtxns: [
      ...this.getOpParamObjects('gtxns'),
      {
        name: 'LoadScratch',
        type: 'any',
        args: 1,
        fn: (node: ts.Node) => {
          this.push(node, 'gloadss', StackType.any);
        },
      },
    ],
    asset: this.getOpParamObjects('asset_params_get'),
    gitxn: this.getOpParamObjects('gitxn'),
    block: this.getOpParamObjects('block'),
  };

  programVersion = 10;

  templateVars: Record<string, { name: string; type: TypeInfo; initNode: ts.CallExpression }> = {};

  project: Project;

  skipAlgod: boolean;

  currentForEachLabel?: string;

  forEachCount: number = 0;

  forOfCount: number = 0;

  currentLoop?: string;

  innerTxnHasBegun: boolean = false;

  compiledPrograms: { [program in 'clear' | 'approval' | 'lsig']?: string } = {};

  algodVersion?: {
    major: number;
    minor: number;
    patch: number;
    commitHash: string;
  };

  hasDynamicTemplateVar: boolean = false;

  /**
   * The estimated size of the program in bytes
   * This is an estimation because future versions of algod or differen template variable value may change the size
   */
  estimatedProgramSize: { [program in 'clear' | 'approval' | 'lsig']?: number } = {};

  /** Verifies ABI types are properly decoded for runtime usage */
  private checkDecoding(node: ts.Node, type: TypeInfo) {
    if (type.kind === 'base' && type.type === 'bool') {
      this.pushLines(node, 'int 0', 'getbit');
    } else if (this.isDynamicArrayOfStaticType(type) || isBytes(type)) {
      this.pushVoid(node, 'extract 2 0');
    } else if (isNumeric(type) || isSmallNumber(type)) {
      this.pushVoid(node, 'btoi');
    }
  }

  private processNewValue(node: ts.Node, numericType?: TypeInfo) {
    if (node.getType().isNumberLiteral() && numericType) {
      this.processNumericLiteralWithType(node, numericType);
    } else if (node.isKind(ts.SyntaxKind.BinaryExpression)) {
      this.processBinaryExpression(node, true);
    } else {
      this.processNode(node);
    }

    if (this.usingValue(node.getParentOrThrow())) {
      this.pushLines(node.getParentOrThrow(), 'dup', `store ${compilerScratch.assignmentValue}`);
    }
  }

  /** Handle any action related to boxes or local/global state */
  private handleStorageAction({
    node,
    action,
    storageKeyFrame,
    storageAccountFrame,
    newValue,
  }: {
    /**
     * The node for the storage action. Should be the final callexpression or property access
     * For example: `this.myBox.delete()` or `this.myBox.value`
     */
    node: ts.PropertyAccessExpression | ts.CallExpression;
    /** The action to take on the storage property */
    action: 'get' | 'set' | 'exists' | 'delete' | 'create' | 'extract' | 'replace' | 'size' | 'resize' | 'splice';
    /** If the key for the target storage object is saved in the frame, then this is the name of the key in this.localVariables */
    storageKeyFrame?: string;
    /** If the account for the target local storage is saved in the frame, then this is the name of the key in this.localVariables */
    storageAccountFrame?: string;
    /** Only provided when setting a value */
    newValue?: ts.Node;
  }) {
    const name = getStorageName(node)!;
    const thisNode = node.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ThisKeyword);
    const storagePropNode = thisNode.getParentIfKindOrThrow(ts.SyntaxKind.PropertyAccessExpression);
    const storagePropCallNode = storagePropNode.getParentIfKind(ts.SyntaxKind.CallExpression);

    const fullPropNode = (storagePropCallNode || storagePropNode).getParentIfKindOrThrow(
      ts.SyntaxKind.PropertyAccessExpression
    );
    const fullCallNode = fullPropNode.getParentIfKind(ts.SyntaxKind.CallExpression);

    const args: ts.Node[] = [];
    let keyNode: ts.Node;

    // If the node is a call expression, such as `this.myBox.replace(x, y)` get the arguments
    // then use the property access expression as the node throughout the rest of the method
    if (fullCallNode !== undefined) {
      fullCallNode.getArguments().forEach((a) => args.push(a));
    }

    // eslint-disable-next-line no-param-reassign
    node = fullPropNode;

    const expr = node.getExpression();

    // The node representing the key for the storage object
    if (expr.isKind(ts.SyntaxKind.CallExpression)) {
      keyNode = expr.getArguments()[expr.getArguments().length === 2 ? 1 : 0];
    }

    const { type, valueType, keyType, key, dynamicSize, prefix } = this.storageProps[name];

    const storageType = type;

    // If accesing an account's local state that is saved in the frame
    if (storageAccountFrame && storageType === 'local') {
      this.pushVoid(
        node.getExpression(),
        `frame_dig ${this.localVariables[storageAccountFrame].index} // ${storageAccountFrame}`
      );

      // Accessing a local state for an account given as an argument
    } else if (storageType === 'local') {
      if (!expr.isKind(ts.SyntaxKind.CallExpression)) throw Error();
      this.processNode(expr.getArguments()[0]);
    }

    // Since global/local state doesn't have a native "exists" opcode like boxes
    // we need to use get...ex opcode on the current app ID
    if (action === 'exists' && (storageType === 'global' || storageType === 'local')) {
      this.pushVoid(node.getExpression(), 'txna Applications 0');
    }

    // If a key is defined in the property (LocalStateKey, GlobalStateKey, BoxKey)
    if (key) {
      const hex = Buffer.from(key).toString('hex');
      this.pushVoid(node.getExpression(), `byte 0x${hex} // "${key}"`);

      // If the key is saved in frame
    } else if (storageKeyFrame) {
      this.pushVoid(
        node.getExpression(),
        `frame_dig ${this.localVariables[storageKeyFrame].index} // ${storageKeyFrame}`
      );

      // If the key is provided as an argument
    } else {
      if (prefix) {
        const hex = Buffer.from(prefix).toString('hex');
        this.pushVoid(keyNode!, `byte 0x${hex} // "${prefix}"`);
      }
      const prevTypeHint = this.typeHint;
      this.typeHint = keyType;
      this.processNode(keyNode!);
      this.typeHint = prevTypeHint;

      if (!equalTypes(keyType, StackType.bytes)) {
        this.checkEncoding(keyNode!, this.lastType);
      }

      if (prefix) this.pushVoid(keyNode!, 'concat');
    }

    switch (action) {
      case 'get':
        if (storageType === 'global') {
          this.push(node.getExpression(), 'app_global_get', valueType);
        } else if (storageType === 'local') {
          this.push(node.getExpression(), 'app_local_get', valueType);
        } else if (storageType === 'box') {
          this.assertMaybeValue(
            node.getExpression(),
            'box_get',
            valueType,
            `box value does not exist: ${node
              .getText()
              .split('\n')
              .map((l) => l.trim())
              .join(' ')}`
          );
        }

        if ((storageType === 'box' || !isNumeric(valueType)) && !equalTypes(valueType, StackType.bytes)) {
          this.checkDecoding(node, valueType);
        }

        break;

      case 'set': {
        if (storageType === 'box' && dynamicSize) {
          this.pushLines(node.getExpression(), 'dup', 'box_del', 'pop');
        }

        if (newValue) {
          const prevTypeHint = this.typeHint;
          this.typeHint = valueType;
          this.processNewValue(newValue);
          this.typeHint = prevTypeHint;

          // if valueType is not bytes
          // or if storage type is box
          if ((storageType === 'box' || !isNumeric(valueType)) && !equalTypes(valueType, StackType.bytes)) {
            this.checkEncoding(newValue, this.lastType);
          }

          typeComparison(this.lastType, valueType);
        } else {
          const isUnsafe = this.lastType.kind === 'base' && this.lastType.type.startsWith('unsafe ');
          if (isUnsafe) {
            this.checkEncoding(node, this.lastType);
          }

          const command = storageType === 'box' ? 'swap' : storageType === 'local' ? 'uncover 2' : 'swap';
          this.pushVoid(node.getExpression(), command);

          if ((storageType === 'box' || !isNumeric(valueType)) && !equalTypes(valueType, StackType.bytes)) {
            this.checkEncoding(node, valueType);
          }
        }

        const operation =
          storageType === 'global' ? 'app_global_put' : storageType === 'local' ? 'app_local_put' : 'box_put';
        this.push(node.getExpression(), operation, valueType);
        break;
      }

      case 'exists': {
        const existsAction =
          storageType === 'global' ? 'app_global_get_ex' : storageType === 'local' ? 'app_local_get_ex' : 'box_len';
        this.hasMaybeValue(node.getExpression(), existsAction);
        break;
      }

      case 'delete': {
        const deleteAction =
          storageType === 'global' ? 'app_global_del' : storageType === 'local' ? 'app_local_del' : 'box_del';
        this.pushVoid(node.getExpression(), deleteAction);
        break;
      }

      case 'resize':
        if (!equalTypes(valueType, StackType.bytes)) throw Error(`resize only supported on bytes, not ${keyType}`);

        this.processNode(args[0]);
        this.pushVoid(node.getExpression(), 'box_resize');
        break;

      case 'splice':
        if (!equalTypes(valueType, StackType.bytes)) throw Error(`splice only supported on bytes, not ${keyType}`);

        this.processNode(args[0]);
        this.processNode(args[1]);
        this.processNode(args[2]);
        this.pushVoid(node.getExpression(), 'box_splice');
        break;

      case 'create':
        if (args[0]) {
          this.processNode(args[0]);
        } else if (this.isDynamicType(valueType)) {
          throw Error(
            `Size must be given to create call when the box value is dynamic (${typeInfoToABIString(valueType)})`
          );
        } else this.pushVoid(node, `int ${this.getTypeLength(valueType)}`);

        this.pushLines(node.getExpression(), 'box_create', 'pop');
        break;

      case 'extract':
        if (args[0] && args[1]) {
          this.processNode(args[0]);
          this.processNode(args[1]);
        } else {
          this.pushVoid(node.getExpression(), 'cover 2');
        }
        this.push(node.getExpression(), 'box_extract', valueType);
        break;

      case 'replace':
        if (args[0] && args[1]) {
          this.processNode(args[0]);
          this.processNode(args[1]);
        } else {
          this.pushVoid(node.getExpression(), 'cover 2');
        }
        this.pushVoid(node.getExpression(), 'box_replace');
        break;

      case 'size':
        this.assertMaybeValue(
          node.getExpression(),
          'box_len',
          StackType.uint64,
          `box value does not exist: ${node
            .getText()
            .split('\n')
            .map((l) => l.trim())
            .join(' ')}`
        );
        break;
      default:
        throw new Error();
    }
  }

  private andCount: number = 0;

  private orCount: number = 0;

  private sourceFile: ts.SourceFile;

  private nodeDepth: number = 0;

  /**
     The current top level node being processed within a method

    This is used to determine if a function call should return a value or not. For example,

    ```ts
    class Foo {
      bar(arr: number[]) {
        const x = arr.pop(); // "arr.pop()" is NOT top-level node
        arr.pop(); // "arr.pop()" is top-level node
      }
    }
    ```
   */
  private topLevelNode!: ts.Node;

  private getTypeInfo(type: ts.Type<ts.ts.Type>): TypeInfo {
    if (type.getText() === 'SplitUint128') return { kind: 'base', type: 'split uint128' };
    if (type.getText() === 'DivmodwOutput') return { kind: 'base', type: 'divmodw output' };
    if (type.getText() === 'VRFReturnValues') return { kind: 'base', type: 'vrf return values' };
    if (type.getText() === 'ECDSAPubKey') return { kind: 'base', type: 'ecdsa pubkey' };
    if (type.isNumberLiteral()) return { kind: 'base', type: 'uint64' };
    if (type.isStringLiteral()) return { kind: 'base', type: 'string' };
    if (type.isVoid()) return { kind: 'base', type: 'void' };

    if (type.getText() === 'Account') {
      throw Error(
        '`Account` no longer supported. Use `Address` instead. May require client-side changes. See this PR for more details: https://github.com/algorandfoundation/TEALScript/pull/296. Use `AccountReference` if you need to explicitly use the reference type.'
      );
    }

    if (type.getText() === 'Application') {
      throw Error(
        '`Application` type no longer supported. Use `AppID` instead. May require client-side changes. See this PR for more details: https://github.com/algorandfoundation/TEALScript/pull/296. Use `AppReference` if you need to explicitly use the reference type.'
      );
    }

    if (type.getText() === 'Asset') {
      throw Error(
        'Asset` type no longer supported. Use `AssetID` instead. May require client-side changes. See this PR for more details: https://github.com/algorandfoundation/TEALScript/pull/296. Use `AssetReference` if you need to explicitly use the reference type.'
      );
    }

    if (type.getText().startsWith('InnerTxn<')) {
      const typeInfo = this.getTypeInfo(type.getAliasTypeArguments()[0]);
      if (typeInfo.kind !== 'base') throw Error('InnerTxn type must be a txn type');
      return { kind: 'base', type: `generic ${typeInfo.type}` };
    }

    if (type.getText() === 'Txn') return { kind: 'base', type: 'txn' };
    if (type.getText() === 'Required<PaymentParams>') return { kind: 'base', type: 'pay' };
    if (type.getText() === 'Required<AssetTransferParams>') return { kind: 'base', type: 'axfer' };
    if (type.getText() === 'AppCallTxn') return { kind: 'base', type: 'appl' };
    if (type.getText() === 'Required<KeyRegParams>') return { kind: 'base', type: 'keyreg' };
    if (type.getText() === 'Required<AssetConfigParams>') return { kind: 'base', type: 'acfg' };
    if (type.getText() === 'Required<AssetFreezeParams>') return { kind: 'base', type: 'afrz' };

    const aliasedTypeNode = this.getAliasedTypeNode(type);

    const typeString = (aliasedTypeNode?.getText() ?? type.getText())
      .toLowerCase()
      .replace(/</g, '')
      .replace(/>/g, '')
      .replace('typeof ', '')
      .replace(/, */g, 'x');

    if (typeString === 'byte') return { kind: 'base', type: 'byte' };

    const txnTypes = {
      thistxnparams: 'txn',
      paymentparams: 'pay',
      appparams: 'appl',
      assettransferparams: 'axfer',
      assetconfigparams: 'acfg',
      assetcreateparams: 'acfg',
      assetfreezeparams: 'afrz',
      onlinekeyregparams: 'keyreg',
      methodcallparams: 'appl',
    } as { [key: string]: string };

    if (txnTypes[typeString]) return { kind: 'base', type: txnTypes[typeString] };
    if (typeString.startsWith('methodcall')) {
      const typeArgs = type.getAliasTypeArguments();
      let args: TypeInfo[] = [];
      const returns = StackType.void;
      let name: string | undefined;

      if (typeArgs[0].isTuple()) {
        args = typeArgs[0].getTupleElements().map((e) => this.getTypeInfo(e));
      } else {
        const sig = typeArgs[0].getCallSignatures()[0];
        name = (sig.getDeclaration() as ts.MethodDeclaration).getName();

        args = sig.getParameters().map((param) => this.getTypeInfo(param.getDeclarations()[0].getType()));
      }

      return {
        kind: 'method',
        args,
        returns,
      };
    }
    if (typeString === 'itxnparams') return { kind: 'base', type: 'itxn' };
    if (typeString === 'bytes32') return { kind: 'staticArray', length: 32, base: { kind: 'base', type: 'byte' } };
    if (typeString === 'bytes64') return { kind: 'staticArray', length: 64, base: { kind: 'base', type: 'byte' } };

    if (type.isBoolean() || type.isBooleanLiteral()) return { kind: 'base', type: 'bool' };

    if (type.isTuple()) {
      const typeInfo: TypeInfo = {
        kind: 'tuple',
        elements: [],
      };

      type.getTupleElements().forEach((e) => {
        typeInfo.elements.push(this.getTypeInfo(e));
      });

      return typeInfo;
    }

    if (type.isArray()) {
      return {
        kind: 'dynamicArray',
        base: this.getTypeInfo(type.getArrayElementType()!),
      };
    }

    if (['address', 'appid', 'assetid', 'assetreference', 'appreference', 'accountreference'].includes(typeString)) {
      return {
        kind: 'base',
        type: typeString,
      };
    }

    if (type.isObject()) {
      const typeInfo: TypeInfo = { kind: 'object', properties: {} };
      type.getProperties().forEach((p) => {
        p.getDeclarations().forEach((d) => {
          if (!d.isKind(ts.SyntaxKind.PropertySignature)) throw Error(`${type.getText()} ${d.getKindName()}`);
          typeInfo.properties[p.getName()] = this.getTypeInfo(d.getType()!);
        });
      });

      return typeInfo;
    }

    if (aliasedTypeNode?.isKind(ts.SyntaxKind.TypeReference) && aliasedTypeNode?.getText().startsWith('StaticArray')) {
      const typeArgs = aliasedTypeNode.getTypeArguments();

      const length = Number(typeArgs[1].getType().getText());

      if (Number.isNaN(length)) throw Error(`StaticArray length is not a literal number: ${typeArgs[1].getText()}`);
      return {
        kind: 'staticArray',
        length,
        base: this.getTypeInfo(typeArgs[0].getType()),
      };
    }

    if (type.getText().startsWith('StaticArray')) {
      const typeArgs = type.getAliasTypeArguments();
      const length = Number(typeArgs[1].getText());
      if (Number.isNaN(length)) throw Error(`StaticArray length must be a literal number`);

      return {
        kind: 'staticArray',
        length,
        base: this.getTypeInfo(typeArgs[0]),
      };
    }

    if (
      type.getUnionTypes()[0]?.isNumber() ||
      type.getUnionTypes()[0]?.isString() ||
      type.isString() ||
      type.isNumber()
    ) {
      return { kind: 'base', type: typeString.replace('number', 'uint64') };
    }

    if (type.isNumberLiteral()) {
      return { kind: 'base', type: `uint64` };
    }

    if (type.isStringLiteral()) {
      return { kind: 'base', type: `string` };
    }

    if (type.isAny()) {
      return { kind: 'base', type: 'any' };
    }

    if (typeString.match(/uint\d+$/) || typeString.match(/ufixed\d+x\d+$/)) {
      return { kind: 'base', type: typeString };
    }

    if (typeString === 'brandstringx"bytes"') {
      return { kind: 'base', type: 'bytes' };
    }

    if (typeString.match(/staticbytes\d+$/)) {
      return {
        kind: 'staticArray',
        base: { kind: 'base', type: 'byte' },
        length: Number(typeString.replace('staticbytes', '')),
      };
    }

    if (type.isUnion()) {
      const firstType = this.getTypeInfo(type.getUnionTypes()[0]);
      type.getUnionTypes().forEach((t) => {
        if (!equalTypes(this.getTypeInfo(t), firstType)) {
          throw Error(`Union types must all be the same type`);
        }
      });

      return firstType;
    }

    throw Error(`Cannot resolve type ${type.getText()} (${typeString})`);
  }

  private getAliasedTypeNode(type: ts.Type<ts.ts.Type>): ts.TypeNode<ts.ts.TypeNode> | undefined {
    const isUserTypeAlias = (d: ts.Node<ts.ts.Node> | undefined) => {
      const sourcePath = path.normalize(d?.getSourceFile().getFilePath() ?? '');
      return (
        d?.isKind(ts.SyntaxKind.TypeAliasDeclaration) &&
        !sourcePath.startsWith(this.typesDir) &&
        !sourcePath.startsWith(this.libDir)
      );
    };

    let currentTypeNode;

    const firstDeclaration = type.getAliasSymbol()?.getDeclarations().at(-1) as ts.TypeAliasDeclaration;

    if (isUserTypeAlias(firstDeclaration)) {
      currentTypeNode = firstDeclaration?.getTypeNode();
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (currentTypeNode === undefined) break;
      const declaration = currentTypeNode.getSymbol()?.getDeclarations().at(-1) as ts.TypeAliasDeclaration;

      if (isUserTypeAlias(declaration)) {
        currentTypeNode = declaration.getTypeNode();
      } else break;
    }

    return currentTypeNode;
  }

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

      this.pushLines(node, 'uncover 2', 'dig 1', '*', 'cover 2', 'mulw', 'cover 2', '+', 'swap');
    });
  }

  private customProperties: {
    [propertyName: string]: {
      fn: (node: ts.PropertyAccessExpression) => void;
      check: (node: ts.PropertyAccessExpression) => boolean;
    };
  } = {
    id: {
      check: (node: ts.PropertyAccessExpression) =>
        this.lastType.kind === 'base' && ['assetid', 'appid'].includes(this.lastType.type),
      fn: (node: ts.PropertyAccessExpression) => {
        this.lastType = StackType.uint64;
      },
    },
    zeroIndex: {
      check: (node: ts.PropertyAccessExpression) => ['AssetID', 'AppID'].includes(node.getExpression().getText()),
      fn: (node: ts.PropertyAccessExpression) => {
        this.push(node.getNameNode(), 'int 0', this.getTypeInfo(node.getType()));
      },
    },
    zeroAddress: {
      check: (node: ts.PropertyAccessExpression) => ['Address', 'Account'].includes(node.getExpression().getText()),
      fn: (node: ts.PropertyAccessExpression) => {
        this.push(node.getNameNode(), 'global ZeroAddress', this.getTypeInfo(node.getType()));
      },
    },
    length: {
      check: (node: ts.PropertyAccessExpression) => {
        return isBytes(this.lastType) || this.lastType.kind === 'dynamicArray' || this.lastType.kind === 'staticArray';
      },
      fn: (n: ts.PropertyAccessExpression) => {
        if (this.lastType.kind === 'staticArray') {
          this.push(n.getNameNode(), `int ${this.lastType.length}`, StackType.uint64);
          return;
        }

        if (isBytes(this.lastType)) {
          this.push(n.getNameNode(), 'len', StackType.uint64);
          return;
        }

        if (this.lastType.kind === 'dynamicArray' && this.isDynamicArrayOfStaticType(this.lastType)) {
          this.pushLines(n.getNameNode(), 'len', `int ${this.getTypeLength(this.lastType.base)}`, '/');
          this.lastType = StackType.uint64;
          return;
        }

        // Dynamic array of non-static types are still ABI encoded
        if (this.lastType.kind === 'dynamicArray') {
          this.pushLines(n.getNameNode(), 'int 0', 'extract_uint16');
          this.lastType = StackType.uint64;
          return;
        }

        throw Error(`Unsupported length property for type ${typeInfoToABIString(this.lastType)}`);
      },
    },
  };

  arc4Description() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = [] as any[];

    const getEventJSON = (e: Event) => {
      const args = e.args.map((a) => ({
        name: a.name,
        type: typeInfoToABIString(a.type, true),
        desc: a.desc ? a.desc : undefined,
      }));

      return { name: e.name, args, desc: e.desc };
    };

    this.abi.methods.forEach((m) => {
      const args = m.args.map((a) => ({
        name: a.name,
        type: typeInfoToABIString(a.type),
        desc: a.desc ? a.desc : undefined,
      }));

      const events = m.events.map((e) => getEventJSON(this.events[e]));

      methods.push({
        name: m.name,
        desc: m.desc ? m.desc : undefined,
        readonly: m.readonly,
        args,
        returns: {
          type: typeInfoToABIString(m.returns.type, true),
          desc: m.returns.desc ? m.returns.desc : undefined,
        },
        events: events.length ? events : undefined,
      });
    });

    const events = Object.values(this.events).map(getEventJSON);

    return { name: this.abi.name, desc: this.abi.desc, methods, events: events.length ? events : undefined };
  }

  private verifyTxn(node: ts.CallExpression, type?: string) {
    const firstArg = node.getArguments()[1];
    if (!firstArg.isKind(ts.SyntaxKind.ObjectLiteralExpression))
      throw new Error('Expected object literal as second argument');

    const preTealLength = this.teal[this.currentProgram].length;

    this.processNode(node.getArguments()[0]);

    // Get the opcodes that were needed to process the txn index
    const opcodes = this.teal[this.currentProgram]
      .slice(preTealLength)
      .map((t) => t.teal)
      .filter((t) => !t.startsWith('//'));

    // If more than one opcode was needed, it will be more efficient to store the index in scratch
    const indexInScratch: boolean = opcodes.length > 1;

    if (indexInScratch) {
      this.pushVoid(node, `store ${compilerScratch.verifyTxnIndex}`);
    } else this.teal[this.currentProgram].pop();

    const loadField = (fieldNode: ts.Node, field: string) => {
      if (indexInScratch) {
        this.pushVoid(fieldNode, `load ${compilerScratch.verifyTxnIndex}`);
      } else if (node.getArguments()[0].getText() !== 'this.txn') {
        this.processNode(node.getArguments()[0]);
      }

      const txnOp = node.getArguments()[0].getText() === 'this.txn' ? 'txn' : 'gtxns';
      this.pushVoid(fieldNode, `${txnOp} ${capitalizeFirstChar(field)}`);
    };

    // Don't perform type check on method arguments because they are checked in the method routing
    let skipTypeCheck = false;
    if (node.getArguments()[0].isKind(ts.SyntaxKind.Identifier)) {
      const { name } = this.processFrame(node.getArguments()[0], node.getArguments()[0].getText(), false);
      if (this.currentSubroutine.args.find((a) => a.name === node.getArguments()[0].getText())) {
        skipTypeCheck = typeInfoToABIString(this.localVariables[name].type) === type;
      }
    }

    const txnText = node.getArguments()[0].getText();

    if (
      type !== undefined &&
      !skipTypeCheck &&
      (this.currentProgram === 'lsig' || node.getArguments()[0].getText() !== 'this.txn')
    ) {
      this.pushVoid(node, `// verify ${type}`);
      loadField(node, 'typeEnum');
      this.pushVoid(node, `int ${type}`);
      this.pushVoid(node, '==');
      this.pushVoid(
        node,
        'assert',
        `transaction verification failed: ${JSON.stringify({ txn: txnText, field: 'typeEnum', expected: type })}`
      );
    }

    const processConditionProp = (
      condAssignment: ts.PropertyAssignment,
      topProp: ts.ObjectLiteralElementLike,
      field: string
    ) => {
      const condition = condAssignment.getNameNode().getText();

      if (['includedIn', 'notIncludedIn'].includes(condition)) {
        const propInit = condAssignment.getInitializer();
        if (!propInit?.isKind(ts.SyntaxKind.ArrayLiteralExpression)) throw Error('Expected array literal');
        propInit.getElements().forEach((e, eIndex) => {
          loadField(topProp, field);
          this.processNode(e);
          const op = condition === 'includedIn' ? '==' : '!=';
          this.pushLines(condAssignment, op);
          if (eIndex) this.pushLines(condAssignment, '||');
        });

        this.pushVoid(
          condAssignment,
          'assert',
          `transaction verification failed: ${JSON.stringify({
            txn: { txnText },
            field,
            condition,
            expected: propInit.getText(),
          })}`
        );
        return;
      }

      const conditionMapping: Record<string, string> = {
        greaterThan: '>',
        greaterThanEqualTo: '>=',
        lessThan: '<',
        lessThanEqualTo: '<=',
        not: '!=',
      };

      const op = conditionMapping[condition];

      if (op === undefined) throw Error();
      loadField(topProp, field);
      this.processNode(condAssignment.getInitializer()!);
      this.pushLines(condAssignment, op);
      this.pushVoid(
        condAssignment,
        'assert',
        `transaction verification failed: ${JSON.stringify({
          txn: txnText,
          field,
          condition,
          expected: op + condAssignment.getInitializer()!.getText(),
        })}`
      );
    };

    firstArg.getProperties().forEach((topProp, i) => {
      if (!topProp.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
      const field = topProp.getNameNode().getText();

      this.pushVoid(topProp, `// verify ${field}`);

      const init = topProp.getInitializer();
      if (init?.isKind(ts.SyntaxKind.ObjectLiteralExpression)) {
        init.getProperties().forEach((childProp) => {
          if (!childProp.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
          const initializer = childProp.getInitializer();

          if (childProp.getName().match(/^\d+$/)) {
            this.pushVoid(childProp, `// verify ${field} ${childProp.getName()}`);
            if (initializer?.isKind(ts.SyntaxKind.ObjectLiteralExpression)) {
              initializer.getProperties().forEach((grandChildProp) => {
                if (!grandChildProp.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();

                processConditionProp(grandChildProp, topProp, `${field} ${childProp.getName()}`);
              });
            } else {
              loadField(childProp, `${field} ${childProp.getName()}`);
              this.processNode(childProp.getInitializer()!);
              this.pushLines(childProp, '==');
              this.pushVoid(
                childProp,
                'assert',
                `transaction verification failed: ${JSON.stringify({
                  txn: txnText,
                  field,
                  index: childProp.getName(),
                  expected: childProp.getInitializer()!.getText(),
                })}`
              );
            }
          } else processConditionProp(childProp, topProp, field);
        });
        return;
      }

      loadField(topProp, field);
      this.processNode(topProp.getInitializer()!);
      this.pushLines(topProp, '==');
      this.pushVoid(
        topProp,
        'assert',
        `transaction verification failed: ${JSON.stringify({
          txn: txnText,
          field,
          expected: topProp.getInitializer()!.getText(),
        })}`
      );
    });
  }

  private forIterator(
    node: ts.Node,
    arrayNode: ts.Node,
    logic: ts.Node,
    paramName: string,
    method: 'forEach' | 'forOf'
  ) {
    const arrayType = this.getStackTypeFromNode(arrayNode);

    // TODO: Support dynamic array of static type as well
    if (arrayType.kind !== 'staticArray') throw Error();
    if (typeInfoToABIString(arrayType.base) === 'bool') {
      throw Error('Iterating over boolean arrays is not currently supported');
    }
    if (this.isDynamicType(arrayType)) throw Error('Cannot iterate over dynamic elements');
    const baseType = arrayType.base;
    const typeLength = this.getTypeLength(baseType);

    const frameName = `${method}//${node.getStartLinePos()}`;

    this.processNode(arrayNode);

    const lastTealLine = this.teal[this.currentProgram].at(-1)!.teal;

    // If this is a value larger than 4096 bytes in a box, use box_extract
    if (lastTealLine.startsWith('box_extract') && this.getTypeLength(arrayType) > 4096) {
      this.teal[this.currentProgram].pop(); // pop box_extract
      this.teal[this.currentProgram].pop(); // pop cover 2

      // Save box key
      this.initialFrameBury(
        node,
        `${frameName}//box_key`,
        StackType.bytes,
        'key for the box that contains the array we are iterating over'
      );

      // Save offset
      this.pushLines(node, 'swap', 'dup');

      this.initialFrameBury(
        node,
        `${frameName}//offset`,
        StackType.uint64,
        'the offset we are extracting the next element from'
      );

      // Save end offset
      this.pushLines(node, '+');
      this.initialFrameBury(node, `${frameName}//end_offset`, StackType.uint64, 'the offset of the last element');

      // Save the current element
      this.frameDig(node, `${frameName}//box_key`);
      this.frameDig(node, `${frameName}//offset`);

      this.pushLines(node, `int ${typeLength}`, 'box_extract');

      this.lastType = baseType;
      this.checkDecoding(node, baseType);

      this.initialFrameBury(node, paramName, baseType);
    } else {
      // Save the full array
      this.pushLines(node, 'dup');
      this.initialFrameBury(node, `${frameName}//aray`, arrayType, 'copy of the array we are iterating over');
      this.pushVoid(node, `extract 0 ${typeLength}`);

      this.checkDecoding(node, baseType);

      // Save the current element
      this.initialFrameBury(node, paramName, baseType);

      // Save the offset
      this.pushLines(node, 'int 0');
      this.initialFrameBury(
        node,
        `${frameName}//offset`,
        StackType.uint64,
        'the offset we are extracting the next element from'
      );
    }
    const label = `*${method}_${this[`${method}Count`]}`;
    this.pushLines(node, `${label}:`);
    this[`${method}Count`] += 1;

    const prevForEachLabel = this.currentForEachLabel;
    this.currentForEachLabel = label;
    const previousLoop = this.currentLoop;
    if (method === 'forOf') this.currentLoop = label;
    this.processNode(logic);
    this.currentLoop = previousLoop;
    this.currentForEachLabel = prevForEachLabel;

    const arrayIndex = this.localVariables[`${frameName}//aray`]?.index;

    // End of for each logic
    if (method === 'forOf') this.pushVoid(node, `${label}_continue:`);
    this.pushLines(node, '// increment offset and loop if not out of bounds');
    this.frameDig(node, `${frameName}//offset`);
    this.pushLines(node, `int ${typeLength}`, '+', 'dup');

    if (arrayIndex !== undefined) {
      this.pushVoid(node, `int ${arrayType.length * typeLength} // offset of last element`);
    } else {
      this.frameDig(node, `${frameName}//end_offset`);
    }

    this.pushLines(node, '<', `bz ${label}_end`);
    this.frameBury(node, `${frameName}//offset`);

    if (arrayIndex !== undefined) {
      this.frameDig(node, `${frameName}//aray`);
      this.frameDig(node, `${frameName}//offset`);
      this.pushLines(node, `int ${typeLength}`, 'extract');
    } else {
      this.frameDig(node, `${frameName}//box_key`);
      this.frameDig(node, `${frameName}//offset`);
      this.pushLines(node, `int ${typeLength}`, 'box_extract');
    }

    this.lastType = baseType;

    this.checkDecoding(node, baseType);

    this.frameBury(node, paramName);

    this.pushLines(node, `b ${label}`, `${label}_end:`);
  }

  private opcodeImplementations: {
    [methodName: string]: {
      fn: (node: ts.CallExpression) => void;
      check: (node: ts.CallExpression) => boolean;
    };
  } = {
    len: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const typeArg = node.getTypeArguments()?.[0];
        const arg = node.getArguments()?.[0];

        if (typeArg) {
          if (arg) throw Error('len cannot be called with both a type argument and an argument');
          const type = this.getTypeInfo(typeArg.getType());
          if (this.isDynamicType(type)) throw Error('len cannot be used with dynamic type as type argument');
          this.push(node, `int ${this.getTypeLength(type)}`, StackType.uint64);
          return;
        }

        const type = this.getStackTypeFromNode(arg);

        if (this.isDynamicType(type)) {
          this.processNode(arg);
          this.push(node, 'len', StackType.uint64);
        } else {
          this.push(node, `int ${this.getTypeLength(type)}`, StackType.uint64);
        }
      },
    },
    asserts: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        node.getArguments().forEach((a) => {
          this.processNode(a);
          this.pushVoid(a, 'assert', `asserts failed: ${node.getText().replace(/\n/g, '\\n')}`);
        });
      },
    },
    bzero: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const typeArg = node.getTypeArguments()?.[0];
        const arg = node.getArguments()[0];

        if (typeArg && !arg) {
          const typeInfo = this.getTypeInfo(typeArg.getType());
          if (this.isDynamicType(typeInfo)) {
            throw Error('bzero cannot be used with dynamic types');
          }
          this.push(node, `byte 0x${'00'.repeat(this.getTypeLength(typeInfo))}`, typeInfo);
          return;
        }

        if (arg && !typeArg) {
          const staticType: TypeInfo = {
            kind: 'staticArray',
            base: { kind: 'base', type: 'byte' },
            length: parseInt(arg.getText(), 10),
          };

          const type = this.typeHint && isBytes(this.typeHint) ? this.typeHint : staticType;

          if (arg.isKind(ts.SyntaxKind.NumericLiteral))
            this.push(node, `byte 0x${'00'.repeat(parseInt(arg.getText(), 10))}`, type);
          else {
            this.processNode(arg);
            this.push(node, 'bzero', StackType.bytes);
          }
          return;
        }

        throw Error('bzero cannot be called with both a type argument and an argument');
      },
    },
    addr: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        // TODO: add pseudo op type parsing/assertion to handle this
        // not currently exported in langspeg.json
        const args = node.getArguments();
        if (!args[0].isKind(ts.SyntaxKind.StringLiteral)) throw new Error('addr() argument must be a string literal');
        this.push(args[0], `addr ${args[0].getLiteralText()}`, ForeignType.Address);
      },
    },
    method: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const args = node.getArguments();
        if (!args[0].isKind(ts.SyntaxKind.StringLiteral)) throw new Error('method() argument must be a string literal');
        this.push(args[0], `method "${args[0].getLiteralText()}"`, StackType.bytes);
      },
    },
    setbit: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const args = node.getArguments();
        this.processNode(args[0]);
        const inputType = this.lastType;
        this.processNode(args[1]);
        this.processNode(args[2]);
        this.push(node, 'setbit', inputType);
      },
    },
    getbit: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const args = node.getArguments();
        this.processNode(args[0]);
        this.processNode(args[1]);
        this.push(node, 'getbit', StackType.uint64);
      },
    },
  };

  private customMethods: {
    [methodName: string]: {
      fn: (node: ts.CallExpression) => void;
      check: (node: ts.CallExpression) => boolean;
    };
  } = {
    ...this.opcodeImplementations,
    // String.subtring
    substring: {
      check: (node: ts.CallExpression) => isBytes(this.lastType),
      fn: (node: ts.CallExpression) => {
        this.processNode(node.getArguments()[0]);
        this.processNode(node.getArguments()[1]);
        this.push(node, 'substring3', StackType.bytes);
      },
    },
    increaseOpcodeBudget: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        this.pushLines(
          node,
          'itxn_begin',
          'int appl',
          'itxn_field TypeEnum',
          'int 0',
          'itxn_field Fee',
          'byte 0x0a8101 // #pragma version 10; int 1',
          'dup',
          'itxn_field ApprovalProgram',
          'itxn_field ClearStateProgram',
          'int DeleteApplication',
          'itxn_field OnCompletion',
          'itxn_submit'
        );
      },
    },
    // Global methods
    clone: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        this.processNode(node.getArguments()[0]);
      },
    },
    rawBytes: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        if (node.getArguments().length !== 1) throw new Error();
        this.processNode(node.getArguments()[0]);
        this.checkEncoding(node.getArguments()[0], this.lastType);
        this.lastType = StackType.bytes;
      },
    },
    rawByte: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        if (node.getArguments().length !== 1) throw new Error('rawByte must be given a single argument');
        this.processNode(node.getArguments()[0]);
        this.checkEncoding(node.getArguments()[0], this.lastType);
        if (this.getTypeLength(this.lastType) !== 1) throw new Error('rawByte argument must be a single byte');
        this.lastType = { type: 'byte', kind: 'base' };
      },
    },
    castBytes: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        if (node.getTypeArguments()?.length !== 1) throw Error('castBytes must be given a single type argument');
        this.processNode(node.getArguments()[0]);
        const typeArg = node.getTypeArguments()[0];
        this.lastType = this.getTypeInfo(typeArg.getType());
        if (!this.disableWarnings)
          // eslint-disable-next-line no-console
          console.warn('WARNING: castBytes is UNSAFE and does not validate encoding. Use at your own risk.');
      },
    },
    wideRatio: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const args = node.getArguments();
        if (
          args.length !== 2 ||
          !args[0].isKind(ts.SyntaxKind.ArrayLiteralExpression) ||
          !args[1].isKind(ts.SyntaxKind.ArrayLiteralExpression)
        )
          throw new Error();

        this.multiplyWideRatioFactors(node, new Array(...args[0].getElements()));
        this.multiplyWideRatioFactors(node, new Array(...args[1].getElements()));

        this.pushLines(node, 'divmodw', 'pop', 'pop', 'swap', '!');
        this.pushVoid(node, 'assert', 'wideRatio failed');

        this.lastType = StackType.uint64;
      },
    },
    hex: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const args = node.getArguments();
        if (args.length !== 1) throw new Error();
        const arg0Type = args[0].getType();
        if (!arg0Type.isStringLiteral()) throw new Error('Hex argument must be string literal');

        this.push(
          args[0],
          `byte 0x${arg0Type.getLiteralValueOrThrow().toString().replace(/^0x/, '')}`,
          StackType.bytes
        );
      },
    },
    btobigint: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        this.processNode(node.getArguments()[0]);
        this.lastType = { kind: 'base', type: 'bigint' };
      },
    },
    verifyTxn: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => this.verifyTxn(node),
    },
    verifyPayTxn: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.PaymentTx),
    },
    verifyAppCallTxn: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.ApplicationCallTx),
    },
    verifyAssetTransferTxn: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.AssetTransferTx),
    },
    verifyAssetConfigTxn: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.AssetConfigTx),
    },
    verifyKeyRegTxn: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.KeyRegistrationTx),
    },
    // Array methods
    push: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        isArrayType(this.getStackTypeFromNode((node.getExpression() as ts.PropertyAccessExpression).getExpression())),
      fn: (node: ts.CallExpression) => {
        const expr = node.getExpression();
        if (!expr.isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

        if (this.lastType.kind !== 'dynamicArray') throw new Error('Can only push to dynamic array');
        if (!this.isDynamicArrayOfStaticType(this.lastType))
          throw new Error('Cannot push to dynamic array of dynamic types');
        this.processNode(node.getArguments()[0]);
        this.checkEncoding(node.getArguments()[0], this.lastType);
        this.pushVoid(node, 'concat');

        this.updateValue(expr.getExpression());
      },
    },
    pop: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        isArrayType(this.getStackTypeFromNode((node.getExpression() as ts.PropertyAccessExpression).getExpression())),
      fn: (node: ts.CallExpression) => {
        if (!node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();
        if (this.lastType.kind !== 'dynamicArray') throw new Error('Can only pop from dynamic array');
        if (this.isDynamicType(this.lastType.base)) throw new Error('Cannot pop from dynamic array of dynamic types');

        const poppedType = this.lastType.base;

        const typeLength = this.getTypeLength(this.lastType.base);
        this.pushLines(node.getExpression(), 'dup', 'len', `int ${typeLength}`, '-', 'int 0', 'swap', 'extract3');

        // only get the popped element if we're expecting a return value
        if (this.topLevelNode !== node) {
          this.pushLines(node.getExpression(), 'dup', 'len', `int ${typeLength}`);

          this.processNode((node.getExpression() as ts.PropertyAccessExpression).getExpression());

          this.pushLines(node.getExpression(), 'cover 2', 'extract3', 'swap');
        }

        this.updateValue((node.getExpression() as ts.PropertyAccessExpression).getExpression());

        if (this.topLevelNode !== node) this.checkDecoding(node, poppedType);

        this.lastType = poppedType;
      },
    },
    splice: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        isArrayType(this.getStackTypeFromNode((node.getExpression() as ts.PropertyAccessExpression).getExpression())),
      fn: (node: ts.CallExpression) => {
        if (!node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

        if (this.lastType.kind !== 'dynamicArray') {
          throw new Error(`Can only splice dynamic array (got ${this.lastType})`);
        }
        if (!this.isDynamicArrayOfStaticType(this.lastType)) {
          throw new Error('Cannot splice a dynamic array of dynamic types');
        }
        const elementType = this.lastType.base;

        // `int ${parseInt(node.getArguments()[1].getText(), 10)}`
        this.processNode(node.getArguments()[1]);

        // TODO: Optimize for literals
        // const spliceIndex = parseInt(node.getArguments()[0].getText(), 10);
        // const spliceStart = spliceIndex * this.getTypeLength(elementType);
        this.processNode(node.getArguments()[0]);
        this.pushLines(node, `int ${this.getTypeLength(elementType)}`, '*', `store ${compilerScratch.spliceStart}`);

        // const spliceElementLength = parseInt(node.getArguments()[1].getText(), 10);
        // const spliceByteLength = (spliceElementLength + 1) * this.getTypeLength(elementType);
        this.processNode(node.getArguments()[1]);
        this.pushLines(
          node,
          `int ${this.getTypeLength(elementType)}`,
          '*',
          `int ${this.getTypeLength(elementType)}`,
          '+',
          `store ${compilerScratch.spliceByteLength}`
        );

        // extract first part
        this.processNode((node.getExpression() as ts.PropertyAccessExpression).getExpression());
        this.pushLines(node, 'int 0', `load ${compilerScratch.spliceStart}`, 'substring3');

        // extract second part
        this.processNode((node.getExpression() as ts.PropertyAccessExpression).getExpression());
        this.pushLines(
          node,
          // get end
          'dup',
          'len',
          // get start (end of splice)
          `load ${compilerScratch.spliceStart}`,
          `load ${compilerScratch.spliceByteLength}`,
          '+',
          `int ${this.getTypeLength(elementType)}`,
          '-',
          'swap',
          // extract second part
          'substring3',
          // concat everything
          'concat'
        );

        if (this.topLevelNode !== node) {
          // this.pushLines(`byte 0x${spliceElementLength.toString(16).padStart(4, '0')}`);

          this.processNode((node.getExpression() as ts.PropertyAccessExpression).getExpression());
          this.pushLines(
            node,
            `load ${compilerScratch.spliceStart}`,
            // `int ${spliceByteLength - this.getTypeLength(elementType)}`,
            `load ${compilerScratch.spliceByteLength}`,
            `int ${this.getTypeLength(elementType)}`,
            '-',
            'extract3',
            'swap'
          );
        }

        this.updateValue((node.getExpression() as ts.PropertyAccessExpression).getExpression());
        this.lastType = { kind: 'dynamicArray', base: elementType };
      },
    },
    forEach: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        isArrayType(this.getStackTypeFromNode((node.getExpression() as ts.PropertyAccessExpression).getExpression())),
      fn: (node: ts.CallExpression) => {
        this.addSourceComment(node.getExpression(), true);

        const fn = node.getArguments()[0];

        if (!fn.isKind(ts.SyntaxKind.ArrowFunction)) throw Error();
        const params = fn.getChildrenOfKind(ts.SyntaxKind.SyntaxList)[0].getChildrenOfKind(ts.SyntaxKind.Parameter);

        if (params.length !== 1) throw Error('forEach function must have exactly one parameter in TEALScript');

        const paramName = params[0].getName();

        const expr = (node.getExpression() as ts.PropertyAccessExpression).getExpression();
        this.forIterator(node, expr, fn.getChildrenOfKind(ts.SyntaxKind.Block)[0], paramName, 'forEach');
      },
    },
    // Address methods
    fromBytes: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        (node.getExpression() as ts.PropertyAccessExpression).getExpression().getText() === 'Address',
      fn: (node: ts.CallExpression) => {
        if (!node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

        this.processNode(node.getArguments()[0]);
        this.lastType = ForeignType.Address;
      },
    },
    fromAddress: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        (node.getExpression() as ts.PropertyAccessExpression).getExpression().getText() === 'Address',
      fn: (node: ts.CallExpression) => {
        if (!node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

        const type = node.getArguments()[0].getType();
        if (!type.isStringLiteral()) throw Error('fromAddress must be called with a string literal');

        this.push(node, `addr ${type.getLiteralValueOrThrow()}`, ForeignType.Address);
      },
    },
    // Asset / Application fromUint64
    fromUint64: {
      check: (node: ts.CallExpression) =>
        node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        ((node.getExpression() as ts.PropertyAccessExpression).getExpression().getText() === 'AssetID' ||
          (node.getExpression() as ts.PropertyAccessExpression).getExpression().getText() === 'AppID'),
      fn: (node: ts.CallExpression) => {
        if (!node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

        this.processNode(node.getArguments()[0]);
        this.lastType = this.getTypeInfo(
          (node.getExpression() as ts.PropertyAccessExpression).getExpression().getType()
        );
      },
    },
    // number methods
    Uint: {
      check: (node: ts.CallExpression) => node.getExpression().isKind(ts.SyntaxKind.Identifier),
      fn: (node: ts.CallExpression) => {
        const args = node.getArguments();
        if (args.length !== 1) throw new Error();
        const arg0Type = args[0].getType();
        if (!arg0Type.isStringLiteral()) throw new Error('Uint argument must be string literal');

        const widthArg = node.getTypeArguments()?.[0];

        if (widthArg === undefined) {
          throw Error('Uint must have a type argument specifying the width');
        }

        const width = parseInt(widthArg.getText(), 10);
        const typeInfo = { kind: 'base', type: `uint${width}` } as TypeInfo;
        const value = BigInt(arg0Type.getLiteralValueOrThrow() as string);

        const maxValue = 2n ** BigInt(width) - 1n;

        if (value > maxValue) {
          throw Error(`Value ${value} is too large for uint${width}. Max value is ${maxValue}`);
        }

        if (width === 64 || isSmallNumber(typeInfo)) this.push(node, `int ${value}`, typeInfo);
        else this.push(node, `byte 0x${value.toString(16).padStart(width / 4, '0')}`, typeInfo);
      },
    },
    toString: {
      check: (node: ts.CallExpression) => {
        return this.lastType.kind === 'base' && !!this.lastType.type.match(/uint\d+$/);
      },
      fn: (node: ts.CallExpression) => {
        if (this.lastType.kind !== 'base') throw Error();

        if (!equalTypes(this.lastType, StackType.uint64)) {
          const width = parseInt(this.lastType.type.match(/\d+/)![0], 10);
          if (width > 64) throw Error('toString is only supported for uint64 and smaller');
          this.pushVoid(node, 'btoi');
        }

        this.pushVoid(node, 'callsub *itoa');
        this.lastType = StackType.bytes;
      },
    },
  };

  private disableWarnings: boolean;

  private algodServer: string;

  private algodPort: number;

  private algodToken: string;

  private disableOverflowChecks: boolean;

  private disableTypeScript: boolean;

  private events: Record<string, Event> = {};

  private libDir: string;

  private typesDir: string;

  private cwd: string;

  constructor(options: CompilerOptions) {
    this.project = options.project;
    this.disableWarnings = options.disableWarnings || false;
    this.algodServer = options.algodServer || 'http://localhost';
    this.algodPort = options.algodPort || 4001;
    this.algodToken = options.algodToken || 'a'.repeat(64);
    this.srcPath = options.srcPath;
    this.disableOverflowChecks = options.disableOverflowChecks || false;
    this.disableTypeScript = options.disableTypeScript || false;
    this.skipAlgod = options.skipAlgod || false;

    this.libDir = path.normalize(options.tealscriptLibDir || __dirname);
    this.typesDir = path.normalize(options.tealscriptTypesDir || path.join(__dirname, '..', '..', 'types'));
    this.cwd = options.cwd;

    this.name = options.className;
    this.sourceFile = this.project.getSourceFile(this.srcPath)!;
  }

  static compileAll(options: Omit<CompilerOptions, 'className'>): Promise<Compiler>[] {
    const compilers = options.project
      .getSourceFile(options.srcPath)!
      .getStatements()
      .filter((body) => body.isKind(ts.SyntaxKind.ClassDeclaration))
      .map(async (body) => {
        if (!body.isKind(ts.SyntaxKind.ClassDeclaration)) throw Error();
        const name = body.getNameNode()!.getText();

        const compiler = new Compiler({ ...options, className: name });
        await compiler.compile();
        if (!options.skipAlgod) await compiler.algodCompile();

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
      const type = PARAM_TYPES[arg] || opSpec.ArgEnumTypes![i].replace(/\[\d*\]byte/, 'bytes');

      const typeInfo = { kind: 'base', type } as TypeInfo;

      if (['txn', 'global', 'itxn', 'gtxns', 'gitxn', 'block'].includes(op)) {
        fn = (node: ts.Node) => this.push(node, `${op} ${arg}`, typeInfo);
      } else {
        fn = (node: ts.Node) => this.popMaybeValue(node, `${op} ${arg}`, typeInfo);
      }
      return {
        name: arg,
        args: opSpec.Args?.length || 0,
        fn,
      };
    });
  }

  private isDynamicType(type: TypeInfo): boolean {
    if (type.kind === 'dynamicArray') return true;

    if (type.kind === 'tuple') {
      return type.elements.map((e) => this.isDynamicType(e)).includes(true);
    }

    if (type.kind === 'staticArray') {
      return this.isDynamicType(type.base);
    }

    if (type.kind === 'object') {
      return Object.values(type.properties)
        .map((p) => this.isDynamicType(p))
        .includes(true);
    }

    if (type.kind === 'base') {
      return type.type === 'bytes' || type.type === 'string' || type.type === 'byte[]';
    }

    throw Error();
  }

  private getTypeLength(inputType: TypeInfo): number {
    if (inputType.kind === 'staticArray') {
      if (equalTypes(inputType.base, { kind: 'base', type: 'bool' })) {
        return Math.ceil(inputType.length / 8);
      }

      return inputType.length * this.getTypeLength(inputType.base);
    }

    if (inputType.kind === 'tuple') {
      let totalLength = 0;
      let consecutiveBools = 0;

      inputType.elements.forEach((e) => {
        if (equalTypes(e, { kind: 'base', type: 'bool' })) {
          consecutiveBools += 1;
        } else {
          if (consecutiveBools > 0) {
            totalLength += Math.ceil(consecutiveBools / 8);
          }

          totalLength += this.getTypeLength(e);

          consecutiveBools = 0;
        }
      });

      // If the last element is a bool, make sure to add the length
      if (consecutiveBools > 0) {
        totalLength += Math.ceil(consecutiveBools / 8);
      }

      return totalLength;
    }

    if (inputType.kind === 'object') {
      let totalLength = 0;
      let consecutiveBools = 0;

      Object.values(inputType.properties).forEach((e) => {
        if (equalTypes(e, { kind: 'base', type: 'bool' })) {
          consecutiveBools += 1;
        } else {
          if (consecutiveBools > 0) {
            totalLength += Math.ceil(consecutiveBools / 8);
          }

          totalLength += this.getTypeLength(e);

          consecutiveBools = 0;
        }
      });

      return totalLength;
    }

    if (inputType.kind === 'base') {
      const { type } = inputType;

      if (MULTI_OUTPUT_TYPES.includes(type)) {
        // TODO: Link to docs
        throw Error(
          'You cannot directly use a multi-output opcode in an array. You must fist assign the output to a variable.'
        );
      }

      if (inputType.type.startsWith('uint') || inputType.type.startsWith('ufixed')) {
        return parseInt(type.match(/\d+/)![0], 10) / 8;
      }

      switch (type) {
        case 'bool':
          return 1;
        case 'assetid':
        case 'appid':
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

    throw Error(`Cannot determine length for dynamic array. If you are seeing this, file an issue on GitHub`);
  }

  private getClassInfo(node: ts.Identifier):
    | {
        declaration: ts.ClassDeclaration;
        type: 'contract' | 'lsig' | 'core';
      }
    | undefined {
    const classDeclarationNodes: ts.ClassDeclaration[] = [];

    node.getDefinitionNodes().forEach((d) => {
      if (d.isKind(ts.SyntaxKind.ClassDeclaration)) classDeclarationNodes.push(d);
    });

    if (classDeclarationNodes.length === 0) return undefined;
    if (classDeclarationNodes.length > 1) {
      throw Error(
        `Multiple class declarations found for ${node.getText()}. Please report this error on GitHub https://github.com/algorandfoundation/tealscript`
      );
    }

    const declaration = classDeclarationNodes[0];

    const sourcePath = path.normalize(declaration?.getSourceFile().getFilePath() ?? '');

    if (sourcePath.startsWith(this.typesDir) || sourcePath.startsWith(this.libDir)) {
      if (declaration.getName() === CONTRACT_CLASS) {
        return {
          declaration,
          type: 'contract',
        };
      }

      if (declaration.getName() === LSIG_CLASS) {
        return {
          declaration,
          type: 'lsig',
        };
      }

      return {
        declaration,
        type: 'core',
      };
    }

    const superClass = declaration.getHeritageClauses()[0].getTypeNodes()[0].getExpression();

    if (
      superClass.getText() === CONTRACT_CLASS ||
      (superClass.isKind(ts.SyntaxKind.Identifier) && this.getClassInfo(superClass)?.type === 'contract') ||
      superClass.getText().startsWith(`${CONTRACT_CLASS}.extend(`)
    ) {
      return {
        declaration,
        type: 'contract',
      };
    }

    if (
      superClass.getText() === LSIG_CLASS ||
      (superClass.isKind(ts.SyntaxKind.Identifier) && this.getClassInfo(superClass)?.type === 'lsig') ||
      superClass.getText().startsWith(`${LSIG_CLASS}.extend(`)
    ) {
      return {
        declaration,
        type: 'lsig',
      };
    }

    return {
      declaration,
      type: 'core',
    };
  }

  private async postProcessTeal(input: TEALInfo[]): Promise<TEALInfo[]> {
    const compilerOptions = {
      algodPort: this.algodPort,
      algodServer: this.algodServer,
      algodToken: this.algodToken,
      disableWarnings: this.disableWarnings,
      disableOverflowChecks: this.disableOverflowChecks,
      disableTypeScript: this.disableTypeScript,
      project: this.project,
      cwd: this.cwd,
      skipAlgod: this.skipAlgod,
    };

    return (
      await Promise.all(
        input.map(async (t) => {
          const tealLine = t.teal;

          if (tealLine.startsWith('#pragma')) {
            return { teal: `#pragma version ${this.programVersion}`, node: t.node };
          }

          if (tealLine.startsWith('PENDING_SCHEMA')) {
            const className = tealLine.split(' ')[1];
            const classNode = t.node.getDescendantsOfKind(ts.SyntaxKind.Identifier)[0];

            const { declaration } = this.getClassInfo(classNode)!;

            const srcPath = declaration.getSourceFile()?.getFilePath() || this.srcPath;
            const c = new Compiler({ ...compilerOptions, srcPath, className });
            await c.compile();
            if (tealLine.startsWith('PENDING_SCHEMA_GLOBAL_INT')) {
              return { teal: `int ${c.arc32Description().state.global.num_uints}`, node: t.node };
            }
            if (tealLine.startsWith('PENDING_SCHEMA_GLOBAL_BYTES')) {
              return { teal: `int ${c.arc32Description().state.global.num_byte_slices}`, node: t.node };
            }
            if (tealLine.startsWith('PENDING_SCHEMA_LOCAL_INT')) {
              return { teal: `int ${c.arc32Description().state.local.num_uints}`, node: t.node };
            }
            if (tealLine.startsWith('PENDING_SCHEMA_LOCAL_BYTES')) {
              return { teal: `int ${c.arc32Description().state.local.num_byte_slices}`, node: t.node };
            }
          }

          if (tealLine.startsWith('PENDING_COMPILE') && !compilerOptions.skipAlgod) {
            const className = tealLine.split(' ')[1];
            const classNode = t.node.getDescendantsOfKind(ts.SyntaxKind.Identifier)[0];

            const { declaration } = this.getClassInfo(classNode)!;

            const srcPath = declaration.getSourceFile()?.getFilePath() || this.srcPath;

            const c = new Compiler({ ...compilerOptions, srcPath, className });
            await c.compile();

            if (tealLine.split(':')[0].endsWith('ADDR')) {
              const compiledProgram = await c.algodCompileProgram('lsig');
              return { teal: `addr ${compiledProgram.hash}`, node: t.node };
            }

            const target = tealLine.split(':')[0].split('_').at(-1)!.toLowerCase() as 'approval' | 'clear' | 'lsig';
            const compiledProgram = await c.algodCompileProgram(target);
            // decode result from base64 to hex
            const hexResult = Buffer.from(compiledProgram.result, 'base64').toString('hex');
            return { teal: `byte 0x${hexResult}`, node: t.node };
          }

          const method = tealLine.split(' ')[1];
          const subroutine = this.subroutines.find((s) => s.name === method);

          if (tealLine.startsWith('PENDING_PROTO')) {
            if (subroutine === undefined) throw new Error(`Subroutine ${method} not found`);

            const newLines = [];

            newLines.push(
              `proto ${subroutine.args.length} ${equalTypes(subroutine.returns.type, StackType.void) ? 0 : 1}`
            );

            if (this.frameSize[method])
              newLines.push(
                '// Push empty bytes after the frame pointer to reserve space for local variables',
                'byte 0x'
              );
            if (this.frameSize[method] > 1) newLines.push(`dupn ${this.frameSize[method] - 1}`);

            return newLines.map((l) => {
              return { node: t.node, teal: l };
            });
          }

          const { errorMessage } = t;

          return { node: t.node, teal: tealLine, errorMessage };
        })
      )
    ).flat();
  }

  private getTypeScriptDiagnostics() {
    Compiler.diagsRan.push(this.srcPath);

    const sourceFile = this.project.getSourceFile(this.srcPath)!;
    const diags = sourceFile.getPreEmitDiagnostics();

    if (diags.length > 0) {
      throw Error(`TypeScript diagnostics failed\n${this.project.formatDiagnosticsWithColorAndContext(diags)}`);
    }
  }

  /**
   * Process the signatures of all of the subroutines so that they can be called in any order
   *
   * @param methods The methods to process
   */
  preProcessMethods(methods: (ts.MethodDeclaration | ts.FunctionDeclaration)[]) {
    methods.forEach((node) => {
      if (!node.getNameNode()?.isKind(ts.SyntaxKind.Identifier)) throw Error('Method name must be identifier');
      const name = node.getNameNode()!.getText();
      const typeNode = node.getReturnType();
      if (typeNode === undefined) throw Error(`A return type annotation must be defined for ${name}`);

      const returnType = node.getReturnTypeNode()?.getType()
        ? this.getTypeInfo(node.getReturnTypeNode()!.getType())
        : StackType.void;

      const sub = {
        name,
        allows: { call: [], create: [] },
        nonAbi: { call: [], create: [] },
        args: [],
        desc: '',
        returns: { type: returnType, desc: '' },
        node,
        events: [],
      } as Subroutine;

      new Array(...node.getParameters()).reverse().forEach((p) => {
        let type = this.getTypeInfo(p.getType());

        if (p.getTypeNode()?.getText() === 'Account') {
          type = { kind: 'base', type: 'account' };
        }

        sub.args.push({
          name: p.getNameNode().getText(),
          type,
          desc: '',
        });
      });

      this.subroutines.push(sub);
    });
  }

  /**
   * Gets the class child nodes for a superclass
   */
  getSuperClassNodes(
    superClassNode: ts.Node,
    methodNodes: ts.MethodDeclaration[],
    propertyNodes: ts.PropertyDeclaration[]
  ) {
    const options = {
      algodPort: this.algodPort,
      algodServer: this.algodServer,
      algodToken: this.algodToken,
      disableWarnings: this.disableWarnings,
      disableOverflowChecks: this.disableOverflowChecks,
      disableTypeScript: this.disableTypeScript,
      project: this.project,
      cwd: this.cwd,
    };

    const symbol = superClassNode.getSymbol()?.getAliasedSymbol() || superClassNode.getSymbol()!;

    const srcPath = symbol.getDeclarations()!.at(-1)!.getSourceFile().getFilePath();

    const superCompiler = new Compiler({ ...options, srcPath, className: symbol.getName() });
    const superClassNodes = superCompiler.getClassChildren();

    methodNodes.push(...superClassNodes.methodNodes);
    propertyNodes.push(...superClassNodes.propertyNodes);
  }

  /**
   * Get the child nodes of the contract class
   */
  getClassChildren(): {
    methodNodes: ts.MethodDeclaration[];
    propertyNodes: ts.PropertyDeclaration[];
  } {
    const classNode = this.sourceFile.getStatements().find((body) => {
      if (!body.isKind(ts.SyntaxKind.ClassDeclaration)) return false;

      if (body.getName() === this.name) return true;

      return false;
    }) as ts.ClassDeclaration | undefined;

    if (classNode === undefined) throw Error(`Class ${this.name} not found`);

    const heritageClauses = classNode.getHeritageClauses();
    if (heritageClauses === undefined) {
      throw Error(`Contract ${this.name} must extend Contract, LogicSig, a subclass of either, or .extend() of either`);
    }

    const methodNodes: ts.MethodDeclaration[] = [];
    const propertyNodes: ts.PropertyDeclaration[] = [];

    const superClassNode = heritageClauses[0].getTypeNodes()[0].getExpression();

    if (superClassNode.isKind(ts.SyntaxKind.CallExpression)) {
      const superExpr = superClassNode.getExpression();
      if (!superExpr.isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

      if ([CONTRACT_CLASS, LSIG_CLASS].includes(superExpr.getName())) throw Error();

      superClassNode.getArguments().forEach((a) => {
        this.getSuperClassNodes(a, methodNodes, propertyNodes);
      });
    } else if (superClassNode.isKind(ts.SyntaxKind.Identifier)) {
      const superClass = superClassNode.getText();

      if (![CONTRACT_CLASS, LSIG_CLASS].includes(superClass)) {
        this.getSuperClassNodes(superClassNode, methodNodes, propertyNodes);
      }
    }

    classNode.forEachChild((c) => {
      if (c.isKind(ts.SyntaxKind.MethodDeclaration)) methodNodes.push(c);
      if (c.isKind(ts.SyntaxKind.PropertyDeclaration)) propertyNodes.push(c);
    });

    const uniqueNodes = (n: ts.Node, i: number, arr: ts.Node[]) => {
      return arr.indexOf(n) === i;
    };

    return { methodNodes: methodNodes.filter(uniqueNodes), propertyNodes: propertyNodes.filter(uniqueNodes) };
  }

  private initializeTEAL(node: ts.Node) {
    this.pushLines(node, '#pragma version PROGAM_VERSION');

    if (this.currentProgram === 'lsig') {
      this.pushLines(node, '//#pragma mode logicsig');
    }

    this.pushLines(
      node,
      '',
      `// This TEAL was generated by TEALScript v${VERSION}`,
      '// https://github.com/algorandfoundation/TEALScript',
      ''
    );

    if (this.currentProgram === 'approval') {
      const createLabels =
        '*create_NoOp *create_OptIn *NOT_IMPLEMENTED *NOT_IMPLEMENTED *NOT_IMPLEMENTED *create_DeleteApplication ';

      const callLabels =
        '*call_NoOp *call_OptIn *call_CloseOut *NOT_IMPLEMENTED *call_UpdateApplication *call_DeleteApplication';

      this.pushLines(
        node,
        '// This contract is compliant with and/or implements the following ARCs: [ ARC4 ]',
        '',
        '// The following ten lines of TEAL handle initial program flow',
        '// This pattern is used to make it easy for anyone to parse the start of the program and determine if a specific action is allowed',
        '// Here, action refers to the OnComplete in combination with whether the app is being created or called',
        '// Every possible action for this contract is represented in the switch statement',
        '// If the action is not implemented in the contract, its respective branch will be "*NOT_IMPLEMENTED" which just contains "err"',
        'txn ApplicationID',
        '!',
        'int 6',
        '*',
        'txn OnCompletion',
        '+',
        `switch ${callLabels} ${createLabels}`,
        '*NOT_IMPLEMENTED:'
      );

      this.pushVoid(
        node,
        'err',
        'The requested action is not implemented in this contract. Are you using the correct OnComplete? Did you set your app ID?'
      );

      this.teal.clear.push({ node, teal: '#pragma version PROGAM_VERSION' });
    } else if (this.currentProgram === 'lsig') {
      this.pushLines(node, '// The address of this logic signature is', '', 'b *route_logic');
    }
  }

  async compile() {
    const sourceFile = this.project.getSourceFile(this.srcPath);

    const importedFiles = sourceFile?.getImportDeclarations().map((d) => d.getModuleSpecifierSourceFile()) || [];

    // Go over all the files we are importing and check for number keywords
    [sourceFile, ...importedFiles].forEach((f) => {
      f?.getStatements().forEach((s) => {
        const numberKeywords = s.getDescendantsOfKind(ts.SyntaxKind.NumberKeyword);

        if (numberKeywords.length > 0) {
          const node = numberKeywords[0];
          const loc = ts.ts.getLineAndCharacterOfPosition(node.getSourceFile().compilerNode, node.getStart());
          const errPath = path.relative(this.cwd, node.getSourceFile().getFilePath());

          const msg = `number keyword not allowed at ${errPath}:${loc.line + 1}:${loc.character}. Use uint64 instead.`;

          throw Error(msg);
        }
      });
    });

    if (!Compiler.diagsRan.includes(this.srcPath) && !this.disableTypeScript) {
      this.getTypeScriptDiagnostics();
    }

    this.sourceFile.getStatements().forEach((body) => {
      const errNode = body;
      const loc = ts.ts.getLineAndCharacterOfPosition(errNode.getSourceFile().compilerNode, errNode.getStart());
      const lines: string[] = [];
      const errPath = path.relative(this.cwd, errNode.getSourceFile().getFilePath());
      errNode
        .getText()
        .split('\n')
        .forEach((l: string, i: number) => {
          lines.push(`${errPath}:${loc.line + i + 1}: ${l}`);
        });

      const msg = `${errNode.getKindName()} at ${errPath}:${loc.line}:${loc.character}\n    ${lines.join('\n    ')}\n`;

      if (
        body.isKind(ts.SyntaxKind.VariableStatement) &&
        body.getDeclarationKind() !== ts.VariableDeclarationKind.Const
      ) {
        throw new Error(`Top-level variables must be constants\n${msg}`);
      }
    });

    const { methodNodes, propertyNodes } = this.getClassChildren();
    this.preProcessMethods(methodNodes);
    propertyNodes.forEach((n) => this.processPropertyDefinition(n));

    this.sourceFile.getStatements().forEach((body) => {
      if (!body.isKind(ts.SyntaxKind.ClassDeclaration)) return;

      this.lastNode = body;

      const superClass = body.getHeritageClauses()![0].getTypeNodes()[0].getExpression();
      if (
        [CONTRACT_CLASS, LSIG_CLASS].includes(superClass.getText()) ||
        (superClass.isKind(ts.SyntaxKind.Identifier) && this.getClassInfo(superClass)?.type === 'contract') ||
        (superClass.isKind(ts.SyntaxKind.Identifier) && this.getClassInfo(superClass)?.type === 'lsig') ||
        superClass.getText().startsWith(`${CONTRACT_CLASS}.extend(`) ||
        superClass.getText().startsWith(`${LSIG_CLASS}.extend(`)
      ) {
        const className = body.getName()!;

        if (className === this.name) {
          if (superClass.getText() === LSIG_CLASS) this.currentProgram = 'lsig';

          this.classNode = body;
          this.initializeTEAL(body);

          this.abi = {
            name: className,
            desc: '',
            methods: [],
          };

          methodNodes.forEach((node) => this.processNode(node));
        }
      }
    });

    if (
      this.currentProgram !== 'lsig' &&
      this.subroutines.map((a) => a.allows.create).flat().length === 0 &&
      !Object.values(this.bareCallConfig)
        .map((c) => c.action)
        .includes('CREATE')
    ) {
      const name = 'createApplication';
      const m = {
        name,
        desc: 'The default create method generated by TEALScript',
        returns: { type: StackType.void, desc: '' },
        args: [],
        events: [],
      };

      this.subroutines.push({
        ...m,
        allows: { create: ['NoOp'], call: [] },
        nonAbi: {
          create: [],
          call: [],
        },
        node: this.classNode,
      });

      this.abi.methods.push(m);

      this.pushLines(this.classNode, `*abi_route_${name}:`, 'int 1', 'return');
    }

    if (this.currentProgram !== 'lsig') this.routeAbiMethods();

    while (this.pendingSubroutines.length > 0) {
      this.processSubroutine(this.pendingSubroutines.pop()!);
    }

    Object.keys(this.compilerSubroutines).forEach((sub) => {
      if (this.teal[this.currentProgram].map((t) => t.teal).includes(`callsub ${sub}`)) {
        this.pushLines(this.classNode, ...this.compilerSubroutines[sub]());
      }
    });

    this.teal[this.currentProgram] = await this.postProcessTeal(this.teal[this.currentProgram]);
    this.teal[this.currentProgram] = optimizeTeal(this.teal[this.currentProgram]);
    this.teal[this.currentProgram] = this.prettyTeal(this.teal[this.currentProgram]);

    this.teal[this.currentProgram].forEach((t, i) => {
      if (t.teal.length === 0 || t.teal.trim().startsWith('//') || t.teal.trim().split(' ')[0].endsWith(':')) return;

      const relativePath = path.relative(this.cwd, t.node.getSourceFile().getFilePath());
      const line = ts.ts.getLineAndCharacterOfPosition(t.node.getSourceFile().compilerNode, t.node.getStart()).line + 1;
      this.sourceInfo.push({
        teal: i + 1,
        source: `${relativePath}:${line}`,
        errorMessage: t.errorMessage,
      });
    });

    let hasNonAbi = false;

    this.subroutines.forEach((sub) => {
      if (sub.nonAbi.call.length + sub.nonAbi.create.length > 0) {
        hasNonAbi = true;
      }
    });

    if (hasNonAbi) {
      const i = this.teal[this.currentProgram].map((t) => t.teal).findIndex((t) => t.includes('[ ARC4 ]'));
      this.teal[this.currentProgram][i].teal =
        '// !!!! WARNING: This contract is *NOT* ARC4 compliant. It may contain ABI methods, but it also allows app calls where the first argument does NOT match an ABI selector';
    }

    this.abi.methods = this.abi.methods.map((m) => ({
      ...m,
      args: m.args.map((a) => ({ ...a, type: a.type })),
      returns: { ...m.returns, type: m.returns.type },
    }));

    this.abi.methods.forEach((method) => {
      const m = method;
      const subroutine = this.subroutines.find((s) => s.name === m.name);

      if (subroutine === undefined) throw Error(`Subroutine ${m.name} not found`);

      const comment = subroutine.desc;
      if (comment === '') return;

      try {
        const tsdocParser = new tsdoc.TSDocParser();
        const { docComment } = tsdocParser.parseString(comment);

        m.desc = renderDocNode(docComment.summarySection);

        docComment.params.blocks.forEach((p) => {
          const arg = m.args.find((a) => a.name === p.parameterName);

          if (arg === undefined) throw new Error(`${p.parameterName} is not an argument of ${m.name}`);

          arg.desc = renderDocNode(p.content);
        });

        if (docComment.returnsBlock) {
          m.returns.desc = renderDocNode(docComment.returnsBlock.content);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        if (!this.disableWarnings) console.warn(`Error when parsing tsdoc comment for ${m.name}: ${e}`);
      }
    });

    if (this.currentProgram === 'lsig') return;

    // Start of clear program compiliation

    this.currentProgram = 'clear';

    this.teal.clear
      .map((t) => t.teal)
      .forEach((t) => {
        if (t.startsWith('callsub')) {
          const subNode = this.subroutines.find((s) => s.name === t.split(' ')[1]);
          if (subNode === undefined) return;
          this.processNode(subNode.node);
        }
      });

    while (this.pendingSubroutines.length > 0) {
      this.processSubroutine(this.pendingSubroutines.pop()!);
    }

    this.teal.clear = await this.postProcessTeal(this.teal.clear);
    this.teal.clear = optimizeTeal(this.teal.clear);
    this.teal.clear = this.prettyTeal(this.teal.clear);
  }

  private push(node: ts.Node, teal: string, type: TypeInfo, errorMessage?: string) {
    this.lastNode = node;

    if (!equalTypes(type, StackType.void)) this.lastType = type;

    if (errorMessage) this.teal[this.currentProgram].push({ teal: `// ${errorMessage}`, node });
    this.teal[this.currentProgram].push({ teal, node, errorMessage });
  }

  private pushVoid(node: ts.Node, teal: string, errorMessage?: string) {
    this.push(node, teal, StackType.void, errorMessage);
  }

  private getSignature(node: ts.MethodDeclaration | ts.ClassDeclaration): string {
    if (node.isKind(ts.SyntaxKind.ClassDeclaration)) {
      return 'createApplication()void';
    }

    const abiArgs = node.getParameters().map((p) => {
      return typeInfoToABIString(this.getTypeInfo(p.getType()));
    });

    return `${node.getName()}(${abiArgs.join(',')})${typeInfoToABIString(this.getTypeInfo(node.getReturnType()))
      .replace(/account/g, 'address')
      .replace(/asset/g, 'uint64')
      .replace(/application/g, 'uint64')}`;
  }

  private pushMethod(subroutine: ts.MethodDeclaration | ts.ClassDeclaration) {
    this.pushVoid(this.lastNode, `method "${this.getSignature(subroutine)}"`);
  }

  private routeAbiMethods() {
    const switchIndex = this.teal[this.currentProgram].map((t) => t.teal).findIndex((t) => t.startsWith('switch '));

    ON_COMPLETES.forEach((onComplete) => {
      if (onComplete === 'ClearState') return;
      ['create', 'call'].forEach((a) => {
        const methods = this.abi.methods.filter((m) => {
          const subroutine = this.subroutines.find((s) => s.name === m.name)!;
          return subroutine.allows[a as 'call'].includes(onComplete);
        });

        const nonAbi = this.subroutines.find((s) => s.nonAbi[a as 'call' | 'create'].includes(onComplete));

        if (methods.length === 0 && this.bareCallConfig[onComplete] === undefined && nonAbi === undefined) {
          this.teal[this.currentProgram][switchIndex].teal = this.teal[this.currentProgram][switchIndex].teal.replace(
            `*${a}_${onComplete}`,
            '*NOT_IMPLEMENTED'
          );
          return;
        }

        this.pushVoid(this.classNode, `*${a}_${onComplete}:`);

        if (a.toUpperCase() === this.bareCallConfig[onComplete]?.action) {
          this.pushLines(this.classNode, 'txn NumAppArgs', `bz *abi_route_${this.bareCallConfig[onComplete]!.method}`);
        }

        if (methods.length === 0 && nonAbi === undefined) {
          this.pushVoid(
            this.classNode,
            'err',
            `this contract does not implement any ABI methods for ${onComplete} ${a}`
          );
          return;
        }

        methods.forEach((m) => {
          this.pushMethod(this.subroutines.find((s) => s.name === m.name)!.node);
        });

        if (methods.length > 0) {
          this.pushLines(
            this.classNode,
            'txna ApplicationArgs 0',
            `match ${methods.map((m) => `*abi_route_${m.name}`).join(' ')}`
          );
        }

        if (nonAbi) {
          this.pushLines(
            this.classNode,
            '// !!!! WARNING: non-ABI routing',
            `callsub ${nonAbi.name}`,
            'int 1',
            'return'
          );
        } else {
          this.pushVoid(
            this.classNode,
            'err',
            `this contract does not implement the given ABI method for ${a} ${onComplete}`
          );
        }
      });
    });

    if (this.teal[this.currentProgram][switchIndex].teal.endsWith('*NOT_IMPLEMENTED')) {
      const removeLastDuplicates = (array: string[]) => {
        let lastIndex = array.length - 1;
        const element = array[lastIndex];
        while (array[lastIndex] === element && lastIndex >= 0) {
          array.pop();
          lastIndex--;
        }
        return array;
      };

      const switchLine = removeLastDuplicates(this.teal[this.currentProgram][switchIndex].teal.split(' ')).join(' ');

      this.teal[this.currentProgram][switchIndex].teal = switchLine;
    }
  }

  private assertMaybeValue(node: ts.Node, opcode: string, type: TypeInfo, errorMessage: string) {
    this.pushVoid(node, opcode);
    this.push(node, 'assert', type, errorMessage);
  }

  private popMaybeValue(node: ts.Node, opcode: string, type: TypeInfo) {
    this.pushVoid(node, opcode);
    this.push(node, 'pop', type);
  }

  private hasMaybeValue(node: ts.Node, opcode: string) {
    this.pushVoid(node, opcode);
    this.pushVoid(node, 'swap');
    this.push(node, 'pop', { kind: 'base', type: 'bool' });
  }

  private pushComments(node: ts.Node) {
    const commentRanges = [
      ...(ts.ts.getLeadingCommentRanges(this.sourceFile.getText(), node.compilerNode.pos) || []),
      ...(ts.ts.getTrailingCommentRanges(this.sourceFile.getText(), node.compilerNode.pos) || []),
    ];
    commentRanges.forEach((c) => {
      const comment = this.sourceFile.getText().slice(c.pos, c.end);
      if (comment.startsWith('///') && !this.comments.includes(c.pos)) {
        this.pushVoid(this.lastNode, comment.replace('///', '//'));
        this.comments.push(c.pos);
      }
    });
  }

  private processThrowStatement(node: ts.ThrowStatement) {
    const expr = node.getExpression();
    if (!expr.isKind(ts.SyntaxKind.CallExpression)) throw Error('Must throw Error');
    if (expr.getExpression().getText() !== 'Error') throw Error('Must throw Error');

    const args = expr.getArguments();

    const errorMessage = args?.[0].getType().isStringLiteral()
      ? args[0].getType().getLiteralValueOrThrow().valueOf().toString()
      : undefined;
    this.pushVoid(node, 'err', errorMessage);
  }

  private processDoStatement(node: ts.DoStatement) {
    const thisLoop = `*do_while_${this.doWhileCount}`;
    this.doWhileCount += 1;

    const prevLoop = this.currentLoop;
    this.currentLoop = thisLoop;

    this.pushVoid(node, `${thisLoop}_statement:`);
    this.processNode(node.getStatement());
    this.pushVoid(node, `${thisLoop}:`);
    this.pushVoid(node, `${thisLoop}_continue:`);
    this.processConditional(node.getExpression());
    this.pushVoid(node, `bnz ${thisLoop}_statement`);
    this.pushVoid(node, `${thisLoop}_end:`);

    this.currentLoop = prevLoop;
  }

  private processWhileStatement(node: ts.WhileStatement) {
    const thisLoop = `*while_${this.whileCount}`;
    this.whileCount += 1;

    const prevLoop = this.currentLoop;
    this.currentLoop = thisLoop;

    this.pushVoid(node, `${thisLoop}:`);
    this.pushVoid(node, `${thisLoop}_continue:`);
    this.processConditional(node.getExpression());
    this.pushVoid(node, `bz ${thisLoop}_end`);

    this.processNode(node.getStatement());
    this.pushVoid(node, `b ${thisLoop}`);
    this.pushVoid(node, `${thisLoop}_end:`);

    this.currentLoop = prevLoop;
  }

  private processForStatement(node: ts.ForStatement) {
    const start = node.getStart();
    const end = node.getChildren()[7].getEnd();
    const forComment = node.getSourceFile().getFullText().slice(start, end);
    this.addSourceComment(node, true, forComment);

    this.processNode(node.getInitializerOrThrow());

    const preLoop = this.currentLoop;
    const thisLoop = `*for_${this.forCount}`;
    this.forCount += 1;

    this.currentLoop = thisLoop;

    this.pushVoid(node, `${thisLoop}:`);
    this.addSourceComment(node.getConditionOrThrow(), true);
    this.processConditional(node.getConditionOrThrow());
    this.pushVoid(node, `bz ${thisLoop}_end`);

    this.processNode(node.getStatement());

    this.pushVoid(node, `${thisLoop}_continue:`);
    this.addSourceComment(node.getIncrementorOrThrow(), true);
    this.processNode(node.getIncrementorOrThrow());
    this.pushVoid(node, `b ${thisLoop}`);
    this.pushVoid(node, `${thisLoop}_end:`);

    this.currentLoop = preLoop;
  }

  private processForOfStatement(node: ts.ForOfStatement) {
    const arrayNode = node.getExpression();
    const logic = node.getStatement();
    const declarations = node.getInitializer() as ts.VariableDeclarationList;
    const name = declarations.getDeclarations()[0].getNameNode().getText();

    this.forIterator(node, arrayNode, logic, name, 'forOf');
  }

  /**
   * Every node in the AST is passed through this function.
   */
  private processNode(node: ts.Node) {
    this.pushComments(node);

    // See comment on topLevelNode property for explanation
    let isTopLevelNode = false;

    if (
      !node.isKind(ts.SyntaxKind.ClassDeclaration) &&
      !node.isKind(ts.SyntaxKind.MethodDeclaration) &&
      !node.isKind(ts.SyntaxKind.Block) &&
      !node.isKind(ts.SyntaxKind.ExpressionStatement) &&
      !node.isKind(ts.SyntaxKind.NonNullExpression)
    ) {
      if (this.nodeDepth === 0) {
        this.topLevelNode = node;
        isTopLevelNode = true;
      }
      this.nodeDepth += 1;
    }

    try {
      if (node.isKind(ts.SyntaxKind.PropertyDeclaration)) this.processPropertyDefinition(node);
      else if (node.isKind(ts.SyntaxKind.ForOfStatement)) this.processForOfStatement(node);
      else if (node.isKind(ts.SyntaxKind.MethodDeclaration)) this.processMethodDefinition(node);
      else if (node.isKind(ts.SyntaxKind.PropertyAccessExpression)) this.processExpressionChain(node);
      else if (node.isKind(ts.SyntaxKind.AsExpression)) this.processTypeCast(node);
      else if (node.isKind(ts.SyntaxKind.TypeAssertionExpression)) this.processTypeCast(node);
      else if (node.isKind(ts.SyntaxKind.NewExpression)) this.processNewExpression(node);
      else if (node.isKind(ts.SyntaxKind.ArrayLiteralExpression)) this.processArrayLiteralExpression(node);
      else if (node.isKind(ts.SyntaxKind.NonNullExpression)) this.processNode(node.getExpression());
      else if (node.isKind(ts.SyntaxKind.ObjectLiteralExpression)) this.processObjectLiteralExpression(node);
      else if (node.compilerNode.kind === 108) this.lastType = { kind: 'base', type: 'this' };
      else if (node.isKind(ts.SyntaxKind.ThrowStatement)) this.processThrowStatement(node);
      else if (node.isKind(ts.SyntaxKind.WhileStatement)) this.processWhileStatement(node);
      else if (node.isKind(ts.SyntaxKind.ForStatement)) this.processForStatement(node);
      else if (node.isKind(ts.SyntaxKind.DoStatement)) this.processDoStatement(node);
      // Vars/Consts
      else if (node.isKind(ts.SyntaxKind.Identifier)) this.processIdentifier(node);
      else if (node.isKind(ts.SyntaxKind.VariableDeclarationList)) this.processVariableDeclaration(node);
      else if (node.isKind(ts.SyntaxKind.VariableDeclaration)) this.processVariableDeclarator(node);
      else if (node.isKind(ts.SyntaxKind.NumericLiteral) || node.isKind(ts.SyntaxKind.StringLiteral))
        this.processLiteral(node);
      // Logical
      else if (node.isKind(ts.SyntaxKind.Block)) this.processBlockStatement(node);
      else if (node.isKind(ts.SyntaxKind.IfStatement)) this.processIfStatement(node);
      else if (node.isKind(ts.SyntaxKind.PrefixUnaryExpression)) this.processUnaryExpression(node);
      else if (node.isKind(ts.SyntaxKind.BinaryExpression)) this.processBinaryExpression(node);
      else if (node.isKind(ts.SyntaxKind.CallExpression)) {
        const expr = node.getExpression();
        if (expr.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          this.processExpressionChain(node);
        } else {
          this.processCallExpression(node);
        }
      } else if (node.isKind(ts.SyntaxKind.ExpressionStatement)) this.processExpressionStatement(node);
      else if (node.isKind(ts.SyntaxKind.ReturnStatement)) this.processReturnStatement(node);
      else if (node.isKind(ts.SyntaxKind.ParenthesizedExpression)) this.processNode(node.getExpression());
      else if (node.isKind(ts.SyntaxKind.VariableStatement)) this.processNode(node.getDeclarationList());
      else if (node.isKind(ts.SyntaxKind.ElementAccessExpression)) this.processExpressionChain(node);
      else if (node.isKind(ts.SyntaxKind.ConditionalExpression)) this.processConditionalExpression(node);
      else if (node.compilerNode.kind === ts.SyntaxKind.TrueKeyword) {
        this.push(node, 'int 1', { kind: 'base', type: 'bool' });
      } else if (node.compilerNode.kind === ts.SyntaxKind.FalseKeyword) {
        this.push(node, 'int 0', { kind: 'base', type: 'bool' });
      } else if (node.isKind(ts.SyntaxKind.BreakStatement)) {
        this.pushVoid(node, `b ${this.currentLoop}_end`);
      } else if (node.isKind(ts.SyntaxKind.ContinueStatement)) {
        this.pushVoid(node, `b ${this.currentLoop}_continue`);
      } else throw new Error(`Unknown node type: ${node.getKindName()}`);
    } catch (e) {
      if (!(e instanceof Error)) throw e;

      // Because this is recursive, we need to keep track of the error from
      // the node that actually caused the error and ignore all other error messages
      this.processErrorNodes.push(node);

      const errNode = this.processErrorNodes[0];
      const loc = ts.ts.getLineAndCharacterOfPosition(errNode.getSourceFile().compilerNode, errNode.getStart());
      const lines: string[] = [];
      const errPath = path.relative(this.cwd, errNode.getSourceFile().getFilePath());
      errNode
        .getText()
        .split('\n')
        .forEach((l: string, i: number) => {
          lines.push(`${errPath}:${loc.line + i + 1}: ${l}`);
        });

      const msg = `TEALScript can not process ${errNode.getKindName()} at ${errPath}:${loc.line}:${
        loc.character
      }\n    ${lines.join('\n    ')}\n`;

      e.message = `${e.message.replace(`\n${msg}`, '')}\n${msg}`;

      throw e;
    }

    if (isTopLevelNode) this.nodeDepth = 0;
  }

  private processObjectLiteralExpression(node: ts.ObjectLiteralExpression) {
    const type = this.typeHint;
    if (type === undefined) throw new Error();
    const elements: ts.Expression[] = [];

    const objTypes = getObjectTypes(type);

    node.getProperties().forEach((p) => {
      if (!p.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
      elements[Object.keys(objTypes).indexOf(p.getNameNode().getText())] = p.getInitializer()!;
    });

    this.processArrayElements(elements, node);
  }

  private processConditionalExpression(node: ts.ConditionalExpression) {
    const tc = this.ternaryCount;
    const thisTernary = `*ternary${tc}`;
    this.ternaryCount += 1;

    this.processConditional(node.getCondition());
    this.pushVoid(node, `bz ${thisTernary}_false`);
    this.processNode(node.getWhenTrue());
    this.pushVoid(node, `b ${thisTernary}_end`);
    this.pushVoid(node, `${thisTernary}_false:`);
    this.processNode(node.getWhenFalse());
    this.pushVoid(node, `${thisTernary}_end:`);
  }

  private pushLines(node: ts.Node, ...lines: string[]) {
    lines.forEach((l) => this.push(node, l, StackType.void));
  }

  private getarrayElementTypes(elements: number): TypeInfo[] {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');

    if (this.typeHint.kind === 'dynamicArray') {
      return new Array(elements).fill(this.typeHint.base);
    }

    if (this.typeHint.kind === 'tuple') {
      return this.typeHint.elements;
    }

    if (this.typeHint.kind === 'base') {
      return new Array(elements).fill(this.typeHint);
    }

    if (this.typeHint.kind === 'object') {
      return Object.values(this.typeHint.properties);
    }

    if (this.typeHint.kind === 'staticArray') {
      return new Array(elements).fill(this.typeHint.base);
    }

    throw new Error();
  }

  private processBools(nodes: ts.Node[], isDynamicArray: boolean = false) {
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

  private processTuple(elements: ts.Expression[] | ts.Node<ts.ts.Node>[], parentNode: ts.Node) {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    const { typeHint } = this;

    // TODO figure out what this was for
    // if (!this.getABIType(typeHint).includes(']')) typeHint = `${typeHint}[]`;

    const types = this.getarrayElementTypes(elements.length);

    const dynamicTypes = types.filter((t) => this.isDynamicType(t));
    const staticTypes = types.filter((t) => !this.isDynamicType(t));
    const staticTuple = { kind: 'tuple', elements: staticTypes } as TypeInfo;
    const headLength = this.getTypeLength(staticTuple) + dynamicTypes.length * 2;

    const isStatic = !this.isDynamicType(typeHint);

    let consecutiveBools: ts.Node[] = [];
    elements.forEach((e, i) => {
      if (i === 0 && !isStatic) {
        this.pushLines(
          parentNode,
          'byte 0x // initial head',
          'byte 0x // initial tail',
          `byte 0x${headLength.toString(16).padStart(4, '0')} // initial head offset`
        );
      }

      if (equalTypes(types[i], { kind: 'base', type: 'bool' })) {
        consecutiveBools.push(e);
        return;
      }

      if (consecutiveBools.length > 0) {
        this.processBools(consecutiveBools);
        if (!isStatic) this.pushVoid(e, 'callsub *process_static_tuple_element');
        // Don't concat if bools are the first elements
        else if (consecutiveBools.length !== i) this.pushVoid(e, `concat // ${i}`);

        consecutiveBools = [];
      }

      this.typeHint = types[i];

      if (e.getType().isNumberLiteral()) {
        this.processNumericLiteralWithType(e, types[i]);
      } else {
        this.processNode(e);
      }

      this.checkEncoding(e, this.lastType);
      typeComparison(this.lastType, types[i]);

      if (this.isDynamicType(types[i])) this.pushVoid(e, 'callsub *process_dynamic_tuple_element');
      else if (!isStatic) this.pushVoid(e, 'callsub *process_static_tuple_element');
      else if (i !== 0) this.pushVoid(e, 'concat');
    });

    if (consecutiveBools.length > 0) {
      this.processBools(consecutiveBools);
      if (!isStatic) this.pushVoid(parentNode, 'callsub *process_static_tuple_element');
      if (isStatic && consecutiveBools.length !== elements.length) this.pushVoid(parentNode, 'concat');
    }

    if (!isStatic) this.pushLines(parentNode, 'pop // pop head offset', 'concat // concat head and tail');
  }

  private checkEncoding(node: ts.Node, type: TypeInfo) {
    if (type.kind === 'base') {
      const width = parseInt(type.type.match(/\d+/)?.[0] || '512', 10);

      if (isSmallNumber(type)) {
        this.pushVoid(node, 'itob');

        if (type.type.startsWith('unsafe')) this.overflowCheck(node, width);
        this.pushLines(node, `extract ${(64 - width) / 8} ${width / 8}`);

        this.lastType = { kind: 'base', type: type.type.replace(/unsafe /g, '') };

        return;
      }

      if (type.type.startsWith('unsafe')) {
        this.overflowCheck(node, width);
        this.fixBitWidth(node, width);
        this.lastType = { kind: 'base', type: type.type.replace(/unsafe /g, '') };

        return;
      }
    }

    const abiType = typeInfoToABIString(type);

    if (type.kind === 'dynamicArray' && this.isDynamicArrayOfStaticType(type)) {
      const baseType = typeInfoToABIString(type.base);
      if (baseType === 'bool') return;
      const length = this.getTypeLength(type.base);

      this.pushLines(node, 'dup', 'len');
      if (length > 1) {
        this.pushLines(node, `int ${length}`, '/');
      }
      this.pushLines(node, 'itob', 'extract 6 2', 'swap', 'concat');
    } else if (isBytes(type)) {
      this.pushLines(node, 'dup', 'len', 'itob', 'extract 6 2', 'swap', 'concat');
    } else if (abiType === 'bool') {
      this.pushLines(node, 'byte 0x00', 'int 0', 'uncover 2', 'setbit');
    } else if (isNumeric(type)) {
      this.pushLines(node, 'itob');
    }
  }

  private getTupleElement(type: TypeInfo): TupleElement {
    const elem: TupleElement = new TupleElement(type, 0);

    let offset = 0;
    let consecutiveBools = 0;

    const processTypeInfo = (ti: TypeInfo) => {
      const abiType = typeInfoToABIString(ti);

      if (abiType === 'bool') {
        consecutiveBools += 1;
        elem.add(new TupleElement(ti, offset));
        return;
      }

      if (consecutiveBools) {
        offset += Math.ceil(consecutiveBools / 8);
        consecutiveBools = 0;
      }

      if (ti.kind === 'tuple' || ti.kind === 'object') {
        const t = new TupleElement(ti, offset);
        t.add(...this.getTupleElement(ti));
        elem.add(t);
      } else if (ti.kind === 'staticArray' || ti.kind === 'dynamicArray') {
        const t = new TupleElement(ti, offset);
        t.add(this.getTupleElement(ti.base));
        elem.add(t);
      } else elem.add(new TupleElement(ti, offset));

      if (this.isDynamicType(ti)) {
        offset += 2;
      } else {
        offset += this.getTypeLength(ti);
      }
    };

    if (type.kind === 'object') {
      Object.values(type.properties).forEach((t) => {
        processTypeInfo(t);
      });
    }

    if (type.kind === 'tuple') {
      type.elements.forEach((t) => {
        processTypeInfo(t);
      });
    }

    if (type.kind === 'staticArray') {
      elem.add(this.getTupleElement(type.base));
    }

    if (type.kind === 'dynamicArray') {
      elem.add(this.getTupleElement(type.base));
    }

    return elem;
  }

  private processArrayElements(elements: ts.Expression[] | ts.Node<ts.ts.Node>[], parentNode: ts.Node) {
    const { typeHint } = this;
    if (typeHint === undefined) throw Error('Type hint must be provided to process object or array');

    if (
      typeHint.kind === 'tuple' ||
      typeHint.kind === 'object' ||
      ((typeHint.kind === 'staticArray' || typeHint.kind === 'dynamicArray') && this.isDynamicType(typeHint.base))
    ) {
      this.processTuple(elements, parentNode);
      if (typeHint.kind === 'dynamicArray') {
        this.pushLines(parentNode, `byte 0x${elements.length.toString(16).padStart(4, '0')}`, 'swap', 'concat');
      }
      this.lastType = typeHint;
      return;
    }

    const types = this.getarrayElementTypes(elements.length);

    if (
      (typeHint.kind === 'staticArray' || typeHint.kind === 'dynamicArray') &&
      equalTypes(typeHint.base, { kind: 'base', type: 'bool' })
    ) {
      this.processBools(elements, typeHint.kind === 'dynamicArray');
    } else {
      elements.forEach((e, i) => {
        this.typeHint = types[i];

        if (e.getType().isNumberLiteral()) {
          this.processNumericLiteralWithType(e, types[i]);
        } else {
          this.processNode(e);
        }
        typeComparison(this.lastType, types[i]);
        this.checkEncoding(e, types[i]);
        if (i) this.pushVoid(parentNode, 'concat');
      });
    }

    if (typeHint.kind === 'staticArray') {
      const { length } = typeHint;

      if (length && elements.length < length) {
        const typeLength = this.getTypeLength(typeHint.base);
        this.pushVoid(parentNode, `byte 0x${'00'.repeat(typeLength * (length - elements.length))}`);

        if (elements.length > 0) this.pushVoid(parentNode, 'concat');
      }
    }

    this.lastType = typeHint;
  }

  private processArrayLiteralExpression(node: ts.ArrayLiteralExpression) {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    const { typeHint } = this;

    if (typeHint.kind === 'dynamicArray' && node.getElements().length === 0) {
      this.push(node, 'byte 0x', typeHint);
      return;
    }

    this.processArrayElements(node.getElements(), node);
  }

  /**
   *
   * @param node The top level node to process
   * @param chain The existing expression chain to add to
   * @returns The base expression and reversed expression chain `this.txn.sender` ->
   * `{ chain: [this.txn, this.txn.sender], base: [this] }`
   */
  private getExpressionChain(
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
      return this.getExpressionChain(expr, chain);
    }

    chain.reverse();
    return { base: expr, chain };
  }

  private getAccessChain(node: ts.ElementAccessExpression, chain: ts.ElementAccessExpression[] = []) {
    chain.push(node);

    const expr = node.getExpression();
    if (expr.isKind(ts.SyntaxKind.ElementAccessExpression)) {
      this.getAccessChain(expr, chain);
    }

    return chain;
  }

  /**
   * Given a variable name, this function will return the value that we ultimately need to get from the frame
   *
   * For example:
   *
   * ```ts
   * const x = a[1][2]
   * const y = x[3][4]
   * ```
   *
   * Given `y`, return that we are ultimately accessing `a[1][2][3][4]`
   *
   * @param node The node of the variable that we're accessing
   * @param inputName The name of the variable that we're accessing
   * @param load Whether or not to load the value and put it on the stack. If false, it will just return information about the frame object
   * @returns
   */
  private processFrame(
    node: ts.Node,
    inputName: string,
    load: boolean
  ): {
    /** Access for an array. Ie. `a[0][1]` -> `[0, 1]` */
    accessors: (ts.Expression | string)[];
    /** The name of the frame object */
    name: string;
    /** Whether this is a object saved in the frame or in app storage */
    type: 'frame' | 'storage';
    /** If storage, then this is the storage expression ie. `this.myBoxMap` */
    storageExpression?: ts.PropertyAccessExpression;
    /** If this is a storage map, then this is the name of the frame object holding the map key */
    storageKeyFrame?: string;
    /** If this is local storage, then this is the name of the frame object holding the local account */
    storageAccountFrame?: string;
  } {
    let name = inputName;
    let currentFrame = this.localVariables[inputName];

    let type: 'frame' | 'storage' = 'frame';
    let storageExpression: ts.PropertyAccessExpression | undefined;

    const accessors: (ts.Expression | string)[][] = [];

    /* 
    Walk through the pointers until we get the base frame object
    Each step might include array access, which we need to return
    For example:
    
    ```ts
    const x = a[1][2]
    const y = x[3][4]
    ```

    `y` frame object has the accessor [3,4] and `x` frame object has accessors `[1,2]`, giving us the full access chain `[1,2,3,4]`
    */
    while (currentFrame.framePointer !== undefined) {
      if (currentFrame.accessors) accessors.push(currentFrame.accessors);

      name = currentFrame.framePointer!;
      currentFrame = this.localVariables[name];
    }

    // If the base is saving a storage map or local storage, then we need to get the storage expression
    if (currentFrame.storageExpression !== undefined) {
      if (currentFrame.accessors) accessors.push(currentFrame.accessors);
      // eslint-disable-next-line prefer-destructuring
      name = getStorageName(currentFrame.storageExpression)!;
      type = 'storage';
      storageExpression = currentFrame.storageExpression;
    }

    // If we aren't loading the value, the just retun the information about it
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

    // If we are loading, then either dig from the frame or load from storage
    if (currentFrame.storageExpression !== undefined) {
      this.handleStorageAction({
        node: currentFrame.storageExpression,
        storageKeyFrame: currentFrame.storageKeyFrame,
        storageAccountFrame: currentFrame.storageAccountFrame,
        action: 'get',
      });
      // Don't actually load the result of multi-output opcodes because there's an explicit load later when processing the property access
    } else if (!MULTI_OUTPUT_TYPES.includes(typeInfoToABIString(currentFrame.type))) {
      this.push(node, `frame_dig ${currentFrame.index!} // ${name}: ${currentFrame.typeString}`, currentFrame.type);
    } else {
      this.lastType = currentFrame.type;
    }

    return { name, type, accessors: accessors.reverse().flat() };
  }

  private updateValue(node: ts.Node) {
    const currentArgs = this.currentSubroutine.args;
    // Add back to frame/storage if necessary
    if (node.isKind(ts.SyntaxKind.Identifier)) {
      const name = node.getText();
      const frameObj = this.localVariables[name];

      if (frameObj.index !== undefined) {
        const { index, type, typeString } = this.localVariables[name];
        if (currentArgs.find((s) => s.name === name && isArrayType(s.type))) {
          throw Error('Mutating argument array is not allowed. Use "clone()" method to create a deep copy.');
        }

        this.pushVoid(node, `frame_bury ${index} // ${name}: ${typeString}`);
      } else {
        const processedFrame = this.processFrame(node, name, false);

        if (processedFrame.type === 'frame') {
          const frame = this.localVariables[processedFrame.name];

          if (currentArgs.find((s) => s.name === processedFrame.name && isArrayType(s.type))) {
            throw Error('Mutating argument array is not allowed. Use "clone()" method to create a deep copy.');
          }

          this.pushVoid(node, `frame_bury ${frame.index} // ${name}: ${frame.typeString}`);
        } else {
          const { type, valueType } = this.storageProps[processedFrame.name];
          const action = type === 'box' && !this.isDynamicType(valueType) ? 'replace' : 'set';
          this.handleStorageAction({
            node: processedFrame.storageExpression!,
            storageAccountFrame: processedFrame.storageAccountFrame,
            storageKeyFrame: processedFrame.storageKeyFrame,
            action,
          });
        }
      }
    } else if (node.isKind(ts.SyntaxKind.CallExpression) || node.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
      let storageName: string | undefined;

      if (node.isKind(ts.SyntaxKind.CallExpression)) {
        if (!node.getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression))
          throw new Error('Must be property access expression');
        storageName = getStorageName(node.getExpression() as ts.PropertyAccessExpression);
      } else storageName = getStorageName(node);

      if (this.scratch[storageName!]) {
        const scratch = this.scratch[storageName!];
        const { slot, type } = scratch;

        typeComparison(this.lastType, type);
        if (slot !== undefined) {
          this.pushVoid(node, `store ${slot}`);
        } else {
          const call = node.getDescendantsOfKind(ts.SyntaxKind.CallExpression)[0];

          this.processNode(call.getArguments()[0]);
          this.pushVoid(node, 'swap');
          this.pushVoid(node, `stores`);
        }

        return;
      }
      const storageProp = this.storageProps[storageName!];

      const { type, valueType } = storageProp;
      let action: 'set' | 'replace' =
        type === 'box' && !this.isDynamicType(valueType) && !typeInfoToABIString(valueType).includes('bool')
          ? 'replace'
          : 'set';
      if (valueType.kind === 'base') action = 'set';
      // Honestly not sure why I needed to add this after b89ddc6c24d6102f9e890a0e76222de7e0ca79b5 (0.67.2)
      // But it works...
      if (
        type === 'box' &&
        action === 'replace' &&
        this.teal[this.currentProgram].at(-1)?.teal.startsWith('replace3')
      ) {
        this.teal[this.currentProgram].pop();
      }

      this.handleStorageAction({
        node,
        action,
      });
    } else {
      throw new Error(`Can't update ${node.getKindName()} array`);
    }
  }

  private compilerSubroutines: { [name: string]: () => string[] } = {
    '*itoa': () => [
      '*intToAscii:',
      'proto 1 1',
      'byte 0x30313233343536373839 // "0123456789"',
      'frame_dig -1 // i: uint64',
      'int 1',
      'extract3',
      'retsub',
      '',
      '*itoa:',
      'proto 1 1',
      'frame_dig -1 // i: uint64',
      'int 0',
      '==',
      'bz *itoa_if_end',
      'byte 0x30',
      'retsub',
      '*itoa_if_end:',
      'frame_dig -1 // i: uint64',
      'int 10',
      '/',
      'int 0',
      '>',
      'bz *itoa_ternary_false',
      'frame_dig -1 // i: uint64',
      'int 10',
      '/',
      'callsub *itoa',
      'b *itoa_ternary_end',
      '*itoa_ternary_false:',
      'byte 0x // ""',
      '*itoa_ternary_end:',
      'frame_dig -1 // i: uint64',
      'int 10',
      '%',
      'callsub *intToAscii',
      'concat',
      'retsub',
    ],
    '*process_static_tuple_element': () => {
      const tupleHead = '-4 // tuple head';
      const tupleTail = '-3 // tuple tail';
      const headOffset = '-2 // head offset';
      const element = '-1 // element';

      return [
        '*process_static_tuple_element:',
        'proto 4 3',
        `frame_dig ${tupleHead}`,
        `frame_dig ${element}`,
        'concat',

        `frame_dig ${tupleTail}`,
        `frame_dig ${headOffset}`,
        'retsub',
      ];
    },
    '*process_dynamic_tuple_element': () => {
      const tupleHead = '-4 // tuple head';
      const tupleTail = '-3 // tuple tail';
      const headOffset = '-2 // head offset';
      const element = '-1 // element';

      return [
        '*process_dynamic_tuple_element:',
        'proto 4 3',
        `frame_dig ${tupleHead}`,
        `frame_dig ${headOffset}`,
        'concat',
        `frame_bury ${tupleHead}`,
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
    '*update_dynamic_head': () => [
      '*update_dynamic_head:',
      'proto 2 0',
      'frame_dig -2 // length difference',
      `load ${compilerScratch.fullArray}`,
      'frame_dig -1 // dynamic array offset',
      'extract_uint16 // extract dynamic array offset',

      `load ${compilerScratch.subtractHeadDifference}`,
      'bz *subtract_head_difference',
      '+ // add difference to offset',
      'b *end_calc_new_head',

      '*subtract_head_difference:',
      'swap',
      '- // subtract difference from offet',

      '*end_calc_new_head:',

      'itob // convert to bytes',
      'extract 6 2 // convert to uint16',
      `load ${compilerScratch.fullArray}`,
      'swap',
      'frame_dig -1 // offset',
      'swap',
      'replace3 // update offset',
      `store ${compilerScratch.fullArray}`,
      'retsub',
    ],
    '*get_length_difference': () => [
      '*get_length_difference:',
      // Get new element length
      `load ${compilerScratch.newElement}`,
      'len // length of new element',
      `load ${compilerScratch.elementLength}`,
      '<',

      'bnz *swapped_difference',
      `load ${compilerScratch.newElement}`,
      'len // length of new element',
      `load ${compilerScratch.elementLength}`,
      'int 1',
      `store ${compilerScratch.subtractHeadDifference}`,
      'b *get_difference',

      '*swapped_difference:',
      `load ${compilerScratch.elementLength}`,
      `load ${compilerScratch.newElement}`,
      'len // length of new element',
      'int 0',
      `store ${compilerScratch.subtractHeadDifference}`,

      '*get_difference:',
      '- // get length difference',
      `store ${compilerScratch.lengthDifference}`,
      'retsub',
    ],
  };

  private getElementHead(topLevelTuple: TupleElement, accessors: (ts.Expression | string)[], node: ts.Node) {
    let previousTupleElement = topLevelTuple;
    let previousElemIsBool = false;

    // At the end of this forEach, the stack will contain the HEAD offset of the accessed element
    accessors.forEach((acc, i) => {
      if (typeof acc === 'string') {
        if (!acc.startsWith('accessor//')) {
          const index = Object.keys(getObjectTypes(previousTupleElement.type)).indexOf(acc);

          const elem = previousTupleElement[index];

          this.pushLines(node, `int ${elem.headOffset} // headOffset`, '+');

          previousTupleElement = elem;
          return;
        }

        const elem = previousTupleElement[0];

        const frame = this.localVariables[acc];

        this.push(node, `frame_dig ${frame.index} // saved accessor: ${acc}`, StackType.uint64);

        this.pushLines(
          node,
          // `int ${accNumber * this.getTypeLength(elem.type)} // acc * typeLength`,
          `int ${this.getTypeLength(elem.type)}`,
          '* // acc * typeLength',
          '+'
        );

        previousTupleElement = elem;
        return;
      }

      const accNumber = parseInt(acc.getText(), 10);

      const elem: TupleElement = Number.isNaN(accNumber)
        ? previousTupleElement[0]
        : previousTupleElement[accNumber] || previousTupleElement[0];

      if (typeInfoToABIString(elem.type) === 'bool' && !previousElemIsBool) {
        this.pushLines(acc, `int ${elem.headOffset} // headOffset`, '+');

        previousElemIsBool = true;
      } else if (previousTupleElement.arrayType === 'tuple') {
        this.pushLines(acc, `int ${elem.headOffset} // headOffset`, '+');
        // Dynamic element in static or dynamic array
      } else if (this.isDynamicType(elem.type)) {
        if (!Number.isNaN(accNumber)) {
          this.pushLines(acc, `int ${accNumber * 2} // acc * 2`, '+');
        } else {
          this.processNode(acc);

          if (!isNumeric(this.lastType)) this.pushVoid(acc, 'btoi');

          this.pushLines(acc, 'int 2', '* // acc * 2', '+');
        }
        // Static element in array
      } else if (!previousElemIsBool) {
        if (!Number.isNaN(accNumber)) {
          this.pushLines(acc, `int ${accNumber * this.getTypeLength(elem.type)} // acc * typeLength`, '+');
        } else {
          this.processNode(acc);

          if (!isNumeric(this.lastType)) this.pushVoid(acc, 'btoi');

          this.pushLines(acc, `int ${this.getTypeLength(elem.type)}`, '* // acc * typeLength', '+');
        }
      }

      if (
        previousTupleElement.arrayType === 'dynamic' &&
        !(i === 0 && this.isDynamicArrayOfStaticType(previousTupleElement.type))
      ) {
        this.pushLines(acc, 'int 2', '+ // add two for length');
      }

      if (this.isDynamicType(elem.type) && i !== accessors.length - 1) {
        this.pushLines(acc, `load ${compilerScratch.fullArray}`, 'swap', 'extract_uint16');
      }

      previousTupleElement = elem;
    });

    return previousTupleElement;
  }

  private processLiteralStaticTupleAccess(
    node: ts.Node,
    accessors: (ts.Expression | string)[],
    parentExpression: ts.Node,
    newValue?: ts.Node
  ) {
    const parentType = this.lastType;

    let previousTupleElement = this.getTupleElement(parentType);

    accessors.forEach((acc, i) => {
      let accNumber: number | undefined;

      if (typeof acc === 'string') {
        if (acc.startsWith('accessor//')) {
          const frame = this.localVariables[acc];

          this.push(node, `frame_dig ${frame.index} // saved accessor: ${acc}`, StackType.uint64);
        } else accNumber = Object.keys(getObjectTypes(previousTupleElement.type)).indexOf(acc);
      } else if (acc.isKind(ts.SyntaxKind.NumericLiteral)) {
        accNumber = parseInt((acc as ts.Expression).getText(), 10);
      } else {
        this.processNode(acc);
      }

      const accessedElem = previousTupleElement[accNumber ?? 0] || previousTupleElement[0];

      if (accNumber && previousTupleElement[accNumber]) {
        this.pushLines(node, `int ${accessedElem.headOffset} // headOffset`);
      } else {
        if (accNumber !== undefined) this.pushVoid(node, `int ${accNumber}`);
        this.pushLines(node, `int ${this.getTypeLength(accessedElem.type)}`, '* // acc * typeLength');
      }

      if (i) this.pushVoid(node, '+');

      previousTupleElement = accessedElem;
    });

    const elem = previousTupleElement;

    const length = this.getTypeLength(elem.type);

    const storageExpression = this.localVariables[parentExpression.getText()]?.storageExpression ?? parentExpression;
    const isBox =
      storageExpression.isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      getStorageName(storageExpression) &&
      this.storageProps[getStorageName(storageExpression)!] &&
      this.storageProps[getStorageName(storageExpression)!].type === 'box' &&
      !this.isDynamicType(this.storageProps[getStorageName(storageExpression)!].valueType);

    if (newValue) {
      if (newValue.getType().isNumberLiteral()) {
        this.processNewValue(newValue, elem.type);
      } else {
        this.processNewValue(newValue);
      }

      this.checkEncoding(node, elem.type);

      if (!isBox) {
        this.pushVoid(node, 'replace3');
      }

      this.updateValue(parentExpression);
    } else {
      this.pushVoid(node, `int ${length}`);
      if (isBox) {
        this.handleStorageAction({
          node: storageExpression,
          action: 'extract',
        });
      } else this.pushLines(node, 'extract3');

      this.checkDecoding(node, elem.type);
      this.lastType = elem.type;
    }
  }

  private processParentArrayAccess(
    node: ts.Node,
    accessors: (ts.Expression | string)[],
    parentExpression: ts.Node,
    newValue?: ts.Node
  ): void {
    const parentType = this.lastType;

    // If we know the tuple is static and doesn't contain bools or dynamic accessors,
    // we can skip all of the opcodes and just use the offset calculated by getElementHead directly
    // TODO: add bool support
    const isNonBoolStatic = !this.isDynamicType(parentType) && !typeInfoToABIString(parentType).includes('bool');
    let literalAccessors = true;

    accessors.forEach((a) => {
      if (typeof a === 'string') {
        if (a.startsWith('accessor//')) literalAccessors = false;
        return;
      }

      if (Number.isNaN(parseInt((a as ts.Expression).getText(), 10))) literalAccessors = false;
    });

    if (isNonBoolStatic) {
      this.processLiteralStaticTupleAccess(node, accessors, parentExpression, newValue);
      return;
    }

    this.pushLines(node, `store ${compilerScratch.fullArray}`, 'int 0 // initial offset');

    const topLevelTuple = this.getTupleElement(parentType);

    const element = this.getElementHead(topLevelTuple, accessors, node);

    let baseType: TypeInfo | undefined;

    if (element.type.kind === 'staticArray' || element.type.kind === 'dynamicArray') {
      baseType = element.type.base;
    } else {
      baseType = element.type;
    }

    if (this.isDynamicType(element.type)) {
      if (!isBytes(element.type) && this.isDynamicType(baseType)) {
        throw new Error(`Cannot access nested dynamic array element: ${typeInfoToABIString(element.type)}`);
      }

      if (newValue) {
        this.pushLines(node, 'dup', `store ${compilerScratch.elementHeadOffset}`);
      }

      this.pushLines(
        node,
        `load ${compilerScratch.fullArray}`,
        `load ${compilerScratch.fullArray}`,
        'uncover 2',
        'extract_uint16'
      );

      if (element.parent!.type.kind === 'dynamicArray') {
        this.pushLines(node, 'int 2', '+ // add two for length');
      }

      if (newValue) {
        this.pushLines(node, 'dup', `store ${compilerScratch.elementStart}`);
      }

      this.pushLines(
        node,
        'dup // duplicate start of element',
        `load ${compilerScratch.fullArray}`,
        'swap',
        'extract_uint16 // get number of elements',
        `int ${this.getTypeLength(baseType!)} // get type length`,
        '* // multiply by type length',
        'int 2',
        '+ // add two for length'
      );

      this.pushVoid(node, newValue ? `store ${compilerScratch.elementLength}` : 'extract3');
    }

    if (newValue) {
      if (this.isDynamicType(element.type)) {
        if (element.parent?.arrayType !== 'tuple') {
          throw new Error(
            'Updating nested dynamic array elements not yet supported. The entire array must be overwritten to change a value'
          );
        }
        // Get pre element
        this.pushLines(
          node,
          `load ${compilerScratch.fullArray}`,
          'int 0',
          `load ${compilerScratch.elementStart}`,
          'substring3'
        );

        // Get new element
        if (newValue.getType().isNumberLiteral()) {
          this.processNumericLiteralWithType(newValue, element.type);
        } else {
          this.processNewValue(newValue);
        }

        this.checkEncoding(newValue, this.lastType);

        this.pushLines(newValue, 'dup', `store ${compilerScratch.newElement}`);

        // Get post element
        this.pushLines(
          node,
          `load ${compilerScratch.fullArray}`,
          `load ${compilerScratch.elementStart}`,
          `load ${compilerScratch.elementLength}`,
          '+ // get end of Element',
          `load ${compilerScratch.fullArray}`,
          'len',
          'substring3'
        );

        // Form new tuple
        this.pushLines(node, 'concat', 'concat', `store ${compilerScratch.fullArray}`);

        // Get length difference
        this.pushLines(node, 'callsub *get_length_difference');

        const elementIndex = element.parent!.findIndex((e) => e.id === element.id);

        const nextDynamicSiblings = element.parent!.slice(elementIndex + 1).filter((e) => this.isDynamicType(e.type));

        const headDiffs = nextDynamicSiblings.map((e) => e.headOffset - element.headOffset);

        headDiffs.forEach((diff) => {
          this.pushLines(
            node,
            `load ${compilerScratch.lengthDifference}`,
            `load ${compilerScratch.elementHeadOffset}`,
            `int ${diff}`,
            '+ // head ofset',
            'callsub *update_dynamic_head'
          );
        });

        this.pushVoid(node, `load ${compilerScratch.fullArray}`);
      } else if (typeInfoToABIString(element.type) === 'bool') {
        this.pushLines(node, 'int 8', '* // get bit offset');

        let consecutiveBools = 0;
        const elementIndex = element.parent!.findIndex((e) => e.id === element.id);
        const boolParentType = element.parent!.type;

        if (boolParentType.kind === 'tuple' || boolParentType.kind === 'object') {
          for (let i = elementIndex - 1; i >= 0; i--) {
            const { type } = element.parent![i];
            if (type.kind === 'base' && type.type === 'bool') {
              consecutiveBools += 1;
            } else break;
          }

          this.pushLines(node, `int ${consecutiveBools}`);
        } else if (node.isKind(ts.SyntaxKind.ElementAccessExpression)) {
          const argExpr = node.getArgumentExpression();
          if (argExpr === undefined) throw Error();

          this.processNode(argExpr);
        } else if (node.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          if (parentType?.kind !== 'object') throw Error();
          const idx = Object.keys(parentType.properties).indexOf(node.getName());
          this.pushVoid(node, `int ${idx}`);
        } else throw Error();

        this.pushLines(node, '+ // add accessor bits');
        if (element.parent!.arrayType === 'dynamic') {
          this.pushLines(node, 'int 16', '+ // 16 bits for length prefix');
        }
        this.pushLines(node, `load ${compilerScratch.fullArray}`, 'swap');
        this.processNewValue(newValue);

        this.pushVoid(node, 'setbit');
      } else {
        this.pushLines(node, `load ${compilerScratch.fullArray}`, 'swap');
        this.processNewValue(newValue);
        this.checkEncoding(newValue, this.lastType);
        this.pushVoid(node, 'replace3');
      }

      this.updateValue(parentExpression);
    } else {
      if (typeInfoToABIString(element.type) === 'bool') {
        this.pushLines(node, 'int 8', '*');

        let consecutiveBools = 0;
        const elementIndex = element.parent!.findIndex((e) => e.id === element.id);
        const boolParentType = element.parent!.type;

        if (boolParentType.kind === 'tuple' || boolParentType.kind === 'object') {
          for (let i = elementIndex - 1; i >= 0; i--) {
            const { type } = element.parent![i];
            if (type.kind === 'base' && type.type === 'bool') {
              consecutiveBools += 1;
            } else break;
          }

          this.pushLines(node, `int ${consecutiveBools}`);
        } else if (node.isKind(ts.SyntaxKind.ElementAccessExpression)) {
          const argExpr = node.getArgumentExpression();
          if (argExpr === undefined) throw Error();

          this.processNode(argExpr);
        } else if (node.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          if (parentType?.kind !== 'object') throw Error();
          const idx = Object.keys(parentType.properties).indexOf(node.getName());
          this.pushVoid(node, `int ${idx}`);
        } else throw Error();

        this.pushLines(node, '+', `load ${compilerScratch.fullArray}`, 'swap', 'getbit');

        this.lastType = { kind: 'base', type: 'bool' };
        return;
      }

      if (!this.isDynamicType(element.type)) {
        this.pushLines(
          node,
          `load ${compilerScratch.fullArray}`,
          'swap',
          `int ${this.getTypeLength(element.type)}`,
          'extract3'
        );
      }

      this.checkDecoding(node, element.type);

      this.lastType = element.type;
    }
  }

  private processMethodDefinition(node: ts.MethodDeclaration) {
    if (!node.getNameNode().isKind(ts.SyntaxKind.Identifier)) throw Error('Method name must be identifier');
    if (node.getReturnType() === undefined)
      throw Error(`A return type annotation must be defined for ${node.getNameNode().getText()}`);

    const returnType = node.getReturnTypeNode()?.getType()
      ? this.getTypeInfo(node.getReturnTypeNode()!.getType())
      : StackType.void;

    this.currentSubroutine = this.subroutines.find((s) => s.name === node.getNameNode().getText())!;

    this.currentSubroutine.desc = node
      .getJsDocs()
      .map((j) => j.getText())
      .join('\n');

    if (!node.getBody()) throw new Error(`A method body must be defined for ${node.getNameNode().getText()}`);

    let scope = 'public';

    node.getModifiers()?.forEach((m) => {
      if (
        node
          .getDecorators()
          .map((d) => d.getStart())
          .includes(m.getStart())
      )
        return;
      if (m.compilerNode.kind === ts.SyntaxKind.PrivateKeyword) scope = 'private';
      else if (m.compilerNode.kind === ts.SyntaxKind.ProtectedKeyword) scope = 'protected';
      else if (m.compilerNode.kind !== ts.SyntaxKind.PublicKeyword) {
        throw Error(`Method modifier "${m.getText()}" is not supported by TEALScript`);
      }
    });

    if (scope !== 'public') {
      this.processSubroutine(node);
      return;
    }

    if (this.currentProgram === 'lsig' && node.getNameNode().getText() !== 'logic') {
      throw Error('Only one method called "logic" can be defined in a logic signature');
    }

    if (this.currentProgram === 'lsig' && !equalTypes(returnType, StackType.void))
      throw Error('logic method must have a void return type');

    this.currentSubroutine.allows = { create: [], call: [] };
    let bareAction = false;

    const n = this.currentSubroutine.name;
    if (
      [
        'createApplication',
        'updateApplication',
        'deleteApplication',
        'optInToApplication',
        'closeOutOfApplication',
        'clearState',
      ].includes(n)
    ) {
      const isCreate = this.currentSubroutine.name === 'createApplication';
      let oc: OnComplete;

      if (n === 'createApplication') oc = 'NoOp';
      else if (n === 'updateApplication') oc = 'UpdateApplication';
      else if (n === 'deleteApplication') oc = 'DeleteApplication';
      else if (n === 'optInToApplication') oc = 'OptIn';
      else if (n === 'closeOutOfApplication') oc = 'CloseOut';
      else if (n === 'clearState') oc = 'ClearState';
      else throw Error();

      const action = isCreate ? 'create' : 'call';

      this.currentSubroutine.allows[action as 'call'].push(oc);
    }

    node.getDecorators().forEach((d) => {
      const expr = d.getExpression();
      if (expr.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
        if (expr.getExpression().getText() !== 'abi') throw Error(`Unknown decorator ${d.getText()}`);
        if (expr.getName() !== 'readonly') throw Error(`Unknown decorator ${d.getText()}`);
        this.currentSubroutine.readonly = true;
        return;
      }

      const callExpr = d.getExpression();
      if (!callExpr.isKind(ts.SyntaxKind.CallExpression)) throw Error(`Unknown decorator ${d.getText()}`);
      const propExpr = callExpr.getExpression();

      if (!propExpr.isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error(`Unknown decorator ${d.getText()}`);
      const decoratorClass = propExpr.getExpression().getText();
      const decoratorFunction = propExpr.getNameNode().getText();

      switch (decoratorClass) {
        case 'abi':
          this.currentSubroutine.readonly = true;
          break;
        case 'allow':
          if (!['call', 'create', 'bareCreate', 'bareCall'].includes(decoratorFunction))
            throw Error(`Unknown decorator ${d.getText()}`);

          if (decoratorFunction.startsWith('bare') && this.currentSubroutine.args.length > 0)
            throw Error('Cannot use bare decorator on method with arguments');

          if (['create', 'bareCreate'].includes(decoratorFunction) && callExpr.getArguments().length === 0) {
            if (decoratorFunction.startsWith('bare')) {
              bareAction = true;
              if (this.bareCallConfig.NoOp) throw Error('Duplicate bare decorator for NoOp');
              this.bareCallConfig.NoOp = { action: 'CREATE', method: this.currentSubroutine.name };
            } else this.currentSubroutine.allows.create.push('NoOp');
          } else {
            const arg = callExpr.getArguments()[0];
            if (arg === undefined) throw Error(`Missing OnComplete in decorator ${d.getText()}`);

            if (!arg.isKind(ts.SyntaxKind.StringLiteral)) throw Error(`Invalid OnComplete: ${arg.getText()}`);

            const oc = arg.getLiteralText() as
              | 'NoOp'
              | 'OptIn'
              | 'CloseOut'
              | 'ClearState'
              | 'UpdateApplication'
              | 'DeleteApplication';
            if (!ON_COMPLETES.includes(oc)) throw Error(`Invalid OnComplete: ${oc}`);

            if (decoratorFunction.startsWith('bare')) {
              bareAction = true;
              if (this.bareCallConfig[oc]) throw Error(`Duplicate bare decorator for ${oc}`);
              const action = decoratorFunction.replace('bare', '').toUpperCase() as 'CALL' | 'CREATE';

              this.bareCallConfig[oc] = { action, method: this.currentSubroutine.name };
            } else this.currentSubroutine.allows[decoratorFunction as 'call'].push(oc);
          }
          break;

        case 'nonABIRouterFallback':
          if (callExpr.getArguments()[0]) {
            const arg = callExpr.getArguments()[0];

            if (!arg.isKind(ts.SyntaxKind.StringLiteral)) throw Error(`Invalid OnComplete: ${arg.getText()}`);

            const oc = arg.getLiteralText() as
              | 'NoOp'
              | 'OptIn'
              | 'CloseOut'
              | 'ClearState'
              | 'UpdateApplication'
              | 'DeleteApplication';
            if (!ON_COMPLETES.includes(oc)) throw Error(`Invalid OnComplete: ${oc}`);

            if (decoratorFunction !== 'call' && decoratorFunction !== 'create')
              throw Error(`Unknown decorator ${d.getText()}`);
            if (this.currentSubroutine.args.length !== 0)
              throw Error('Non-ABI methods must not have arguments defined');
            if (!equalTypes(this.currentSubroutine.returns.type, StackType.void))
              throw Error('Non-ABI methods must return void');

            this.currentSubroutine.nonAbi[decoratorFunction as 'call' | 'create'].push(oc);
          } else throw Error(`Missing OnComplete in decorator ${d.getText()}`);

          break;
        default:
          throw Error(`Unknown decorator ${d.getText()}`);
      }
    });

    const { allows, nonAbi } = this.currentSubroutine;
    if (nonAbi.call.length + nonAbi.create.length > 0) {
      if (allows.call.length + allows.create.length > 0) {
        throw Error('Cannot mix @allow and @nonABIRouterFallback decorators');
      }

      this.processSubroutine(node);
      return;
    }

    if (allows.create.length + allows.call.length === 0 && bareAction === false) {
      allows.call.push('NoOp');
    }

    this.processRoutableMethod(node);
  }

  private processBlockStatement(node: ts.Block) {
    node.getStatements().forEach((s) => {
      this.processNode(s);
    });
  }

  private processReturnStatement(node: ts.ReturnStatement) {
    this.addSourceComment(node);

    if (this.currentForEachLabel) {
      this.pushVoid(node, `b ${this.currentForEachLabel}_end`);
      return;
    }

    const returnType = this.currentSubroutine.returns.type;

    if (typeInfoToABIString(returnType) === 'void') {
      if (
        node.getExpression() &&
        this.currentSubroutine.node.isKind(ts.SyntaxKind.MethodDeclaration) &&
        this.currentSubroutine.node.getReturnTypeNode()?.getType() === undefined
      ) {
        throw Error(
          `TEALScript does not support implicit return types. Please add a return type to ${this.currentSubroutine.name}`
        );
      }
      this.pushVoid(node, 'retsub');
      return;
    }

    this.typeHint = returnType;

    this.processNode(node.getExpression()!);

    typeComparison(this.lastType, returnType, true);

    this.pushVoid(node, `b *${this.currentSubroutine.name}*return`);

    this.typeHint = undefined;
  }

  private fixBitWidth(node: ts.Node, desiredWidth: number) {
    if (desiredWidth === 64 && this.teal[this.currentProgram].at(-1)!.teal === 'itob') return;
    const lastTypeStr = typeInfoToABIString(this.lastType);

    const lastWidth = parseInt(lastTypeStr.match(/\d+/)?.[0] || '512', 10);

    if (lastTypeStr === 'bigint' || lastTypeStr.startsWith('unsafe')) {
      this.pushLines(
        node,
        `byte 0x${'FF'.repeat(desiredWidth / 8)}`,
        'b&',
        `dup`,
        'len',
        'dup',
        `int ${desiredWidth / 8}`,
        '-',
        'swap',
        'substring3'
      );

      return;
    }

    if (desiredWidth < lastWidth) {
      this.pushLines(node, `extract ${(lastWidth - desiredWidth) / 8} ${desiredWidth / 8}`);

      return;
    }

    this.pushLines(node, `byte 0x${'FF'.repeat(desiredWidth / 8)}`, 'b&');
    this.lastType = { kind: 'base', type: `uint${desiredWidth}` };
  }

  private getStackTypeAfterFunction(fn: () => void): TypeInfo {
    const preType = this.lastType;
    const preTeal = this.teal[this.currentProgram].slice();
    const preLastComment = new Array(...this.lastSourceCommentRange) as [number, number];
    const preTypeHint = this.typeHint;
    fn();
    const type = this.lastType;
    this.lastType = preType;
    this.typeHint = preTypeHint;
    this.teal[this.currentProgram] = preTeal;
    this.lastSourceCommentRange = preLastComment;
    return type;
  }

  private getStackTypeFromNode(node: ts.Node): TypeInfo {
    return this.getStackTypeAfterFunction(() => this.processNode(node));
  }

  private isBinaryExpression(node: ts.Node): boolean {
    if (node.isKind(ts.SyntaxKind.BinaryExpression)) {
      return true;
    }

    if (node.isKind(ts.SyntaxKind.ParenthesizedExpression)) {
      return this.isBinaryExpression(node.getExpression());
    }

    return false;
  }

  mathType = '';

  private usingValue(node: ts.Node): boolean {
    const parent = node.getParentOrThrow();

    if (parent.isKind(ts.SyntaxKind.ForStatement)) {
      if (node.getStart() === parent.getIncrementor()?.getStart()) return false;
    }
    if (parent.isKind(ts.SyntaxKind.ParenthesizedExpression)) return this.usingValue(parent);
    if (parent.isKind(ts.SyntaxKind.ExpressionStatement)) return false;
    if (parent.isKind(ts.SyntaxKind.Block)) return false;

    return true;
  }

  private processBinaryExpression(node: ts.BinaryExpression, processAssignmentOp = false) {
    const leftNode = node.getLeft();
    const rightNode = node.getRight();
    let prevTypeHint = this.typeHint;

    if (node.getOperatorToken().getText() === '=') {
      prevTypeHint = undefined;
      this.addSourceComment(node);

      const leftType = this.getStackTypeFromNode(leftNode);
      this.typeHint = leftType;

      if (leftNode.isKind(ts.SyntaxKind.Identifier)) {
        const name = leftNode.getText();
        const processedFrame = this.processFrame(leftNode, name, false);
        const target = this.localVariables[processedFrame.name];

        this.processNode(rightNode);
        if (this.usingValue(node)) {
          this.pushVoid(node, 'dup');
        }

        const currentArgs = this.currentSubroutine.args;
        if (currentArgs.find((s) => s.name === name && isArrayType(s.type))) {
          throw Error(
            'Mutating argument array is not allowed. Create a new variable using the "clone()" method to create a deep copy first.'
          );
        }
        this.pushVoid(node, `frame_bury ${target.index} // ${name}: ${target.typeString}`);
      } else if (leftNode.isKind(ts.SyntaxKind.ElementAccessExpression)) {
        this.processExpressionChain(leftNode, rightNode);
        if (this.usingValue(node)) {
          this.pushVoid(node, `load ${compilerScratch.assignmentValue}`);
        }
      } else if (leftNode.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
        const isStorageValue = leftNode
          .getFirstChild()
          ?.getType()
          .getText()
          .match(/(Box|LocalState|GlobalState)Value/);

        if (isStorageValue) {
          this.handleStorageAction({
            node: leftNode,
            action: 'set',
            newValue: rightNode,
          });
        } else this.processExpressionChain(leftNode, rightNode);

        if (this.usingValue(node)) {
          this.pushVoid(node, `load ${compilerScratch.assignmentValue}`);
        }
      }

      this.typeHint = prevTypeHint;
      return;
    }

    let operator = node
      .getOperatorToken()
      .getText()
      .replace('>>', 'shr')
      .replace('<<', 'shl')
      .replace('===', '==')
      .replace('!==', '!=')
      .replace('**', 'exp');

    let updateValue = false;

    if (['+=', '-=', '*=', '/='].includes(operator)) {
      if (processAssignmentOp === false) {
        this.addSourceComment(node);

        const isStorageExpr = leftNode
          .getFirstChild()
          ?.getType()
          .getText()
          .match(/(Scratch|Box|LocalState|GlobalState)Value/);

        const isExprChain =
          leftNode.isKind(ts.SyntaxKind.ElementAccessExpression) ||
          leftNode.isKind(ts.SyntaxKind.PropertyAccessExpression);

        if (!isStorageExpr && isExprChain && this.getTypeInfo(leftNode.getFirstChild()!.getType()).kind !== 'base') {
          this.processExpressionChain(leftNode, node);
          if (this.usingValue(node)) {
            this.pushLines(node, `load ${compilerScratch.assignmentValue}`);
            this.lastType = this.getTypeInfo(rightNode.getType());
          }
          return;
        }

        updateValue = true;
      }
      operator = operator.replace('=', '');
    }

    if (['&&', '||'].includes(operator)) {
      this.processLogicalExpression(node);
      return;
    }

    const rightType = this.getStackTypeFromNode(rightNode);
    const leftType = this.getStackTypeFromNode(leftNode);
    const leftTypeStr = typeInfoToABIString(leftType);
    const rightTypeStr = typeInfoToABIString(rightType);

    if (
      !isNumeric(leftType) &&
      !leftTypeStr.match(/\d+$/) &&
      leftTypeStr !== 'bigint' &&
      (operator.startsWith('<') || operator.startsWith('>'))
    ) {
      throw Error(
        'TEALScript only supports number comparison. If you want to compare these values as numbers, use btobigint'
      );
    }

    const isMathOp = ['+', '-', '*', '/', '%', 'exp', '|', '&', '^'].includes(operator);

    if ((isMathOp && leftTypeStr.startsWith('ufixed')) || rightTypeStr.startsWith('ufixed')) {
      throw Error('ufixed math is not supported in TEALScript');
    }

    if (leftNode.getType().isNumberLiteral()) {
      this.processNumericLiteralWithType(leftNode, rightType);
    } else this.processNode(leftNode);

    if (rightNode.getType().isNumberLiteral()) {
      this.processNumericLiteralWithType(rightNode, leftType);
    } else this.processNode(rightNode);

    if (
      operator === '+' &&
      (isBytes(leftType) ||
        (leftType.kind === 'staticArray' && equalTypes(leftType.base, { kind: 'base', type: 'byte' })))
    ) {
      this.push(node.getOperatorToken(), 'concat', StackType.bytes);
      if (updateValue) this.updateValue(leftNode);
      return;
    }

    if (operator === 'exp' && leftTypeStr !== 'uint64' && !isSmallNumber(leftType)) {
      throw new Error(`Exponent operator only supported for uintN <= 64, got ${leftTypeStr} and ${rightTypeStr}`);
    }

    if (
      (leftTypeStr.match(/\d+$/) || leftTypeStr === 'bigint') &&
      !isNumeric(leftType) &&
      !isSmallNumber(leftType) &&
      (operator === '==' || operator === '!=' || operator.startsWith('<') || operator.startsWith('>'))
    ) {
      this.push(node, `b${operator}`, { kind: 'base', type: 'bool' });
    } else if (isMathOp && leftTypeStr.match(/\d+$/) && !isSmallNumber(leftType) && !isNumeric(leftType)) {
      this.push(node.getOperatorToken(), `b${operator}`, { kind: 'base', type: `unsafe ${leftTypeStr}` });
    } else if (isMathOp && leftTypeStr === 'bigint') {
      this.push(node.getOperatorToken(), `b${operator}`, leftType);
    } else {
      this.push(node.getOperatorToken(), operator, leftType);
    }

    if (isMathOp && !isNumeric(leftType) && !leftTypeStr.startsWith('ufixed64') && leftTypeStr !== 'bigint') {
      this.lastType = { kind: 'base', type: `unsafe ${leftTypeStr}` };
    }

    if (leftTypeStr.startsWith('unsafe') || rightTypeStr.startsWith('unsafe')) {
      typeComparison(
        { kind: 'base', type: leftTypeStr.replace('unsafe ', '') },
        { kind: 'base', type: rightTypeStr.replace('unsafe ', '') }
      );
      if (isMathOp) this.lastType = { kind: 'base', type: `unsafe ${leftTypeStr.replace(/unsafe /g, '')}` };
    } else if (!leftNode.getType().isNumberLiteral() && !rightNode.getType().isNumberLiteral()) {
      typeComparison(leftType, rightType);
    }
    if (updateValue) {
      if (this.usingValue(node)) this.pushLines(node, 'dup', `store ${compilerScratch.assignmentValue}`);
      this.updateValue(leftNode);
      if (this.usingValue(node)) this.pushLines(node, `load ${compilerScratch.assignmentValue}`);
      this.lastType = this.getTypeInfo(rightNode.getType());
    }

    if (operator === '==' || operator === '!=' || operator.startsWith('<') || operator.startsWith('>')) {
      this.lastType = { kind: 'base', type: 'bool' };
    }
  }

  private processLogicalExpression(node: ts.BinaryExpression) {
    this.processNode(node.getLeft());
    const type = this.lastType;

    let label: string;

    if (node.getOperatorToken().getText() === '&&') {
      label = `*skip_and${this.andCount}`;
      this.andCount += 1;

      this.pushVoid(node.getOperatorToken(), 'dup');
      this.pushVoid(node.getOperatorToken(), `bz ${label}`);
    } else if (node.getOperatorToken().getText() === '||') {
      label = `*skip_or${this.orCount}`;
      this.orCount += 1;

      this.pushVoid(node.getOperatorToken(), 'dup');
      this.pushVoid(node.getOperatorToken(), `bnz ${label}`);
    }

    this.processNode(node.getRight());
    this.push(node.getOperatorToken(), node.getOperatorToken().getText(), StackType.uint64);
    this.pushVoid(node.getOperatorToken(), `${label!}:`);
    this.lastType = type;
  }

  private processIdentifier(node: ts.Identifier) {
    // should only be true when calling getStackTypeFromNode
    if (node.getText() === 'globals') {
      this.lastType = { kind: 'base', type: 'globals' };
      return;
    }

    const type = node.getType();

    if (type.isStringLiteral()) {
      this.push(node, `byte "${type.getLiteralValueOrThrow()}"`, StackType.bytes);
      return;
    }

    if (type.isNumberLiteral()) {
      this.push(node, `int ${type.getLiteralValueOrThrow()}`, StackType.uint64);
      return;
    }

    // Lookup const definition
    const defNode = node.getDefinitionNodes()[0];

    const inClass = defNode
      .getAncestors()
      .map((a) => a.getKind())
      .includes(ts.SyntaxKind.ClassDeclaration);

    /** True if defined in a function outside of a class */
    const inFunction = defNode
      .getAncestors()
      .map((a) => a.getKind())
      .includes(ts.SyntaxKind.FunctionDeclaration);

    // This is true when we are in a non-class function and the identifier is a function parameter
    const isFunctionParam = defNode.getParent()?.isKind(ts.SyntaxKind.FunctionDeclaration);

    if (!inClass && !isFunctionParam && !inFunction) {
      if (!defNode.isKind(ts.SyntaxKind.VariableDeclaration)) throw Error();
      this.processNode(defNode.getInitializerOrThrow());
      return;
    }

    const processedFrame = this.processFrame(node, node.getText(), true);

    if (processedFrame.accessors.length > 0) {
      this.processParentArrayAccess(node, processedFrame.accessors, node);
    }
  }

  private processNewExpression(node: ts.NewExpression) {
    (node.getArguments() || []).forEach((a) => {
      this.processNode(a);
    });

    this.lastType = this.getTypeInfo(node.getExpression().getType());
  }

  private fixByteWidth(node: ts.Node, desiredWidth: number) {
    const { lastType } = this;

    if (isBytes(lastType)) {
      this.pushLines(
        node,
        `byte 0x${'00'.repeat(desiredWidth)}`,
        'concat',
        'dup',
        `extract ${desiredWidth} 0`,
        'byte 0x',
        'b==',
        'assert',
        `extract 0 ${desiredWidth}`
      );
      return;
    }

    const lastWidth = parseInt(typeInfoToABIString(lastType).match(/\d+/)![0], 10);

    if (lastWidth > desiredWidth) {
      this.pushLines(node, `extract 0 ${desiredWidth}`);
    } else if (lastWidth < desiredWidth) {
      this.pushLines(node, `byte 0x${'00'.repeat(desiredWidth - lastWidth)}`, 'concat');
    }
  }

  private processTypeCast(node: ts.AsExpression | ts.TypeAssertion) {
    const expr = node.getExpression();

    if (expr.getType().isNumberLiteral()) {
      this.processNumericLiteralWithType(expr, this.getTypeInfo(node.getTypeNode()!.getType()));
      return;
    }

    const prevTypeHint = this.typeHint;
    this.typeHint = this.getTypeInfo(node.getTypeNode()!.getType());
    const { typeHint } = this;

    const typeStr = typeInfoToABIString(typeHint);

    if (TXN_TYPES.includes(typeStr)) {
      const lastTypeStr = typeInfoToABIString(this.getTypeInfo(expr.getType()));
      if (lastTypeStr !== typeStr && lastTypeStr !== 'txn') {
        throw new Error(`Cannot cast ${lastTypeStr} to ${typeStr}`);
      }

      this.processNode(expr);
      this.pushLines(node, 'dup', 'gtxns TypeEnum', `int ${typeStr}`, '==');
      this.pushVoid(node, 'assert', `failed to cast ${expr.getText()} to ${typeStr}`);
      this.lastType = typeHint;
      return;
    }

    if (expr.isKind(ts.SyntaxKind.StringLiteral)) {
      const width = parseInt(typeStr.match(/\d+/)![0], 10);
      const str = expr.getLiteralText();
      if (str.length > width) throw new Error(`String literal too long for ${typeStr}`);
      const padBytes = width - str.length;
      const hex = Buffer.from(str).toString('hex');
      const paddedHex = hex + '00'.repeat(padBytes);
      this.push(node, `byte 0x${paddedHex} // "${str}"`, typeHint);
      return;
    }

    this.processNode(node.getExpression());

    if (typeStr.match(/byte\[\d+\]$/)) {
      const typeWidth = parseInt(typeStr.match(/\d+/)![0], 10);
      this.fixByteWidth(node, typeWidth);
    }

    if (typeInfoToABIString(this.lastType) === 'any') {
      this.lastType = typeHint;
      return;
    }

    if (
      (typeStr.match(/uint\d+$/) || typeStr.match(/ufixed\d+x\d+$/)) &&
      typeStr !== typeInfoToABIString(this.lastType)
    ) {
      if (equalTypes(typeHint, StackType.uint64)) {
        if (!isSmallNumber(this.lastType)) {
          this.overflowCheck(node, 64);
          this.fixBitWidth(node, 64);
          this.push(node, 'btoi', StackType.uint64);
        } else this.lastType = StackType.uint64;
        return;
      }

      // If going from uint64
      if (equalTypes(this.lastType, StackType.uint64)) {
        // itob it only if its bigger
        if (!isSmallNumber(typeHint)) this.pushVoid(node, 'itob');
        // if going from a small int to a bigger int
      } else if (isSmallNumber(this.lastType) && !isSmallNumber(typeHint)) {
        this.pushLines(node, 'itob');
        // going from a big into a smaller int
      } else if (!isSmallNumber(this.lastType) && isSmallNumber(typeHint)) {
        const width = parseInt(typeStr.match(/\d+/)![0], 10);
        this.overflowCheck(node, width);
        this.fixBitWidth(node, width);
        this.push(node, 'btoi', typeHint);
        return;
      }

      this.lastType = { kind: 'base', type: `unsafe ${typeStr}` };
      return;
    }

    this.lastType = typeHint;
    this.typeHint = prevTypeHint;
  }

  private processVariableDeclaration(node: ts.VariableDeclarationList) {
    node.getDeclarations().forEach((d) => {
      const typeNode = d.getTypeNode();
      this.typeHint = typeNode === undefined ? undefined : this.getTypeInfo(typeNode.getType());

      this.processNode(d);
      this.typeHint = undefined;
    });
  }

  /**
   * Saves information about storage access such as the key (and account if local storage) to the frame
   *
   * @param node The node that is saving storage access in a variable
   * @param name The name of the new variable
   * @param storageExpression The expression for accessing the storage property
   * @param type The value type
   * @param accessors If accessing an array, save the accessors used (ie. if `this.myArrays('foo').value[0][1]` then save [0, 1])
   */
  private initializeStorageFrame(
    node: ts.Node,
    name: string,
    storageExpression: ts.PropertyAccessExpression,
    type: TypeInfo,
    accessors?: (string | ts.Expression)[]
  ) {
    this.localVariables[name] = {
      accessors,
      storageExpression,
      type,
      typeString: typeInfoToABIString(type),
    };

    // Get information about the storage access and ensure there are keys we need to save
    const storageName = getStorageName(storageExpression)!;
    const storageProp = this.storageProps[storageName];
    const expr = storageExpression.getExpression();

    if (!expr.isKind(ts.SyntaxKind.CallExpression)) return;

    const exprArgs = expr.getArguments();

    // Save the key to the frame. For local storage this will be the second argument, for global and box storage it will be the first argument
    const argLength = exprArgs.length;
    const keyNode = exprArgs[argLength === 2 ? 1 : 0];

    // If the storage object has a key (any GlobalStateMap, LocalStateMap, and BoxMap)
    if (keyNode !== undefined && !keyNode.isKind(ts.SyntaxKind.StringLiteral) && !keyNode.getType().isNumberLiteral()) {
      this.addSourceComment(node, true);

      // Add the prefix to the given key if it exists
      if (storageProp.prefix) {
        const hex = Buffer.from(storageProp.prefix).toString('hex');
        this.pushVoid(keyNode, `byte 0x${hex} // "${storageProp.prefix}"`);
      }

      this.processNode(keyNode);

      // Ensure the key is properly encoded (except for bytes which are not ABI encoded)
      if (!equalTypes(storageProp.keyType, StackType.bytes)) {
        this.checkEncoding(keyNode, this.lastType);
      }

      if (storageProp.prefix) this.pushVoid(keyNode, 'concat');

      const keyFrameName = `storage key//${name}`;

      // Save the map key to the frame
      this.pushVoid(keyNode, `frame_bury ${this.frameIndex} // ${keyFrameName}`);
      this.localVariables[keyFrameName] = {
        index: this.frameIndex,
        type: StackType.uint64,
        typeString: 'uint64',
      };
      this.frameIndex += 1;

      // Save the name of the storage key frame in the variable frame object
      this.localVariables[name].storageKeyFrame = keyFrameName;
    }

    // If we are saving access for local storage, we need to save the account to the frame as well
    if (storageProp.type === 'local') {
      const accountNode = exprArgs[0];
      const accountFrameName = `storage account//${name}`;

      this.addSourceComment(node, true);

      // Save the account in the frame
      this.processNode(accountNode);
      this.pushVoid(accountNode, `frame_bury ${this.frameIndex} // ${accountFrameName}`);
      this.localVariables[accountFrameName] = {
        index: this.frameIndex,
        type: StackType.uint64,
        typeString: 'uint64',
      };
      this.frameIndex += 1;

      // Save the name of the storage frame in the variable frame object
      this.localVariables[name].storageAccountFrame = accountFrameName;
    }
  }

  private processVariableDeclarator(node: ts.VariableDeclaration) {
    if (node.getType().isStringLiteral() || node.getType().isNumberLiteral()) return;

    const name = node.getNameNode().getText();

    if (node.getInitializer()) {
      const initializerType = this.getTypeInfo(node.getType()!);
      const initializerTypeString = typeInfoToABIString(initializerType);

      let lastFrameAccess: string | undefined;

      const isArray = isArrayType(initializerType);

      if (
        node.getInitializer()!.isKind(ts.SyntaxKind.Identifier) &&
        (isArray || MULTI_OUTPUT_TYPES.includes(initializerTypeString))
      ) {
        lastFrameAccess = node.getInitializer()!.getText();

        this.localVariables[name] = {
          framePointer: lastFrameAccess,
          type: initializerType,
          typeString: node.getType()?.getText().replace(/\n/g, ' ') || typeInfoToABIString(initializerType),
        };

        return;
      }

      const init = node.getInitializer();
      if (init?.isKind(ts.SyntaxKind.ElementAccessExpression) && isArray) {
        const accessChain = this.getAccessChain(init);
        lastFrameAccess = accessChain[0].getExpression().getText();

        // Only add source comments if there will be generated TEAL
        if (accessChain.find((e) => e.getArgumentExpression()?.getType().isNumberLiteral())) {
          this.addSourceComment(node);
        }
        const accessors = accessChain.map((e, i) => {
          if (e.getArgumentExpression()?.getType().isNumberLiteral()) return e.getArgumentExpression()!;

          if (e.getArgumentExpression()?.getType().isNumberLiteral()) {
            this.push(e.getArgumentExpression()!, `int ${e.getArgumentExpression()!.getText()}`, StackType.uint64);
          } else this.processNode(e.getArgumentExpression()!);

          const accName = `accessor//${i}//${name}`;
          this.pushVoid(node.getInitializer()!!, `frame_bury ${this.frameIndex} // accessor: ${accName}`);

          this.localVariables[accName] = {
            index: this.frameIndex,
            type: StackType.uint64,
            typeString: 'uint64',
          };

          this.frameIndex += 1;

          return accName;
        });

        if (lastFrameAccess.startsWith('this.')) {
          if (!accessChain[0].getExpression().isKind(ts.SyntaxKind.PropertyAccessExpression)) {
            throw new Error('Expected call expression');
          }

          this.initializeStorageFrame(
            node,
            name,
            accessChain[0].getExpression() as ts.PropertyAccessExpression,
            initializerType,
            accessors
          );
        } else {
          this.localVariables[name] = {
            accessors,
            framePointer: lastFrameAccess,
            type: initializerType,
            typeString: node.getType()?.getText().replace(/\n/g, ' ') || typeInfoToABIString(initializerType),
          };
        }

        if (node.getTypeNode()) typeComparison(this.lastType, this.getTypeInfo(node.getTypeNode()!.getType()));
        return;
      }

      const isStorageValue = init
        ?.getFirstChild()
        ?.getType()
        .getText()
        .match(/(Box|LocalState|GlobalState)Value/);

      if (init?.isKind(ts.SyntaxKind.PropertyAccessExpression) && isStorageValue && isArray) {
        this.initializeStorageFrame(node, name, init, initializerType);

        if (node.getTypeNode())
          typeComparison(
            this.storageProps[getStorageName(init)!].valueType,
            this.getTypeInfo(node.getTypeNode()!.getType())
          );
        return;
      }

      if (init?.isKind(ts.SyntaxKind.PropertyAccessExpression) && isArray) {
        lastFrameAccess = init.getExpression().getText();

        const type = this.getStackTypeFromNode(init.getExpression());
        if (isArray) {
          const index = Object.keys(getObjectTypes(type)).indexOf(init.getNameNode().getText());

          if (lastFrameAccess.startsWith('this.')) {
            const initExpr = init.getExpression();
            if (!initExpr.isKind(ts.SyntaxKind.PropertyAccessExpression)) throw new Error('Expected call expression');

            this.initializeStorageFrame(node, name, initExpr, initializerType, [
              ts.createWrappedNode(stringToExpression(index.toString()) as ts.ts.Expression),
            ]);
          } else {
            this.localVariables[name] = {
              accessors: [ts.createWrappedNode(stringToExpression(index.toString()) as ts.ts.Expression)],
              framePointer: lastFrameAccess,
              type: initializerType,
              typeString: node.getType()?.getText().replace(/\n/g, ' ') || typeInfoToABIString(initializerType),
            };
          }

          if (node.getTypeNode()) typeComparison(initializerType, this.getTypeInfo(node.getTypeNode()!.getType()));
          return;
        }
      }

      this.addSourceComment(node);
      const hint = node.getTypeNode() ? this.getTypeInfo(node.getTypeNode()!.getType()) : undefined;

      if (init?.getType().isNumberLiteral() && this.typeHint) {
        this.processNumericLiteralWithType(init, this.typeHint);
      } else {
        this.typeHint = hint;
        this.processNode(init!);
        if (hint) {
          if (this.lastType.kind === 'base' && this.lastType.type.startsWith('unsafe')) {
            this.checkEncoding(init!, this.lastType);
          }
          typeComparison(this.lastType, hint);
        }
      }

      const type = hint || this.lastType;

      let typeString = node.getTypeNode()?.getText().replace(/\n/g, ' ') || typeInfoToABIString(type);

      const parent = node.getParentOrThrow();
      let isLet = false;
      if (parent.isKind(ts.SyntaxKind.VariableDeclarationList)) {
        isLet = parent.getFlags() === ts.NodeFlags.Let;
      }

      if (isLet && type.kind === 'base' && type.type.match(/^(ufixed|uint)(?!64)/)) {
        type.type = `unsafe ${type.type}`;
        typeString = `unsafe ${typeString}`;
      }

      this.localVariables[name] = {
        index: this.frameIndex,
        type,
        typeString,
      };

      if (MULTI_OUTPUT_TYPES.includes(typeInfoToABIString(type))) return;

      this.pushVoid(node, `frame_bury ${this.frameIndex} // ${name}: ${typeString}`);

      this.frameIndex += 1;
    } else {
      if (!node.getTypeNode()) throw new Error('Uninitialized variables must have a type');

      this.localVariables[name] = {
        index: this.frameIndex,
        type: this.getTypeInfo(node.getTypeNode()!.getType()),
        typeString: node.getTypeNode()!.getText().replace(/\n/g, ' '),
      };

      this.frameIndex += 1;
    }
  }

  private processExpressionStatement(node: ts.ExpressionStatement) {
    this.processNode(node.getExpression());
  }

  private isDynamicArrayOfStaticType(type: TypeInfo) {
    return type.kind === 'dynamicArray' && !this.isDynamicType(type.base);
  }

  private processConditional(node: ts.Node) {
    this.addSourceComment(node);
    this.processNode(node);

    if (!isNumeric(this.lastType) && typeInfoToABIString(this.lastType) !== 'bool') {
      this.pushLines(node, 'byte 0x', 'b!=');
    }
  }

  private processIfStatement(node: ts.IfStatement, elseIfCount: number = 0, parentIf = (this.ifCount += 1)) {
    let labelPrefix: string;

    const thisIf = `*if${parentIf}`;

    if (elseIfCount === 0) {
      labelPrefix = thisIf;
      this.pushVoid(node, `// ${labelPrefix}_condition`);
    } else {
      labelPrefix = `${thisIf}_elseif${elseIfCount}`;
      this.pushVoid(node, `${labelPrefix}_condition:`);
    }

    this.processConditional(node.getExpression());

    const elseStatement = node.getElseStatement();

    if (elseStatement === undefined) {
      this.pushVoid(node, `bz ${thisIf}_end`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.getThenStatement());
    } else if (elseStatement?.isKind(ts.SyntaxKind.IfStatement)) {
      this.pushVoid(node, `bz ${thisIf}_elseif${elseIfCount + 1}_condition`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.getThenStatement());
      this.pushVoid(node, `b ${thisIf}_end`);
      this.processIfStatement(elseStatement, elseIfCount + 1, parentIf);
    } else {
      this.pushVoid(node, `bz ${thisIf}_else`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.getThenStatement());
      this.pushVoid(node, `b ${thisIf}_end`);
      this.pushVoid(node, `${thisIf}_else:`);
      this.processNode(elseStatement);
    }

    if (elseIfCount === 0) {
      this.pushVoid(node, `${thisIf}_end:`);
    }
  }

  private processUnaryExpression(node: ts.PrefixUnaryExpression) {
    this.processNode(node.getOperand());
    switch (node.getOperatorToken()) {
      case ts.SyntaxKind.ExclamationToken:
        this.pushVoid(node.getOperand(), '!');
        break;
      case ts.SyntaxKind.TildeToken:
        if (isNumeric(this.lastType) || isSmallNumber(this.lastType)) this.pushVoid(node.getOperand(), '~');
        else this.pushVoid(node.getOperand(), 'b~');
        break;
      default:
        throw new Error(`Unsupported unary operator ${ts.SyntaxKind[node.getOperatorToken()]}`);
    }
  }

  private processPropertyDefinition(node: ts.PropertyDeclaration) {
    const init = node.getInitializer();
    if (init === undefined) throw Error();

    if (node.getNameNode().getText() === 'programVersion') {
      if (!init.isKind(ts.SyntaxKind.NumericLiteral)) throw Error('programVersion must be a number');

      this.programVersion = parseInt(init.getLiteralText(), 10);

      if (this.programVersion < 8) throw Error('programVersion must be >= 8');
      return;
    }

    if (
      init.isKind(ts.SyntaxKind.CallExpression) &&
      ['BoxMap', 'GlobalStateMap', 'LocalStateMap', 'BoxKey', 'GlobalStateKey', 'LocalStateKey'].includes(
        init.getExpression().getText()
      )
    ) {
      if (this.currentProgram === 'lsig') {
        throw Error('Logic signatures cannot have stateful properties');
      }

      let props: StorageProp;
      const klass = init.getExpression().getText();
      const type = klass.toLocaleLowerCase().replace('state', '').replace('map', '').replace('key', '') as StorageType;
      const typeArgs = init.getTypeArguments();

      if (typeArgs === undefined) {
        throw new Error('Type arguments must be specified for storage properties');
      }

      if (klass.includes('Map')) {
        if (typeArgs.length !== 2) throw new Error(`Expected 2 type arguments for ${klass}`);
        props = {
          name: node.getName(),
          type,
          keyType: this.getTypeInfo(typeArgs[0].getType()),
          valueType: this.getTypeInfo(typeArgs[1].getType()),
          initNode: init,
        };
      } else {
        if (typeArgs.length !== 1) throw new Error(`Expected a type argument for ${klass}`);

        props = {
          name: node.getName(),
          type,
          keyType: StackType.bytes,
          valueType: this.getTypeInfo(typeArgs[0].getType()),
          initNode: init,
        };
      }

      if (props.type === 'box' && this.isDynamicType(props.valueType)) {
        props.dynamicSize = true;
      }

      const initArgs = init.getArguments();
      if (initArgs[0] !== undefined) {
        if (!initArgs[0].isKind(ts.SyntaxKind.ObjectLiteralExpression)) throw new Error('Expected object literal');

        initArgs[0].getProperties().forEach((p) => {
          if (!p.isKind(ts.SyntaxKind.PropertyAssignment)) throw new Error();
          const name = p.getNameNode()?.getText();
          const propInit = p.getInitializer();

          switch (name) {
            case 'key':
              if (klass.includes('Map')) throw new Error(`${name} only applies to storage keys`);
              if (!propInit?.isKind(ts.SyntaxKind.StringLiteral)) throw new Error('Storage key must be string');
              props.key = propInit.getLiteralText();
              break;
            case 'dynamicSize':
              if (props.type !== 'box') throw new Error(`${name} only applies to box storage`);
              if (!this.isDynamicType(props.valueType)) throw new Error(`${name} only applies to dynamic types`);

              props.dynamicSize = propInit!.getText() === 'true';
              break;
            case 'prefix':
              if (!klass.includes('Map')) throw new Error(`${name} only applies to storage maps`);
              if (!propInit!.isKind(ts.SyntaxKind.StringLiteral)) throw new Error('Storage prefix must be string');
              props.prefix = propInit.getLiteralText();
              break;
            case 'maxKeys':
              if (!klass.includes('Map')) throw new Error(`${name} only applies to storage maps`);
              if (!propInit!.isKind(ts.SyntaxKind.NumericLiteral)) throw new Error('Storage maxKeys must be number');
              props.maxKeys = parseInt(propInit.getLiteralText(), 10);
              break;
            case 'allowPotentialCollisions':
              if (
                propInit?.compilerNode.kind !== ts.SyntaxKind.TrueKeyword &&
                propInit?.compilerNode.kind !== ts.SyntaxKind.FalseKeyword
              ) {
                throw new Error('Storage allowPotentialCollisions must be boolean');
              }
              props.allowPotentialCollisions = propInit?.compilerNode.kind === ts.SyntaxKind.TrueKeyword;
              break;
            default:
              throw new Error(`Unknown property ${name}`);
          }
        });
      }

      if (!props.key && klass.includes('Key')) {
        props.key = node.getNameNode().getText();
      }

      if (klass.includes('StateMap') && !props.maxKeys) throw new Error('maxKeys must be specified for state maps');

      // If this is a state map
      if (klass.includes('Map') && props.allowPotentialCollisions !== true) {
        const prefixRequired = Object.keys(this.storageProps).find((propName) => {
          const p = this.storageProps[propName];
          // Only check the same storage type (box, local, global)
          if (p.type !== type) return false;

          // If the existing prop is a key, make sure the length of the new key doesn't match the length of the existing key
          if (p.key !== undefined) {
            return this.isDynamicType(props.keyType) || p.key.length === this.getTypeLength(props.keyType);
          }

          return (
            p.keyType === props.keyType ||
            this.isDynamicType(p.keyType) ||
            this.getTypeLength(p.keyType) === this.getTypeLength(props.keyType)
          );
        });

        if (prefixRequired) {
          if (props.prefix === undefined)
            throw Error(
              `Prefix must be defined for "${node
                .getNameNode()
                .getText()}" due to potential collision with "${prefixRequired}"`
            );

          const collision = Object.keys(this.storageProps).find((propName) => {
            const p = this.storageProps[propName];
            // Only check the same storage type (box, local, global)
            if (p.type !== type) return false;

            return p.key?.startsWith(props.prefix!) || p.prefix === props.prefix;
          });

          if (collision) {
            throw Error(`Storage prefix "${props.prefix}" collides with existing storage property "${collision}"`);
          }
        }
        // If this is a state key
      } else if (props.allowPotentialCollisions !== true) {
        // Get potential a Map that collides with this key and doesn't have a prefix
        const prefixRequired = Object.keys(this.storageProps).find((propName) => {
          const p = this.storageProps[propName];
          // Only check the same storage type (box, local, global)
          if (p.type !== type) return false;

          // Only check storage map
          if (p.key !== undefined) return false;

          return (
            p.prefix === undefined &&
            (this.isDynamicType(p.keyType) || this.getTypeLength(p.keyType) === this.getTypeLength(props.keyType))
          );
        });

        if (prefixRequired) {
          throw Error(
            `"${node
              .getNameNode()
              .getText()}" has a potential key collision with "${prefixRequired}". "${prefixRequired}" must have a prefix or "${node
              .getNameNode()
              .getText()}" must have a different key name`
          );
        }

        const thisKey = props.key || node.getNameNode().getText();
        const collision = Object.keys(this.storageProps).find((propName) => {
          const p = this.storageProps[propName];

          // Only check the same storage type (box, local, global)
          if (p.type !== type) return false;

          return p.key === thisKey || (p.prefix && thisKey.startsWith(p.prefix));
        });

        if (collision) {
          throw Error(
            `Storage key for "${node
              .getNameNode()
              .getText()}" collides with existing storage property "${collision}". One of the names or prefixes must be changed`
          );
        }
      }

      this.storageProps[node.getNameNode().getText()] = props;
    } else if (init.isKind(ts.SyntaxKind.NewExpression) && init.getExpression().getText() === 'EventLogger') {
      if (this.currentProgram === 'lsig') {
        throw Error('Logic signatures cannot log events');
      }

      const initTypeArgs = init.getTypeArguments();
      if (!initTypeArgs[0].isKind(ts.SyntaxKind.TypeLiteral)) {
        throw Error(`EventLogger type argument must be a type literal`);
      }

      this.events[node.getNameNode().getText()] = {
        name: node.getNameNode().getText(),
        args: [],
        desc: node
          .getJsDocs()
          .map((d) => d.getCommentText())
          .join(''),
        argTupleType: this.getTypeInfo(initTypeArgs[0].getType()),
      };

      const event = this.events[node.getNameNode().getText()];

      initTypeArgs[0].getProperties().forEach((p) => {
        const desc = p
          .getJsDocs()
          .map((d) => d.getCommentText())
          .join();

        const name = p.getName();
        const type = this.getTypeInfo(p.getType());
        event.args.push({ name, type, desc });
      });
    } else if (init.isKind(ts.SyntaxKind.CallExpression) && init.getExpression().getText() === 'ScratchSlot') {
      if (init.getTypeArguments()?.length !== 1) throw Error('ScratchSlot must have one type argument ');

      if (init.getArguments()?.length !== 1) throw Error('ScratchSlot must have one argument');

      if (!init.getArguments()[0].isKind(ts.SyntaxKind.NumericLiteral))
        throw Error('ScratchSlot argument must be a literal number');

      const type = this.getTypeInfo(init.getTypeArguments()[0].getType());
      const name = node.getNameNode().getText();
      const slot = parseInt(init.getArguments()[0].getText(), 10);

      if (slot < 0 || slot > 200)
        throw Error('Scratch slot must be between 0 and 200 (inclusive). 201-256 is reserved for the compiler');

      this.scratch[name] = { type, slot, initNode: init };
    } else if (init.isKind(ts.SyntaxKind.CallExpression) && init.getExpression().getText() === 'DynamicScratchSlot') {
      if (init.getTypeArguments()?.length !== 1) throw Error('ScratchSlot must have one type argument ');

      const type = this.getTypeInfo(init.getTypeArguments()[0].getType());
      const name = node.getNameNode().getText();

      this.scratch[name] = { type, initNode: init };
    } else if (init.isKind(ts.SyntaxKind.CallExpression) && init.getExpression().getText() === 'TemplateVar') {
      if (init.getTypeArguments()?.length !== 1) throw Error('TemplateVar must have one type argument ');

      if (init.getArguments()[0] && !init.getArguments()[0].isKind(ts.SyntaxKind.NumericLiteral)) {
        throw Error('TemplateVar name argument must be a string literal');
      }

      const name = init.getArguments()[0]?.getText() || node.getNameNode().getText();
      const type = this.getTypeInfo(init.getTypeArguments()[0].getType());

      // TODO: Add slot argument, otherwise assign one automatically
      const slot = 200 + Object.keys(this.templateVars).length;

      this.scratch[node.getNameNode().getText()] = { slot, type, initNode: init };
      this.templateVars[node.getNameNode().getText()] = {
        type,
        name,
        initNode: init,
      };
    } else {
      throw new Error();
    }
  }

  private getNumericLiteralValueString(node: ts.Node): string {
    let value = '';
    if (node.isKind(ts.SyntaxKind.Identifier)) {
      const symbol = node.getSymbol()?.getAliasedSymbol() || node.getSymbolOrThrow();

      symbol.getDeclarations().forEach((d) => {
        if (d.isKind(ts.SyntaxKind.VariableDeclaration)) {
          value = this.getNumericLiteralValueString(d.getInitializerOrThrow());
        }
      });
    } else return node.getText().replace(/_/g, '');

    if (value === '') throw Error();
    return value;
  }

  private processNumericLiteralWithType(node: ts.Node, typeInfo: TypeInfo) {
    const type = typeInfoToABIString(typeInfo);
    if (!node.getType().isNumberLiteral()) throw Error();

    const textWithoutUnderscores = this.getNumericLiteralValueString(node);

    if (BigInt(textWithoutUnderscores.split('.')[0]) > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw Error(`Number ${node.getText()} is too large for a number literal. Use Uint constructor with string")`);
    }

    if (type === 'uint64') {
      this.processNode(node);
      return;
    }

    if (type === 'bigint') {
      const value = Number(textWithoutUnderscores);
      let hex = value.toString(16);
      if (hex.length % 2) hex = `0${hex}`;
      this.push(node, `byte 0x${hex}`, typeInfo);
      return;
    }

    if (type.match(/ufixed\d+x\d+$/)) {
      const match = type.match(/\d+/g)!;
      const n = parseInt(match[0], 10);
      const m = parseInt(match[1], 10);

      const numDecimals = textWithoutUnderscores.match(/(?<=\.)\d+/)![0].length;

      if (numDecimals > m)
        throw Error(`Value ${node.getText()} cannot be represented as ${type}. A more precise type is required.`);

      const valueStr = textWithoutUnderscores.replace('.', '') + '0'.repeat(m - numDecimals);

      const fixedValue = BigInt(valueStr);

      if (isSmallNumber(typeInfo)) {
        this.push(node, `int ${fixedValue}`, typeInfo);
      } else this.push(node, `byte 0x${fixedValue.toString(16).padStart(n / 4, '00')}`, typeInfo);

      return;
    }

    if (type.match(/uint\d+$/)) {
      const width = Number(type.match(/\d+/)![0]);
      const value = Number(textWithoutUnderscores);
      const maxValue = 2 ** width - 1;

      if (value > maxValue) {
        throw Error(`Value ${value} is too large for ${type}. Max value is ${maxValue}`);
      }

      if (isSmallNumber(typeInfo)) this.push(node, `int ${value}`, typeInfo);
      else this.push(node, `byte 0x${value.toString(16).padStart(width / 4, '0')}`, typeInfo);
    }
  }

  private processLiteral(node: ts.StringLiteral | ts.NumericLiteral) {
    if (node.compilerNode.kind === ts.SyntaxKind.StringLiteral) {
      const hex = Buffer.from(node.getLiteralText(), 'utf8').toString('hex');
      this.push(node, `byte 0x${hex} // "${node.getLiteralText()}"`, StackType.bytes);
    } else {
      const textWithoutUnderscores = this.getNumericLiteralValueString(node);
      if (BigInt(textWithoutUnderscores) > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw Error(
          `Number ${node.getText()} is too large for a number literal. Use Uint64 constructor with string: Uint64("${textWithoutUnderscores}")`
        );
      }
      this.push(node, `int ${node.getText()}`, StackType.uint64);
    }
  }

  /**
   * Method for handling an expression chain that starts with `this`
   *
   * Note this method will delete elements from the chain as they are processed
   *
   * @param chain Expression chain to process
   * @param newValue New value to assign to the chain expression
   */
  private processThisBase(chain: ExpressionChainNode[], newValue?: ts.Node) {
    // If this is a pendingGroup call (ie. `this.pendingGroup.submit()`)
    if (
      chain[0] &&
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      chain[0].getNameNode().getText() === 'pendingGroup'
    ) {
      if (!chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression))
        throw Error(`Unsupported ${chain[1].getKindName()} ${chain[1].getText()}`);
      if (!chain[2].isKind(ts.SyntaxKind.CallExpression))
        throw Error(`Unsupported ${chain[2].getKindName()} ${chain[2].getText()}`);

      const methodName = chain[1].getNameNode().getText();
      if (chain[2].getArguments()[0]) {
        const { returnType, argTypes, name } = this.methodTypeArgsToTypes(chain[2].getTypeArguments());
        this.processTransaction(chain[2], methodName, chain[2].getArguments()[0], argTypes, returnType, name);
      } else if (methodName === 'submit') {
        this.pushVoid(chain[2], 'itxn_submit');
      } else throw new Error(`Unknown method ${chain[2].getText()}`);

      chain.splice(0, 3);
      return;
    }

    if (
      chain[0] &&
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      chain[0].getNameNode().getText() === 'txn' &&
      chain[1]?.isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      chain[2]?.isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      chain[1].getName() === 'applicationArgs' &&
      chain[2].getName() === 'length'
    ) {
      this.push(chain[2], 'txn NumAppArgs', StackType.uint64);
      chain.splice(0, 3);
      return;
    }

    // If accessing the txnGroup
    if (
      chain[0] &&
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      chain[0].getNameNode().getText() === 'txnGroup'
    ) {
      // If getting the group size
      if (
        chain[1] &&
        chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        chain[1].getNameNode().getText() === 'length'
      ) {
        this.push(chain[1], 'global GroupSize', StackType.uint64);
        chain.splice(0, 2);
        return;
      }

      // Otherwise this should be a group index
      if (!chain[1].isKind(ts.SyntaxKind.ElementAccessExpression))
        throw Error(`Unsupported ${chain[1].getKindName()} ${chain[1].getText()}`);
      this.processNode(chain[1].getArgumentExpression()!);
      this.lastType = { kind: 'base', type: 'txn' };

      chain.splice(0, 2);
      return;
    }

    // If accessing the inner txn group
    if (
      chain[0] &&
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      chain[0].getNameNode().getText() === 'lastInnerGroup'
    ) {
      // Otherwise this should be a group index
      if (!chain[1].isKind(ts.SyntaxKind.ElementAccessExpression))
        throw Error(`Unsupported ${chain[1].getKindName()} ${chain[1].getText()}`);

      const index = chain[1].getArgumentExpression()?.getType().getLiteralValue();

      if (index === undefined) throw Error('Inner group txn index must be a literal');
      this.processNode(chain[1].getArgumentExpression()!);

      this.lastType = { kind: 'base', type: 'gitxn' };

      chain.splice(0, 2);
      return;
    }

    // If this is a template variable
    if (
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      this.templateVars[chain[0].getNameNode().getText()]
    ) {
      const propName = chain[0].getNameNode().getText();
      const { name, type } = this.templateVars[propName];

      let op = 'byte';
      if (isNumeric(type)) op = 'int';

      this.push(chain[0], `${op} TMPL_${name}`, type);

      chain.splice(0, 1);
      return;
    }

    // If this is a scratch slot
    if (chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) && this.scratch[chain[0].getNameNode().getText()]) {
      const name = chain[0].getNameNode().getText();

      let slot: number | undefined;

      // If this is a dynamic scratch slot
      if (
        chain[1].isKind(ts.SyntaxKind.CallExpression) &&
        chain[2].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        chain[2].getName() === 'value'
      ) {
        this.processNode(chain[1].getArguments()[0]);
        typeComparison(this.lastType, StackType.uint64);
      }
      // else if this is a static scratch slot
      else if (chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression) && chain[1].getName() === 'value') {
        slot = this.scratch[name].slot;
      } else {
        throw Error(`Invalid scratch expression ${chain[1].getText()}`);
      }

      let opcode: string;

      if (newValue !== undefined) {
        this.processNode(newValue);
        typeComparison(this.lastType, this.scratch[name].type);
        opcode = 'store';
      } else {
        opcode = 'load';
      }

      if (slot !== undefined) {
        opcode += ` ${slot}`;
      } else {
        opcode += 's';
      }

      this.push(chain[1], opcode, this.scratch[name].type);

      chain.splice(0, slot === undefined ? 3 : 2);

      return;
    }

    // If this is an event
    if (chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) && this.events[chain[0].getNameNode().getText()]) {
      const name = chain[0].getNameNode().getText();
      if (!this.currentSubroutine.events.includes(name)) this.currentSubroutine.events.push(name);
      const { argTupleType } = this.events[name];

      if (!chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression) || !chain[2].isKind(ts.SyntaxKind.CallExpression))
        throw Error(`Unsupported ${chain[1].getKindName()} ${chain[1].getText()}`);

      if (chain[1].getNameNode().getText() !== 'log')
        throw Error(`Unsupported event method ${chain[1].getNameNode().getText()}`);

      const argTypes = typeInfoToABIString(argTupleType)
        .replace(/asset/g, 'uint64')
        .replace(/account/g, 'address')
        .replace(/application/g, 'uint64');

      const signature = `${name}${argTypes}`;

      const selector = sha512_256(Buffer.from(signature)).slice(0, 8);

      this.typeHint = argTupleType;
      this.pushVoid(chain[2], `byte 0x${selector} // ${signature}`);
      this.processNode(chain[2].getArguments()[0]);
      this.pushVoid(chain[2], 'concat');

      this.pushVoid(chain[2], 'log');

      chain.splice(0, 3);
      return;
    }

    // If this is a storage property (ie. GlobalMap, BoxKey, etc.)
    if (
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      this.storageProps[chain[0].getNameNode().getText()]
    ) {
      const name = chain[0].getNameNode().getText();
      const storageProp = this.storageProps[name];

      /**
       * Specifies whether this is a storage Map or LocalState, which means it's
       * always a call expression.
       */
      const isMapOrLocal = storageProp.key === undefined || storageProp.type === 'local';

      /** The index of the node that specifies which action to take. ie `.value` or `.delete()` */
      let actionNodeIndex = isMapOrLocal ? 2 : 1;

      if (chain[actionNodeIndex + 1] && chain[actionNodeIndex + 1].isKind(ts.SyntaxKind.CallExpression)) {
        actionNodeIndex += 1;
      }

      const actionNode = chain[actionNodeIndex] as ts.CallExpression | ts.PropertyAccessExpression;

      /** name of the action. ie "value" or "delete" */
      let action: string;

      if (actionNode.isKind(ts.SyntaxKind.PropertyAccessExpression)) action = actionNode.getNameNode().getText();
      if (actionNode.isKind(ts.SyntaxKind.CallExpression)) {
        action = (actionNode.getExpression() as ts.PropertyAccessExpression).getNameNode().getText();
      }

      const getFullValue = actionNode.getText() === chain.at(-1)?.getText();

      // Don't get the box value if we can use box_replace or box_extract later
      if (
        action! !== 'value' ||
        getFullValue ||
        storageProp.valueType.kind === 'base' ||
        !(
          storageProp.type === 'box' &&
          !this.isDynamicType(storageProp.valueType) &&
          !typeInfoToABIString(storageProp.valueType).match('bool')
        )
      ) {
        this.handleStorageAction({
          node: actionNode,
          action: action!.replace('value', 'get') as
            | 'get'
            | 'set'
            | 'exists'
            | 'delete'
            | 'create'
            | 'extract'
            | 'replace'
            | 'size',
        });
      } else this.lastType = storageProp.valueType;

      chain.splice(0, actionNodeIndex + 1);
      return;
    }

    // If `this.txn`, `this.app`, or `this.itxn`
    if (
      chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
      ['txn', 'app', 'itxn'].includes(chain[0].getNameNode().getText())
    ) {
      const op = chain[0].getNameNode().getText();

      // If the entire expression is simply `this.txn` which returns the current txn
      if (op === 'txn' && chain[1] === undefined) {
        this.push(chain[0], 'txn', { kind: 'base', type: 'txn' });
        chain.splice(0, 1);
        return;
      }

      // If the entire expression is simply `this.app` which returns the current app
      if (op === 'app' && chain[1] === undefined) {
        this.push(chain[0], 'txna Applications 0', ForeignType.Application);
        chain.splice(0, 1);
        return;
      }

      // If the expression is an app argument
      if (op === 'app') {
        // If the expression is `this.app.address`, then use `CurrentApplicationAddress` rather
        // than app_params_get (which would be handled later by processOpcodeImmediate if we didn't
        // return here)
        if (chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression) && chain[1].getNameNode().getText() === 'address') {
          this.push(chain[1], 'global CurrentApplicationAddress', ForeignType.Address);
          chain.splice(0, 2);
          return;
        }
        this.push(chain[0], 'txna Applications 0', ForeignType.Application);
        chain.splice(0, 1);
        return;
      }

      // Assume this is an param opcode (ie. `this.txn.sender` or `this.app.creator`)
      if (!chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression))
        throw Error(`Unsupported ${chain[1].getKindName()} ${chain[1].getText()}`);

      this.processOpcodeImmediate(
        chain[0],
        this.getTypeInfo(chain[0].getNameNode().getType()),
        chain[1].getNameNode().getText(),
        false,
        true
      );

      chain.splice(0, 2);
      return;
    }

    if (chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) && chain[1].isKind(ts.SyntaxKind.CallExpression)) {
      const methodName = chain[0].getNameNode().getText();
      this.processCallExpression(chain[1]);
      chain.splice(0, 2);
    }
  }

  private processCallExpression(node: ts.CallExpression) {
    this.addSourceComment(node);

    const expr = node.getExpression();
    let methodName: string;
    if (expr?.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
      methodName = expr.getNameNode().getText();
    } else if (expr?.isKind(ts.SyntaxKind.Identifier)) {
      methodName = expr.getText();

      // If this is a custom method
      if (this.customMethods[methodName] && this.customMethods[methodName].check(node)) {
        this.customMethods[methodName].fn(node);
        return;
      }

      // If this is an opcode
      if (langspec.Ops.map((o) => o.Name).includes(this.opcodeAliases[methodName] ?? methodName)) {
        this.processOpcode(node);
        return;
      }

      // If a txn method like sendMethodCall, sendPayment, etc.
      if (TXN_METHODS.includes(methodName)) {
        const { returnType, argTypes, name } = this.methodTypeArgsToTypes(node.getTypeArguments());

        this.processTransaction(node, methodName, node.getArguments()[0], argTypes, returnType, name);
        return;
      }

      if (this.subroutines.find((s) => s.name === methodName) === undefined) {
        const definition = expr.getDefinitionNodes()[0];
        if (!definition.isKind(ts.SyntaxKind.FunctionDeclaration)) throw Error();
        this.preProcessMethods([definition]);
        this.pendingSubroutines.push(definition);
      }
    } else throw new Error(`Invalid parent for call expression: ${expr?.getKindName()} ${expr?.getText()}`);

    const preArgsType = this.lastType;
    const subroutine = this.subroutines.find((s) => s.name === methodName);
    if (!subroutine) throw new Error(`Unknown subroutine ${methodName}`);

    new Array(...node.getArguments()).reverse().forEach((a, i) => {
      const prevTypeHint = this.typeHint;
      this.typeHint = subroutine.args[i].type;
      this.processNode(a);
      this.typeHint = prevTypeHint;
      if (this.lastType.kind === 'base' && this.lastType.type.startsWith('unsafe ')) {
        this.checkEncoding(a, this.lastType);
        if (isSmallNumber(this.lastType)) this.push(a, 'btoi', this.lastType);
      }
      typeComparison(this.lastType, subroutine.args[i].type);
    });

    this.lastType = preArgsType;
    const returnTypeStr = typeInfoToABIString(subroutine.returns.type);

    let returnType = subroutine.returns.type;
    if (returnTypeStr.match(/\d+$/) && !returnTypeStr.match(/^(uint|ufixed)64/)) {
      returnType = { kind: 'base', type: `unsafe ${returnTypeStr}` };
    }
    this.push(node, `callsub ${methodName}`, returnType);
    if (this.nodeDepth === 1 && !equalTypes(subroutine.returns.type, StackType.void)) this.pushVoid(node, 'pop');
  }

  private methodTypeArgsToTypes(typeArgs: ts.TypeNode[]) {
    let argTypes: TypeInfo[] = [];
    let name: string | undefined;

    if (typeArgs[0]?.isKind(ts.SyntaxKind.TupleType)) {
      argTypes = typeArgs[0].getElements().map((t) => {
        return this.getTypeInfo(t.getType());
      });
    } else if (typeArgs[0]) {
      const sig = typeArgs[0].getType().getCallSignatures()[0];
      argTypes = sig.getParameters().map((param) => this.getTypeInfo(param.getDeclarations()[0].getType()));
    }

    let returnType: TypeInfo = StackType.void;
    if (typeArgs[0]?.isKind(ts.SyntaxKind.TypeQuery)) {
      const sig = typeArgs![0].getType().getCallSignatures()[0];
      name = (sig.getDeclaration() as ts.MethodDeclaration).getName();
      returnType = this.getTypeInfo(sig.getReturnType());
    } else if (typeArgs[1]) {
      returnType = this.getTypeInfo(typeArgs[1].getType());
    }

    return { returnType, argTypes, name };
  }

  /**
   * Walks an expression chain and processes each node
   * @param node The node to process
   * @param newValue If we are setting the value of an array, the new value will be passed here
   */
  private processExpressionChain(node: ExpressionChainNode, newValue?: ts.Node) {
    // Check for forEach first because the chain is processed differently
    if (node.isKind(ts.SyntaxKind.CallExpression)) {
      const expr = node.getExpression();
      if (expr.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
        const methodName = expr.getNameNode().getText();

        if (methodName === 'forEach') {
          this.customMethods.forEach.fn(node);
          return;
        }
      }
    }

    const { base, chain } = this.getExpressionChain(node);

    if (base.isKind(ts.SyntaxKind.ParenthesizedExpression)) {
      if (!base.getExpression().isKind(ts.SyntaxKind.BinaryExpression))
        throw Error(`Unexpected parentheses around ${base.getExpression().getKindName()}`);
      this.processNode(base.getExpression());
    }

    this.addSourceComment(node);
    let storageBase: ts.PropertyAccessExpression | undefined;

    if (base.compilerNode.kind === ts.SyntaxKind.ThisKeyword) {
      // If the chain starts with a storage expression, then we need to handle it differently
      // than just an identifer when it comes to updating array values, so save it seperately here
      if (
        chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        chain[1] &&
        (chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression) || chain[1].isKind(ts.SyntaxKind.CallExpression)) &&
        this.storageProps[chain[0].getNameNode().getText()]
      ) {
        storageBase = (
          chain[1].isKind(ts.SyntaxKind.CallExpression) ? chain[2] : chain[1]
        ) as ts.PropertyAccessExpression;
      }
      this.processThisBase(chain, newValue);
    }

    /**
     * An array of objects used to access the base array.
     * For example, `myObj.foo[2]` -> `["myObj", ts.Node(2)]`
     * */
    const accessors: (string | ts.Expression)[] = [];

    if (base.isKind(ts.SyntaxKind.Identifier)) {
      if (base.getText() === 'blocks') {
        if (chain[0].isKind(ts.SyntaxKind.ElementAccessExpression)) {
          this.processNode(chain[0].getArgumentExpressionOrThrow());
          this.lastType = { kind: 'base', type: 'block' };
          chain.splice(0, 1);
        } else throw Error('Blocks must be accessed via array index');
      }
      if (base.getText() === 'OnCompletion') {
        if (chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          const oc = chain[0].getNameNode().getText() as OnComplete;

          this.pushVoid(chain[0], `int ${ON_COMPLETES.indexOf(oc)} // ${oc}`);

          chain.splice(0, 1);
        }
      }

      const classInfo = this.getClassInfo(base);

      if (classInfo?.type === 'contract') {
        if (chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          const propName = chain[0].getNameNode().getText();

          switch (propName) {
            case 'approvalProgram':
              if (!chain[1].isKind(ts.SyntaxKind.CallExpression))
                throw Error(`approvralProgram must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_APPROVAL: ${base.getText()}`, StackType.bytes);
              chain.splice(0, 2);
              break;
            case 'clearProgram':
              if (!chain[1].isKind(ts.SyntaxKind.CallExpression)) throw Error(`clearProgram must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_CLEAR: ${base.getText()}`, StackType.bytes);
              chain.splice(0, 2);
              break;
            case 'schema':
              if (!chain[1].isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();
              if (!chain[2].isKind(ts.SyntaxKind.PropertyAccessExpression)) throw Error();

              // eslint-disable-next-line no-case-declarations
              const globalOrLocal = chain[1].getNameNode().getText() === 'global' ? 'GLOBAL' : 'LOCAL';
              // eslint-disable-next-line no-case-declarations
              const uintOrBytes = chain[2].getNameNode().getText() === 'numUint' ? 'INT' : 'BYTES';
              this.push(
                chain[1],
                `PENDING_SCHEMA_${globalOrLocal}_${uintOrBytes}: ${base.getText()}`,
                StackType.uint64
              );
              chain.splice(0, 3);

              break;
            default:
              throw Error(`Unknown contract property ${propName}`);
          }
        }
      }

      if (classInfo?.type === 'lsig') {
        if (chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          const propName = chain[0].getNameNode().getText();

          switch (propName) {
            case 'program':
              if (!chain[1].isKind(ts.SyntaxKind.CallExpression)) throw Error(`program must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_LSIG: ${base.getText()}`, StackType.bytes);
              chain.splice(0, 2);
              break;
            case 'address':
              if (!chain[1].isKind(ts.SyntaxKind.CallExpression)) throw Error(`address must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_LSIG_ADDR: ${base.getText()}`, StackType.bytes);
              chain.splice(0, 2);
              break;
            default:
              throw Error(`Unknown lsig property ${propName}`);
          }
        }
      }

      const type = base.getType();

      if (type.isStringLiteral()) {
        this.push(base, `byte "${type.getLiteralValueOrThrow()}"`, StackType.bytes);
      }

      if (type.isNumberLiteral()) {
        this.push(base, `int ${type.getLiteralValueOrThrow()}`, StackType.uint64);
      }

      // If getting a txn type via the TransactionType enum
      if (base.getText() === 'TransactionType') {
        const enums: { [key: string]: string } = {
          Unknown: 'unknown',
          Payment: 'pay',
          KeyRegistration: 'keyreg',
          AssetConfig: 'acfg',
          AssetTransfer: 'axfer',
          AssetFreeze: 'afrz',
          ApplicationCall: 'appl',
        };

        if (!chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression))
          throw Error(`Unsupported ${chain[0].getKindName()} ${chain[0].getText()}`);
        const txType = chain[0].getNameNode().getText();

        if (!enums[txType]) throw new Error(`Unknown transaction type ${txType}`);
        this.push(node, `int ${enums[txType]}`, StackType.uint64);
        return;
      }

      // If this is a global variable
      if (base.getText() === 'globals') {
        if (!chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression))
          throw Error(`Unsupported ${chain[0].getKindName()} ${chain[0].getText()}`);
        this.processOpcodeImmediate(chain[0], { kind: 'base', type: 'global' }, chain[0].getNameNode().getText());
        chain.splice(0, 1);

        // If this is a custom method like `wideRatio`
      } else if (
        chain[0] &&
        chain[0].isKind(ts.SyntaxKind.CallExpression) &&
        this.customMethods[base.getText()] &&
        this.customMethods[base.getText()].check(chain[0])
      ) {
        const callNode = chain[0];
        this.customMethods[base.getText()].fn(callNode);

        chain.splice(0, 1);

        // If this is an opcode
      } else if (
        chain[0] &&
        chain[0].isKind(ts.SyntaxKind.CallExpression) &&
        langspec.Ops.map((o) => o.Name).includes(this.opcodeAliases[base.getText()] ?? base.getText())
      ) {
        this.processOpcode(chain[0]);
        chain.splice(0, 1);

        // If the base is a variable
      } else if (this.localVariables[base.getText()]) {
        const baseType = this.getTypeInfo(base.getType());

        const isStaticLength =
          baseType.kind === 'staticArray' &&
          chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression) &&
          chain[0].getName() === 'length';

        const frame = this.localVariables[base.getText()];

        // If this is a static array length, don't push array to stack since its not used
        if (isStaticLength) {
          this.lastType = baseType;
        }
        // else if this is an array reference, process the frame and get the accessors
        else if (frame && frame.index === undefined && !MULTI_OUTPUT_TYPES.includes(typeInfoToABIString(frame.type))) {
          const frameFollow = this.processFrame(chain[0].getExpression(), chain[0].getExpression().getText(), false);

          const { storageExpression } = frameFollow;

          // If this is a box with a static array, don't load the value here and use box_extract/replace later
          const isStaticBox =
            storageExpression &&
            storageExpression.isKind(ts.SyntaxKind.PropertyAccessExpression) &&
            getStorageName(storageExpression) &&
            this.storageProps[getStorageName(storageExpression)!] &&
            this.storageProps[getStorageName(storageExpression)!].type === 'box' &&
            !this.isDynamicType(this.storageProps[getStorageName(storageExpression)!].valueType) &&
            !typeInfoToABIString(this.storageProps[getStorageName(storageExpression)!].valueType).match('bool');

          if (!isStaticBox) {
            this.processFrame(chain[0].getExpression(), chain[0].getExpression().getText(), true);
          } else {
            this.lastType = this.storageProps[getStorageName(storageExpression)!].valueType;
          }

          frameFollow.accessors.forEach((e) => accessors.push(e));

          // otherwise just load the value
        } else {
          this.processNode(base);
        }
      }
    }

    // Check if this is a custom propertly like `zeroIndex`
    if (chain[0] && chain[0].isKind(ts.SyntaxKind.PropertyAccessExpression)) {
      const propName = chain[0].getNameNode().getText();
      if (this.customProperties[propName]?.check?.(chain[0])) {
        this.customProperties[propName].fn(chain[0]);
        chain.splice(0, 1);
      }
    }

    /** Saves the last accessor so it can be passed to processParentArrayAccess later */
    let lastAccessor: ts.Expression | undefined;

    // Iterate over the remaining unprocessed nodes in the chain and remove them once processed
    const remainingChain = chain.filter((n, i) => {
      // Skip if this is the propertyAccessExpression for a callExpression
      // For example, skip `this.txn.sender.hasAsset` when `this.txn.sender.hasAsset()` will be next
      if (chain[i + 1] && chain[i + 1].isKind(ts.SyntaxKind.CallExpression)) return false;
      this.addSourceComment(n);

      // If accessing a specific byte in a string/byteslice
      if (isBytes(this.lastType) && n.isKind(ts.SyntaxKind.ElementAccessExpression)) {
        this.processNode(n.getArgumentExpression()!);
        this.pushLines(n, 'int 1', 'extract3');
        this.lastType = { kind: 'base', type: 'byte' };
        return false;
      }

      // If accessing an array
      if (
        isArrayType(this.lastType) &&
        (n.isKind(ts.SyntaxKind.ElementAccessExpression) || n.isKind(ts.SyntaxKind.PropertyAccessExpression))
      ) {
        // If this is a index into an array ie. `arr[0]`
        if (n.isKind(ts.SyntaxKind.ElementAccessExpression)) accessors.push(n.getArgumentExpression()!);
        // If this is a property in an object ie. `myObj.foo`
        if (n.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          const name = n.getName();
          const childType = this.getTypeInfo(n.getChildAtIndex(0).getType());

          if (Object.keys(this.customProperties).includes(name)) {
            const prevLastType = this.lastType;
            this.lastType = childType;
            const passCheck = this.customProperties[name].check(n);
            this.lastType = prevLastType;

            const hasNameAsProp = childType.kind === 'object' && childType.properties[name] !== undefined;
            const isLengthOfStaticArray = childType.kind === 'staticArray' && name === 'length';
            if (!hasNameAsProp && passCheck) {
              if (!isLengthOfStaticArray) {
                this.processParentArrayAccess(lastAccessor!, accessors, storageBase || base);
              } else this.lastType = childType;

              this.customProperties[name].fn(n);
              accessors.length = 0;

              return false;
            }
          }
          accessors.push(n.getNameNode().getText());
        }

        lastAccessor = n;

        const newValueValue = i === chain.length - 1 ? newValue : undefined;

        const accessedType = this.getStackTypeAfterFunction(() => {
          this.processParentArrayAccess(lastAccessor!, accessors.slice(), storageBase || base, newValueValue);
        });

        if (!isArrayType(accessedType)) {
          this.processParentArrayAccess(lastAccessor!, accessors, storageBase || base, newValueValue);

          accessors.length = 0;
        }

        return false;
      }

      if (n.isKind(ts.SyntaxKind.CallExpression)) {
        const expr = n.getExpression();
        if (!expr.isKind(ts.SyntaxKind.PropertyAccessExpression))
          throw Error(`Unsupported ${n.getKindName()}: ${n.getText()}`);

        const methodName = expr.getNameNode().getText();

        // If this is a custom method
        if (this.customMethods[methodName]?.check?.(n)) {
          this.customMethods[methodName].fn(n);
          accessors.length = 0;
          return false;
        }

        // Otherwise assume it's an opcode method ie. `this.app.address.hasAsset(123)`
        const preArgsType = this.lastType;
        n.getArguments().forEach((a) => this.processNode(a));
        this.lastType = preArgsType;
        this.processOpcodeImmediate(n, this.lastType, methodName);
        return false;
      }

      // If this is a property access expression assume it's an opcode param
      if (n.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
        if (MULTI_OUTPUT_TYPES.includes(typeInfoToABIString(this.lastType))) {
          const parent = n.getExpressionIfKindOrThrow(ts.SyntaxKind.Identifier);
          const parentName = parent.getText();
          const frameName = this.processFrame(parent, parentName, false).name;
          this.frameDig(n, `${frameName} ${n.getName()}`);
          return false;
        }

        // Check if this is a custom propertly like `zeroIndex`
        if (n.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          const propName = n.getNameNode().getText();
          if (this.customProperties[propName]?.check?.(n)) {
            this.customProperties[propName].fn(n);
            return false;
          }
        }

        if (chain[i + 1] && chain[i + 1].isKind(ts.SyntaxKind.CallExpression)) return false;
        this.processOpcodeImmediate(n, this.lastType, n.getNameNode().getText());
        return false;
      }

      const lastTypeStr = typeInfoToABIString(this.lastType);

      // Handle the case when an imediate array index is needed ie. txna ApplicationArgs i
      if (lastTypeStr.startsWith('ImmediateArray:')) {
        if (n.getArgumentExpression()?.isKind(ts.SyntaxKind.NumericLiteral)) {
          this.push(n, `${this.teal[this.currentProgram].pop()!.teal} ${n.getArgumentExpression()?.getText()}`, {
            kind: 'base',
            type: lastTypeStr.replace('ImmediateArray: ', ''),
          });
        } else if (n.getArgumentExpression()) {
          const opcode = `${this.teal[this.currentProgram].at(-1)!.teal}`.split(' ')[0];
          const field = `${this.teal[this.currentProgram].at(-1)!.teal}`.split(' ')[1];
          this.teal[this.currentProgram].pop();

          this.processNode(n.getArgumentExpression()!);
          this.push(n, `${opcode}as ${field}`, {
            kind: 'base',
            type: lastTypeStr.replace('ImmediateArray: ', ''),
          });
        }

        return false;
      }

      return true;
    });

    // Process the array access if there are array access elements
    if (accessors.length) {
      this.processParentArrayAccess(lastAccessor!, accessors, storageBase || base, newValue);
    }

    if (remainingChain.length)
      throw Error(
        `LastType: ${typeInfoToABIString(
          this.lastType
        )} | Base (${base.getKindName()}): ${base.getText()} | Chain: ${chain.map((n) => n.getText())}`
      );
  }

  private processSubroutine(fn: ts.MethodDeclaration | ts.FunctionDeclaration) {
    const frameStart = this.teal[this.currentProgram].length;
    this.currentSubroutine = this.subroutines.find((s) => s.name === fn.getNameNode()?.getText())!;

    const sigParams = fn
      .getSignature()
      .getParameters()
      .map((p) => p.getDeclarations()[0].getText());

    const returnTypeString = fn.getReturnTypeNode()?.getText() || 'void';
    const headerComment = [`// ${fn.getName()}(${sigParams.join(', ')}): ${returnTypeString}`];

    if (this.currentSubroutine.desc !== '') {
      headerComment.push('//');
      const descLines = this.currentSubroutine.desc.split('\n');
      descLines.forEach((line, i) => {
        const newLine = line
          .trim()
          .replace(/^\/\*\*/, '')
          .replace(/\*\/$/, '')
          .replace(/^\*/, '');
        if (newLine.trim() !== '' || !(i === 0 || i === descLines.length - 1))
          headerComment.push(`// ${newLine.trim()}`);
      });
    }

    while (headerComment.at(-1) === '// ') headerComment.pop();

    this.pushLines(fn, ...headerComment);

    this.pushVoid(fn, `${this.currentSubroutine.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.localVariables));
    this.localVariables = {};

    this.pushLines(fn, `PENDING_PROTO: ${this.currentSubroutine.name}`);

    let argIndex = -1;
    const params = new Array(...fn.getParameters());
    params.forEach((p) => {
      if (p.getTypeNode() === undefined) throw new Error();

      const type = this.getTypeInfo(p.getTypeNode()!.getType());

      this.localVariables[p.getNameNode().getText()] = {
        index: argIndex,
        type,
        typeString: p.getTypeNode()!.getText(),
      };
      argIndex -= 1;
    });

    this.frameIndex = 0;
    this.processNode(fn.getBodyOrThrow());

    const currentTeal = this.teal[this.currentProgram];
    const returnBranch = `*${this.currentSubroutine.name}*return`;

    if (currentTeal.at(-1)?.teal === `b ${returnBranch}`) {
      currentTeal.pop();
    }

    if (currentTeal.map((t) => t.teal).includes(`b ${returnBranch}`)) {
      this.pushLines(this.currentSubroutine.node, `${returnBranch}:`);
    }

    if (returnTypeString !== 'void' && this.frameIndex > 0) {
      this.pushLines(this.currentSubroutine.node, '// set the subroutine return value', 'frame_bury 0');

      if (this.frameIndex > 1) {
        this.pushLines(
          this.currentSubroutine.node,
          '// pop all local variables from the stack',
          `popn ${this.frameIndex - 1}`
        );
      }
    }

    this.pushVoid(this.currentSubroutine.node, 'retsub');

    this.frameInfo[this.currentSubroutine.name] = {
      start: frameStart,
      end: this.teal[this.currentProgram].length,
      frame: {},
    };

    const currentFrame = this.localVariables;
    const currentFrameInfo = this.frameInfo[this.currentSubroutine.name];

    Object.keys(this.localVariables).forEach((name) => {
      currentFrameInfo.frame[currentFrame[name].index!] = { name, type: currentFrame[name].type };
    });

    this.localVariables = lastFrame;
    this.frameSize[this.currentSubroutine.name] = this.frameIndex;
  }

  private processClearState(fn: ts.MethodDeclaration) {
    if (this.clearStateCompiled) throw Error('duplicate clear state decorator defined');

    this.currentProgram = 'clear';
    if (fn.getParameters().length > 0) throw Error('clear state cannot have parameters');
    this.processNode(fn.getBodyOrThrow());
    this.pushLines(fn.getBodyOrThrow(), 'int 1', 'return');
    this.clearStateCompiled = true;
    this.currentProgram = 'approval';
  }

  private overflowCheck(node: ts.Node, width: number) {
    if (this.disableOverflowChecks) return;

    this.pushLines(node, 'dup', 'bitlen', `int ${width}`, '<=');

    if (node.isKind(ts.SyntaxKind.MethodDeclaration)) {
      this.pushVoid(node, 'assert', `${node.getName()} return value overflowed ${width} bits`);
    } else this.pushVoid(node, 'assert', `${node.getText().replace(/\n/g, '\\n')} overflowed ${width} bits`);
  }

  private processRoutableMethod(fn: ts.MethodDeclaration) {
    if (this.currentSubroutine.allows.call.includes('ClearState') || this.currentSubroutine.name === 'clearState') {
      this.processClearState(fn);
      return;
    }

    this.pushVoid(fn, `// ${this.getSignature(fn)}`);
    if (this.currentProgram !== 'lsig') {
      this.pushLines(fn, `*abi_route_${this.currentSubroutine.name}:`);
    } else {
      this.pushLines(fn, `*route_${this.currentSubroutine.name}:`);
    }

    const returnType = this.currentSubroutine.returns.type;
    const returnTypeStr = typeInfoToABIString(this.currentSubroutine.returns.type)
      .replace(/asset|application/, 'uint64')
      .replace('account', 'address');

    if (returnTypeStr !== 'void') this.pushLines(fn, '// The ABI return prefix', 'byte 0x151f7c75');

    const argCount = fn.getParameters().length;

    const args: { name: string; type: TypeInfo; desc: string }[] = [];

    let nonTxnArgCount =
      argCount - fn.getParameters().filter((p) => p.getTypeNode()?.getText().includes('Txn')).length + 1;
    let gtxnIndex = 0;

    new Array(...fn.getParameters()).reverse().forEach((p, i) => {
      let type = this.getTypeInfo(p!.getTypeNode()!.getType());

      if (p.getTypeNode()?.getText() === 'Account') {
        type = { kind: 'base', type: 'account' };
      }
      const typeStr = typeInfoToABIString(type);

      this.pushVoid(p, `// ${p.getNameNode().getText()}: ${typeStr}`);

      if (!TXN_TYPES.includes(typeStr)) {
        if (this.currentProgram === 'lsig') this.pushLines(p, `int ${(nonTxnArgCount -= 1) - 1}`, 'args');
        else this.pushVoid(p, `txna ApplicationArgs ${(nonTxnArgCount -= 1)}`);
      }

      if (isRefType(type)) {
        if (this.currentProgram === 'lsig') {
          if (['appreference', 'assetreference'].includes(typeStr)) this.pushVoid(p, 'btoi');
        } else {
          this.pushVoid(p, 'btoi');
          this.pushVoid(p, `txnas ${capitalizeFirstChar(typeStr)}s`);
        }
      } else if (TXN_TYPES.includes(typeStr)) {
        this.pushVoid(p, 'txn GroupIndex');
        this.pushVoid(p, `int ${(gtxnIndex += 1)}`);
        this.pushVoid(p, '-');
        if (typeStr !== 'txn') {
          this.pushLines(p, 'dup', 'gtxns TypeEnum', `int ${typeStr}`, '==');
          this.pushVoid(
            p,
            'assert',
            `argument ${i} (${p.getNameNode().getText()}) for ${
              this.currentSubroutine.name
            } must be a ${typeStr} transaction`
          );
        }
      } else if (!this.isDynamicType(type) && typeStr !== 'uint64') {
        this.pushLines(p, 'dup', 'len', `int ${typeStr === 'bool' ? 1 : this.getTypeLength(type)}`, '==');
        this.pushVoid(
          p,
          'assert',
          `argument ${i} (${p.getNameNode().getText()}) for ${this.currentSubroutine.name} must be a ${typeStr}`
        );
      }

      if (!isRefType(type)) this.checkDecoding(p, type);

      args.push({
        name: p.getNameNode().getText(),
        type,
        desc: '',
      });
    });

    // Only add an ABI method if it allows any non-bare OnComplete calls
    const currentAllows = Object.values(this.currentSubroutine.allows).flat();
    if (currentAllows.length > 0) {
      this.abi.methods.push({
        name: this.currentSubroutine.name,
        readonly: this.currentSubroutine.readonly || undefined,
        args: args.reverse(),
        desc: '',
        returns: { type: returnType, desc: '' },
        events: this.currentSubroutine.events,
      });
    }

    this.pushVoid(fn, `// execute ${this.getSignature(this.currentSubroutine.node)}`);
    this.pushVoid(fn, `callsub ${this.currentSubroutine.name}`);

    if (returnTypeStr.match(/\d+$/) && !returnTypeStr.match(/^(uint|ufixed)64/)) {
      this.lastType = { kind: 'base', type: `unsafe ${returnTypeStr}` };
      this.checkEncoding(fn, this.lastType);
    } else this.checkEncoding(fn, returnType);

    if (!equalTypes(returnType, StackType.void)) this.pushLines(fn, 'concat', 'log');
    this.pushLines(fn, 'int 1', 'return');
    this.processSubroutine(fn);
  }

  private opcodeAliases: Record<string, string> = {
    extractUint16: 'extract_uint16',
    extractUint32: 'extract_uint32',
    extractUint64: 'extract_uint64',
    ed25519VerifyBare: 'ed25519verify_bare',
    ed25519Verify: 'ed25519verify',
    vrfVefiry: 'vrf_verify',
    ecScalarMul: 'ec_scalar_mul',
    ecPairingCheck: 'ec_pairing_check',
    ecMultiScalarMul: 'ec_multi_scalar_mul',
    ecSubgroupCheck: 'ec_subgroup_check',
    ecMapTo: 'ec_map_to',
    ecAdd: 'ec_add',
    base64Decode: 'base64_decode',
    jsonRef: 'json_ref',
    ecdsaVerify: 'ecdsa_verify',
    ecdsaPkDecompress: 'ecdsa_pk_decompress',
    ecdsaPkRecover: 'ecdsa_pk_recover',
    onlineStake: 'online_stake',
  };

  private processOpcode(node: ts.CallExpression) {
    const nodeText = node.getExpression().getText();

    const opcodeName = this.opcodeAliases[nodeText] ?? nodeText;

    if (opcodeName === 'assert') {
      const args = node.getArguments();
      this.processNode(args[0]);

      const errorMessage = args[1]?.getType().isStringLiteral()
        ? args[1].getType().getLiteralValueOrThrow().valueOf().toString()
        : undefined;

      this.pushVoid(node, 'assert', errorMessage);

      return;
    }

    if (opcodeName === 'sqrt') {
      this.processNode(node.getArguments()[0]);
      const type = this.lastType;
      const opcode = isNumeric(type) ? 'sqrt' : 'bsqrt';

      this.pushVoid(node, opcode);

      if (!isNumeric(type) && type.kind === 'base' && !type.type.startsWith('unsafe ')) {
        this.lastType = { kind: 'base', type: `unsafe ${type.type}` };
      }

      return;
    }

    if (this.currentProgram === 'lsig' && opcodeName === 'log') {
      throw Error('Logic signatures cannot log data');
    }

    const opSpec = langspec.Ops.find((o) => o.Name === opcodeName)!;
    let line: string[] = [opcodeName];

    const declaration = node.getExpression()?.getType()?.getCallSignatures()?.[0]?.getDeclaration();

    const argTypes: ts.Type[] = [];
    if (declaration?.isKind(ts.SyntaxKind.FunctionDeclaration)) {
      declaration.getParameters().forEach((p) => argTypes.push(p.getType()));
    }

    if (opSpec.Size === 1) {
      const preArgsType = this.lastType;
      node.getArguments().forEach((a, i) => {
        this.processNode(a);
        if (declaration) typeComparison(this.lastType, this.getTypeInfo(argTypes[i]));
      });
      this.lastType = preArgsType;
    } else if (opSpec.Size === 0) {
      line = line.concat(node.getArguments().map((a) => a.getText()));
    } else {
      node
        .getArguments()
        .slice(opSpec.Size - 1)
        .forEach((a, i) => {
          this.processNode(a);
          if (declaration) typeComparison(this.lastType, this.getTypeInfo(argTypes[i + opSpec.Size - 1]));
        });

      line = line.concat(
        node
          .getArguments()
          .slice(0, opSpec.Size - 1)
          .map((immediateArg) => {
            const immediateArgType = immediateArg.getType();

            if (immediateArgType.isStringLiteral()) {
              return immediateArgType.getLiteralValueOrThrow().valueOf() as string;
            }
            if (immediateArgType.isNumberLiteral()) {
              return immediateArgType.getLiteralValueOrThrow().valueOf().toString();
            }

            throw Error(`Cannot process ${immediateArg.getText()} as immediate argument`);
          })
      );
    }

    let returnTypeStr = opSpec.Returns?.at(-1)?.replace(/\[\d*\]byte/, 'bytes') || 'void';

    if (opSpec.Name.endsWith('256')) returnTypeStr = 'byte[32]';

    let returnType: TypeInfo;

    if (returnTypeStr.endsWith('[]')) {
      returnType = { kind: 'dynamicArray', base: { kind: 'base', type: returnTypeStr.replace('[]', '') } };
    } else if (returnTypeStr.match(/\[\d+\]$/)) {
      returnType = {
        kind: 'staticArray',
        length: Number(returnTypeStr.match(/\d+/)![0]),
        base: { kind: 'base', type: returnTypeStr.replace(/\[\d+\]$/, '') },
      };
    } else {
      returnType = { kind: 'base', type: returnTypeStr } as TypeInfo;
    }

    if (equalTypes(returnType, StackType.any)) returnType = this.getTypeInfo(node.getType());

    this.push(node.getExpression(), line.join(' '), returnType);

    const returnTypeInfo = this.getTypeInfo(node.getReturnType());

    if (opcodeName === 'vrf_verify') {
      const parent = node.getParent();
      if (!parent?.isKind(ts.SyntaxKind.VariableDeclaration)) {
        throw Error(`${opcodeName} output must be assigned to a variable before usage`);
      }
      const name = parent.getName();

      const verified = `${name} verified`;
      const output = `${name} output`;

      this.initialFrameBury(node, verified, { kind: 'base', type: 'bool' }, `${verified}: bool`);
      this.initialFrameBury(node, output, StackType.bytes, `${output}: byte[]`);

      this.lastType = returnTypeInfo;
    }

    if (['mulw', 'addw', 'expw'].includes(opcodeName)) {
      const parent = node.getParent();
      if (!parent?.isKind(ts.SyntaxKind.VariableDeclaration)) {
        throw Error(`${opcodeName} output must be assigned to a variable before usage`);
      }
      const name = parent.getName();

      const low = `${name} low`;
      const high = `${name} high`;

      this.initialFrameBury(node, low, StackType.uint64, `${low}: uint64`);
      this.initialFrameBury(node, high, StackType.uint64, `${high}: uint64`);

      this.lastType = returnTypeInfo;
    }

    if (opcodeName === 'divmodw') {
      const parent = node.getParent();
      if (!parent?.isKind(ts.SyntaxKind.VariableDeclaration)) {
        throw Error(`${opcodeName} output must be assigned to a variable before usage`);
      }
      const name = parent.getName();

      const quotientLow = `${name} quotientLow`;
      const quotientHigh = `${name} quotientHigh`;
      const remainderHigh = `${name} remainderHigh`;
      const remainderLow = `${name} remainderLow`;

      this.initialFrameBury(node, remainderLow, StackType.uint64, `${remainderLow}: uint64`);
      this.initialFrameBury(node, remainderHigh, StackType.uint64, `${remainderHigh}: uint64`);
      this.initialFrameBury(node, quotientLow, StackType.uint64, `${quotientLow}: uint64`);
      this.initialFrameBury(node, quotientHigh, StackType.uint64, `${quotientHigh}: uint64`);

      this.lastType = returnTypeInfo;
    }

    if (returnTypeInfo.kind === 'base' && returnTypeInfo.type === 'ecdsa pubkey') {
      const parent = node.getParent();
      if (!parent?.isKind(ts.SyntaxKind.VariableDeclaration)) {
        throw Error(`${opcodeName} output must be assigned to a variable before usage`);
      }
      const name = parent.getName();

      const x = `${name} x`;
      const y = `${name} y`;

      this.initialFrameBury(node, y, StackType.bytes, `${y} component: byte[]`);
      this.initialFrameBury(node, x, StackType.bytes, `${x} component: byte[]`);

      this.lastType = returnTypeInfo;
    }
  }

  private initialFrameBury(node: ts.Node, name: string, type: TypeInfo, comment?: string) {
    const defaultComment = `${name}: ${typeInfoToABIString(type)}`;
    // Save box key
    this.localVariables[name] = {
      index: this.frameIndex,
      type,
      typeString: typeInfoToABIString(type),
      comment,
    };
    this.pushVoid(node, `frame_bury ${this.frameIndex} // ${comment ?? defaultComment}`);
    this.frameIndex += 1;
  }

  private frameBury(node: ts.Node, name: string) {
    const frame = this.localVariables[name];
    if (!frame) throw Error(`Unknown variable ${name}`);

    typeComparison(this.lastType, frame.type, true);

    const defaultComment = `${name}: ${typeInfoToABIString(this.lastType)}`;

    this.pushVoid(node, `frame_bury ${frame.index} // ${frame.comment ?? defaultComment}`);
  }

  private frameDig(node: ts.Node, name: string) {
    const frame = this.localVariables[name];
    if (!frame) throw Error(`Unknown variable ${name}`);

    this.pushVoid(node, `frame_dig ${frame.index} // ${frame.comment ?? name}`);
    this.lastType = frame.type;
  }

  private processTransaction(
    node: ts.Node,
    name: string,
    fields: ts.Node,
    argTypes: TypeInfo[],
    returnType: TypeInfo,
    methodName?: string
  ) {
    const argTypeStrings = argTypes.map((t) => typeInfoToABIString(t));

    if (this.currentProgram === 'clear') throw Error('Inner transactions not allowed in clear state program');
    if (this.currentProgram === 'lsig') throw Error('Inner transaction not allowed in logic signatures');

    if (!fields.isKind(ts.SyntaxKind.ObjectLiteralExpression))
      throw new Error('Transaction fields must be an object literal');

    const method = name.replace('this.pendingGroup.', '').replace(/^(add|send|Inner)/, '');
    const send = name.startsWith('send');
    if (name.startsWith('add')) {
      this.innerTxnHasBegun = true;
    } else if (name.startsWith('send')) {
      this.innerTxnHasBegun = false;
    }

    let txnType = '';

    fields.getProperties().forEach((p) => {
      if (!p.isKind(ts.SyntaxKind.PropertyAssignment)) throw Error();
      const key = p.getNameNode()?.getText();

      if (key === 'isFirstTxn') {
        this.innerTxnHasBegun = false;
        return;
      }

      if (key === 'methodArgs') {
        const init = p.getInitializer();
        if (!init?.isKind(ts.SyntaxKind.ArrayLiteralExpression)) throw new Error('methodArgs must be an array');

        init.getElements().forEach((e, i: number) => {
          if (TXN_TYPES.includes(argTypeStrings[i]) || TXN_TYPES.includes(argTypeStrings[i].replace('generic ', ''))) {
            let innerArgs: TypeInfo[] = [];
            let innerMethodReturnType: TypeInfo = StackType.void;
            const argType = argTypes[i];

            if (argType.kind === 'method') {
              innerArgs = argType.args;
              innerMethodReturnType = argType.returns;
            }
            this.processTransaction(e, argTypeStrings[i], e, innerArgs, innerMethodReturnType);
          }
        });
      }
    });

    /*
declare type AssetFreezeTxn = Required<AssetFreezeParams>;
    */

    switch (method.replace('generic ', '')) {
      case 'pay':
      case 'Payment':
        txnType = TransactionType.PaymentTx;
        break;
      case 'axfer':
      case 'AssetTransfer':
        txnType = TransactionType.AssetTransferTx;
        break;
      case 'appl':
      case 'MethodCall':
      case 'AppCall':
        txnType = TransactionType.ApplicationCallTx;
        break;
      case 'acfg':
      case 'AssetCreation':
      case 'AssetConfig':
        txnType = TransactionType.AssetConfigTx;
        break;
      case 'afrz':
      case 'AssetFreeze':
        txnType = TransactionType.AssetFreezeTx;
        break;
      case 'keyreg':
      case 'OfflineKeyRegistration':
      case 'OnlineKeyRegistration':
        txnType = TransactionType.KeyRegistrationTx;
        break;
      default:
        throw new Error(`Invalid transaction call ${name}`);
    }

    this.pushVoid(node, this.innerTxnHasBegun ? 'itxn_next' : 'itxn_begin');
    if (this.innerTxnHasBegun === false) this.innerTxnHasBegun = true;
    this.pushVoid(node, `int ${txnType}`);
    this.pushVoid(node, 'itxn_field TypeEnum');

    const nameProp = fields
      .getProperties()
      .find((p) => p.isKind(ts.SyntaxKind.PropertyAssignment) && p.getNameNode()?.getText() === 'name');

    const argTypeStringsWithTxn = argTypeStrings.map((t) => (t.startsWith('generic ') ? 'txn' : t));

    if (nameProp && txnType === TransactionType.ApplicationCallTx) {
      if (
        !nameProp.isKind(ts.SyntaxKind.PropertyAssignment) ||
        !nameProp.getInitializer()!.isKind(ts.SyntaxKind.StringLiteral)
      )
        throw new Error('Method call name key must be a string');

      this.pushVoid(
        nameProp,
        `method "${(nameProp.getInitializer()! as ts.StringLiteral).getLiteralText()}(${argTypeStringsWithTxn.join(
          ','
        )})${typeInfoToABIString(returnType, true)}"`
      );
      this.pushVoid(nameProp, 'itxn_field ApplicationArgs');
    } else if (methodName) {
      this.pushVoid(
        node,
        `method "${methodName}(${argTypeStringsWithTxn
          .join(',')
          // any[] is used for default lifecycle methods, which we want to remove
          .replace('any[]', '')})${typeInfoToABIString(returnType, true)}"`
      );
      this.pushVoid(node, 'itxn_field ApplicationArgs');
    }

    fields.getProperties().forEach((p) => {
      if (!p.isKind(ts.SyntaxKind.PropertyAssignment)) throw Error();
      const key = p.getNameNode()?.getText();
      const init = p.getInitializer();

      if (key === undefined) throw new Error('Key must be defined');

      if (key === 'isFirstTxn') return;

      if (key === 'name' && txnType === TransactionType.ApplicationCallTx) {
        return;
      }

      this.addSourceComment(p, true);
      this.pushComments(p);

      if (
        (key === 'approvalProgram' || key === 'clearStateProgram') &&
        init?.isKind(ts.SyntaxKind.ArrayLiteralExpression)
      ) {
        init.getElements().forEach((e) => {
          this.processNode(e);
          this.pushVoid(e, `itxn_field ${capitalizeFirstChar(key)}Pages`);
        });
      } else if (key === 'onCompletion') {
        if (!p.isKind(ts.SyntaxKind.PropertyAssignment) || !init?.isKind(ts.SyntaxKind.PropertyAccessExpression)) {
          throw new Error('Must use OnCompletion enum');
        }

        const oc = init.getNameNode().getText() as OnComplete;
        this.pushVoid(p.getInitializer()!, `int ${ON_COMPLETES.indexOf(oc)} // ${oc}`);
        this.pushVoid(p, 'itxn_field OnCompletion');
      } else if (key === 'methodArgs') {
        let accountIndex = 1;
        let appIndex = 1;
        let assetIndex = 0;

        if (!p.isKind(ts.SyntaxKind.PropertyAssignment) || !init?.isKind(ts.SyntaxKind.ArrayLiteralExpression)) {
          throw new Error('methodArgs must be an array');
        }
        init.getElements().forEach((e, i: number) => {
          if (argTypeStrings[i] === 'account') {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Accounts');
            this.pushVoid(e, `int ${accountIndex}`);
            this.pushVoid(e, 'itob');
            accountIndex += 1;
          } else if (argTypeStrings[i] === 'asset') {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Assets');
            this.pushVoid(e, `int ${assetIndex}`);
            this.pushVoid(e, 'itob');
            assetIndex += 1;
            // if it's an appl but NOT a method call
          } else if (argTypeStrings[i] === 'appl' && !e.isKind(ts.SyntaxKind.ObjectLiteralExpression)) {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Applications');
            this.pushVoid(e, `int ${appIndex}`);
            this.pushVoid(e, 'itob');
            appIndex += 1;
          } else if (argTypeStrings[i] === 'uint64') {
            this.processNode(e);
            typeComparison(this.lastType, argTypes[i]);
            this.pushVoid(e, 'itob');
          } else if (
            TXN_TYPES.includes(argTypeStrings[i]) ||
            TXN_TYPES.includes(argTypeStrings[i].replace('generic ', ''))
          ) {
            return;
          } else {
            const prevTypeHint = this.typeHint;
            this.typeHint = argTypes[i];
            this.processNode(e);
            this.checkEncoding(e, argTypes[i]);
            this.typeHint = prevTypeHint;
          }
          this.pushVoid(e, 'itxn_field ApplicationArgs');
        });
      } else if (p.isKind(ts.SyntaxKind.PropertyAssignment) && init?.isKind(ts.SyntaxKind.ArrayLiteralExpression)) {
        init.getElements().forEach((e) => {
          this.processNode(e);
          this.pushVoid(e, `itxn_field ${capitalizeFirstChar(key)}`);
        });
      } else if (p.isKind(ts.SyntaxKind.PropertyAssignment)) {
        this.processNode(p.getInitializer()!);
        this.pushVoid(p, `itxn_field ${capitalizeFirstChar(key)}`);
      }
    });

    if (
      !fields
        .getProperties()
        .map((p) => p.isKind(ts.SyntaxKind.PropertyAssignment) && p.getNameNode()?.getText())
        .includes('fee')
    ) {
      this.pushLines(node, '// Fee field not set, defaulting to 0', 'int 0', 'itxn_field Fee');
    }

    if (send) {
      this.pushLines(node, '// Submit inner transaction', 'itxn_submit');

      if (name === 'sendMethodCall' && typeInfoToABIString(returnType) !== 'void') {
        this.pushLines(node, 'itxn NumLogs', 'int 1', '-', 'itxnas Logs', 'extract 4 0');
        this.checkDecoding(node, returnType);
        this.lastType = returnType;
      } else if (name === 'sendAssetCreation') {
        this.push(node, 'itxn CreatedAssetID', ForeignType.Asset);
      }
    }
  }

  /*
    Processes an immediate argument to TEAL opcodes
    For example, "this.txn.sender -> txn Sender"
  */
  private processOpcodeImmediate(
    node: ts.Node,
    calleeType: TypeInfo,
    name: string,
    checkArgs: boolean = false,
    thisTxn: boolean = false
  ): void {
    const type = calleeType;

    let typeStr = typeInfoToABIString(type);

    if (type.kind === 'base') {
      if (['assetid', 'assetreference'].includes(type.type)) typeStr = 'asset';
      if (['appid', 'appreference'].includes(type.type)) typeStr = 'application';
      if (['address', 'accountreference'].includes(type.type)) typeStr = 'account';
    }

    if (TXN_TYPES.includes(typeStr) && !thisTxn) {
      typeStr = 'gtxns';
    }

    if (typeStr === 'account') {
      if (name === 'isOptedInToApp') {
        this.pushLines(node, 'app_opted_in');
        this.lastType = { kind: 'base', type: 'bool' };
        return;
      }
    }

    if (!['isInLedger', 'isOptedInToAsset'].includes(name)) {
      if (this.OP_PARAMS[typeStr] === undefined) {
        throw Error(`Unknown or unsupported method: ${node.getText()} for type ${typeStr}`);
      }

      const paramObj = this.OP_PARAMS[typeStr].find((p) => {
        let paramName = p.name.replace(/^Acct/, '').replace(/^Blk/, '');

        if (['asset', 'application', 'account', 'itxn'].includes(typeStr) && this.currentProgram === 'lsig') {
          throw Error(`Cannot access ${capitalizeFirstChar(typeStr)} parameters in logic signature`);
        }

        if (typeStr === 'application') paramName = paramName.replace(/^App/, '');
        if (typeStr === 'asset') paramName = paramName.replace(/^Asset/, '');
        return paramName === capitalizeFirstChar(name);
      });

      if (typeStr === 'account' && name === 'voterBalance') {
        this.push(node, 'voter_params_get VoterBalance', StackType.uint64);
        return;
      }

      if (typeStr === 'account' && name === 'voterIncentiveEligible') {
        this.push(node, 'voter_params_get VoterIncentiveEligible', StackType.uint64);
        return;
      }

      if (!paramObj) throw new Error(`Unknown or unsupported method: ${node.getText()} for ${typeStr}`);

      if (!checkArgs || paramObj.args === 1) {
        paramObj.fn(node);
      }
      return;
    }

    switch (name) {
      case 'isInLedger':
        this.hasMaybeValue(node, 'acct_params_get AcctBalance');
        return;
      case 'isOptedInToAsset':
        if (!checkArgs) {
          this.hasMaybeValue(node, 'asset_holding_get AssetBalance');
        }
        return;
      default:
        throw new Error(`Unknown method: ${type}.${name}`);
    }
  }

  async algodCompile(): Promise<void> {
    if (this.currentProgram === 'lsig') {
      await this.algodCompileProgram('lsig');
      return;
    }

    await this.algodCompileProgram('approval');
    await this.algodCompileProgram('clear');
  }

  async algodCompileProgram(program: 'approval' | 'clear' | 'lsig'): Promise<{ result: string; hash: string }> {
    let dynamicTemplateWarning = false;
    const body = this.teal[program]
      .map((t) => t.teal)
      .map((t) => {
        // Replace template variables
        if (t.startsWith('bytecblock') || t.startsWith('intcblock')) {
          const newArgs = t.split(' ').map((arg) => {
            const tVar = Object.values(this.templateVars).find((v) => v.name === arg.replace(/^TMPL_/, ''));

            if (tVar === undefined) return arg;

            if (this.isDynamicType(tVar.type) || isNumeric(tVar.type)) {
              if (program === 'lsig' || (program === 'approval' && !dynamicTemplateWarning)) {
                // eslint-disable-next-line no-console
                console.warn(
                  `WARNING: Due to dynamic template variable type for ${tVar.name} (${typeInfoToABIString(
                    tVar.type
                  )}) PC values will be offset from first opcode after constant blocks. This will be handled by algokit clients, but ARC56 has a minimal reference implementation available for scenarios where algokit is not being used: https://github.com/joe-p/ARCs/blob/extended_app_description/ARCs/arc-0056.md#calculating-cblock-offsets`
                );

                this.hasDynamicTemplateVar = true;
                dynamicTemplateWarning = true;
              }

              return isNumeric(tVar.type) ? '0' : '0x';
            }

            return `0x${'00'.repeat(this.getTypeLength(tVar.type))}`;
          });

          return newArgs.join(' ');
        }

        // Remove comments to avoid taking up space in the request body
        if (t.startsWith('//')) {
          return '';
        }

        return t.trim();
      })
      .join('\n');

    const response = await fetch(`${this.algodServer}:${this.algodPort}/v2/teal/compile?sourcemap=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-Algo-API-Token': this.algodToken,
      },
      body,
    });

    const json = await response.json();

    if (response.status !== 200) {
      if ((json.message as string).includes('request body too large')) {
        this.teal[program] = this.teal[program].filter((t) => !t.teal.trim().startsWith('//'));
        // eslint-disable-next-line no-console
        console.warn(
          `The emitted TEAL for ${this.name}'s ${program} program was too large. Removing comments from TEAL and trying again...`
        );

        // For some reason without awaiting explicitly here ConnectionClosed will be thrown
        // eslint-disable-next-line no-return-await
        return await this.algodCompileProgram(program);
      }
      // eslint-disable-next-line no-console
      console.error(
        this.teal[program]
          .map((t) => t.teal)
          .map((l, i) => `${i + 1}: ${l}`)
          .join('\n')
      );

      throw new Error(`${response.statusText}: ${json.message}`);
    }

    if (!this.algodVersion) {
      const versionResponse = await fetch(`${this.algodServer}:${this.algodPort}/versions`, {
        method: 'GET',
        headers: {
          'X-Algo-API-Token': this.algodToken,
        },
      });

      const versionJson = await versionResponse.json();

      this.algodVersion = {
        major: versionJson.build.major,
        minor: versionJson.build.minor,
        patch: versionJson.build.build_number,
        commitHash: versionJson.build.commit_hash,
      };
    }

    if (Object.keys(this.templateVars).length === 0) {
      this.compiledPrograms[program] = json.result;
    }

    this.estimatedProgramSize[program] = Buffer.from(json.result, 'base64').byteLength;

    if (program === 'clear') return json;

    const mapping = await getSourceMap(json.sourcemap.mappings);

    this.lineToPc = mapping.lineToPc;
    this.pcToLine = mapping.pcToLine;

    if (program === 'lsig') {
      const addrLine = this.teal.lsig.find((t) => t.teal.trim() === '// The address of this logic signature is')!;
      addrLine.teal += ` ${json.hash}`;
    }

    let lastCblockPc = 0;
    let lastCblockLine = 0;

    if (this.hasDynamicTemplateVar) {
      const bytecblockLine = this.teal[program].findIndex((t) => t.teal.trim().startsWith('bytecblock'));
      const intcblockLine = this.teal[program].findIndex((t) => t.teal.trim().startsWith('intcblock'));
      lastCblockLine = Math.max(bytecblockLine, intcblockLine);

      lastCblockPc = this.lineToPc[lastCblockLine].at(-1)!;
    }
    this.sourceInfo.forEach((sm) => {
      if (this.hasDynamicTemplateVar) {
        if (sm.teal - 1 <= lastCblockLine) return;
        const pcs = this.lineToPc[sm.teal - 1];

        // PCs will be undefined if the line is blank or a comment
        if (pcs === undefined) return;

        // eslint-disable-next-line no-param-reassign
        sm.pc = this.lineToPc[sm.teal - 1].map((pc) => pc - lastCblockPc);
        return;
      }
      // eslint-disable-next-line no-param-reassign
      sm.pc = this.lineToPc[sm.teal - 1];
    });

    return json;
  }

  private addSourceComment(node: ts.Node, force?: boolean, comment?: string) {
    if (
      !force &&
      node.getStart() >= this.lastSourceCommentRange[0] &&
      node.getEnd() <= this.lastSourceCommentRange[1]
    ) {
      return;
    }

    const nodePath = path.relative(this.cwd, node.getSourceFile().getFilePath());
    this.pushVoid(node, `// ${nodePath}:${node.getStartLineNumber()}`);

    const lines = (comment ?? node.getText()).split('\n').map((l) => `// ${l}`);
    this.pushLines(node, ...lines);

    this.lastSourceCommentRange = [node.getStart(), node.getEnd()];
  }

  arc56Description(): ARC56Contract {
    const objectToStructFields = (typeInfo: TypeInfo & { kind: 'object' }) => {
      const fields: StructField[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const [field, type] of Object.entries(typeInfo.properties)) {
        if (type.kind === 'object') {
          fields.push({ name: field, type: objectToStructFields(type) });
        } else {
          fields.push({ name: field, type: typeInfoToABIString(type) });
        }
      }

      return fields;
    };

    const state: ARC56Contract['state'] = {
      schema: {
        global: {
          bytes: 0,
          ints: 0,
        },
        local: {
          bytes: 0,
          ints: 0,
        },
      },
      keys: {
        global: {},
        local: {},
        box: {},
      },
      maps: {
        global: {},
        local: {},
        box: {},
      },
    };

    const sourceInfo = this.sourceInfo.filter((s) => s.pc !== undefined);

    const arc56: ARC56Contract = {
      ...this.arc4Description(),
      arcs: [4, 56],
      structs: {},
      state,
      bareActions: { create: [], call: [] },
      // TODO: clear source mapping
      sourceInfo: {
        approval: {
          // @ts-expect-error Undefined PCs are filtered out above
          sourceInfo,
          pcOffsetMethod: this.hasDynamicTemplateVar ? 'cblocks' : 'none',
        },
        clear: { sourceInfo: [], pcOffsetMethod: 'none' },
      },
      source: {
        approval: Buffer.from(this.teal.approval.map((t) => t.teal).join('\n')).toString('base64'),
        clear: Buffer.from(this.teal.clear.map((t) => t.teal).join('\n')).toString('base64'),
      },
    };

    Object.values(this.storageProps).forEach((sp) => {
      if (sp.key) {
        state.keys[sp.type][sp.name] = {
          key: Buffer.from(sp.key).toString('base64'),
          keyType: 'AVMBytes',
          valueType: equalTypes(sp.valueType, StackType.bytes) ? 'AVMBytes' : typeInfoToABIString(sp.valueType),
        };
      } else {
        let keyType = equalTypes(sp.keyType, StackType.bytes) ? 'AVMBytes' : typeInfoToABIString(sp.keyType);
        let valueType = equalTypes(sp.valueType, StackType.bytes) ? 'AVMBytes' : typeInfoToABIString(sp.valueType);

        const typeArgs = sp.initNode.getTypeArguments();

        if (sp.valueType.kind === 'object') {
          valueType = typeArgs[sp.key ? 0 : 1].getText();
          arc56.structs[valueType] = objectToStructFields(sp.valueType);
        }

        if (sp.keyType.kind === 'object') {
          keyType = typeArgs[0].getText();
          arc56.structs[keyType] = objectToStructFields(sp.keyType);
        }

        state.maps[sp.type][sp.name] = {
          keyType,
          valueType,
          prefix: sp.prefix ? Buffer.from(sp.prefix).toString('base64') : undefined,
        };
      }

      if (sp.type === 'global' || sp.type === 'local') {
        if (isNumeric(sp.valueType)) {
          state.schema[sp.type].ints += sp.maxKeys || 1;
        } else {
          state.schema[sp.type].bytes += sp.maxKeys || 1;
        }
      }
    });

    arc56.methods.forEach((m) => {
      const subroutine = this.subroutines.find((s) => s.name === m.name)!;
      const actions = subroutine.allows;

      // eslint-disable-next-line no-param-reassign
      m.actions = actions;

      if (subroutine.node.isKind(ts.SyntaxKind.MethodDeclaration)) {
        const returnTypeInfo = this.getTypeInfo(subroutine.node.getReturnType());

        if (returnTypeInfo.kind === 'object') {
          const returnTypeNode =
            subroutine.node.getChildrenOfKind(ts.SyntaxKind.TypeReference)?.[0] || subroutine.node.getReturnType();
          const structName = returnTypeNode?.getText();

          // eslint-disable-next-line no-param-reassign
          m.returns.struct = structName;
          if (!arc56.structs[structName]) {
            arc56.structs[structName] = objectToStructFields(returnTypeInfo);
          }
        }

        subroutine.node.getParameters().forEach((p) => {
          const arg = m.args.find((a) => a.name === p.getName())!;

          const typeInfo = this.getTypeInfo(p.getType());

          if (typeInfo.kind === 'object') {
            const structName = (p.getChildrenOfKind(ts.SyntaxKind.TypeReference)?.[0] || p.getType()).getText();
            arg.struct = structName;
            if (!arc56.structs[structName]) {
              arc56.structs[structName] = objectToStructFields(typeInfo);
            }
          }
        });
      }
    });

    Object.keys(this.templateVars).forEach((k) => {
      const typeInfo = this.templateVars[k].type;

      let type = typeInfoToABIString(typeInfo);
      if (typeInfo.kind === 'object') {
        const structName = this.templateVars[k].initNode.getTypeArguments()[0].getText();
        if (!arc56.structs[structName]) {
          arc56.structs[structName] = objectToStructFields(typeInfo);
        }
        type = structName;
      }

      arc56.templateVariables ||= {};
      arc56.templateVariables![k] = { type };
    });

    Object.keys(this.scratch).forEach((k) => {
      const { slot } = this.scratch[k];
      if (slot === undefined) return;

      const typeInfo = this.scratch[k].type;

      let type = typeInfoToABIString(typeInfo);
      if (typeInfo.kind === 'object') {
        const structName = this.scratch[k].initNode.getTypeArguments()[0].getText();
        if (!arc56.structs[structName]) {
          arc56.structs[structName] = objectToStructFields(typeInfo);
        }
        type = structName;
      }

      arc56.scratchVariables ||= {};
      arc56.scratchVariables![k] = { type, slot };
    });

    if (this.compiledPrograms.approval && this.compiledPrograms.clear) {
      arc56.byteCode = {
        approval: this.compiledPrograms.approval,
        clear: this.compiledPrograms.clear,
      };
    }

    if (this.algodVersion) {
      arc56.compilerInfo = {
        compiler: 'algod',
        compilerVersion: this.algodVersion,
      };
    }

    return arc56;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arc32Description(): any {
    const approval = Buffer.from(this.teal.approval.map((t) => t.teal).join('\n')).toString('base64');
    const clear = Buffer.from(this.teal.clear.map((t) => t.teal).join('\n')).toString('base64');
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
      switch (v.type) {
        case 'global':
          if (isNumeric(v.valueType)) {
            state.global.num_uints += v.maxKeys || 1;
            if (v.key) globalDeclared[k] = { type: 'uint64', key: v.key };
          } else {
            if (v.key) globalDeclared[k] = { type: 'bytes', key: v.key };
            state.global.num_byte_slices += v.maxKeys || 1;
          }

          break;
        case 'local':
          if (isNumeric(v.valueType)) {
            state.local.num_uints += v.maxKeys || 1;
            if (v.key) localDeclared[k] = { type: 'uint64', key: v.key };
          } else {
            state.local.num_byte_slices += v.maxKeys || 1;
            if (v.key) localDeclared[k] = { type: 'bytes', key: v.key };
          }
          break;
        default:
          break;
      }
    }

    if (state.global.num_uints + state.global.num_byte_slices > 64) {
      throw new Error('over allocated global state');
    }

    if (state.local.num_uints + state.local.num_byte_slices > 16) {
      throw new Error('over allocated local state');
    }

    const hints: { [signature: string]: { call_config: { [action: string]: string } } } = {};

    const arc32 = {
      hints,
      bare_call_config: {
        no_op: this.bareCallConfig.NoOp?.action || 'NEVER',
        opt_in: this.bareCallConfig.OptIn?.action || 'NEVER',
        close_out: this.bareCallConfig.CloseOut?.action || 'NEVER',
        update_application: this.bareCallConfig.UpdateApplication?.action || 'NEVER',
        delete_application: this.bareCallConfig.DeleteApplication?.action || 'NEVER',
      },
      schema: {
        local: { declared: localDeclared, reserved: {} },
        global: { declared: globalDeclared, reserved: {} },
      },
      state,
      source: { approval, clear },
      contract: this.arc4Description(),
    };

    this.abi.methods.forEach((m) => {
      const signature = `${m.name}(${m.args.map((a) => typeInfoToABIString(a.type)).join(',')})${typeInfoToABIString(
        m.returns.type
      )
        .replace(/asset/g, 'uint64')
        .replace(/application/g, 'uint64')
        .replace(/account/g, 'address')}`;

      hints[signature] = {
        call_config: {},
      };

      const subroutine = this.subroutines.find((s) => s.name === m.name)!;

      subroutine.allows.create.forEach((oc) => {
        const snakeOC = oc
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toLowerCase();
        hints[signature].call_config[snakeOC] = 'CREATE';
      });

      subroutine.allows.call.forEach((oc) => {
        if (oc === 'ClearState') return;
        const snakeOC = oc
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toLowerCase();
        hints[signature].call_config[snakeOC] = 'CALL';
      });
    });

    return arc32;
  }

  prettyTeal(teal: TEALInfo[]): TEALInfo[] {
    const output: TEALInfo[] = [];
    let comments: string[] = [];

    let hitFirstLabel = false;
    let lastIsLabel: boolean = false;

    teal.forEach((t, i) => {
      const tealLine = t.teal;
      if (tealLine === '// No extra bytes needed for this subroutine') return;
      if (tealLine === '//#pragma mode logicsig') {
        output.push({ node: this.classNode, teal: tealLine });
        return;
      }

      if (tealLine.startsWith('//')) {
        if (comments.length === 0 && output.at(-1)!.teal !== '' && !lastIsLabel)
          output.push({ node: this.classNode, teal: '' });
        comments.push(tealLine);
        return;
      }

      const isLabel = !tealLine.startsWith('byte ') && tealLine.split('//')[0].endsWith(':');

      if (isLabel && output.at(-1)!.teal !== '') output.push({ node: this.classNode, teal: '' });

      hitFirstLabel = hitFirstLabel || isLabel;

      if (isLabel || tealLine.startsWith('#') || !hitFirstLabel) {
        comments.forEach((c) => output.push({ node: t.node, teal: c }));
        comments = [];
        output.push({ node: t.node, teal: tealLine });
        lastIsLabel = isLabel;
      } else {
        comments.forEach((c) => output.push({ node: t.node, teal: `\t${c.replace(/\n/g, '\n\t')}` }));
        comments = [];
        output.push({ node: t.node, teal: `\t${tealLine}`, errorMessage: t.errorMessage });
        lastIsLabel = false;
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
