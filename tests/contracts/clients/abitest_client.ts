import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3N0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKc3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE1CgkvLyBhOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglieXRlIDB4CglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMDAwMDAwMDAwMDAwMTYwMDAwMDAwMDAwMDAwMDIxCgljb25jYXQKCWZyYW1lX2J1cnkgLTEgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxNwoJLy8gcmV0dXJuIGFbMV07CglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglpbnQgMQoJaW50IDgKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfcmV0dXJuU3RhdGljQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHJldHVyblN0YXRpY0FycmF5CglpbnQgMQoJcmV0dXJuCgpyZXR1cm5TdGF0aWNBcnJheToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjEKCS8vIGE6IFN0YXRpYzx1aW50NjRbXSwgMz4gPSBbMTEsIDIyLCAzM10KCWJ5dGUgMHgKCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDBiMDAwMDAwMDAwMDAwMDAxNjAwMDAwMDAwMDAwMDAwMjEKCWNvbmNhdAoJZnJhbWVfYnVyeSAtMSAvLyBhOiB1aW50NjRbM10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIzCgkvLyByZXR1cm4gYTsKCWZyYW1lX2RpZyAtMSAvLyBhOiB1aW50NjRbM10KCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3N0YXRpY0FycmF5QXJnOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMQoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJY2FsbHN1YiBzdGF0aWNBcnJheUFyZwoJaW50IDEKCXJldHVybgoKc3RhdGljQXJyYXlBcmc6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjI3CgkvLyByZXR1cm4gYVsxXTsKCWZyYW1lX2RpZyAtMSAvLyBhOiB1aW50NjRbM10KCWludCAxCglpbnQgOAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9ub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50czoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDUKCWNhbGxzdWIgbm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHMKCWludCAxCglyZXR1cm4KCm5vbkxpdGVyYWxTdGF0aWNBcnJheUVsZW1lbnRzOgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozMQoJLy8gbjEgPSAxMQoJaW50IDExCglmcmFtZV9idXJ5IC0xIC8vIG4xOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjMyCgkvLyBuMiA9IDIyCglpbnQgMjIKCWZyYW1lX2J1cnkgLTIgLy8gbjI6IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzMKCS8vIG4zID0gMzMKCWludCAzMwoJZnJhbWVfYnVyeSAtMyAvLyBuMzogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozNAoJLy8gYTogU3RhdGljPHVpbnQ2NFtdLCAzPiA9IFtuMSwgbjIsIG4zXQoJYnl0ZSAweAoJZnJhbWVfZGlnIC0xIC8vIG4xOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0yIC8vIG4yOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0zIC8vIG4zOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfYnVyeSAtNCAvLyBhOiB1aW50NjRbM10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM2CgkvLyByZXR1cm4gYVsxXTsKCWZyYW1lX2RpZyAtNCAvLyBhOiB1aW50NjRbM10KCWludCAxCglpbnQgOAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9taXhlZFN0YXRpY0FycmF5RWxlbWVudHM6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiA1CgljYWxsc3ViIG1peGVkU3RhdGljQXJyYXlFbGVtZW50cwoJaW50IDEKCXJldHVybgoKbWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRzOgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MAoJLy8gbjEgPSAzCglpbnQgMwoJZnJhbWVfYnVyeSAtMSAvLyBuMTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MQoJLy8gbjIgPSA0CglpbnQgNAoJZnJhbWVfYnVyeSAtMiAvLyBuMjogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MgoJLy8gbjMgPSA1CglpbnQgNQoJZnJhbWVfYnVyeSAtMyAvLyBuMzogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MwoJLy8gYTogU3RhdGljPHVpbnQ2NFtdLCA5PiA9IFswLCAxLCAyLCBuMSwgbjIsIG4zLCA2LCA3LCA4XQoJYnl0ZSAweAoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMgoJY29uY2F0CglmcmFtZV9kaWcgLTEgLy8gbjE6IHVpbnQ2NAoJaXRvYgoJY29uY2F0CglmcmFtZV9kaWcgLTIgLy8gbjI6IHVpbnQ2NAoJaXRvYgoJY29uY2F0CglmcmFtZV9kaWcgLTMgLy8gbjM6IHVpbnQ2NAoJaXRvYgoJY29uY2F0CglieXRlIDB4MDAwMDAwMDAwMDAwMDAwNjAwMDAwMDAwMDAwMDAwMDcwMDAwMDAwMDAwMDAwMDA4Cgljb25jYXQKCWZyYW1lX2J1cnkgLTQgLy8gYTogdWludDY0WzldCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0NQoJLy8gcmV0dXJuIGFbMV0gKyBhWzRdICsgYVs3XTsKCWZyYW1lX2RpZyAtNCAvLyBhOiB1aW50NjRbOV0KCWludCAxCglpbnQgOAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzldCglpbnQgNAoJaW50IDgKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJKwoJZnJhbWVfZGlnIC00IC8vIGE6IHVpbnQ2NFs5XQoJaW50IDcKCWludCA4CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCSsKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGUKCnJvdXRlX2FiaToKCW1ldGhvZCAic3RhdGljQXJyYXkoKXVpbnQ2NCIKCW1ldGhvZCAicmV0dXJuU3RhdGljQXJyYXkoKXVpbnQ2NFszXSIKCW1ldGhvZCAic3RhdGljQXJyYXlBcmcodWludDY0WzNdKXVpbnQ2NCIKCW1ldGhvZCAibm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHMoKXVpbnQ2NCIKCW1ldGhvZCAibWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRzKCl1aW50NjQiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfc3RhdGljQXJyYXkgYWJpX3JvdXRlX3JldHVyblN0YXRpY0FycmF5IGFiaV9yb3V0ZV9zdGF0aWNBcnJheUFyZyBhYmlfcm91dGVfbm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHMgYWJpX3JvdXRlX21peGVkU3RhdGljQXJyYXlFbGVtZW50cw==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "staticArray", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "returnStaticArray", desc: "", args: [], returns: { type: "uint64[3]", desc: "" } }),
        new algosdk.ABIMethod({ name: "staticArrayArg", desc: "", args: [{ type: "uint64[3]", name: "a", desc: "" }], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralStaticArrayElements", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "mixedStaticArrayElements", desc: "", args: [], returns: { type: "uint64", desc: "" } })
    ];
    async staticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.staticArray(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async returnStaticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint[]>> {
        const result = await this.execute(await this.compose.returnStaticArray(txnParams));
        return new bkr.ABIResult<bigint[]>(result, result.returnValue as bigint[]);
    }
    async staticArrayArg(args: {
        a: bigint[];
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.staticArrayArg({ a: args.a }, txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async nonLiteralStaticArrayElements(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.nonLiteralStaticArrayElements(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async mixedStaticArrayElements(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.mixedStaticArrayElements(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    compose = {
        staticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArray"), {}, txnParams, atc);
        },
        returnStaticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "returnStaticArray"), {}, txnParams, atc);
        },
        staticArrayArg: async (args: {
            a: bigint[];
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "staticArrayArg"), { a: args.a }, txnParams, atc);
        },
        nonLiteralStaticArrayElements: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "nonLiteralStaticArrayElements"), {}, txnParams, atc);
        },
        mixedStaticArrayElements: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "mixedStaticArrayElements"), {}, txnParams, atc);
        }
    };
}
