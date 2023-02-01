import algosdk from 'algosdk';
import * as bkr from 'beaker-ts';

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

  override approvalProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGVBcHA6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlQXBwCglpbnQgMQoJcmV0dXJuCgpjcmVhdGVBcHA6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX2luY3I6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglidG9pCgljYWxsc3ViIGluY3IKCWludCAxCglyZXR1cm4KCmluY3I6Cglwcm90byAyIDAKCgkvLyBleGFtcGxlcy9zaW1wbGUvc2ltcGxlLnRzOjE2CgkvLyB0aGlzLmNvdW50ZXIucHV0KHRoaXMuY291bnRlci5nZXQoKSArIGkpCglieXRlICJjb3VudGVyIgoJYnl0ZSAiY291bnRlciIKCWFwcF9nbG9iYWxfZ2V0CglmcmFtZV9kaWcgLTEgLy8gaTogdWludDY0CgkrCglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgphYmlfcm91dGVfZGVjcjoKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDEKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCWNhbGxzdWIgZGVjcgoJaW50IDEKCXJldHVybgoKZGVjcjoKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MjAKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpIC0gaSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCS0KCWFwcF9nbG9iYWxfcHV0CglyZXRzdWIKCmFiaV9yb3V0ZV9hZGQ6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCgljYWxsc3ViIGFkZAoJaW50IDEKCXJldHVybgoKYWRkOgoJcHJvdG8gMyAwCgoJLy8gZXhhbXBsZXMvc2ltcGxlL3NpbXBsZS50czoyNAoJLy8gcmV0dXJuIGEgKyBiOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQyNTYKCWZyYW1lX2RpZyAtMiAvLyBiOiB1aW50MjU2CgliKwoJYnl0ZSAweEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYKCWImCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zdWI6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCgljYWxsc3ViIHN1YgoJaW50IDEKCXJldHVybgoKc3ViOgoJcHJvdG8gMyAwCgoJLy8gZXhhbXBsZXMvc2ltcGxlL3NpbXBsZS50czoyOAoJLy8gcmV0dXJuIGEgLSBiOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQyNTYKCWZyYW1lX2RpZyAtMiAvLyBiOiB1aW50MjU2CgliLQoJYnl0ZSAweEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYKCWImCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCm1haW46Cgl0eG4gTnVtQXBwQXJncwoJYm56IHJvdXRlX2FiaQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgk9PQoJaW50IDEKCW1hdGNoIGJhcmVfcm91dGVfY3JlYXRlQXBwCgpyb3V0ZV9hYmk6CgltZXRob2QgImluY3IodWludDY0KXZvaWQiCgltZXRob2QgImRlY3IodWludDY0KXZvaWQiCgltZXRob2QgImFkZCh1aW50MjU2LHVpbnQyNTYpdWludDI1NiIKCW1ldGhvZCAic3ViKHVpbnQyNTYsdWludDI1Nil1aW50MjU2IgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX2luY3IgYWJpX3JvdXRlX2RlY3IgYWJpX3JvdXRlX2FkZCBhYmlfcm91dGVfc3Vi';

  override clearProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MzMKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgMSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWludCAxCgkrCglhcHBfZ2xvYmFsX3B1dA==';

  override methods: algosdk.ABIMethod[] = [
    new algosdk.ABIMethod({
      name: 'incr', desc: '', args: [{ type: 'uint64', name: 'i', desc: '' }], returns: { type: 'void', desc: '' },
    }),
    new algosdk.ABIMethod({
      name: 'decr', desc: '', args: [{ type: 'uint64', name: 'i', desc: '' }], returns: { type: 'void', desc: '' },
    }),
    new algosdk.ABIMethod({
      name: 'add', desc: '', args: [{ type: 'uint256', name: 'b', desc: '' }, { type: 'uint256', name: 'a', desc: '' }], returns: { type: 'uint256', desc: '' },
    }),
    new algosdk.ABIMethod({
      name: 'sub', desc: '', args: [{ type: 'uint256', name: 'b', desc: '' }, { type: 'uint256', name: 'a', desc: '' }], returns: { type: 'uint256', desc: '' },
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

  async add(args: {
        b: bigint;
        a: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
    const result = await this.execute(await this.compose.add({ b: args.b, a: args.a }, txnParams));
    return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
  }

  async sub(args: {
        b: bigint;
        a: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
    const result = await this.execute(await this.compose.sub({ b: args.b, a: args.a }, txnParams));
    return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
  }

  compose = {
    incr: async (args: {
            i: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'incr'), { i: args.i }, txnParams, atc),
    decr: async (args: {
            i: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'decr'), { i: args.i }, txnParams, atc),
    add: async (args: {
            b: bigint;
            a: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'add'), { b: args.b, a: args.a }, txnParams, atc),
    sub: async (args: {
            b: bigint;
            a: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'sub'), { b: args.b, a: args.a }, txnParams, atc),
  };
}
