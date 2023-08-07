/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */

// https://stackoverflow.com/a/69288824
type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

declare type widths = 8 |
16 |
24 |
32 |
40 |
48 |
56 |
64 |
72 |
80 |
88 |
96 |
104 |
112 |
120 |
128 |
136 |
144 |
152 |
160 |
168 |
176 |
184 |
192 |
200 |
208 |
216 |
224 |
232 |
240 |
248 |
256 |
264 |
272 |
280 |
288 |
296 |
304 |
312 |
320 |
328 |
336 |
344 |
352 |
360 |
368 |
376 |
384 |
392 |
400 |
408 |
416 |
424 |
432 |
440 |
448 |
456 |
464 |
472 |
480 |
488 |
496 |
504 |
512

declare type precisions = 1 |
2 |
3 |
4 |
5 |
6 |
7 |
8 |
9 |
10 |
11 |
12 |
13 |
14 |
15 |
16 |
17 |
18 |
19 |
20 |
21 |
22 |
23 |
24 |
25 |
26 |
27 |
28 |
29 |
30 |
31 |
32 |
33 |
34 |
35 |
36 |
37 |
38 |
39 |
40 |
41 |
42 |
43 |
44 |
45 |
46 |
47 |
48 |
49 |
50 |
51 |
52 |
53 |
54 |
55 |
56 |
57 |
58 |
59 |
60 |
61 |
62 |
63 |
64 |
65 |
66 |
67 |
68 |
69 |
70 |
71 |
72 |
73 |
74 |
75 |
76 |
77 |
78 |
79 |
80 |
81 |
82 |
83 |
84 |
85 |
86 |
87 |
88 |
89 |
90 |
91 |
92 |
93 |
94 |
95 |
96 |
97 |
98 |
99 |
100 |
101 |
102 |
103 |
104 |
105 |
106 |
107 |
108 |
109 |
110 |
111 |
112 |
113 |
114 |
115 |
116 |
117 |
118 |
119 |
120 |
121 |
122 |
123 |
124 |
125 |
126 |
127 |
128 |
129 |
130 |
131 |
132 |
133 |
134 |
135 |
136 |
137 |
138 |
139 |
140 |
141 |
142 |
143 |
144 |
145 |
146 |
147 |
148 |
149 |
150 |
151 |
152 |
153 |
154 |
155 |
156 |
157 |
158 |
159 |
160

// See https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d
type Brand<K, T> = K & { __brand?: T }

declare type uint<N extends widths> = Brand<number, `uint${N}`>
declare type uint64 = uint<64> | number
declare type ufixed<N extends widths, M extends precisions> = Brand<number, `ufixed${N}x${M}`>

declare type byte = Brand<string, 'byte'>
declare type bytes = Brand<string, 'bytes'>

declare class Asset {
  static fromIndex(index: uint64): Asset;

  static readonly zeroIndex: Asset;

  readonly total: uint64;

  readonly decimals: uint64;

  readonly defaultFrozen: uint64;

  readonly name: string;

  readonly unitName: string;

  readonly url: string;

  readonly metadataHash: string;

  readonly manager: Address;

  readonly reserve: Address;

  readonly freeze: Address;

  readonly clawback: Address;

  readonly creator: Address;
}

declare class Address {
  static fromBytes(addr: BytesLike): Address;

  static readonly zeroAddress: Address;

  readonly balance: uint64;

  readonly hasBalance: uint64;

  readonly minBalance: uint64;

  readonly totalAssets: uint64;

  // eslint-disable-next-line no-use-before-define
  readonly authAddr: Address;

  readonly totalNumUint: uint64;

  readonly totalNumByteSlice: uint64;

  readonly totalExtraAppPages: uint64;

  readonly totalAppsCreated: uint64;

  readonly totalAppsOptedIn: uint64;

  readonly totalAssetsCreated: uint64;

  readonly totalBoxes: uint64;

  readonly totalBoxBytes: uint64;

