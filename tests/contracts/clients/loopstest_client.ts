import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class LoopsTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYWJpX3JvdXRlX3doaWxlTG9vcDoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgkhPQoJJiYKCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHdoaWxlTG9vcAoJaW50IDEKCXJldHVybgoKd2hpbGVMb29wOgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2xvb3BzLmFsZ28udHM6NgoJLy8gaSA9IDAKCWludCAwCglmcmFtZV9idXJ5IC0xIC8vIGk6IHVpbnQ2NAoKd2hpbGVfMDoKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCWludCAxMAoJPAoJYnogd2hpbGVfMF9lbmQKCgkvLyB0ZXN0cy9jb250cmFjdHMvbG9vcHMuYWxnby50czo5CgkvLyBpID0gaSArIDEKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCWludCAxCgkrCglmcmFtZV9idXJ5IC0xIC8vIGk6IHVpbnQ2NAoJYiB3aGlsZV8wCgp3aGlsZV8wX2VuZDoKCS8vIHRlc3RzL2NvbnRyYWN0cy9sb29wcy5hbGdvLnRzOjEyCgkvLyByZXR1cm4gaTsKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCWl0b2IKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX2Zvckxvb3A6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMwoJY2FsbHN1YiBmb3JMb29wCglpbnQgMQoJcmV0dXJuCgpmb3JMb29wOgoJcHJvdG8gMyAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2xvb3BzLmFsZ28udHM6MTYKCS8vIGkgPSAwCglpbnQgMAoJZnJhbWVfYnVyeSAtMSAvLyBpOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvbG9vcHMuYWxnby50czoxOAoJLy8gaiA9IDAKCWludCAwCglmcmFtZV9idXJ5IC0yIC8vIGo6IHVpbnQ2NAoKZm9yXzA6CglmcmFtZV9kaWcgLTIgLy8gajogdWludDY0CglpbnQgMTAKCTwKCWJ6IGZvcl8wX2VuZAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9sb29wcy5hbGdvLnRzOjE5CgkvLyBpID0gaSArIDEKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCWludCAxCgkrCglmcmFtZV9idXJ5IC0xIC8vIGk6IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9sb29wcy5hbGdvLnRzOjE4CgkvLyBqID0gaiArIDEKCWZyYW1lX2RpZyAtMiAvLyBqOiB1aW50NjQKCWludCAxCgkrCglmcmFtZV9idXJ5IC0yIC8vIGo6IHVpbnQ2NAoJYiBmb3JfMAoKZm9yXzBfZW5kOgoJLy8gdGVzdHMvY29udHJhY3RzL2xvb3BzLmFsZ28udHM6MjIKCS8vIHJldHVybiBpOwoJZnJhbWVfZGlnIC0xIC8vIGk6IHVpbnQ2NAoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCgkvLyBkZWZhdWx0IGNyZWF0ZUFwcGxpY2F0aW9uCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCSYmCglyZXR1cm4KCnJvdXRlX2FiaToKCW1ldGhvZCAid2hpbGVMb29wKCl1aW50NjQiCgltZXRob2QgImZvckxvb3AoKXVpbnQ2NCIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDAKCW1hdGNoIGFiaV9yb3V0ZV93aGlsZUxvb3AgYWJpX3JvdXRlX2Zvckxvb3A=";
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
