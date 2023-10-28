import { Contract } from '../../src/lib/index';

class DummyContract extends Contract {}

// eslint-disable-next-line no-unused-vars
class GeneralTest extends Contract {
  txnTypeEnum(): void {
    assert(this.txnGroup[0].typeEnum === TransactionType.ApplicationCall);
  }

  txnGroupLength(): void {
    assert(this.txnGroup.length === 1);
  }

  asserts(arg1: boolean, arg2: boolean): void {
    assert(arg1, arg2, arg1 === arg2);
  }

  verifyTxnFromArg(somePay: PayTxn): void {
    verifyTxn(somePay, { receiver: this.app.address, amount: 100_000 });
  }

  verifyTxnFromTxnGroup(): void {
    verifyTxn(this.txnGroup[0], { sender: this.txn.sender });
  }

  verifyTxnCondition(): void {
    verifyTxn(this.txn, {
      applicationID: { greaterThan: 1 },
    });
  }

  verifyTxnIncludedIn(): void {
    verifyTxn(this.txn, {
      sender: { includedIn: [this.txn.sender] },
    });
  }

  verifyTxnNotIncludedIn(): void {
    verifyTxn(this.txn, {
      sender: { notIncludedIn: [globals.zeroAddress] },
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
    assert(1 << 2 === 4);
    assert(4 >> 1 === 2);
  }

  fromBytes(): void {
    assert(Address.fromBytes('abc').minBalance);
  }

  fromID(): void {
    log(Application.fromID(123).creator);
    log(Asset.fromID(123).creator);
  }

  bzeroFunction(): void {
    const n = 1;
    const x: bytes = bzero(2); // 2
    const y: bytes = bzero(n); // 3
    const z: [uint64, uint<8>] = bzero<[uint64, uint<8>]>(); // 12
    assert(len(x + y + z) === 12);
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

  uintNToUint64InMethodArgs(): void {
    sendMethodCall<[number], void>({
      name: 'registerCreature',
      methodArgs: [1 as uint<8>],
    });
  }

  numberToString(): void {
    const n = 1;
    const s = '1';
    assert(n.toString() === s);
  }
}

// eslint-disable-next-line no-unused-vars
class Templates extends Contract {
  tmpl(): void {
    log(templateVar<bytes>('FOO'));
    assert(templateVar<uint64>('BAR'));
  }
}