  assetBalance(asa: Asset): uint64

  hasAsset(asa: Asset): uint64

  assetFrozen(asa: Asset): uint64

  isOptedInToApp(app: Application): boolean
}

type Account = Address

type BytesLike = bytes | Address | string

declare class Application {
  static fromIndex(appID: uint64): Application;

  static readonly zeroIndex: Application;

  readonly approvalProgram: bytes;

  readonly clearStateProgram: bytes;

  readonly globalNumUint: uint64;

  readonly globalNumByteSlice: uint64;

  readonly localNumUint: uint64;

  readonly localNumByteSlice: uint64;

  readonly extraProgramPages: uint64;

  readonly creator: Address;

  readonly address: Address;

  global(key: BytesLike): BytesLike | IntLike
}

declare class BoxMap<KeyType, ValueType> {
  constructor(options?: {dynamicSize?: boolean, prefix?: string })

  get(key: KeyType): ValueType

  exists(key: KeyType): uint64

  delete(key: KeyType): void

  set(key: KeyType, value: ValueType): void

  create(key: KeyType, size: uint64): void

  replace(key: KeyType, offset: uint64, value: bytes): void

  extract(key: KeyType, offset: uint64, length: uint64): bytes

  size(key: KeyType): uint64
}

declare class BoxKey<ValueType> {
  constructor(options?: { key?: string, dynamicSize?: boolean })

  get(): ValueType

  exists(): uint64

  delete(): void

  set(value: ValueType): void

  create(size: uint64): void

  replace(offset: uint64, value: bytes): void

  extract(offset: uint64, length: uint64): bytes

  size(): uint64
}

declare class GlobalStateMap<KeyType, ValueType> {
  constructor()

  get(key: KeyType): ValueType

  exists(key: KeyType): uint64

  delete(key: KeyType): void

  set(key: KeyType, value: ValueType): void
}

declare class GlobalStateKey<ValueType> {
  constructor(options?: { key?: string })

  get(): ValueType

  exists(): uint64

  delete(): void

  set(value: ValueType): void
}

declare class LocalStateMap<KeyType, ValueType> {
  constructor()

  get(account: Address, key: KeyType): ValueType

  exists(account: Address, key: KeyType): uint64

  delete(account: Address, key: KeyType): void

  set(account: Address, key: KeyType, value: ValueType): void
}

declare class LocalStateKey<ValueType> {
  constructor(options?: { key?: string })

  get(account: Address): ValueType

  exists(account: Address): uint64

  delete(account: Address): void

  set(account: Address, value: ValueType): void
}

type IntLike = uint64 | Asset | Application | boolean | number

interface CommonTransactionParams {
  fee: uint64
  sender?: Address
  rekeyTo?: Address
  note?: string
}

interface CommonOnChainTransactionParams extends Required<CommonTransactionParams> {
  groupIndex: uint64,
  txID: string,
}

interface AppOnChainTransactionParams extends CommonOnChainTransactionParams {
  createdAssetID: Asset,
  createdApplicationID: Application,
  lastLog: bytes,
  applicationID: Application,
  numAppArgs: uint64,
  numAccounts: uint64,
  numAssets: uint64,
  numApplicatons: uint64,
  numLogs: uint64,
  numApprovalProgrammPages: uint64,
  numClearStateProgramPages: uint64,
}

interface AssetTransferParams extends CommonTransactionParams {
  xferAsset: Asset
  assetAmount: uint64
  assetSender?: Address
  assetReceiver: Address
  assetCloseTo?: Address
}

interface AssetConfigParams extends CommonTransactionParams {
  configAsset: Asset
  configAssetManager?: Address
  configAssetReserve?: Address
  configAssetFreeze?: Address
  configAssetClawback?: Address
}

