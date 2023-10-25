/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */

// https://stackoverflow.com/a/69288824
type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

declare type widths =
  | 8
  | 16
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 88
  | 96
  | 104
  | 112
  | 120
  | 128
  | 136
  | 144
  | 152
  | 160
  | 168
  | 176
  | 184
  | 192
  | 200
  | 208
  | 216
  | 224
  | 232
  | 240
  | 248
  | 256
  | 264
  | 272
  | 280
  | 288
  | 296
  | 304
  | 312
  | 320
  | 328
  | 336
  | 344
  | 352
  | 360
  | 368
  | 376
  | 384
  | 392
  | 400
  | 408
  | 416
  | 424
  | 432
  | 440
  | 448
  | 456
  | 464
  | 472
  | 480
  | 488
  | 496
  | 504
  | 512;

declare type precisions =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127
  | 128
  | 129
  | 130
  | 131
  | 132
  | 133
  | 134
  | 135
  | 136
  | 137
  | 138
  | 139
  | 140
  | 141
  | 142
  | 143
  | 144
  | 145
  | 146
  | 147
  | 148
  | 149
  | 150
  | 151
  | 152
  | 153
  | 154
  | 155
  | 156
  | 157
  | 158
  | 159
  | 160;

// See https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d
type Brand<K, T> = K & { __brand?: T };

declare type uint<N extends widths> = Brand<number, `uint${N}`>;
declare type uint64 = uint<64> | number;
declare type ufixed<N extends widths, M extends precisions> = Brand<number, `ufixed${N}x${M}`>;

declare type byte = Brand<string, 'byte'>;
declare type bytes = Brand<string, 'bytes'>;

declare type TxnVerificationTests = {
  lessThan?: IntLike;
  lessThanEqualTo?: IntLike;
  greaterThan?: IntLike;
  greaterThanEqualTo?: IntLike;
  not?: IntLike | BytesLike;
  includedIn?: (IntLike | BytesLike)[];
  notIncludedIn?: (IntLike | BytesLike)[];
};

declare type TxnVerificationFields = {
  sender?: Address | TxnVerificationTests;
  fee?: IntLike | TxnVerificationTests;
  firstValid?: IntLike | TxnVerificationTests;
  firstValidTime?: IntLike | TxnVerificationTests;
  lastValid?: IntLike | TxnVerificationTests;
  note?: BytesLike | TxnVerificationTests;
  lease?: StaticArray<byte, 32> | TxnVerificationTests;
  receiver?: Address | TxnVerificationTests;
  amount?: IntLike | TxnVerificationTests;
  closeRemainderTo?: Address | TxnVerificationTests;
  votePK?: StaticArray<byte, 32> | TxnVerificationTests;
  selectionPK?: StaticArray<byte, 32> | TxnVerificationTests;
  voteFirst?: IntLike | TxnVerificationTests;
  voteLast?: IntLike | TxnVerificationTests;
  voteKeyDilution?: IntLike | TxnVerificationTests;
  type?: BytesLike | TxnVerificationTests;
  typeEnum?: IntLike | TxnVerificationTests;
  xferAsset?: IntLike | TxnVerificationTests;
  assetAmount?: IntLike | TxnVerificationTests;
  assetSender?: Address | TxnVerificationTests;
  assetReceiver?: Address | TxnVerificationTests;
  assetCloseTo?: Address | TxnVerificationTests;
  groupIndex?: IntLike | TxnVerificationTests;
  txID?: StaticArray<byte, 32> | TxnVerificationTests;
  applicationID?: IntLike | TxnVerificationTests;
  onCompletion?: IntLike | TxnVerificationTests;
  applicationArgs?: BytesLike | TxnVerificationTests;
  numAppArgs?: IntLike | TxnVerificationTests;
  accounts?: Address | TxnVerificationTests;
  numAccounts?: IntLike | TxnVerificationTests;
  approvalProgram?: BytesLike | TxnVerificationTests;
  clearStateProgram?: BytesLike | TxnVerificationTests;
  rekeyTo?: Address | TxnVerificationTests;
  configAsset?: IntLike | TxnVerificationTests;
  configAssetTotal?: IntLike | TxnVerificationTests;
  configAssetDecimals?: IntLike | TxnVerificationTests;
  configAssetDefaultFrozen?: boolean | TxnVerificationTests;
  configAssetUnitName?: BytesLike | TxnVerificationTests;
  configAssetName?: BytesLike | TxnVerificationTests;
  configAssetURL?: BytesLike | TxnVerificationTests;
  configAssetMetadataHash?: StaticArray<byte, 32> | TxnVerificationTests;
  configAssetManager?: Address | TxnVerificationTests;
  configAssetReserve?: Address | TxnVerificationTests;
  configAssetFreeze?: Address | TxnVerificationTests;
  configAssetClawback?: Address | TxnVerificationTests;
  freezeAsset?: IntLike | TxnVerificationTests;
  freezeAssetAccount?: Address | TxnVerificationTests;
  freezeAssetFrozen?: boolean | TxnVerificationTests;
  assets?: IntLike | TxnVerificationTests;
  numAssets?: IntLike | TxnVerificationTests;
  applications?: IntLike | TxnVerificationTests;
  numApplications?: IntLike | TxnVerificationTests;
  globalNumUint?: IntLike | TxnVerificationTests;
  globalNumByteSlice?: IntLike | TxnVerificationTests;
  localNumUint?: IntLike | TxnVerificationTests;
  localNumByteSlice?: IntLike | TxnVerificationTests;
  extraProgramPages?: IntLike | TxnVerificationTests;
  nonparticipation?: boolean | TxnVerificationTests;
  logs?: BytesLike | TxnVerificationTests;
  numLogs?: IntLike | TxnVerificationTests;
  createdAssetID?: IntLike | TxnVerificationTests;
  createdApplicationID?: IntLike | TxnVerificationTests;
  lastLog?: BytesLike | TxnVerificationTests;
  stateProofPK?: BytesLike | TxnVerificationTests;
  approvalProgramPages?: BytesLike | TxnVerificationTests;
  numApprovalProgramPages?: IntLike | TxnVerificationTests;
  clearStateProgramPages?: BytesLike | TxnVerificationTests;
  numClearStateProgramPages?: IntLike | TxnVerificationTests;
};

