/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */

declare type uint16<N = void> = N extends number ? number[] : number;
declare type uint64<N = void> = N extends number ? number[] : number;
declare type uint256<N = void> = N extends number ? number[] : number;

declare type ufixed64x2<N = void> = N extends number ? number[] : number;

declare type bytes = string
declare type StaticArray<T, N extends number> = T[]

declare class Asset {
  constructor(id: uint64)

  readonly total: uint64;

  readonly decimals: uint64;

  readonly defaultFrozen: uint64;

  readonly name: string;

  readonly unitName: string;

  readonly url: string;

  readonly metadataHash: string;

  readonly manager: Account;

  readonly reserve: Account;

  readonly freeze: Account;

  readonly clawback: Account;

  readonly creator: Account;
}

declare class Account {
  constructor(id: uint64)

  readonly balance: uint64;

  readonly hasBalance: uint64;

  readonly minBalance: uint64;

  readonly totalAssets: uint64;

  // eslint-disable-next-line no-use-before-define
  readonly authAddr: Account;

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
}

type BytesLike = bytes | Account

declare class Application {
  constructor(id: uint64)

  address: Account;

  clearStateProgram: bytes;

  global(key: BytesLike): any
}

declare class BoxMap<KeyType, ValueType> {
  constructor(options?: { defaultSize?: number })

  get(key: KeyType): ValueType

  exists(key: KeyType): uint64

  delete(key: KeyType): void

  put(key: KeyType, value: ValueType): void
}

declare class BoxReference<ValueType> {
  constructor(options?: { defaultSize?: number, key?: string })

  get(): ValueType

  exists(): uint64

  delete(): void

  put(value: ValueType): void
}

declare class GlobalMap<KeyType, ValueType> {
  constructor()

  get(key: KeyType): ValueType

  exists(key: KeyType): uint64

  delete(key: KeyType): void

  put(key: KeyType, value: ValueType): void
}

declare class GlobalReference<ValueType> {
  constructor(options?: { key?: string })

  get(): ValueType

  exists(): uint64

  delete(): void

  put(value: ValueType): void
}

declare class LocalMap<KeyType, ValueType> {
  constructor()

  get(account: Account, key: KeyType): ValueType

  exists(account: Account, key: KeyType): uint64

  delete(account: Account, key: KeyType): void

  put(account: Account, key: KeyType, value: ValueType): void
}

declare class LocalReference<ValueType> {
  constructor(options?: { key?: string })

  get(account: Account): ValueType

  exists(account: Account): uint64

  delete(account: Account): void

  put(account: Account, value: ValueType): void
}

type IntLike = uint64 | Asset | Application | boolean

interface CommonTransactionParams {
  fee: uint64
  sender?: Account
  rekeyTo?: Account
  note?: string
}

interface AssetTransferParams extends CommonTransactionParams {
  xferAsset: Asset
  assetAmount: uint64
  assetSender?: Account
  assetReceiver: Account
  assetCloseTo?: Account
}

interface AssetCreateParams extends CommonTransactionParams {
  configAssetName: bytes
  configAssetUnitName: bytes
  configAssetTotal: uint64
  configAssetDecimals: uint64
  configAssetManager: Account
  configAssetReserve: Account
}

interface PaymentParams extends CommonTransactionParams {
  amount: uint64
  receiver: Account
  closeRemainderTo?: Account
}

interface AppParams extends CommonTransactionParams {
  applicationID?: Application
  OnCompletion: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' | 'CreateApplication'
  accounts?: Account[]
  approvalProgram?: bytes | NewableFunction
  applicationArgs?: bytes[]
  clearStateProgram?: bytes
  applications?: Array<uint64 | Application>
  assets?: Array<uint64 | Asset>
  globalNumByteSlice?: uint64
  globalNumUint?: uint64
  localNumByteSlice?: uint64
  localNumUint?: uint64
}

declare type PayTxn = Required<PaymentParams>
declare type AssetTransferTxn = Required<AssetTransferParams>
declare type AppCallTxn = Required<AppParams>

interface MethodCallParams<ArgsType> extends AppParams {
  methodArgs?: ArgsType
  name: string
}

