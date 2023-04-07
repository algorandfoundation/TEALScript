import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class MerkleTree extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { root: { type: bkr.AVMType.bytes, key: "root", desc: "", static: false }, size: { type: bkr.AVMType.uint64, key: "size", desc: "", static: false } }, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKY2FsY0luaXRSb290OgoJcHJvdG8gMiAxCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjEzCgkvLyByZXN1bHQgPSBzaGEyNTYoJycpCglieXRlICIiCglzaGEyNTYKCWZyYW1lX2J1cnkgLTEgLy8gcmVzdWx0OiBieXRlcwoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czoxNQoJLy8gaSA9IDAKCWludCAwCglmcmFtZV9idXJ5IC0yIC8vIGk6IHVpbnQ2NAoKZm9yXzA6CglmcmFtZV9kaWcgLTIgLy8gaTogdWludDY0CglpbnQgMwoJPAoJYnogZm9yXzBfZW5kCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjE2CgkvLyByZXN1bHQgPSBzaGEyNTYoY29uY2F0KHJlc3VsdCwgcmVzdWx0KSkKCWZyYW1lX2RpZyAtMSAvLyByZXN1bHQ6IGJ5dGVzCglmcmFtZV9kaWcgLTEgLy8gcmVzdWx0OiBieXRlcwoJY29uY2F0CglzaGEyNTYKCWZyYW1lX2J1cnkgLTEgLy8gcmVzdWx0OiBieXRlcwoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czoxNQoJLy8gaSA9IGkgKyAxCglmcmFtZV9kaWcgLTIgLy8gaTogdWludDY0CglpbnQgMQoJKwoJZnJhbWVfYnVyeSAtMiAvLyBpOiB1aW50NjQKCWIgZm9yXzAKCmZvcl8wX2VuZDoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czoxOQoJLy8gcmV0dXJuIHJlc3VsdDsKCWZyYW1lX2RpZyAtMSAvLyByZXN1bHQ6IGJ5dGVzCglyZXRzdWIKCmhhc2hDb25jYXQ6Cglwcm90byAyIDEKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MjMKCS8vIHJldHVybiBzaGEyNTYoY29uY2F0KGxlZnQsIHJpZ2h0KSk7CglmcmFtZV9kaWcgLTEgLy8gbGVmdDogYnl0ZXMKCWZyYW1lX2RpZyAtMiAvLyByaWdodDogYnl0ZXMKCWNvbmNhdAoJc2hhMjU2CglyZXRzdWIKCmlzUmlnaHRTaWJsaW5nOgoJcHJvdG8gMSAxCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjI3CgkvLyByZXR1cm4gZ2V0Ynl0ZShlbGVtLCAwKSA9PT0gMTcwOwoJZnJhbWVfZGlnIC0xIC8vIGVsZW06IGJ5dGVbMzNdCglpbnQgMAoJZ2V0Ynl0ZQoJaW50IDE3MAoJPT0KCXJldHN1YgoKY2FsY1Jvb3Q6Cglwcm90byA1IDEKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MzEKCS8vIHJlc3VsdCA9IGxlYWYKCWZyYW1lX2RpZyAtMSAvLyBsZWFmOiBieXRlcwoJZnJhbWVfYnVyeSAtMyAvLyByZXN1bHQ6IGJ5dGVzCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjMzCgkvLyBpID0gMAoJaW50IDAKCWZyYW1lX2J1cnkgLTQgLy8gaTogdWludDY0Cgpmb3JfMToKCWZyYW1lX2RpZyAtNCAvLyBpOiB1aW50NjQKCWludCAzCgk8CglieiBmb3JfMV9lbmQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MzQKCS8vIGVsZW0gPSBwYXRoW2ldCglmcmFtZV9kaWcgLTIgLy8gcGF0aDogYnl0ZVszM11bM10KCWZyYW1lX2RpZyAtNCAvLyBpOiB1aW50NjQKCWludCAzMwoJKgoJaW50IDMzCglleHRyYWN0MwoJZnJhbWVfYnVyeSAtNSAvLyBlbGVtOiBieXRlWzMzXQoKCS8vIGlmMF9jb25kaXRpb24KCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czozNgoJLy8gdGhpcy5pc1JpZ2h0U2libGluZyhlbGVtKQoJYnl0ZSAweAoJcG9wCglmcmFtZV9kaWcgLTUgLy8gZWxlbTogYnl0ZVszM10KCWNhbGxzdWIgaXNSaWdodFNpYmxpbmcKCWJ6IGlmMF9lbHNlCgoJLy8gaWYwX2NvbnNlcXVlbnQKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czozNwoJLy8gcmVzdWx0ID0gdGhpcy5oYXNoQ29uY2F0KHJlc3VsdCwgZXh0cmFjdDMoZWxlbSwgMSwgMzIpKQoJYnl0ZSAweAoJcG9wCglmcmFtZV9kaWcgLTUgLy8gZWxlbTogYnl0ZVszM10KCWludCAxCglpbnQgMzIKCWV4dHJhY3QzCglmcmFtZV9kaWcgLTMgLy8gcmVzdWx0OiBieXRlcwoJY2FsbHN1YiBoYXNoQ29uY2F0CglmcmFtZV9idXJ5IC0zIC8vIHJlc3VsdDogYnl0ZXMKCWIgaWYwX2VuZAoKaWYwX2Vsc2U6CgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MzkKCS8vIHJlc3VsdCA9IHRoaXMuaGFzaENvbmNhdChleHRyYWN0MyhlbGVtLCAxLCAzMiksIHJlc3VsdCkKCWJ5dGUgMHgKCXBvcAoJZnJhbWVfZGlnIC0zIC8vIHJlc3VsdDogYnl0ZXMKCWZyYW1lX2RpZyAtNSAvLyBlbGVtOiBieXRlWzMzXQoJaW50IDEKCWludCAzMgoJZXh0cmFjdDMKCWNhbGxzdWIgaGFzaENvbmNhdAoJZnJhbWVfYnVyeSAtMyAvLyByZXN1bHQ6IGJ5dGVzCgppZjBfZW5kOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjMzCgkvLyBpID0gaSArIDEKCWZyYW1lX2RpZyAtNCAvLyBpOiB1aW50NjQKCWludCAxCgkrCglmcmFtZV9idXJ5IC00IC8vIGk6IHVpbnQ2NAoJYiBmb3JfMQoKZm9yXzFfZW5kOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjQzCgkvLyByZXR1cm4gcmVzdWx0OwoJZnJhbWVfZGlnIC0zIC8vIHJlc3VsdDogYnl0ZXMKCXJldHN1YgoKYmFyZV9yb3V0ZV9EZWxldGVBcHBsaWNhdGlvbjoKCXR4biBPbkNvbXBsZXRpb24KCWludCBEZWxldGVBcHBsaWNhdGlvbgoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglhc3NlcnQKCWJ5dGUgMHgKCXBvcAoJY2FsbHN1YiBkZWxldGUKCWludCAxCglyZXR1cm4KCmRlbGV0ZToKCXByb3RvIDAgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo0OAoJLy8gYXNzZXJ0KHRoaXMudHhuLnNlbmRlciA9PT0gdGhpcy5hcHAuY3JlYXRvcikKCXR4biBTZW5kZXIKCXR4bmEgQXBwbGljYXRpb25zIDAKCWFwcF9wYXJhbXNfZ2V0IEFwcENyZWF0b3IKCWFzc2VydAoJPT0KCWFzc2VydAoJcmV0c3ViCgpiYXJlX3JvdXRlX2NyZWF0ZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgk9PQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJcG9wCgljYWxsc3ViIGNyZWF0ZQoJaW50IDEKCXJldHVybgoKY3JlYXRlOgoJcHJvdG8gMCAwCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjUzCgkvLyB0aGlzLnJvb3QucHV0KHRoaXMuY2FsY0luaXRSb290KCkpCglieXRlICJyb290IgoJYnl0ZSAweAoJZHVwbiAxCgljYWxsc3ViIGNhbGNJbml0Um9vdAoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKYWJpX3JvdXRlX3ZlcmlmeToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgkhPQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJcG9wCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglleHRyYWN0IDIgMAoJY2FsbHN1YiB2ZXJpZnkKCWludCAxCglyZXR1cm4KCnZlcmlmeToKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo1NwoJLy8gYXNzZXJ0KHRoaXMucm9vdC5nZXQoKSA9PT0gdGhpcy5jYWxjUm9vdChzaGEyNTYoZGF0YSksIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWFwcF9nbG9iYWxfZ2V0CglieXRlIDB4CglkdXBuIDIKCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoJZnJhbWVfZGlnIC0xIC8vIGRhdGE6IGJ5dGVzCglzaGEyNTYKCWNhbGxzdWIgY2FsY1Jvb3QKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX2FwcGVuZExlYWY6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglhc3NlcnQKCWJ5dGUgMHgKCXBvcAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJZXh0cmFjdCAyIDAKCWNhbGxzdWIgYXBwZW5kTGVhZgoJaW50IDEKCXJldHVybgoKYXBwZW5kTGVhZjoKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo2MQoJLy8gYXNzZXJ0KGRhdGEgIT09ICcnKQoJZnJhbWVfZGlnIC0xIC8vIGRhdGE6IGJ5dGVzCglieXRlICIiCgkhPQoJYXNzZXJ0CgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjYyCgkvLyBhc3NlcnQodGhpcy5yb290LmdldCgpID09PSB0aGlzLmNhbGNSb290KHNoYTI1NignJyksIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWFwcF9nbG9iYWxfZ2V0CglieXRlIDB4CglkdXBuIDIKCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoJYnl0ZSAiIgoJc2hhMjU2CgljYWxsc3ViIGNhbGNSb290Cgk9PQoJYXNzZXJ0CgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjY0CgkvLyB0aGlzLnJvb3QucHV0KHRoaXMuY2FsY1Jvb3Qoc2hhMjU2KGRhdGEpLCBwYXRoKSkKCWJ5dGUgInJvb3QiCglieXRlIDB4CglkdXBuIDIKCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoJZnJhbWVfZGlnIC0xIC8vIGRhdGE6IGJ5dGVzCglzaGEyNTYKCWNhbGxzdWIgY2FsY1Jvb3QKCWFwcF9nbG9iYWxfcHV0CgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjY2CgkvLyB0aGlzLnNpemUucHV0KHRoaXMuc2l6ZS5nZXQoKSArIDEpCglieXRlICJzaXplIgoJYnl0ZSAic2l6ZSIKCWFwcF9nbG9iYWxfZ2V0CglpbnQgMQoJKwoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKYWJpX3JvdXRlX3VwZGF0ZUxlYWY6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglhc3NlcnQKCWJ5dGUgMHgKCXBvcAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJZXh0cmFjdCAyIDAKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWV4dHJhY3QgMiAwCgljYWxsc3ViIHVwZGF0ZUxlYWYKCWludCAxCglyZXR1cm4KCnVwZGF0ZUxlYWY6Cglwcm90byAzIDAKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NzAKCS8vIGFzc2VydChuZXdEYXRhICE9PSAnJykKCWZyYW1lX2RpZyAtMiAvLyBuZXdEYXRhOiBieXRlcwoJYnl0ZSAiIgoJIT0KCWFzc2VydAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo3MQoJLy8gYXNzZXJ0KHRoaXMucm9vdC5nZXQoKSA9PT0gdGhpcy5jYWxjUm9vdChzaGEyNTYob2xkRGF0YSksIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWFwcF9nbG9iYWxfZ2V0CglieXRlIDB4CglkdXBuIDIKCWZyYW1lX2RpZyAtMyAvLyBwYXRoOiBieXRlWzMzXVszXQoJZnJhbWVfZGlnIC0xIC8vIG9sZERhdGE6IGJ5dGVzCglzaGEyNTYKCWNhbGxzdWIgY2FsY1Jvb3QKCT09Cglhc3NlcnQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NzMKCS8vIHRoaXMucm9vdC5wdXQodGhpcy5jYWxjUm9vdChzaGEyNTYobmV3RGF0YSksIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWJ5dGUgMHgKCWR1cG4gMgoJZnJhbWVfZGlnIC0zIC8vIHBhdGg6IGJ5dGVbMzNdWzNdCglmcmFtZV9kaWcgLTIgLy8gbmV3RGF0YTogYnl0ZXMKCXNoYTI1NgoJY2FsbHN1YiBjYWxjUm9vdAoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglibnogYmFyZV9yb3V0ZV9jcmVhdGUKCXR4biBPbkNvbXBsZXRpb24KCWludCBEZWxldGVBcHBsaWNhdGlvbgoJPT0KCWludCAxCgltYXRjaCBiYXJlX3JvdXRlX0RlbGV0ZUFwcGxpY2F0aW9uCgpyb3V0ZV9hYmk6CgltZXRob2QgInZlcmlmeShieXRlW10sYnl0ZVszM11bM10pdm9pZCIKCW1ldGhvZCAiYXBwZW5kTGVhZihieXRlW10sYnl0ZVszM11bM10pdm9pZCIKCW1ldGhvZCAidXBkYXRlTGVhZihieXRlW10sYnl0ZVtdLGJ5dGVbMzNdWzNdKXZvaWQiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfdmVyaWZ5IGFiaV9yb3V0ZV9hcHBlbmRMZWFmIGFiaV9yb3V0ZV91cGRhdGVMZWFm";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "verify", desc: "", args: [{ type: "byte[]", name: "data", desc: "" }, { type: "byte[33][3]", name: "path", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "appendLeaf", desc: "", args: [{ type: "byte[]", name: "data", desc: "" }, { type: "byte[33][3]", name: "path", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "updateLeaf", desc: "", args: [{ type: "byte[]", name: "oldData", desc: "" }, { type: "byte[]", name: "newData", desc: "" }, { type: "byte[33][3]", name: "path", desc: "" }], returns: { type: "void", desc: "" } })
    ];
    async verify(args: {
        data: Uint8Array;
        path: Uint8Array[];
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.verify({ data: args.data, path: args.path }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async appendLeaf(args: {
        data: Uint8Array;
        path: Uint8Array[];
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.appendLeaf({ data: args.data, path: args.path }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async updateLeaf(args: {
        oldData: Uint8Array;
        newData: Uint8Array;
        path: Uint8Array[];
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.updateLeaf({ oldData: args.oldData, newData: args.newData, path: args.path }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    compose = {
        verify: async (args: {
            data: Uint8Array;
            path: Uint8Array[];
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "verify"), { data: args.data, path: args.path }, txnParams, atc);
        },
        appendLeaf: async (args: {
            data: Uint8Array;
            path: Uint8Array[];
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "appendLeaf"), { data: args.data, path: args.path }, txnParams, atc);
        },
        updateLeaf: async (args: {
            oldData: Uint8Array;
            newData: Uint8Array;
            path: Uint8Array[];
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "updateLeaf"), { oldData: args.oldData, newData: args.newData, path: args.path }, txnParams, atc);
        }
    };
}
