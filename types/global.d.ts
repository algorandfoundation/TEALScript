/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */

declare type uint64 = number
declare type bytes = string

declare class BoxMap<KeyType, ValueType> {
  constructor(options?: { defaultSize?: number })

  get(key: KeyType): ValueType

  exists(key: KeyType): ValueType

  delete(key: KeyType): ValueType

  put(key: KeyType, value: ValueType): void
}

declare class Box<ValueType> {
  constructor(options?: { defaultSize?: number, key?: string })

  get(): ValueType

  exists(): ValueType

  delete(): ValueType

  put(value: ValueType): void
}

declare class GlobalMap<KeyType, ValueType> {
  constructor()

  get(key: KeyType): ValueType

  exists(key: KeyType): ValueType

  delete(key: KeyType): ValueType

  put(key: KeyType, value: ValueType): void
}

declare class GlobalValue<ValueType> {
  constructor(options?: { key?: string })

  get(): ValueType

  exists(): ValueType

  delete(): ValueType

  put(value: ValueType): void
}

declare class Asset {}

declare class Account {
  constructor(id: uint64)

  readonly balance: uint64;

  readonly hasBalance: uint64;

  readonly minBalance: uint64;

  readonly assets: uint64;

  assetBalance(asa: Asset): uint64
}

type BytesLike = bytes | Account

declare class Application {
  constructor(id: uint64)

  address: Account;

  clearStateProgram: bytes;

  global(key: BytesLike): any
}

type IntLike = uint64 | Asset | Application

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

interface PaymentParams extends CommonTransactionParams {
  amount: uint64
  receiver: Account
  closeRemainderTo?: Account
}

interface AppParams extends CommonTransactionParams {
  applicationID?: Application
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
  onComplete: bytes
  approvalProgram?: bytes
  clearStateProgram?: bytes
  globalNumByteSlice?: uint64
  globalNumUint?: uint64
  localNumByteSlice?: uint64
  localNumUint?: uint64
}

type Transaction = PayTxn & AssetTransferTxn & AppCallTxn

declare const global: {
  minTxnFee: uint64
  minBalance: uint64
  maxTxnLife: uint64
  zeroAddress: Account
  groupSize: uint64
  logicSigVersion: uint64
  round: uint64
  latestTimestamp: uint64
  currentApplication: Application
  creatorAddress: Account
  currentApplicationAddress: Account
  groupID: bytes
  groupIndex: uint64
  opcodeBudget: uint64
  callerApplication: Application
  callerApplicationAddress: Account
};

declare class Contract {
  itxn: {
    createdApplicationID: Application
  };

  txn: ThisTxnParams;

  txnGroup: Transaction[];

  app: Application;
}

declare function addr(address: string): Account
declare function sendPayment(params: PaymentParams): void
declare function sendAppCall(params: AppParams): void
declare function sendAssetTransfer(params: AssetTransferParams): void
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
