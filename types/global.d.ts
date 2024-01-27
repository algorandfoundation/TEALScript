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
type Brand<K, T> = K | (K & { __brand?: T });

declare type uint<N extends widths> = Brand<number, `uint${N}`>;
declare type uint8 = uint<8> | number;
declare type uint16 = uint<16> | number;
declare type uint32 = uint<32> | number;
declare type uint64 = uint<64> | number;
declare type uint128 = uint<128> | number;
declare type uint256 = uint<256> | number;

declare type ufixed<N extends widths, M extends precisions> = Brand<number, `ufixed${N}x${M}`>;

declare type byte = Brand<string, 'byte'>;
declare type bytes = Brand<string, 'bytes'>;
declare type bytes32 = StaticArray<byte, 32>;
declare type bytes64 = StaticArray<byte, 64>;

declare type TxnVerificationTests = {
  lessThan?: IntLike;
  lessThanEqualTo?: IntLike;
  greaterThan?: IntLike;
  greaterThanEqualTo?: IntLike;
  not?: IntLike | BytesLike;
  includedIn?: (IntLike | BytesLike)[];
  notIncludedIn?: (IntLike | BytesLike)[];
};

declare type CommonTxnVerificationFields = {
  sender?: Address | TxnVerificationTests;
  fee?: IntLike | TxnVerificationTests;
  firstValid?: IntLike | TxnVerificationTests;
  firstValidTime?: IntLike | TxnVerificationTests;
  lastValid?: IntLike | TxnVerificationTests;
  note?: BytesLike | TxnVerificationTests;
  lease?: bytes32 | TxnVerificationTests;
  rekeyTo?: Address | TxnVerificationTests;
  groupIndex?: IntLike | TxnVerificationTests;
  txID?: bytes32 | TxnVerificationTests;
};

declare type PayTxnVerificationFields = CommonTxnVerificationFields & {
  receiver?: Address | TxnVerificationTests;
  amount?: IntLike | TxnVerificationTests;
  closeRemainderTo?: Address | TxnVerificationTests;
};

declare type KeyRegTxnVerificationFields = CommonTxnVerificationFields & {
  votePK?: bytes32 | TxnVerificationTests;
  selectionPK?: bytes32 | TxnVerificationTests;
  voteFirst?: IntLike | TxnVerificationTests;
  voteLast?: IntLike | TxnVerificationTests;
  voteKeyDilution?: IntLike | TxnVerificationTests;
  nonparticipation?: boolean | TxnVerificationTests;
};

declare type AssetTransferTxnVerificationFields = CommonTxnVerificationFields & {
  xferAsset?: Asset | TxnVerificationTests;
  assetAmount?: IntLike | TxnVerificationTests;
  assetSender?: Address | TxnVerificationTests;
  assetReceiver?: Address | TxnVerificationTests;
  assetCloseTo?: Address | TxnVerificationTests;
};

declare type AssetConfigTxnVerificationFields = CommonTxnVerificationFields & {
  configAsset?: IntLike | TxnVerificationTests;
  configAssetTotal?: IntLike | TxnVerificationTests;
  configAssetDecimals?: IntLike | TxnVerificationTests;
  configAssetDefaultFrozen?: boolean | TxnVerificationTests;
  configAssetUnitName?: BytesLike | TxnVerificationTests;
  configAssetName?: BytesLike | TxnVerificationTests;
  configAssetURL?: BytesLike | TxnVerificationTests;
  configAssetMetadataHash?: bytes32 | TxnVerificationTests;
  configAssetManager?: Address | TxnVerificationTests;
  configAssetReserve?: Address | TxnVerificationTests;
  configAssetFreeze?: Address | TxnVerificationTests;
  configAssetClawback?: Address | TxnVerificationTests;
  freezeAsset?: IntLike | TxnVerificationTests;
  freezeAssetAccount?: Address | TxnVerificationTests;
  freezeAssetFrozen?: boolean | TxnVerificationTests;
};