interface AssetCreateParams extends CommonTransactionParams {
  configAssetName?: bytes
  configAssetUnitName?: bytes
  configAssetTotal: uint64
  configAssetDecimals: uint64
  configAssetManager?: Address
  configAssetReserve?: Address
  configAssetFreeze?: Address
  configAssetClawback?: Address
  configAssetDefaultFrozen?: uint64
  configAssetURL?: bytes
  configAssetMetadataHash?: bytes
}

interface AssetFreezeParams extends CommonTransactionParams {
  freezeAsset: Asset
  freezeAssetAccount: Address
  freezeAssetFrozen: uint64
}

interface PaymentParams extends CommonTransactionParams {
  amount: uint64
  receiver: Address
  closeRemainderTo?: Address
}

interface AppParams extends CommonTransactionParams {
  applicationID?: Application
  onCompletion: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' | 'CreateApplication'
  accounts?: Address[]
  approvalProgram?: bytes | NewableFunction
  applicationArgs?: bytes[]
  clearStateProgram?: bytes
  applications?: Array<Application>
  assets?: Array<Asset>
  globalNumByteSlice?: uint64
  globalNumUint?: uint64
  localNumByteSlice?: uint64
  localNumUint?: uint64
  extraProgramPages?: uint64
}

interface KeyRegParams extends CommonTransactionParams {
  votePk?: bytes
  selectionPK?: bytes
  stateProofPk?: bytes
  voteFirst?: uint64
  voteLast?: uint64
  voteKeyDilution?: uint64
}

interface OnlineKeyRegParams extends CommonTransactionParams {
  votePK: bytes
  selectionPK: bytes
  stateProofPK: bytes
  voteFirst: uint64
  voteLast: uint64
  voteKeyDilution: uint64
}

declare type PayTxn = Required<PaymentParams>
declare type AssetTransferTxn = Required<AssetTransferParams>
declare type AppCallTxn = AppOnChainTransactionParams & Required<AppParams>
declare type KeyRegTxn = Required<KeyRegParams>
declare type AssetConfigTxn = Required<AssetConfigParams>
declare type AssetFreezeTxn = Required<AssetFreezeParams>

interface MethodCallParams<ArgsType> extends AppParams {
  /** ABI method arguments */
  methodArgs?: ArgsType
  /** Name of the ABI method */
  name: string
}

type ThisTxnParams = AppOnChainTransactionParams & AppParams

type Txn = PayTxn &
  AssetTransferTxn &
  AppCallTxn &
  KeyRegTxn &
  AssetConfigTxn &
  AssetFreezeTxn
  & {typeEnum: TransactionType}

declare const globals: {
  minTxnFee: uint64
  minBalance: uint64
  maxTxnLife: uint64
  zeroAddress: Address
  groupSize: uint64
  logicSigVersion: uint64
  round: uint64
  latestTimestamp: uint64
  currentApplicationID: Application
  creatorAddress: Address
  currentApplicationAddress: Address
  groupID: bytes
  opcodeBudget: uint64
  callerApplicationID: Application
  callerApplicationAddress: Address
};

declare function method(signature: string): bytes
declare function addr(address: string): Address

declare function sendPayment(params: Expand<PaymentParams>): void
declare function sendAppCall(params: Expand<AppParams>): void
declare function sendAssetTransfer(params: Expand<AssetTransferParams>): void
declare function sendAssetCreation(params: Expand<AssetCreateParams>): Asset
declare function sendOnlineKeyRegistration(params: Expand<OnlineKeyRegParams>): void
declare function sendOfflineKeyRegistration(params: Expand<CommonTransactionParams>): void
declare function sendAssetConfig(params: Expand<AssetConfigParams>): void
declare function sendAssetFreeze(params: Expand<AssetFreezeParams>): void

