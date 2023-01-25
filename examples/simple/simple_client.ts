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

  override approvalProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGVBcHA6CgljYWxsc3ViIGNyZWF0ZUFwcAoJaW50IDEKCXJldHVybgoKY3JlYXRlQXBwOgoJcHJvdG8gMCAwCglyZXRzdWIKCmFiaV9yb3V0ZV9pbmNyOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCWNhbGxzdWIgaW5jcgoJaW50IDEKCXJldHVybgoKaW5jcjoKCXByb3RvIDEgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MTYKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgaSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCSsKCWFwcF9nbG9iYWxfcHV0CglyZXRzdWIKCmFiaV9yb3V0ZV9kZWNyOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCWNhbGxzdWIgZGVjcgoJaW50IDEKCXJldHVybgoKZGVjcjoKCXByb3RvIDEgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MjAKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpIC0gaSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCS0KCWFwcF9nbG9iYWxfcHV0CglyZXRzdWIKCmFiaV9yb3V0ZV9hZGQ6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJY2FsbHN1YiBhZGQKCWludCAxCglyZXR1cm4KCmFkZDoKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MjQKCS8vIHJldHVybiBhICsgYjsKCWZyYW1lX2RpZyAtMiAvLyBhOiB1aW50MjU2CglmcmFtZV9kaWcgLTEgLy8gYjogdWludDI1NgoJYisKCWJ5dGUgMHhGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGCgliJgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgptYWluOgoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCWludCAxCgltYXRjaCBiYXJlX3JvdXRlX2NyZWF0ZUFwcAoKcm91dGVfYWJpOgoJbWV0aG9kICJpbmNyKHVpbnQ2NCl2b2lkIgoJbWV0aG9kICJkZWNyKHVpbnQ2NCl2b2lkIgoJbWV0aG9kICJhZGQodWludDI1Nix1aW50MjU2KXVpbnQyNTYiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfaW5jciBhYmlfcm91dGVfZGVjciBhYmlfcm91dGVfYWRk';

  override clearProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MjkKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgMSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWludCAxCgkrCglhcHBfZ2xvYmFsX3B1dA==';

  override methods: algosdk.ABIMethod[] = [
    new algosdk.ABIMethod({
      name: 'incr', desc: '', args: [{ type: 'uint64', name: 'i', desc: '' }], returns: { type: 'void', desc: '' },
    }),
    new algosdk.ABIMethod({
      name: 'decr', desc: '', args: [{ type: 'uint64', name: 'i', desc: '' }], returns: { type: 'void', desc: '' },
    }),
    new algosdk.ABIMethod({
      name: 'add', desc: '', args: [{ type: 'uint256', name: 'a', desc: '' }, { type: 'uint256', name: 'b', desc: '' }], returns: { type: 'uint256', desc: '' },
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
        a: bigint;
        b: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
    const result = await this.execute(await this.compose.add({ a: args.a, b: args.b }, txnParams));
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
            a: bigint;
            b: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => this.addMethodCall(algosdk.getMethodByName(this.methods, 'add'), { a: args.a, b: args.b }, txnParams, atc),
  };
}
