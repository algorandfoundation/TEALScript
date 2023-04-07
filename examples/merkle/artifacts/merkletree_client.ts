import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class MerkleTree extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { root: { type: bkr.AVMType.bytes, key: "root", desc: "", static: false }, size: { type: bkr.AVMType.uint64, key: "size", desc: "", static: false } }, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKY2FsY0luaXRSb290OgoJcHJvdG8gMiAxCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjE3CgkvLyByZXN1bHQgPSBFTVBUWV9IQVNICgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NAoJLy8gc2hhMjU2KCcnKQoJYnl0ZSAiIgoJc2hhMjU2CglmcmFtZV9idXJ5IC0xIC8vIHJlc3VsdDogYnl0ZXMKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MTkKCS8vIGkgPSAwCglpbnQgMAoJZnJhbWVfYnVyeSAtMiAvLyBpOiB1aW50NjQKCmZvcl8wOgoJZnJhbWVfZGlnIC0yIC8vIGk6IHVpbnQ2NAoJaW50IDMKCTwKCWJ6IGZvcl8wX2VuZAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czoyMAoJLy8gcmVzdWx0ID0gc2hhMjU2KGNvbmNhdChyZXN1bHQsIHJlc3VsdCkpCglmcmFtZV9kaWcgLTEgLy8gcmVzdWx0OiBieXRlcwoJZnJhbWVfZGlnIC0xIC8vIHJlc3VsdDogYnl0ZXMKCWNvbmNhdAoJc2hhMjU2CglmcmFtZV9idXJ5IC0xIC8vIHJlc3VsdDogYnl0ZXMKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MTkKCS8vIGkgPSBpICsgMQoJZnJhbWVfZGlnIC0yIC8vIGk6IHVpbnQ2NAoJaW50IDEKCSsKCWZyYW1lX2J1cnkgLTIgLy8gaTogdWludDY0CgliIGZvcl8wCgpmb3JfMF9lbmQ6CgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MjMKCS8vIHJldHVybiByZXN1bHQ7CglmcmFtZV9kaWcgLTEgLy8gcmVzdWx0OiBieXRlcwoJcmV0c3ViCgpoYXNoQ29uY2F0OgoJcHJvdG8gMiAxCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjI3CgkvLyByZXR1cm4gc2hhMjU2KGNvbmNhdChsZWZ0LCByaWdodCkpOwoJZnJhbWVfZGlnIC0xIC8vIGxlZnQ6IGJ5dGVzCglmcmFtZV9kaWcgLTIgLy8gcmlnaHQ6IGJ5dGVzCgljb25jYXQKCXNoYTI1NgoJcmV0c3ViCgppc1JpZ2h0U2libGluZzoKCXByb3RvIDEgMQoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czozMQoJLy8gcmV0dXJuIGdldGJ5dGUoZWxlbSwgMCkgPT09IFJJR0hUX1NJQkxJTkdfUFJFRklYOwoJZnJhbWVfZGlnIC0xIC8vIGVsZW06IGJ5dGVbMzNdCglpbnQgMAoJZ2V0Ynl0ZQoJaW50IDE3MAoJPT0KCXJldHN1YgoKY2FsY1Jvb3Q6Cglwcm90byA1IDEKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MzUKCS8vIHJlc3VsdCA9IGxlYWYKCWZyYW1lX2RpZyAtMSAvLyBsZWFmOiBieXRlcwoJZnJhbWVfYnVyeSAtMyAvLyByZXN1bHQ6IGJ5dGVzCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjM3CgkvLyBpID0gMAoJaW50IDAKCWZyYW1lX2J1cnkgLTQgLy8gaTogdWludDY0Cgpmb3JfMToKCWZyYW1lX2RpZyAtNCAvLyBpOiB1aW50NjQKCWludCAzCgk8CglieiBmb3JfMV9lbmQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MzgKCS8vIGVsZW0gPSBwYXRoW2ldCglmcmFtZV9kaWcgLTIgLy8gcGF0aDogYnl0ZVszM11bM10KCWZyYW1lX2RpZyAtNCAvLyBpOiB1aW50NjQKCWludCAzMwoJKgoJaW50IDMzCglleHRyYWN0MwoJZnJhbWVfYnVyeSAtNSAvLyBlbGVtOiBieXRlWzMzXQoKCS8vIGlmMF9jb25kaXRpb24KCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo0MAoJLy8gdGhpcy5pc1JpZ2h0U2libGluZyhlbGVtKQoJYnl0ZSAweAoJcG9wCglmcmFtZV9kaWcgLTUgLy8gZWxlbTogYnl0ZVszM10KCWNhbGxzdWIgaXNSaWdodFNpYmxpbmcKCWJ6IGlmMF9lbHNlCgoJLy8gaWYwX2NvbnNlcXVlbnQKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo0MQoJLy8gcmVzdWx0ID0gdGhpcy5oYXNoQ29uY2F0KHJlc3VsdCwgZXh0cmFjdDMoZWxlbSwgMSwgMzIpKQoJYnl0ZSAweAoJcG9wCglmcmFtZV9kaWcgLTUgLy8gZWxlbTogYnl0ZVszM10KCWludCAxCglpbnQgMzIKCWV4dHJhY3QzCglmcmFtZV9kaWcgLTMgLy8gcmVzdWx0OiBieXRlcwoJY2FsbHN1YiBoYXNoQ29uY2F0CglmcmFtZV9idXJ5IC0zIC8vIHJlc3VsdDogYnl0ZXMKCWIgaWYwX2VuZAoKaWYwX2Vsc2U6CgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NDMKCS8vIHJlc3VsdCA9IHRoaXMuaGFzaENvbmNhdChleHRyYWN0MyhlbGVtLCAxLCAzMiksIHJlc3VsdCkKCWJ5dGUgMHgKCXBvcAoJZnJhbWVfZGlnIC0zIC8vIHJlc3VsdDogYnl0ZXMKCWZyYW1lX2RpZyAtNSAvLyBlbGVtOiBieXRlWzMzXQoJaW50IDEKCWludCAzMgoJZXh0cmFjdDMKCWNhbGxzdWIgaGFzaENvbmNhdAoJZnJhbWVfYnVyeSAtMyAvLyByZXN1bHQ6IGJ5dGVzCgppZjBfZW5kOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjM3CgkvLyBpID0gaSArIDEKCWZyYW1lX2RpZyAtNCAvLyBpOiB1aW50NjQKCWludCAxCgkrCglmcmFtZV9idXJ5IC00IC8vIGk6IHVpbnQ2NAoJYiBmb3JfMQoKZm9yXzFfZW5kOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjQ3CgkvLyByZXR1cm4gcmVzdWx0OwoJZnJhbWVfZGlnIC0zIC8vIHJlc3VsdDogYnl0ZXMKCXJldHN1YgoKYmFyZV9yb3V0ZV9EZWxldGVBcHBsaWNhdGlvbjoKCXR4biBPbkNvbXBsZXRpb24KCWludCBEZWxldGVBcHBsaWNhdGlvbgoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglhc3NlcnQKCWJ5dGUgMHgKCXBvcAoJY2FsbHN1YiBkZWxldGUKCWludCAxCglyZXR1cm4KCmRlbGV0ZToKCXByb3RvIDAgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo1MgoJLy8gYXNzZXJ0KHRoaXMudHhuLnNlbmRlciA9PT0gdGhpcy5hcHAuY3JlYXRvcikKCXR4biBTZW5kZXIKCXR4bmEgQXBwbGljYXRpb25zIDAKCWFwcF9wYXJhbXNfZ2V0IEFwcENyZWF0b3IKCWFzc2VydAoJPT0KCWFzc2VydAoJcmV0c3ViCgpiYXJlX3JvdXRlX2NyZWF0ZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgk9PQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJcG9wCgljYWxsc3ViIGNyZWF0ZQoJaW50IDEKCXJldHVybgoKY3JlYXRlOgoJcHJvdG8gMCAwCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjU3CgkvLyB0aGlzLnJvb3QucHV0KHRoaXMuY2FsY0luaXRSb290KCkpCglieXRlICJyb290IgoJYnl0ZSAweAoJZHVwbiAxCgljYWxsc3ViIGNhbGNJbml0Um9vdAoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKYWJpX3JvdXRlX3ZlcmlmeToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgkhPQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJcG9wCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglleHRyYWN0IDIgMAoJY2FsbHN1YiB2ZXJpZnkKCWludCAxCglyZXR1cm4KCnZlcmlmeToKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo2MQoJLy8gYXNzZXJ0KHRoaXMucm9vdC5nZXQoKSA9PT0gdGhpcy5jYWxjUm9vdChzaGEyNTYoZGF0YSksIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWFwcF9nbG9iYWxfZ2V0CglieXRlIDB4CglkdXBuIDIKCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoJZnJhbWVfZGlnIC0xIC8vIGRhdGE6IGJ5dGVzCglzaGEyNTYKCWNhbGxzdWIgY2FsY1Jvb3QKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX2FwcGVuZExlYWY6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglhc3NlcnQKCWJ5dGUgMHgKCXBvcAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJZXh0cmFjdCAyIDAKCWNhbGxzdWIgYXBwZW5kTGVhZgoJaW50IDEKCXJldHVybgoKYXBwZW5kTGVhZjoKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo2NQoJLy8gYXNzZXJ0KGRhdGEgIT09ICcnKQoJZnJhbWVfZGlnIC0xIC8vIGRhdGE6IGJ5dGVzCglieXRlICIiCgkhPQoJYXNzZXJ0CgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjY2CgkvLyBhc3NlcnQodGhpcy5yb290LmdldCgpID09PSB0aGlzLmNhbGNSb290KEVNUFRZX0hBU0gsIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWFwcF9nbG9iYWxfZ2V0CglieXRlIDB4CglkdXBuIDIKCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo0CgkvLyBzaGEyNTYoJycpCglieXRlICIiCglzaGEyNTYKCWNhbGxzdWIgY2FsY1Jvb3QKCT09Cglhc3NlcnQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NjgKCS8vIHRoaXMucm9vdC5wdXQodGhpcy5jYWxjUm9vdChzaGEyNTYoZGF0YSksIHBhdGgpKQoJYnl0ZSAicm9vdCIKCWJ5dGUgMHgKCWR1cG4gMgoJZnJhbWVfZGlnIC0yIC8vIHBhdGg6IGJ5dGVbMzNdWzNdCglmcmFtZV9kaWcgLTEgLy8gZGF0YTogYnl0ZXMKCXNoYTI1NgoJY2FsbHN1YiBjYWxjUm9vdAoJYXBwX2dsb2JhbF9wdXQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NzAKCS8vIHRoaXMuc2l6ZS5wdXQodGhpcy5zaXplLmdldCgpICsgMSkKCWJ5dGUgInNpemUiCglieXRlICJzaXplIgoJYXBwX2dsb2JhbF9nZXQKCWludCAxCgkrCglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgphYmlfcm91dGVfdXBkYXRlTGVhZjoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgkhPQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJcG9wCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAzCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCglleHRyYWN0IDIgMAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJZXh0cmFjdCAyIDAKCWNhbGxzdWIgdXBkYXRlTGVhZgoJaW50IDEKCXJldHVybgoKdXBkYXRlTGVhZjoKCXByb3RvIDMgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo3NAoJLy8gYXNzZXJ0KG5ld0RhdGEgIT09ICcnKQoJZnJhbWVfZGlnIC0yIC8vIG5ld0RhdGE6IGJ5dGVzCglieXRlICIiCgkhPQoJYXNzZXJ0CgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjc1CgkvLyBhc3NlcnQodGhpcy5yb290LmdldCgpID09PSB0aGlzLmNhbGNSb290KHNoYTI1NihvbGREYXRhKSwgcGF0aCkpCglieXRlICJyb290IgoJYXBwX2dsb2JhbF9nZXQKCWJ5dGUgMHgKCWR1cG4gMgoJZnJhbWVfZGlnIC0zIC8vIHBhdGg6IGJ5dGVbMzNdWzNdCglmcmFtZV9kaWcgLTEgLy8gb2xkRGF0YTogYnl0ZXMKCXNoYTI1NgoJY2FsbHN1YiBjYWxjUm9vdAoJPT0KCWFzc2VydAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo3NwoJLy8gdGhpcy5yb290LnB1dCh0aGlzLmNhbGNSb290KHNoYTI1NihuZXdEYXRhKSwgcGF0aCkpCglieXRlICJyb290IgoJYnl0ZSAweAoJZHVwbiAyCglmcmFtZV9kaWcgLTMgLy8gcGF0aDogYnl0ZVszM11bM10KCWZyYW1lX2RpZyAtMiAvLyBuZXdEYXRhOiBieXRlcwoJc2hhMjU2CgljYWxsc3ViIGNhbGNSb290CglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCWJueiBiYXJlX3JvdXRlX2NyZWF0ZQoJdHhuIE9uQ29tcGxldGlvbgoJaW50IERlbGV0ZUFwcGxpY2F0aW9uCgk9PQoJaW50IDEKCW1hdGNoIGJhcmVfcm91dGVfRGVsZXRlQXBwbGljYXRpb24KCnJvdXRlX2FiaToKCW1ldGhvZCAidmVyaWZ5KGJ5dGVbXSxieXRlWzMzXVszXSl2b2lkIgoJbWV0aG9kICJhcHBlbmRMZWFmKGJ5dGVbXSxieXRlWzMzXVszXSl2b2lkIgoJbWV0aG9kICJ1cGRhdGVMZWFmKGJ5dGVbXSxieXRlW10sYnl0ZVszM11bM10pdm9pZCIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDAKCW1hdGNoIGFiaV9yb3V0ZV92ZXJpZnkgYWJpX3JvdXRlX2FwcGVuZExlYWYgYWJpX3JvdXRlX3VwZGF0ZUxlYWY=";
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