/**
 * Sends ABI method call. The two type arguments in combination with the
 * name argument are used to form the the method signature to ensure typesafety.
 *
 * @example
 * Calling a method and getting the return value
 * ```ts
 * // call createNFT(string,string)uint64
 * const createdAsset = sendMethodCall<[string, string], Asset>({
 *     applicationID: factoryApp,
 *     name: 'createNFT',
 *     methodArgs: ['My NFT', 'MNFT'],
 *     onCompletion: 'NoOp',
 *     fee: 0,
 * });
 * ```
 *
 * @returns The return value of the method call
 *
 * @typeParam ArgsType - A tuple type corresponding to the types of the method arguments
 * @typeParam ReturnType - The return type of the method
 *
 * @param params - The parameters of the method call
 *
 */
declare function sendMethodCall<ArgsType, ReturnType>(
  params: Expand<MethodCallParams<ArgsType>>
): ReturnType
declare function btoi(byteslice: BytesLike): uint64
declare function itob(int: IntLike): bytes
declare function log(content: BytesLike): void
declare function sha256(arg0: BytesLike): StaticArray<byte, 32>
declare function keccak256(arg0: BytesLike): StaticArray<byte, 32>
declare function sha512_256(arg0: BytesLike): StaticArray<byte, 32>
declare function ed25519verify(arg0: BytesLike, arg1: BytesLike, arg2: BytesLike): uint64
declare function len(arg0: BytesLike): uint64
declare function assert(arg0: IntLike): void
declare function concat(arg0: BytesLike, arg1: BytesLike): bytes
declare function substring3(arg0: BytesLike, arg1: IntLike, arg2: IntLike): bytes
declare function getbit(arg0: BytesLike, arg1: IntLike): uint64
declare function setbit(arg0: BytesLike, arg1: IntLike, arg2: IntLike): bytes
declare function getbyte(arg0: BytesLike, arg1: IntLike): uint64
declare function setbyte(arg0: BytesLike, arg1: IntLike, arg2: IntLike): bytes
declare function extract3(arg0: BytesLike, arg1: IntLike, arg2: IntLike): bytes
declare function extract_uint16(arg0: BytesLike, arg1: IntLike): uint64
declare function extract_uint32(arg0: BytesLike, arg1: IntLike): uint64
declare function extract_uint64(arg0: BytesLike, arg1: IntLike): uint64
declare function replace3(arg0: BytesLike, arg1: IntLike, arg2: BytesLike): bytes
declare function ed25519verify_bare(arg0: BytesLike, arg1: BytesLike, arg2: BytesLike): uint64
declare function sqrt(arg0: IntLike): uint64
declare function bitlen(arg0: BytesLike): uint64
declare function exp(arg0: IntLike, arg1: IntLike): uint64
declare function bsqrt(arg0: uint<widths>): uint<widths>
declare function divw(arg0: IntLike, arg1: IntLike, arg2: IntLike): uint64
declare function sha3_256(arg0: BytesLike): StaticArray<byte, 32>
declare function bzero(size: IntLike): bytes

declare function wideRatio(numeratorFactors: uint64[], denominatorFactors: uint64[]): uint64
declare function hex(input: string): bytes

declare type decorator = (
  target: Object,
  key: string | symbol,
  descriptor: PropertyDescriptor
) => PropertyDescriptor

declare class allow {
  static call(onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication'): decorator

  static create(onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' = 'NoOp'): decorator

  static bareCall(onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication'): decorator

  static bareCreate(onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' = 'NoOp'): decorator
}

declare class abi {
  /** Signifies this method doesn't write any state to the chain, thus it can be
   * called via simulate to avoid fees */
  static readonly: decorator;
}

type StaticArray<
  T extends BytesLike | IntLike | StaticArray,
  N extends number
> = (
  T extends byte ? string : (N extends 0 ? never[] : T extends boolean ? (true | false)[] : T[])
) & {__type?: T, __length?: N}

// eslint-disable-next-line no-shadow
enum TransactionType {
  Unknown, // unknown
  Payment, // pay
  KeyRegistration, // keyreg
  AssetConfig, // acfg
  AssetTransfer, // axfer
  AssetFreeze, // afrz
  ApplicationCall, // appl
}
