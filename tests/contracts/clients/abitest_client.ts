import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3N0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKc3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE1CgkvLyBjOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglpbnQgMTEKCWl0b2IKCWludCAyMgoJaXRvYgoJaW50IDMzCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CglmcmFtZV9idXJ5IC0xIC8vIGM6IHVpbnQ2NFszXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTcKCS8vIHJldHVybiBjWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFszXQoJaW50IDEKCWludCA4CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3JldHVyblN0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiByZXR1cm5TdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKcmV0dXJuU3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIxCgkvLyBjOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglpbnQgMTEKCWl0b2IKCWludCAyMgoJaXRvYgoJaW50IDMzCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CglmcmFtZV9idXJ5IC0xIC8vIGM6IHVpbnQ2NFszXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjMKCS8vIHJldHVybiBjOwoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFszXQoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCWludCAxCgltYXRjaCBiYXJlX3JvdXRlX2NyZWF0ZQoKcm91dGVfYWJpOgoJbWV0aG9kICJzdGF0aWNBcnJheSgpdWludDY0IgoJbWV0aG9kICJyZXR1cm5TdGF0aWNBcnJheSgpdWludDY0WzNdIgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX3N0YXRpY0FycmF5IGFiaV9yb3V0ZV9yZXR1cm5TdGF0aWNBcnJheQ==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "staticArray", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "returnStaticArray", desc: "", args: [], returns: { type: "uint64[3]", desc: "" } })
    ];
    async staticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.staticArray(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async returnStaticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint[]>> {
        const result = await this.execute(await this.compose.returnStaticArray(txnParams));
        return new bkr.ABIResult<bigint[]>(result, result.returnValue as bigint[]);
    }
    compose = {
        staticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArray"), {}, txnParams, atc);
        },
        returnStaticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "returnStaticArray"), {}, txnParams, atc);
        }
    };
}
