import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class LoopsTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYWJpX3JvdXRlX3doaWxlTG9vcDoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgkhPQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJY2FsbHN1YiB3aGlsZUxvb3AKCWludCAxCglyZXR1cm4KCndoaWxlTG9vcDoKCXByb3RvIDEgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9sb29wcy5hbGdvLnRzOjYKCS8vIGkgPSAwCglpbnQgMAoJZnJhbWVfYnVyeSAtMSAvLyBpOiB1aW50NjQKCndoaWxlXzA6CglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CglpbnQgMTAKCTwKCWJ6IHdoaWxlXzBfZW5kCgoJLy8gdGVzdHMvY29udHJhY3RzL2xvb3BzLmFsZ28udHM6OQoJLy8gaSA9IGkgKyAxCglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CglpbnQgMQoJKwoJZnJhbWVfYnVyeSAtMSAvLyBpOiB1aW50NjQKCWIgd2hpbGVfMAoKd2hpbGVfMF9lbmQ6CgkvLyB0ZXN0cy9jb250cmFjdHMvbG9vcHMuYWxnby50czoxMgoJLy8gcmV0dXJuIGk7CglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9mb3JMb29wOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCSE9CgkmJgoJYXNzZXJ0CglieXRlIDB4CglkdXAKCWNhbGxzdWIgZm9yTG9vcAoJaW50IDEKCXJldHVybgoKZm9yTG9vcDoKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9sb29wcy5hbGdvLnRzOjE2CgkvLyBpID0gMAoJaW50IDAKCWZyYW1lX2J1cnkgLTEgLy8gaTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2xvb3BzLmFsZ28udHM6MTgKCS8vIGogPSAwCglpbnQgMAoJZnJhbWVfYnVyeSAtMiAvLyBqOiB1aW50NjQKCmZvcl8wOgoJZnJhbWVfZGlnIC0yIC8vIGo6IHVpbnQ2NAoJaW50IDEwCgk8CglieiBmb3JfMF9lbmQKCgkvLyB0ZXN0cy9jb250cmFjdHMvbG9vcHMuYWxnby50czoxOQoJLy8gaSA9IGkgKyAxCglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CglpbnQgMQoJKwoJZnJhbWVfYnVyeSAtMSAvLyBpOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvbG9vcHMuYWxnby50czoxOAoJLy8gaiA9IGogKyAxCglmcmFtZV9kaWcgLTIgLy8gajogdWludDY0CglpbnQgMQoJKwoJZnJhbWVfYnVyeSAtMiAvLyBqOiB1aW50NjQKCWIgZm9yXzAKCmZvcl8wX2VuZDoKCS8vIHRlc3RzL2NvbnRyYWN0cy9sb29wcy5hbGdvLnRzOjIyCgkvLyByZXR1cm4gaTsKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgoJLy8gZGVmYXVsdCBjcmVhdGVBcHBsaWNhdGlvbgoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgk9PQoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09CgkmJgoJcmV0dXJuCgpyb3V0ZV9hYmk6CgltZXRob2QgIndoaWxlTG9vcCgpdWludDY0IgoJbWV0aG9kICJmb3JMb29wKCl1aW50NjQiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfd2hpbGVMb29wIGFiaV9yb3V0ZV9mb3JMb29w";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "whileLoop", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "forLoop", desc: "", args: [], returns: { type: "uint64", desc: "" } })
    ];
    async whileLoop(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.whileLoop(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async forLoop(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.forLoop(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    compose = {
        whileLoop: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "whileLoop"), {}, txnParams, atc);
        },
        forLoop: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "forLoop"), {}, txnParams, atc);
        }
    };
}
