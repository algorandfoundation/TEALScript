import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3N0YXRpY0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzdGF0aWNBcnJheQoJaW50IDEKCXJldHVybgoKc3RhdGljQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE1CgkvLyBhOiBTdGF0aWM8dWludDY0W10sIDM+ID0gWzExLCAyMiwgMzNdCglieXRlIDB4IC8vIEhFSEUKCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDBiMDAwMDAwMDAwMDAwMDAxNjAwMDAwMDAwMDAwMDAwMjEKCWNvbmNhdAoJZnJhbWVfYnVyeSAtMSAvLyBhOiB1aW50NjRbM10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE3CgkvLyByZXR1cm4gYVsxXTsKCWZyYW1lX2RpZyAtMSAvLyBhOiB1aW50NjRbM10KCWludCAxCglpbnQgOAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9yZXR1cm5TdGF0aWNBcnJheToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgcmV0dXJuU3RhdGljQXJyYXkKCWludCAxCglyZXR1cm4KCnJldHVyblN0YXRpY0FycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMQoJLy8gYTogU3RhdGljPHVpbnQ2NFtdLCAzPiA9IFsxMSwgMjIsIDMzXQoJYnl0ZSAweCAvLyBIRUhFCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwYjAwMDAwMDAwMDAwMDAwMTYwMDAwMDAwMDAwMDAwMDIxCgljb25jYXQKCWZyYW1lX2J1cnkgLTEgLy8gYTogdWludDY0WzNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMwoJLy8gcmV0dXJuIGE7CglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zdGF0aWNBcnJheUFyZzoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDEKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWNhbGxzdWIgc3RhdGljQXJyYXlBcmcKCWludCAxCglyZXR1cm4KCnN0YXRpY0FycmF5QXJnOgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyNwoJLy8gcmV0dXJuIGFbMV07CglmcmFtZV9kaWcgLTEgLy8gYTogdWludDY0WzNdCglpbnQgMQoJaW50IDgKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfbm9uTGl0ZXJhbFN0YXRpY0FycmF5RWxlbWVudHM6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiA1CgljYWxsc3ViIG5vbkxpdGVyYWxTdGF0aWNBcnJheUVsZW1lbnRzCglpbnQgMQoJcmV0dXJuCgpub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50czoKCXByb3RvIDUgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzEKCS8vIG4xID0gMTEKCWludCAxMQoJZnJhbWVfYnVyeSAtMSAvLyBuMTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozMgoJLy8gbjIgPSAyMgoJaW50IDIyCglmcmFtZV9idXJ5IC0yIC8vIG4yOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjMzCgkvLyBuMyA9IDMzCglpbnQgMzMKCWZyYW1lX2J1cnkgLTMgLy8gbjM6IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzQKCS8vIGE6IFN0YXRpYzx1aW50NjRbXSwgMz4gPSBbbjEsIG4yLCBuM10KCWJ5dGUgMHggLy8gSEVIRQoJZnJhbWVfZGlnIC0xIC8vIG4xOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0yIC8vIG4yOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfZGlnIC0zIC8vIG4zOiB1aW50NjQKCWl0b2IKCWNvbmNhdAoJZnJhbWVfYnVyeSAtNCAvLyBhOiB1aW50NjRbM10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM2CgkvLyByZXR1cm4gYVsxXTsKCWZyYW1lX2RpZyAtNCAvLyBhOiB1aW50NjRbM10KCWludCAxCglpbnQgOAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9taXhlZFN0YXRpY0FycmF5RWxlbWVudHM6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiA1CgljYWxsc3ViIG1peGVkU3RhdGljQXJyYXlFbGVtZW50cwoJaW50IDEKCXJldHVybgoKbWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRzOgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MAoJLy8gbjEgPSAzCglpbnQgMwoJZnJhbWVfYnVyeSAtMSAvLyBuMTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MQoJLy8gbjIgPSA0CglpbnQgNAoJZnJhbWVfYnVyeSAtMiAvLyBuMjogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MgoJLy8gbjMgPSA1CglpbnQgNQoJZnJhbWVfYnVyeSAtMyAvLyBuMzogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MwoJLy8gYTogU3RhdGljPHVpbnQ2NFtdLCA5PiA9IFswLCAxLCAyLCBuMSwgbjIsIG4zLCA2LCA3LCA4XQoJYnl0ZSAweCAvLyBIRUhFCglieXRlIDB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAyCgljb25jYXQKCWZyYW1lX2RpZyAtMSAvLyBuMTogdWludDY0CglpdG9iCgljb25jYXQKCWZyYW1lX2RpZyAtMiAvLyBuMjogdWludDY0CglpdG9iCgljb25jYXQKCWZyYW1lX2RpZyAtMyAvLyBuMzogdWludDY0CglpdG9iCgljb25jYXQKCWJ5dGUgMHgwMDAwMDAwMDAwMDAwMDA2MDAwMDAwMDAwMDAwMDAwNzAwMDAwMDAwMDAwMDAwMDgKCWNvbmNhdAoJZnJhbWVfYnVyeSAtNCAvLyBhOiB1aW50NjRbOV0KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQ1CgkvLyByZXR1cm4gYVsxXSArIGFbNF0gKyBhWzddOwoJZnJhbWVfZGlnIC00IC8vIGE6IHVpbnQ2NFs5XQoJaW50IDEKCWludCA4CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWZyYW1lX2RpZyAtNCAvLyBhOiB1aW50NjRbOV0KCWludCA0CglpbnQgOAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCgkrCglmcmFtZV9kaWcgLTQgLy8gYTogdWludDY0WzldCglpbnQgNwoJaW50IDgKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJKwoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCWludCAxCgltYXRjaCBiYXJlX3JvdXRlX2NyZWF0ZQoKcm91dGVfYWJpOgoJbWV0aG9kICJzdGF0aWNBcnJheSgpdWludDY0IgoJbWV0aG9kICJyZXR1cm5TdGF0aWNBcnJheSgpdWludDY0WzNdIgoJbWV0aG9kICJzdGF0aWNBcnJheUFyZyh1aW50NjRbM10pdWludDY0IgoJbWV0aG9kICJub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50cygpdWludDY0IgoJbWV0aG9kICJtaXhlZFN0YXRpY0FycmF5RWxlbWVudHMoKXVpbnQ2NCIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDAKCW1hdGNoIGFiaV9yb3V0ZV9zdGF0aWNBcnJheSBhYmlfcm91dGVfcmV0dXJuU3RhdGljQXJyYXkgYWJpX3JvdXRlX3N0YXRpY0FycmF5QXJnIGFiaV9yb3V0ZV9ub25MaXRlcmFsU3RhdGljQXJyYXlFbGVtZW50cyBhYmlfcm91dGVfbWl4ZWRTdGF0aWNBcnJheUVsZW1lbnRz";
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