interface ThisTxnParams {
  fee: uint64
  sender: Account
  rekeyTo?: Account
  note?: bytes
  applicationID: Application
  OnCompletion: bytes
  approvalProgram?: bytes
  clearStateProgram?: bytes
  globalNumByteSlice?: uint64
  globalNumUint?: uint64
  localNumByteSlice?: uint64
  localNumUint?: uint64
  groupIndex: uint64
}

type Transaction = PayTxn & AssetTransferTxn & AppCallTxn

declare const globals: {
  minTxnFee: uint64
  minBalance: uint64
  maxTxnLife: uint64
  zeroAddress: Account
  groupSize: uint64
  logicSigVersion: uint64
  round: uint64
  latestTimestamp: uint64
  currentApplicationID: Application
  creatorAddress: Account
  currentApplicationAddress: Account
  groupID: bytes
  opcodeBudget: uint64
  callerApplicationID: Application
  callerApplicationAddress: Account
};

declare function method(signature: string): bytes
declare function addr(address: string): Account

declare function sendPayment(params: PaymentParams): void
declare function sendAppCall(params: AppParams): void
declare function sendAssetTransfer(params: AssetTransferParams): void
declare function sendAssetCreation(params: AssetCreateParams): Asset
// eslint-disable-next-line max-len
declare function sendMethodCall<ArgsType, ReturnType>(params: MethodCallParams<ArgsType>): ReturnType
declare function btoi(byteslice: BytesLike): uint64
declare function itob(int: IntLike): bytes
declare function log(content: BytesLike): void
declare function err()
declare function sha256(arg0: BytesLike)
declare function keccak256(arg0: BytesLike)
declare function sha512_256(arg0: BytesLike)
declare function ed25519verify(arg0: BytesLike, arg1: BytesLike, arg2: BytesLike)
declare function len(arg0: BytesLike)
declare function mulw(arg0: IntLike, arg1: IntLike)
declare function addw(arg0: IntLike, arg1: IntLike)
declare function divmodw(arg0: IntLike, arg1: IntLike, arg2: IntLike, arg3: IntLike)
declare function assert(arg0: IntLike)
declare function concat(arg0: BytesLike, arg1: BytesLike)
declare function substring3(arg0: BytesLike, arg1: IntLike, arg2: IntLike)
declare function getbit(arg0: BytesLike, arg1: IntLike)
declare function setbit(arg0: BytesLike, arg1: IntLike, arg2: IntLike)
declare function getbyte(arg0: BytesLike, arg1: IntLike)
declare function setbyte(arg0: BytesLike, arg1: IntLike, arg2: IntLike)
declare function extract3(arg0: BytesLike, arg1: IntLike, arg2: IntLike)
declare function extract_uint16(arg0: BytesLike, arg1: IntLike)
declare function extract_uint32(arg0: BytesLike, arg1: IntLike)
declare function extract_uint64(arg0: BytesLike, arg1: IntLike)
declare function replace3(arg0: BytesLike, arg1: IntLike, arg2: BytesLike)
declare function ed25519verify_bare(arg0: BytesLike, arg1: BytesLike, arg2: BytesLike)
declare function sqrt(arg0: IntLike)
declare function bitlen(arg0: BytesLike)
declare function exp(arg0: IntLike, arg1: IntLike)
declare function expw(arg0: IntLike, arg1: IntLike)
declare function bsqrt(arg0: BytesLike)
declare function divw(arg0: IntLike, arg1: IntLike, arg2: IntLike)
declare function sha3_256(arg0: BytesLike)

declare function wideRatio(numeratorFactors: uint64[], denominatorFactors: uint64[]): uint64

function decoratorFunction (
  target: Object,
  key: string | symbol,
  descriptor: PropertyDescriptor
): PropertyDescriptor

declare const clearState = decoratorFunction;
declare const createApplication = decoratorFunction;
declare const noOp = decoratorFunction;
declare const optIn = decoratorFunction;
declare const closeOut = decoratorFunction;
declare const updateApplication = decoratorFunction;
declare const deleteApplication = decoratorFunction;
