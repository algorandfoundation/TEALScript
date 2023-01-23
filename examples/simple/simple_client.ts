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

  override approvalProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGVBcHA6CgljYWxsc3ViIGNyZWF0ZUFwcAoJaW50IDEKCXJldHVybgoKY3JlYXRlQXBwOgoJcHJvdG8gMCAwCglyZXRzdWIKCmFiaV9yb3V0ZV9pbmNyOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCWNhbGxzdWIgaW5jcgoJaW50IDEKCXJldHVybgoKaW5jcjoKCXByb3RvIDEgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MTcKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgaSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCSsKCWFwcF9nbG9iYWxfcHV0CglyZXRzdWIKCmFiaV9yb3V0ZV9kZWNyOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCWNhbGxzdWIgZGVjcgoJaW50IDEKCXJldHVybgoKZGVjcjoKCXByb3RvIDEgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MjEKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpIC0gaSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMSAvLyBpOiB1aW50NjQKCS0KCWFwcF9nbG9iYWxfcHV0CglyZXRzdWIKCmFiaV9yb3V0ZV9hZGQ6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJY2FsbHN1YiBhZGQKCWludCAxCglyZXR1cm4KCmFkZDoKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MjUKCS8vIHJldHVybiBhICsgYjsKCWZyYW1lX2RpZyAtMiAvLyBhOiB1aW50MjU2CglmcmFtZV9kaWcgLTEgLy8gYjogdWludDI1NgoJYisKCWR1cAoJbGVuCglpbnQgMzIKCXN3YXAKCS0KCWJ6ZXJvCglzd2FwCgljb25jYXQKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGVBcHAKCnJvdXRlX2FiaToKCW1ldGhvZCAiaW5jcih1aW50NjQpdm9pZCIKCW1ldGhvZCAiZGVjcih1aW50NjQpdm9pZCIKCW1ldGhvZCAiYWRkKHVpbnQyNTYsdWludDI1Nil1aW50MjU2IgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX2luY3IgYWJpX3JvdXRlX2RlY3IgYWJpX3JvdXRlX2FkZA==';

  override clearProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MzEKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgMSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWludCAxCgkrCglhcHBfZ2xvYmFsX3B1dA==';

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