declare type TxnArrayVerificationField<K, T> = { [P in K]?: T };

declare type AppCallTxnVerificationFields = CommonTxnVerificationFields & {
  logs?: TxnArrayVerificationField<
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
    BytesLike | TxnVerificationTests
  >;
  applicationArgs?: TxnArrayVerificationField<
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
    BytesLike | TxnVerificationTests
  >;
  accounts?: TxnArrayVerificationField<0 | 1 | 2 | 3, Address | TxnVerificationTests>;
  assets?: TxnArrayVerificationField<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, IntLike | TxnVerificationTests>;
  applications?: TxnArrayVerificationField<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, IntLike | TxnVerificationTests>;
  applicationID?: Application | TxnVerificationTests;
  onCompletion?: IntLike | TxnVerificationTests;
  numAppArgs?: IntLike | TxnVerificationTests;
  numAccounts?: IntLike | TxnVerificationTests;
  approvalProgram?: BytesLike | TxnVerificationTests;
  clearStateProgram?: BytesLike | TxnVerificationTests;
  numAssets?: IntLike | TxnVerificationTests;
  numApplications?: IntLike | TxnVerificationTests;
  globalNumUint?: IntLike | TxnVerificationTests;
  globalNumByteSlice?: IntLike | TxnVerificationTests;
  localNumUint?: IntLike | TxnVerificationTests;
  localNumByteSlice?: IntLike | TxnVerificationTests;
  extraProgramPages?: IntLike | TxnVerificationTests;
  numLogs?: IntLike | TxnVerificationTests;
  lastLog?: BytesLike | TxnVerificationTests;
  approvalProgramPages?: BytesLike | TxnVerificationTests;
  numApprovalProgramPages?: IntLike | TxnVerificationTests;
  clearStateProgramPages?: BytesLike | TxnVerificationTests;
  numClearStateProgramPages?: IntLike | TxnVerificationTests;
};

declare type TxnVerificationFields = PayTxnVerificationFields &
  KeyRegTxnVerificationFields &
  AssetTransferTxnVerificationFields &
  AssetConfigTxnVerificationFields &
  AppCallTxnVerificationFields & {
    type?: BytesLike | TxnVerificationTests;
    typeEnum?: IntLike | TxnVerificationTests;
  };

declare class Asset {
  static fromID(index: uint64): Asset;

  static readonly zeroIndex: Asset;

  readonly id: uint64;

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

  readonly isInLedger: uint64;

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

  isOptedInToAsset(asa: Asset): uint64;

  assetFrozen(asa: Asset): uint64;

  isOptedInToApp(app: Application): boolean;
}

class Account extends Address {}

type BytesLike = bytes | Address | string;

declare class Application {
  static fromID(appID: uint64): Application;

  readonly id: uint64;

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

  globalState(key: BytesLike): unknown;

  localState(account: Address, key: BytesLike): unknown;
}

declare class EventLogger<ArgumentTypes extends Object> {
  constructor();

  log(args: ArgumentTypes): void;
}

declare type BoxValue<ValueType> = {
  value: ValueType;
  delete: () => void;
  exists: boolean;
  create(size?: uint64): void;
  replace(offset: uint64, value: bytes): void;
  extract(offset: uint64, length: uint64): bytes;
  size: uint64;
  /**
   * Change the size of the box dding zero bytes to end or removing bytes from the end, as needed.
   * Throws error if the box does not exist or the size is larger than 32,768.
   *
   * @param size The new size of the box
   */
  resize(size: uint64): void;
  /**
   * Remove bytes from the box starting at the given offset and replace them with the given data.
   *
   * @param offset
   * @param length
   * @param data
   */
  splice(offset: uint64, length: uint64, data: bytes): void;
};

declare function BoxKey<ValueType>(options?: { key?: string; dynamicSize?: boolean }): BoxValue<ValueType>;

