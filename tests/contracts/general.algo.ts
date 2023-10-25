import { Contract } from '../../src/lib/index';

class DummyContract extends Contract {}

// eslint-disable-next-line no-unused-vars
class GeneralTest extends Contract {
  txnTypeEnum(): void {
    assert(this.txnGroup[0].typeEnum === TransactionType.Payment);
  }

  txnGroupLength(): uint64 {
    return this.txnGroup.length;
  }

  asserts(arg1: boolean, arg2: boolean): void {
    assert(arg1, arg2, arg1 === arg2);
  }

  verifyTxnFromArg(somePay: PayTxn): void {
    verifyTxn(somePay, { receiver: this.app.address, amount: 100_000 });
  }

  verifyTxnFromTxnGroup(): void {
    verifyTxn(this.txnGroup[0 + 1], { receiver: this.app.address, amount: 100_000 });
  }

  verifyTxnCondition(somePay: PayTxn): void {
    verifyTxn(somePay, {
      receiver: this.app.address,
      amount: { greaterThan: 1, lessThanEqualTo: 10, not: 5 },
    });
  }

  verifyTxnIncludedIn(somePay: PayTxn): void {
    verifyTxn(somePay, {
      amount: { includedIn: [1, 2, 3] },
    });
  }

  verifyTxnNotIncludedIn(somePay: PayTxn): void {
    verifyTxn(somePay, {
      amount: { notIncludedIn: [1, 2, 3] },
    });
  }

  submitPendingGroup(): void {
    this.pendingGroup.addPayment({ amount: 100_000, receiver: this.app.address });
    this.pendingGroup.addAssetCreation({ configAssetTotal: 1 });
    this.pendingGroup.submit();
  }

  methodWithTxnArgs(): void {
    sendMethodCall<[InnerPayment, InnerMethodCall<[uint64], void>], void>({
      name: 'foo',
      methodArgs: [
        { amount: 100_000, receiver: this.txn.sender },
        {
          name: 'bar',
          applicationID: Application.fromID(1337),
          methodArgs: [1],
        },
      ],
    });
  }

  nestedTernary(x: boolean, y: boolean): number {
    // eslint-disable-next-line no-nested-ternary
    return x ? 1 : y ? 2 : 3;
  }

  shift(): void {
    assert(1 << 2);
    assert(3 >> 4);
  }

  fromBytes(): void {
    assert(Address.fromBytes('abc').minBalance);
  }

  fromID(): void {
    log(Application.fromID(123).creator);
    log(Asset.fromID(123).creator);
  }

  tmpl(): void {
    log(templateVar<bytes>('FOO'));
    assert(templateVar<uint64>('BAR'));
  }

  bzeroFunction(): void {
    const n = 1;
    const x: bytes = bzero(2);
    const y: bytes = bzero(n);
    const z: [uint64, uint<8>] = bzero<[uint64, uint<8>]>();
    log(x + y + z);
  }

  myEvent = new EventLogger<[Application, number]>();

  events(): void {
    this.myEvent.log(this.app, 1);
  }

  letOptimization(a: uint64[]): uint64[] {
    assert(a[0]);
    let b = a;
    b = [1, 2, 3];

    return b;
  }

  staticContractProperties(): void {
    sendAppCall({
      approvalProgram: DummyContract.approvalProgram(),
      clearStateProgram: DummyContract.clearProgram(),
      localNumByteSlice: DummyContract.schema.local.numByteSlice,
      localNumUint: DummyContract.schema.local.numUint,
      globalNumByteSlice: DummyContract.schema.global.numByteSlice,
      globalNumUint: DummyContract.schema.global.numUint,
    });
  }
}
