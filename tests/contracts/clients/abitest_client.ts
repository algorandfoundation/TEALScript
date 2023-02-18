import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3N0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKc3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE1CgkvLyBhOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMDAwMDAwMDAwMDAwMTYwMDAwMDAwMDAwMDAwMDIxCglmcmFtZV9idXJ5IC0xIC8vIGE6IHVpbnQ2NFszXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTcKCS8vIHJldHVybiBhWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJZXh0cmFjdCA4IDgKCWJ0b2kKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3JldHVyblN0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiByZXR1cm5TdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKcmV0dXJuU3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIxCgkvLyBhOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMDAwMDAwMDAwMDAwMTYwMDAwMDAwMDAwMDAwMDIxCglmcmFtZV9idXJ5IC0xIC8vIGE6IHVpbnQ2NFszXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjMKCS8vIHJldHVybiBhOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfc3RhdGljQXJyYXlBcmc6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCgljYWxsc3ViIHN0YXRpY0FycmF5QXJnCglpbnQgMQoJcmV0dXJuCgpzdGF0aWNBcnJheUFyZzoKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjcKCS8vIHJldHVybiBhWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFszXQoJZXh0cmFjdCA4IDgKCWJ0b2kKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX25vbkxpdGVyYWxTdGF0aWNBcnJheUVsZW1lbnRzOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gNQoJY2FsbHN1YiBub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50cwoJaW50IDEKCXJldHVybgoKbm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHM6Cglwcm90byA1IDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjMxCgkvLyBuMSA9IDExCglpbnQgMTEKCWZyYW1lX2J1cnkgLTEgLy8gbjE6IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzIKCS8vIG4yID0gMjIKCWludCAyMgoJZnJhbWVfYnVyeSAtMiAvLyBuMjogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozMwoJLy8gbjMgPSAzMwoJaW50IDMzCglmcmFtZV9idXJ5IC0zIC8vIG4zOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM0CgkvLyBhOiBTdGF0aWM8dWludDY0W10sIDM+ID0gW24xLCBuMiwgbjNdCglmcmFtZV9kaWcgLTEgLy8gbjE6IHVpbnQ2NAoJaXRvYgoJZnJhbWVfZGlnIC0yIC8vIG4yOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0zIC8vIG4zOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfYnVyeSAtNCAvLyBhOiB1aW50NjRbM10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM2CgkvLyByZXR1cm4gYVsxXTsKCWZyYW1lX2RpZyAtNCAvLyBhOiB1aW50NjRbM10KCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9taXhlZFN0YXRpY0FycmF5RWxlbWVudHM6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiA1CgljYWxsc3ViIG1peGVkU3RhdGljQXJyYXlFbGVtZW50cwoJaW50IDEKCXJldHVybgoKbWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRzOgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MAoJLy8gbjEgPSAzCglpbnQgMwoJZnJhbWVfYnVyeSAtMSAvLyBuMTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MQoJLy8gbjIgPSA0CglpbnQgNAoJZnJhbWVfYnVyeSAtMiAvLyBuMjogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MgoJLy8gbjMgPSA1CglpbnQgNQoJZnJhbWVfYnVyeSAtMyAvLyBuMzogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MwoJLy8gYTogU3RhdGljPHVpbnQ2NFtdLCA5PiA9IFswLCAxLCAyLCBuMSwgbjIsIG4zLCA2LCA3LCA4XQoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMgoJZnJhbWVfZGlnIC0xIC8vIG4xOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0yIC8vIG4yOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0zIC8vIG4zOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJYnl0ZSAweDAwMDAwMDAwMDAwMDAwMDYwMDAwMDAwMDAwMDAwMDA3MDAwMDAwMDAwMDAwMDAwOAoJY29uY2F0CglmcmFtZV9idXJ5IC00IC8vIGE6IHVpbnQ2NFs5XQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NDUKCS8vIHJldHVybiBhWzFdICsgYVs0XSArIGFbN107CglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzldCglleHRyYWN0IDggOAoJYnRvaQoJZnJhbWVfZGlnIC00IC8vIGE6IHVpbnQ2NFs5XQoJZXh0cmFjdCAzMiA4CglidG9pCgkrCglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzldCglleHRyYWN0IDU2IDgKCWJ0b2kKCSsKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX25vbkxpdGVyYWxTdGF0aWNBcnJheUFjY2VzczoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDMKCWNhbGxzdWIgbm9uTGl0ZXJhbFN0YXRpY0FycmF5QWNjZXNzCglpbnQgMQoJcmV0dXJuCgpub25MaXRlcmFsU3RhdGljQXJyYXlBY2Nlc3M6Cglwcm90byAzIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQ5CgkvLyBhOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMDAwMDAwMDAwMDAwMTYwMDAwMDAwMDAwMDAwMDIxCglmcmFtZV9idXJ5IC0xIC8vIGE6IHVpbnQ2NFszXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NTAKCS8vIG4gPSAxCglpbnQgMQoJZnJhbWVfYnVyeSAtMiAvLyBuOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjUyCgkvLyByZXR1cm4gYVtuXTsKCWZyYW1lX2RpZyAtMSAvLyBhOiB1aW50NjRbM10KCWZyYW1lX2RpZyAtMiAvLyBuOiB1aW50NjQKCWludCA4CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGUKCnJvdXRlX2FiaToKCW1ldGhvZCAic3RhdGljQXJyYXkoKXVpbnQ2NCIKCW1ldGhvZCAicmV0dXJuU3RhdGljQXJyYXkoKXVpbnQ2NFszXSIKCW1ldGhvZCAic3RhdGljQXJyYXlBcmcodWludDY0WzNdKXVpbnQ2NCIKCW1ldGhvZCAibm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHMoKXVpbnQ2NCIKCW1ldGhvZCAibWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRzKCl1aW50NjQiCgltZXRob2QgIm5vbkxpdGVyYWxTdGF0aWNBcnJheUFjY2VzcygpdWludDY0IgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX3N0YXRpY0FycmF5IGFiaV9yb3V0ZV9yZXR1cm5TdGF0aWNBcnJheSBhYmlfcm91dGVfc3RhdGljQXJyYXlBcmcgYWJpX3JvdXRlX25vbkxpdGVyYWxTdGF0aWNBcnJheUVsZW1lbnRzIGFiaV9yb3V0ZV9taXhlZFN0YXRpY0FycmF5RWxlbWVudHMgYWJpX3JvdXRlX25vbkxpdGVyYWxTdGF0aWNBcnJheUFjY2Vzcw==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "staticArray", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "returnStaticArray", desc: "", args: [], returns: { type: "uint64[3]", desc: "" } }),
        new algosdk.ABIMethod({ name: "staticArrayArg", desc: "", args: [{ type: "uint64[3]", name: "a", desc: "" }], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralStaticArrayElements", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "mixedStaticArrayElements", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralStaticArrayAccess", desc: "", args: [], returns: { type: "uint64", desc: "" } })
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
    async nonLiteralStaticArrayAccess(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.nonLiteralStaticArrayAccess(txnParams));
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
        },
        nonLiteralStaticArrayAccess: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "nonLiteralStaticArrayAccess"), {}, txnParams, atc);
        }
    };
}