declare function BoxMap<KeyType, ValueType>(options?: {
  dynamicSize?: boolean;
  prefix?: string;
  allowPotentialCollisions?: boolean;
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
  allowPotentialCollisions?: boolean;
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
  allowPotentialCollisions?: boolean;
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
  loadScratch: (slot: uint64) => unknown;
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
  amount?: uint64;
  receiver?: Address;
  closeRemainderTo?: Address;
}

// eslint-disable-next-line no-shadow
enum OnCompletion {
  NoOp = 0,
  OptIn = 1,
  CloseOut = 2,
  ClearState = 3,
  UpdateApplication = 4,
  DeleteApplication = 5,
}

interface AppParams extends CommonTransactionParams {
  applicationID?: Application;
  onCompletion?: OnCompletion;
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

/** Get information from the given block.
 * Fails unless the block falls between `this.txn.lastValid-1002` and `this.txn.firstValid` (exclusive) */
declare const blocks: {
  /** The block seed */
  seed: bytes;
  /** The timestamp of the block */
  timestamp: uint64;
}[];

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

declare type InnerPayment = PaymentParams;
declare type InnerAppCall = AppParams;
declare type InnerAssetTransfer = AssetTransferParams;
declare type InnerAssetConfig = AssetConfigParams;
declare type InnerAssetCreation = AssetCreateParams;
declare type InnerAssetFreeze = AssetFreezeParams;
declare type InnerOnlineKeyRegistration = OnlineKeyRegParams;
declare type InnerOfflineKeyRegistration = CommonTransactionParams;
declare type InnerMethodCall<ArgsType, ReturnType> = MethodCallParams<ArgsType>;

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
declare function sha256(data: BytesLike): bytes32;

/** @returns the keccak256 hash of the given data */
declare function keccak256(data: BytesLike): bytes32;

/** @returns the sha512_256 hash of the given data */
declare function sha512_256(data: BytesLike): bytes32;

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
declare function ed25519Verify(data: BytesLike, signature: BytesLike, pubkey: BytesLike): boolean;

/** @returns the length of the data */
declare function len(data: BytesLike): uint64;

/** @throws if the given condition is false */
declare function assert(condition: IntLike, message?: string): void;

/** @throws if one of the given conditions is false */
declare function asserts(...conditions: IntLike[]): void;

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function getbit(data: BytesLike | uint64, bitIndex: uint64): boolean;

/**
 * @param data The input data to update
 * @param bitIndex The index of the bit to update
 * @param value The value to set the bit to
 *
 * @returns The updated data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function setbit<InputType extends bytes | uint64>(
  data: InputType,
  bitIndex: uint64,
  value: boolean
): InputType extends string ? bytes : uint64;

/** @returns The value of the byte at the given index */
declare function getbyte(data: BytesLike, byteIndex: uint64): uint64;

/**
 * @param data The input data to update
 * @param byteIndex The index of the byte to update
 * @param value The value to set the byte to
 *
 * @returns The updated data
 */
declare function setbyte(data: bytes, byteIndex: uint64, value: uint64): bytes;

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
declare function extractUint16(data: BytesLike, byteIndex: IntLike): uint64;

/**
 * Extracts 4 bytes from the given data starting at the given index and converts them to uint32
 *
 * @param data bytes to extract from
 * @param start byte index to start extracting from
 *
 * @returns uint32 as uint64
 */
declare function extractUint32(data: BytesLike, byteIndex: IntLike): uint64;

/**
 * Extracts 8 bytes from the given data starting at the given index and converts them to uint64
 *
 * @param data bytes to extract from
 * @param start byte index to start extracting from
 *
 * @returns uint64
 */
declare function extractUint64(data: BytesLike, byteIndex: IntLike): uint64;

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
declare function ed25519VerifyBare(message: BytesLike, signature: BytesLike, publicKey: BytesLike): boolean;

/** @returns square root of the given integer */
declare function sqrt(n: IntLike | uint): uint;

/**
 * Combines two uint64 into one uint128 and then divides it by another uint64
 *
 * @param dividendHigh high bits of the dividend
 * @param dividendLow low bits of the dividend
 * @param divisor divisor
 */
declare function divw(dividendHigh: IntLike, dividendLow: IntLike, divisor: IntLike): uint64;

/** @returns sha3_256 hash of the given data */
declare function sha3_256(data: BytesLike): bytes32;

/**
 *
 * @param curve The curve being used
 * @param data The data that was signed
 * @param sSignatureComponent The s component of the lower-S signature
 * @param rSignatureComponent The r component of the lower-S signature
 * @param xPubkeyComponent The x component of the public key
 * @param yPubkeyComponent The y component of the public key
 *
 * @returns true if the signature is valid, false otherwise
 */
declare function ecdsaVerify(
  curve: 'Secp256k1' | 'Secp256r1',
  data: bytes32,
  sSignatureComponent: uint<256>,
  rSignatureComponent: uint<256>,
  xPubkeyComponent: uint<256>,
  yPubkeyComponent: uint<256>
): boolean;

/**
 *
 * @param curve The curve being used
 * @param pubKey The public key to decompress
 *
 * @returns The X and Y components of the decompressed public key
 */
declare function ecdsaPkDecompress(
  curve: 'Secp256k1' | 'Secp256r1',
  pubKey: StaticArray<byte, 33>
): [uint<256>, uint<256>];

/**
 *
 * @param curve The curve being used
 * @param data The data that was signed
 * @param recoveryID The recovery ID
 * @param sSignatureComponent The s component of the lower-S signature
 * @param rSignatureComponent The r component of the lower-S signature
 *
 * @returns The X and Y components of the recovered public key
 */
declare function ecdsaPkRecover(
  curve: 'Secp256k1' | 'Secp256r1',
  data: bytes32,
  recoveryID: uint64,
  sSignatureComponent: uint<256>,
  rSignatureComponent: uint<256>
): [uint<256>, uint<256>];

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

/**
 * Verifies the fields of a pay transaction against the given parameters.
 *
 * @param txn the transaction to verify
 * @param params the transaction fields to verify in the given transaction
 */
declare function verifyPayTxn(txn: Txn | PayTxn, params: PayTxnVerificationFields): txn is PayTxn;

/**
 * Verifies the fields of an asset config transaction against the given parameters.
 *
 * @param txn the transaction to verify
 * @param params the transaction fields to verify in the given transaction
 */
declare function verifyAssetConfigTxn(
  txn: Txn | AssetConfigTxn,
  params: AssetConfigTxnVerificationFields
): txn is AssetConfigTxn;

/**
 * Verifies the fields of an asset transfer transaction against the given parameters.
 *
 * @param txn the transaction to verify
 * @param params the transaction fields to verify in the given transaction
 */
declare function verifyAssetTransferTxn(
  txn: Txn | AssetTransferTxn,
  params: AssetTransferTxnVerificationFields
): txn is AssetTransferTxn;

/**
 * Verifies the fields of an app call transaction against the given parameters.
 *
 * @param txn the transaction to verify
 * @param params the transaction fields to verify in the given transaction
 */
declare function verifyAppCallTxn(
  txn: ThisTxnParams | Txn | AppCallTxn,
  params: AppCallTxnVerificationFields
): txn is AppCallTxn;

/**
 * Verifies the fields of a key reg transaction against the given parameters.
 *
 * @param txn the transaction to verify
 * @param params the transaction fields to verify in the given transaction
 */
declare function verifyKeyRegTxn(txn: Txn | KeyRegTxn, params: KeyRegTxnVerificationFields): txn is KeyRegTxn;

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

type StaticArray<T extends BytesLike | IntLike | StaticArray, N extends number> = Brand<
  T extends byte ? string : N extends 0 ? never[] : T extends boolean ? (true | false)[] : T[],
  T
>;

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

declare function TemplateVar<TmplType>(name?: string): TmplType;

declare function castBytes<T>(input: BytesLike): T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function rawBytes(input: any): bytes;

declare function clone<T>(input: T): T;

declare type ScratchValue<ValueType> = {
  value: ValueType;
};

declare function ScratchSlot<ValueType>(slot: number): ScratchValue<ValueType>;

/**
 * Send an inner transaction app call to increase the current opcode budget.
 * This will also send any pending transaction in the same group.
 * For every call of this function, the required fee is increased by 1000 microAlgos.
 */
declare function increaseOpcodeBudget();

declare type ECGroup = 'BN254g1' | 'BN254g2' | 'BLS12_381g1' | 'BLS12_381g2';

/**
 * Verify VRF proof of a message against the given public key
 *
 * @param standard VRF standard to use. Currently only VrfAlgorand is supported which is ECVRF-ED25519-SHA512-Elligator2, specified in the IETF internet draft [draft-irtf-cfrg-vrf-03](https://datatracker.ietf.org/doc/draft-irtf-cfrg-vrf/03/).
 * @param message The message to verify
 * @param proof The VRF proof
 * @param pubkey The VRF public key
 */
declare function vrfVefiry(
  standard: 'VrfAlgorand',
  message: bytes,
  proof: StaticArray<byte, 80>,
  pubkey: bytes32
): { verified: boolean; output: bytes };

/**
 * Sum two curve points
 * @param group The target group
 * @param a The first point to add
 * @param b The second point to add
 */
declare function ecAdd(group: ECGroup, a: bytes, b: bytes): bytes;

/**
 * Return the point multiplied by the scalar
 *
 * @param point The point to multiply
 * @param scalar The scalar to multiply
 */
declare function ecScalarMul(group: ECGroup, point: bytes, scalar: bytes): bytes;

/**
 * Checks if the product of the pairing of each point in A with its respective point in B is equal to the identity element of the target group
 *
 * @param group The target group
 * @param a Concatenated points of the target group
 * @param b Concatenated if the associated group
 */
declare function ecPairingCheck(group: ECGroup, a: bytes, b: bytes): boolean;

/**
 * for curve points A and scalars B, return curve point B0A0 + B1A1 + B2A2 + ... + BnAn
 *
 * @param group The target group
 * @param points The concatenated points to multiply
 * @param scalars The scalars to multiply
 *
 */
declare function ecMultiScalarMul(group: ECGroup, points: bytes, scalars: bytes32[]): bytes;

/**
 * Checks if the given point is in the main prime-order subgroup of the target group. Fails if the point is not in the group at all.
 *
 * @param group The target group
 * @param point The point to check
 *
 */
declare function ecSubgroupCheck(group: ECGroup, point: bytes): boolean;

/**
 * Maps field element to the target group.
 *
 * BN254 points are mapped by the SVDW map. BLS12-381 points are mapped by the SSWU map.
 * G1 element inputs are base field elements and G2 element inputs are quadratic field elements,
 * with nearly the same encoding rules (for field elements) as defined in ec_add.
 *
 * There is one difference of encoding rule: G1 element inputs do not need to be 0-padded if
 * they fit in less than 32 bytes for BN254 and less than 48 bytes for BLS12-381. (As usual,
 * the empty byte array represents 0.) G2 elements inputs need to be always have the required size.
 *
 * @param group The target group
 * @param fieldElement The field element to map
 */
declare function ecMapTo(group: ECGroup, fieldElement: bytes): bytes;

/**
 * The highest set bit in the input. If the input is a byte-array, it is interpreted as a big-endian unsigned integer. bitlen of 0 is 0, bitlen of 8 is 4
 *
 * @param input The input to get the higher bit from
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function bitlen(input: any): uint64;