declare class Asset {
  static fromID(index: uint64): Asset;

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

  assetBalance(asa: Asset): uint64;

  hasAsset(asa: Asset): uint64;

  assetFrozen(asa: Asset): uint64;

  isOptedInToApp(app: Application): boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state(app: Application, key: BytesLike): any;
}

type Account = Address;

type BytesLike = bytes | Address | string;

declare class Application {
  static fromID(appID: uint64): Application;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global(key: BytesLike): any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare class EventLogger<ArgumentTypes extends any[]> {
  constructor();

  log(...args: ArgumentTypes): void;
}

declare type BoxValue<ValueType> = {
  value: ValueType;
  delete: () => void;
  exists: boolean;
  create(size: uint64): void;
  replace(offset: uint64, value: bytes): void;
  extract(offset: uint64, length: uint64): bytes;
  size: uint64;
};

declare function BoxKey<ValueType>(options?: { key?: string; dynamicSize?: boolean }): BoxValue<ValueType>;

declare function BoxMap<KeyType, ValueType>(options?: {
  dynamicSize?: boolean;
  prefix?: string;
}): (key: KeyType) => BoxValue<ValueType>;

declare type GlobalStateValue<ValueType> = {
  value: ValueType;
  delete: () => void;
  exists: boolean;
};

declare function GlobalStateKey<ValueType>(options?: { key?: string }): GlobalStateValue<ValueType>;
declare function GlobalStateMap<KeyType, ValueType>(options: {
  maxKeys: number;
  prefix?: string;
}): (key: KeyType) => GlobalStateValue<ValueType>;

declare type LocalStateValue<ValueType> = {
  value: ValueType;
  delete: () => void;
  exists: boolean;
};

declare function LocalStateKey<ValueType>(options?: { key?: string }): (account: Address) => LocalStateValue<ValueType>;

declare function LocalStateMap<KeyType, ValueType>(options: {
  maxKeys: number;
  prefix?: string;
}): (account: Address, key: KeyType) => LocalStateValue<ValueType>;

type IntLike = uint64 | Asset | Application | boolean | number;

interface CommonTransactionParams {
  fee?: uint64;
  sender?: Address;
  rekeyTo?: Address;
  note?: string;
}

interface CommonOnChainTransactionParams extends Required<CommonTransactionParams> {
  groupIndex: uint64;
  txID: string;
}

interface AppOnChainTransactionParams extends CommonOnChainTransactionParams {
  createdAssetID: Asset;
  createdApplicationID: Application;
  lastLog: bytes;
  applicationID: Application;
  numAppArgs: uint64;
  numAccounts: uint64;
  numAssets: uint64;
  numApplicatons: uint64;
  numLogs: uint64;
  numApprovalProgrammPages: uint64;
  numClearStateProgramPages: uint64;
}

interface AssetTransferParams extends CommonTransactionParams {
  xferAsset: Asset;
  assetAmount: uint64;
  assetSender?: Address;
  assetReceiver: Address;
  assetCloseTo?: Address;
}

interface AssetConfigParams extends CommonTransactionParams {
  configAsset: Asset;
  configAssetManager?: Address;
  configAssetReserve?: Address;
  configAssetFreeze?: Address;
  configAssetClawback?: Address;
}

interface AssetCreateParams extends CommonTransactionParams {
  configAssetName?: bytes;
  configAssetUnitName?: bytes;
  configAssetTotal: uint64;
  configAssetDecimals?: uint64;
  configAssetManager?: Address;
  configAssetReserve?: Address;
  configAssetFreeze?: Address;
  configAssetClawback?: Address;
  configAssetDefaultFrozen?: uint64;
  configAssetURL?: bytes;
  configAssetMetadataHash?: bytes;
}

interface AssetFreezeParams extends CommonTransactionParams {
  freezeAsset: Asset;
  freezeAssetAccount: Address;
  freezeAssetFrozen: boolean;
}

interface PaymentParams extends CommonTransactionParams {
  amount: uint64;
  receiver: Address;
  closeRemainderTo?: Address;
}

interface AppParams extends CommonTransactionParams {
  applicationID?: Application;
  onCompletion?:
    | 'NoOp'
    | 'OptIn'
    | 'CloseOut'
    | 'ClearState'
    | 'UpdateApplication'
    | 'DeleteApplication'
    | 'CreateApplication';
  accounts?: Address[];
  approvalProgram?: bytes;
  applicationArgs?: bytes[];
  clearStateProgram?: bytes;
  applications?: Array<Application>;
  assets?: Array<Asset>;
  globalNumByteSlice?: uint64;
  globalNumUint?: uint64;
  localNumByteSlice?: uint64;
  localNumUint?: uint64;
  extraProgramPages?: uint64;
}

interface KeyRegParams extends CommonTransactionParams {
  votePk?: bytes;
  selectionPK?: bytes;
  stateProofPk?: bytes;
  voteFirst?: uint64;
  voteLast?: uint64;
  voteKeyDilution?: uint64;
}

interface OnlineKeyRegParams extends CommonTransactionParams {
  votePK: bytes;
  selectionPK: bytes;
  stateProofPK: bytes;
  voteFirst: uint64;
  voteLast: uint64;
  voteKeyDilution: uint64;
}

declare type PayTxn = Required<PaymentParams>;
declare type AssetTransferTxn = Required<AssetTransferParams>;
declare type AppCallTxn = AppOnChainTransactionParams & Required<AppParams>;
declare type KeyRegTxn = Required<KeyRegParams>;
declare type AssetConfigTxn = Required<AssetConfigParams>;
declare type AssetFreezeTxn = Required<AssetFreezeParams>;

interface MethodCallParams<ArgsType> extends AppParams {
  /** ABI method arguments */
  methodArgs?: ArgsType;
  /** Name of the ABI method */
  name: string;
}

type ThisTxnParams = AppOnChainTransactionParams & AppParams;

type Txn = PayTxn &
  AssetTransferTxn &
  AppCallTxn &
  KeyRegTxn &
  AssetConfigTxn &
  AssetFreezeTxn & { typeEnum: TransactionType };

declare const globals: {
  minTxnFee: uint64;
  minBalance: uint64;
  maxTxnLife: uint64;
  zeroAddress: Address;
  groupSize: uint64;
  logicSigVersion: uint64;
  round: uint64;
  latestTimestamp: uint64;
  currentApplicationID: Application;
  creatorAddress: Address;
  currentApplicationAddress: Address;
  groupID: bytes;
  opcodeBudget: uint64;
  callerApplicationID: Application;
  callerApplicationAddress: Address;
};

declare function method(signature: string): bytes;
declare function addr(address: string): Address;

declare function sendPayment(params: Expand<PaymentParams>): void;
declare function sendAppCall(params: Expand<AppParams>): void;
declare function sendAssetTransfer(params: Expand<AssetTransferParams>): void;
declare function sendAssetCreation(params: Expand<AssetCreateParams>): Asset;
declare function sendOnlineKeyRegistration(params: Expand<OnlineKeyRegParams>): void;
declare function sendOfflineKeyRegistration(params: Expand<CommonTransactionParams>): void;
declare function sendAssetConfig(params: Expand<AssetConfigParams>): void;
declare function sendAssetFreeze(params: Expand<AssetFreezeParams>): void;

declare type InnerPayment = Expand<PaymentParams>;
declare type InnerAppCall = Expand<AppParams>;
declare type InnerAssetTransfer = Expand<AssetTransferParams>;
declare type InnerAssetConfig = Expand<AssetConfigParams>;
declare type InnerAssetCreation = Expand<AssetCreateParams>;
declare type InnerAssetFreeze = Expand<AssetFreezeParams>;
declare type InnerOnlineKeyRegistration = Expand<OnlineKeyRegParams>;
declare type InnerOfflineKeyRegistration = Expand<CommonTransactionParams>;
declare type InnerMethodCall<ArgsType, ReturnType> = Expand<MethodCallParams<ArgsType>>;

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
declare function sendMethodCall<ArgsType, ReturnType>(params: Expand<MethodCallParams<ArgsType>>): ReturnType;

/**
 * @returns the input data converted to  {@link uint64}
 * @throws if the input data is longer than 8 bytes
 */
declare function btoi(data: BytesLike): uint64;

/** @returns {@link uint64} converted to {@link bytes} */
declare function itob(int: IntLike): bytes;

/** Logs data to the chain. Logs only persist if the app call is successful */
declare function log(content: BytesLike): void;

/** @returns the sha256 hash of the given data */
declare function sha256(data: BytesLike): StaticArray<byte, 32>;

/** @returns the keccak256 hash of the given data */
declare function keccak256(data: BytesLike): StaticArray<byte, 32>;

/** @returns the sha512_256 hash of the given data */
declare function sha512_256(data: BytesLike): StaticArray<byte, 32>;

/**
 *
 * Verify the signature of ("ProgData" || program_hash || data) against the pubkey.
 * The program_hash is the hash of the program source code
 *
 * @param data - Data be verified
 * @param signature - The signature to verify
 * @param pubkey - The public key to verify the signature with
 *
 * @returns true if the signature is valid, false otherwise
 */
declare function ed25519verify(data: BytesLike, signature: BytesLike, pubkey: BytesLike): boolean;

/** @returns the length of the data */
declare function len(data: BytesLike): uint64;

/** @throws if one of the given conditions is 0 or false */
declare function assert(...conditions: IntLike[]): void;

/** @returns The concatenation of two {@link bytes} */
declare function concat(a: BytesLike, b: BytesLike): bytes;

/**
 *
 * @param data The input data from which bytes are extracted
 * @param start The start index of the bytes to extract
 * @param end The end index of the bytes to extract (not inclusive)
 *
 * @returns Extracted bytes
 */
declare function substring3(data: BytesLike, start: IntLike, end: IntLike): bytes;

/** @returns The value of the bit at the given index */
declare function getbit(data: BytesLike, bitIndex: IntLike): boolean;

/**
 * @param data The input data to update
 * @param bitIndex The index of the bit to update
 * @param value The value to set the bit to
 *
 * @returns The updated data
 */
declare function setbit(data: BytesLike, bitIndex: IntLike, value: IntLike): bytes;

/** @returns The value of the byte at the given index */
declare function getbyte(data: BytesLike, byteIndex: IntLike): uint64;

/**
 * @param data The input data to update
 * @param byteIndex The index of the byte to update
 * @param value The value to set the byte to
 *
 * @returns The updated data
 */
declare function setbyte(data: BytesLike, byteIndex: IntLike, value: IntLike): bytes;

/**
 * Extracts a subtstring of the given length starting at the given index
 *
 * @param data bytes to extract from
 * @param start byte index to start extracting from
 * @param length number of bytes to extract
 *
 * @returns extracted bytes
 */
declare function extract3(data: BytesLike, start: IntLike, length: IntLike): bytes;

/**
 * Extracts 2 bytes from the given data starting at the given index and converts them to uint16
 *
 * @param data bytes to extract from
 * @param start byte index to start extracting from
 *
 * @returns uint16 as uint64
 */
declare function extract_uint16(data: BytesLike, byteIndex: IntLike): uint64;

/**
 * Extracts 4 bytes from the given data starting at the given index and converts them to uint32
 *
 * @param data bytes to extract from
 * @param start byte index to start extracting from
 *
 * @returns uint32 as uint64
 */
declare function extract_uint32(data: BytesLike, byteIndex: IntLike): uint64;

/**
 * Extracts 8 bytes from the given data starting at the given index and converts them to uint64
 *
 * @param data bytes to extract from
 * @param start byte index to start extracting from
 *
 * @returns uint64
 */
declare function extract_uint64(data: BytesLike, byteIndex: IntLike): uint64;

/**
 * Replace bytes in the given data starting at the given index
 *
 * @param data data containing the bytes that should be replaced
 * @param byteIndex index of the first byte to replace
 * @param newData bytes to replace with
 *
 * @returns updated data
 */
declare function replace3(data: BytesLike, byteIndex: IntLike, newData: BytesLike): bytes;

/**
 * Verifies the given signature against the given public key and message
 *
 * @param message message to verify
 * @param signature signature to verify
 * @param publicKey public key to verify the signature with
 *
 * @returns true if the signature is valid, false otherwise
 */
declare function ed25519verify_bare(message: BytesLike, signature: BytesLike, publicKey: BytesLike): uint64;

/** @returns square root of the given uint64 */
declare function sqrt(n: IntLike): uint64;

/** @returns square root of the given uintN */
declare function bsqrt(arg0: uint<widths>): uint<widths>;

/**
 * Combines two uint64 into one uint128 and then divides it by another uint64
 *
 * @param dividendHigh high bits of the dividend
 * @param dividendLow low bits of the dividend
 * @param divisor divisor
 */
declare function divw(dividendHigh: IntLike, dividendLow: IntLike, divisor: IntLike): uint64;

/** @returns sha3_256 hash of the given data */
declare function sha3_256(data: BytesLike): StaticArray<byte, 32>;

/**
 * Returns zero bytes of the given size.
 *
 * @param size the number of zero bytes to return. If not given, returns the size of the type given
 * the type argument
 *
 */
declare function bzero<T = bytes>(size?: IntLike): T;

/**
 * Use this method if all inputs to the expression are uint64s,
 * the output fits in a uint64, and all intermediate values fit in a uint128.
 * Otherwise uintN division should be used.
 *
 * @returns product of numerators divided by product of denominator */
declare function wideRatio(numeratorFactors: uint64[], denominatorFactors: uint64[]): uint64;

/** @returns hex input decoded to bytes */
declare function hex(input: string): bytes;

/** @returns bytes interpreted as a number */
declare function btobigint(input: BytesLike): number;

/**
 * Verifies the fields of a transaction against the given parameters.
 *
 * @param txn the transaction to verify
 * @param params the transaction fields to verify in the given transaction
 */
declare function verifyTxn(
  txn: Txn | PayTxn | AssetConfigTxn | AppCallTxn | AssetTransferParams | AssetFreezeParams | KeyRegTxn | ThisTxnParams,
  params: TxnVerificationFields
);

declare type decorator = (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;

declare class allow {
  static call(
    onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication'
  ): decorator;

  static create(
    onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' = 'NoOp'
  ): decorator;

  static bareCall(
    onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication'
  ): decorator;

  static bareCreate(
    onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' = 'NoOp'
  ): decorator;
}

declare class nonABIRouterFallback {
  static call(
    onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication'
  ): decorator;

  static create(
    onComplete: 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication' = 'NoOp'
  ): decorator;
}

declare class abi {
  /** Signifies this method doesn't write any state to the chain, thus it can be
   * called via simulate to avoid fees */
  static readonly: decorator;
}

type StaticArray<T extends BytesLike | IntLike | StaticArray, N extends number> = (T extends byte
  ? string
  : N extends 0
  ? never[]
  : T extends boolean
  ? (true | false)[]
  : T[]) & { __type?: T; __length?: N };

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

declare function templateVar<TmplType extends bytes | number>(name: string): TmplType;

declare function castBytes<T>(input: BytesLike): T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function rawBytes(input: any): bytes;

declare function clone<T>(input: T): T;
