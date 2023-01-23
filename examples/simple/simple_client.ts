import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class Simple extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { counter: { type: bkr.AVMType.uint64, key: "counter", desc: "", static: false } }, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYWJpX3JvdXRlX2NyZWF0ZUFwcDoKCWNhbGxzdWIgY3JlYXRlQXBwCglpbnQgMQoJcmV0dXJuCgpjcmVhdGVBcHA6Cglwcm90byAwIDAKCXJldHN1YgoKYWJpX3JvdXRlX2JsYWg6CgljYWxsc3ViIGJsYWgKCWludCAxCglyZXR1cm4KCmJsYWg6Cglwcm90byAwIDAKCXJldHN1YgoKYWJpX3JvdXRlX2luY3I6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJYnRvaQoJY2FsbHN1YiBpbmNyCglpbnQgMQoJcmV0dXJuCgppbmNyOgoJcHJvdG8gMSAwCgoJLy8gZXhhbXBsZXMvc2ltcGxlL3NpbXBsZS50czoyMQoJLy8gdGhpcy5jb3VudGVyLnB1dCh0aGlzLmNvdW50ZXIuZ2V0KCkgKyBpKQoJYnl0ZSAiY291bnRlciIKCWJ5dGUgImNvdW50ZXIiCglhcHBfZ2xvYmFsX2dldAoJZnJhbWVfZGlnIC0xIC8vIGk6IHVpbnQ2NAoJKwoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKYWJpX3JvdXRlX2RlY3I6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJYnRvaQoJY2FsbHN1YiBkZWNyCglpbnQgMQoJcmV0dXJuCgpkZWNyOgoJcHJvdG8gMSAwCgoJLy8gZXhhbXBsZXMvc2ltcGxlL3NpbXBsZS50czoyNQoJLy8gdGhpcy5jb3VudGVyLnB1dCh0aGlzLmNvdW50ZXIuZ2V0KCkgLSBpKQoJYnl0ZSAiY291bnRlciIKCWJ5dGUgImNvdW50ZXIiCglhcHBfZ2xvYmFsX2dldAoJZnJhbWVfZGlnIC0xIC8vIGk6IHVpbnQ2NAoJLQoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgTm9PcAoJdHhuIE9uQ29tcGxldGlvbgoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglpbnQgMQoJbWF0Y2ggYWJpX3JvdXRlX2NyZWF0ZUFwcCBhYmlfcm91dGVfYmxhaAoKcm91dGVfYWJpOgoJbWV0aG9kICJpbmNyKHVpbnQ2NCl2b2lkIgoJbWV0aG9kICJkZWNyKHVpbnQ2NCl2b2lkIgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX2luY3IgYWJpX3JvdXRlX2RlY3I=";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDE7IHJldHVybg==";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "incr", desc: "", args: [{ type: "uint64", name: "i", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "decr", desc: "", args: [{ type: "uint64", name: "i", desc: "" }], returns: { type: "void", desc: "" } })
    ];
    async incr(args: {
        i: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.incr({ i: args.i }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async decr(args: {
        i: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.decr({ i: args.i }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    compose = {
        incr: async (args: {
            i: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "incr"), { i: args.i }, txnParams, atc);
        },
        decr: async (args: {
            i: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "decr"), { i: args.i }, txnParams, atc);
        }
    };
}
