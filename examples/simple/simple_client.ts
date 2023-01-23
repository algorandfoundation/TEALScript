import algosdk from 'algosdk';
import * as bkr from 'beaker-ts';

// eslint-disable-next-line import/prefer-default-export
export class Simple extends bkr.ApplicationClient {
  desc: string = '';

  override appSchema: bkr.Schema = {
    declared: {
      counter: {
        type: bkr.AVMType.uint64, key: 'counter', desc: '', static: false,
      },
    },
    reserved: {},
  };

  override acctSchema: bkr.Schema = { declared: {}, reserved: {} };

  override approvalProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGVBcHA6CgljYWxsc3ViIGNyZWF0ZUFwcAoJaW50IDEKCXJldHVybgoKY3JlYXRlQXBwOgoJcHJvdG8gMCAwCglyZXRzdWIKCmJhcmVfcm91dGVfYmxhaDoKCWNhbGxzdWIgYmxhaAoJaW50IDEKCXJldHVybgoKYmxhaDoKCXByb3RvIDAgMAoJcmV0c3ViCgphYmlfcm91dGVfaW5jcjoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0Cgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglidG9pCgljYWxsc3ViIGluY3IKCWludCAxCglyZXR1cm4KCmluY3I6Cglwcm90byAxIDAKCgkvLyBleGFtcGxlcy9zaW1wbGUvc2ltcGxlLnRzOjI3CgkvLyB0aGlzLmNvdW50ZXIucHV0KHRoaXMuY291bnRlci5nZXQoKSArIGkpCglieXRlICJjb3VudGVyIgoJYnl0ZSAiY291bnRlciIKCWFwcF9nbG9iYWxfZ2V0CglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CgkrCglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgphYmlfcm91dGVfZGVjcjoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0Cgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglidG9pCgljYWxsc3ViIGRlY3IKCWludCAxCglyZXR1cm4KCmRlY3I6Cglwcm90byAxIDAKCgkvLyBleGFtcGxlcy9zaW1wbGUvc2ltcGxlLnRzOjMxCgkvLyB0aGlzLmNvdW50ZXIucHV0KHRoaXMuY291bnRlci5nZXQoKSAtIGkpCglieXRlICJjb3VudGVyIgoJYnl0ZSAiY291bnRlciIKCWFwcF9nbG9iYWxfZ2V0CglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CgktCglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCSYmCglpbnQgTm9PcAoJdHhuIE9uQ29tcGxldGlvbgoJPT0KCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJIT0KCSYmCglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGVBcHAgYmFyZV9yb3V0ZV9ibGFoCgpyb3V0ZV9hYmk6CgltZXRob2QgImluY3IodWludDY0KXZvaWQiCgltZXRob2QgImRlY3IodWludDY0KXZvaWQiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfaW5jciBhYmlfcm91dGVfZGVjcg==';

  override clearProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MTUKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgMSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWludCAxCgkrCglhcHBfZ2xvYmFsX3B1dA==';

  override methods: algosdk.ABIMethod[] = [
    new algosdk.ABIMethod({
      name: 'incr', desc: '', args: [{ type: 'uint64', name: 'i', desc: '' }], returns: { type: 'void', desc: '' },
    }),
    new algosdk.ABIMethod({
      name: 'decr', desc: '', args: [{ type: 'uint64', name: 'i', desc: '' }], returns: { type: 'void', desc: '' },
    }),
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
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'incr'), { i: args.i }, txnParams, atc),
    decr: async (args: {
            i: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'decr'), { i: args.i }, txnParams, atc),
  };
}
