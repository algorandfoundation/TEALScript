declare function addr(address: string): Account
declare function sendPayment(params: PaymentParams): void
declare function sendAppCall(params: AppParams): void
declare function sendAssetTransfer(params: AssetTransferParams): void
declare function sendMethodCall<ArgsType, ReturnType>(params: MethodCallParams<ArgsType>): ReturnType
declare function btoi(bytes: BytesLike): uint64
declare function itob(int: IntLike): bytes
declare function log(content: BytesLike): void
declare function err()
declare function sha256(arg0: ByteLike)
declare function keccak256(arg0: ByteLike)
declare function sha512_256(arg0: ByteLike)
declare function ed25519verify(arg0: ByteLike, arg1: ByteLike, arg2: ByteLike)
declare function len(arg0: ByteLike)
declare function mulw(arg0: IntLike, arg1: IntLike)
declare function addw(arg0: IntLike, arg1: IntLike)
declare function divmodw(arg0: IntLike, arg1: IntLike, arg2: IntLike, arg3: IntLike)
declare function assert(arg0: IntLike)
declare function concat(arg0: ByteLike, arg1: ByteLike)
declare function substring3(arg0: ByteLike, arg1: IntLike, arg2: IntLike)
declare function getbit(arg0: ByteLike, arg1: IntLike)
declare function setbit(arg0: ByteLike, arg1: IntLike, arg2: IntLike)
declare function getbyte(arg0: ByteLike, arg1: IntLike)
declare function setbyte(arg0: ByteLike, arg1: IntLike, arg2: IntLike)
declare function extract3(arg0: ByteLike, arg1: IntLike, arg2: IntLike)
declare function extract_uint16(arg0: ByteLike, arg1: IntLike)
declare function extract_uint32(arg0: ByteLike, arg1: IntLike)
declare function extract_uint64(arg0: ByteLike, arg1: IntLike)
declare function replace3(arg0: ByteLike, arg1: IntLike, arg2: ByteLike)
declare function ed25519verify_bare(arg0: ByteLike, arg1: ByteLike, arg2: ByteLike)
declare function sqrt(arg0: IntLike)
declare function bitlen(arg0: ByteLike)
declare function exp(arg0: IntLike, arg1: IntLike)
declare function expw(arg0: IntLike, arg1: IntLike)
declare function bsqrt(arg0: ByteLike)
declare function divw(arg0: IntLike, arg1: IntLike, arg2: IntLike)
declare function sha3_256(arg0: ByteLike)
