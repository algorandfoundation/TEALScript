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

  override approvalProgram: string = 'I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGVBcHA6CglieXRlIDB4CglkdXBuIDEyNwoJY2FsbHN1YiBjcmVhdGVBcHAKCWludCAxCglyZXR1cm4KCmNyZWF0ZUFwcDoKCXByb3RvIDEyOCAwCglyZXRzdWIKCmFiaV9yb3V0ZV9pbmNyOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCWJ5dGUgMHgKCWR1cG4gMTI2CgljYWxsc3ViIGluY3IKCWludCAxCglyZXR1cm4KCmluY3I6Cglwcm90byAxMjggMAoKCS8vIGV4YW1wbGVzL3NpbXBsZS9zaW1wbGUudHM6MTYKCS8vIHRoaXMuY291bnRlci5wdXQodGhpcy5jb3VudGVyLmdldCgpICsgaSkKCWJ5dGUgImNvdW50ZXIiCglieXRlICJjb3VudGVyIgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMTI4IC8vIGk6IHVpbnQ2NAoJKwoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKYWJpX3JvdXRlX2RlY3I6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJYnRvaQoJYnl0ZSAweAoJZHVwbiAxMjYKCWNhbGxzdWIgZGVjcgoJaW50IDEKCXJldHVybgoKZGVjcjoKCXByb3RvIDEyOCAwCgoJLy8gZXhhbXBsZXMvc2ltcGxlL3NpbXBsZS50czoyMAoJLy8gdGhpcy5jb3VudGVyLnB1dCh0aGlzLmNvdW50ZXIuZ2V0KCkgLSBpKQoJYnl0ZSAiY291bnRlciIKCWJ5dGUgImNvdW50ZXIiCglhcHBfZ2xvYmFsX2dldAoJZnJhbWVfZGlnIC0xMjggLy8gaTogdWludDY0CgktCglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgphYmlfcm91dGVfYWRkOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCXR4bmEgQXBwbGljYXRpb25BcmdzIDIKCWJ5dGUgMHgKCWR1cG4gMTI1CgljYWxsc3ViIGFkZAoJaW50IDEKCXJldHVybgoKYWRkOgoJcHJvdG8gMTI4IDAKCgkvLyBleGFtcGxlcy9zaW1wbGUvc2ltcGxlLnRzOjI0CgkvLyByZXR1cm4gYSArIGI7CglmcmFtZV9kaWcgLTEyOCAvLyBhOiB1aW50MjU2CglmcmFtZV9kaWcgLTEyNyAvLyBiOiB1aW50MjU2CgliKwoJYnl0ZSAweEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYKCWImCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCm1haW46Cgl0eG4gTnVtQXBwQXJncwoJYm56IHJvdXRlX2FiaQoJdHhuIEFwcGxpY2F0aW9uSUQKCWludCAwCgk9PQoJaW50IDEKCW1hdGNoIGJhcmVfcm91dGVfY3JlYXRlQXBwCgpyb3V0ZV9hYmk6CgltZXRob2QgImluY3IodWludDY0KXZvaWQiCgltZXRob2QgImRlY3IodWludDY0KXZvaWQiCgltZXRob2QgImFkZCh1aW50MjU2LHVpbnQyNTYpdWludDI1NiIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDAKCW1hdGNoIGFiaV9yb3V0ZV9pbmNyIGFiaV9yb3V0ZV9kZWNyIGFiaV9yb3V0ZV9hZGQ=';

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
