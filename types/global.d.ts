/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */

// https://stackoverflow.com/a/69288824
private type Expand<T> = T extends (...args: infer A) => infer R
? (...args: Expand<A>) => Expand<R>
: T extends infer O
? { [K in keyof O]: O[K] }
: never;

declare type byte<N = void> = string

declare type uint8<N = void> = N extends number ? number[] : number;
declare type uint16<N = void> = N extends number ? number[] : number;
declare type uint24<N = void> = N extends number ? number[] : number;
declare type uint32<N = void> = N extends number ? number[] : number;
declare type uint40<N = void> = N extends number ? number[] : number;
declare type uint48<N = void> = N extends number ? number[] : number;
declare type uint56<N = void> = N extends number ? number[] : number;
declare type uint64<N = void> = N extends number ? number[] : number;
declare type uint72<N = void> = N extends number ? number[] : number;
declare type uint80<N = void> = N extends number ? number[] : number;
declare type uint88<N = void> = N extends number ? number[] : number;
declare type uint96<N = void> = N extends number ? number[] : number;
declare type uint104<N = void> = N extends number ? number[] : number;
declare type uint112<N = void> = N extends number ? number[] : number;
declare type uint120<N = void> = N extends number ? number[] : number;
declare type uint128<N = void> = N extends number ? number[] : number;
declare type uint136<N = void> = N extends number ? number[] : number;
declare type uint144<N = void> = N extends number ? number[] : number;
declare type uint152<N = void> = N extends number ? number[] : number;
declare type uint160<N = void> = N extends number ? number[] : number;
declare type uint168<N = void> = N extends number ? number[] : number;
declare type uint176<N = void> = N extends number ? number[] : number;
declare type uint184<N = void> = N extends number ? number[] : number;
declare type uint192<N = void> = N extends number ? number[] : number;
declare type uint200<N = void> = N extends number ? number[] : number;
declare type uint208<N = void> = N extends number ? number[] : number;
declare type uint216<N = void> = N extends number ? number[] : number;
declare type uint224<N = void> = N extends number ? number[] : number;
declare type uint232<N = void> = N extends number ? number[] : number;
declare type uint240<N = void> = N extends number ? number[] : number;
declare type uint248<N = void> = N extends number ? number[] : number;
declare type uint256<N = void> = N extends number ? number[] : number;
declare type uint264<N = void> = N extends number ? number[] : number;
declare type uint272<N = void> = N extends number ? number[] : number;
declare type uint280<N = void> = N extends number ? number[] : number;
declare type uint288<N = void> = N extends number ? number[] : number;
declare type uint296<N = void> = N extends number ? number[] : number;
declare type uint304<N = void> = N extends number ? number[] : number;
declare type uint312<N = void> = N extends number ? number[] : number;
declare type uint320<N = void> = N extends number ? number[] : number;
declare type uint328<N = void> = N extends number ? number[] : number;
declare type uint336<N = void> = N extends number ? number[] : number;
declare type uint344<N = void> = N extends number ? number[] : number;
declare type uint352<N = void> = N extends number ? number[] : number;
declare type uint360<N = void> = N extends number ? number[] : number;
declare type uint368<N = void> = N extends number ? number[] : number;
declare type uint376<N = void> = N extends number ? number[] : number;
declare type uint384<N = void> = N extends number ? number[] : number;
declare type uint392<N = void> = N extends number ? number[] : number;
declare type uint400<N = void> = N extends number ? number[] : number;
declare type uint408<N = void> = N extends number ? number[] : number;
declare type uint416<N = void> = N extends number ? number[] : number;
declare type uint424<N = void> = N extends number ? number[] : number;
declare type uint432<N = void> = N extends number ? number[] : number;
declare type uint440<N = void> = N extends number ? number[] : number;
declare type uint448<N = void> = N extends number ? number[] : number;
declare type uint456<N = void> = N extends number ? number[] : number;
declare type uint464<N = void> = N extends number ? number[] : number;
declare type uint472<N = void> = N extends number ? number[] : number;
declare type uint480<N = void> = N extends number ? number[] : number;
declare type uint488<N = void> = N extends number ? number[] : number;
declare type uint496<N = void> = N extends number ? number[] : number;
declare type uint504<N = void> = N extends number ? number[] : number;
declare type uint512<N = void> = N extends number ? number[] : number;

declare type ufixed64x2<N = void> = N extends number ? number[] : number;

declare type bytes = string
declare type StaticArray<T, N extends number> = T[]

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
}

type Account = Address

type BytesLike = bytes | Address

declare class Application {
  static fromIndex(appID: uint64)

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
  constructor(options?: { defaultSize?: number, dynamicSize?: boolean })

  get(key: KeyType): ValueType

  exists(key: KeyType): uint64

  delete(key: KeyType): void

  put(key: KeyType, value: ValueType): void
}

declare class BoxReference<ValueType> {
  constructor(options?: { defaultSize?: number, key?: string, dynamicSize?: boolean })

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

  get(account: Address, key: KeyType): ValueType

  exists(account: Address, key: KeyType): uint64

  delete(account: Address, key: KeyType): void

  put(account: Address, key: KeyType, value: ValueType): void
}

declare class LocalReference<ValueType> {
  constructor(options?: { key?: string })

  get(account: Address): ValueType

  exists(account: Address): uint64

  delete(account: Address): void

  put(account: Address, value: ValueType): void
}

type IntLike = uint64 | Asset | Application | boolean

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

type ThisTxnParams = AppOnChainTransactionParams

type Transaction = PayTxn & AssetTransferTxn & AppCallTxn

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
declare function getbyte(arg0: BytesLike, arg1: IntLike): uint64
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
declare function hex(input: string): bytes

declare type decorator = (
  target: Object,
  key: string | symbol,
  descriptor: PropertyDescriptor
) => PropertyDescriptor

declare const handle: {
  clearState: decorator;
  noOp: decorator;
  optIn: decorator;
  closeOut: decorator;
  updateApplication: decorator;
  deleteApplication: decorator;
  createApplication: decorator;
 };
