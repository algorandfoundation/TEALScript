import { Contract } from '../../src/lib/index';
import { IfTest } from './if.algo';

class DummyContract extends Contract {}

// eslint-disable-next-line no-unused-vars
class Templates extends Contract {
  bytesTmplVar = TemplateVar<bytes>();

  uint64TmplVar = TemplateVar<uint64>();

  tmpl(): void {
    log(this.bytesTmplVar);
    assert(this.uint64TmplVar);
  }
}

// eslint-disable-next-line no-unused-vars
class ProgramVersion extends Contract {
  programVersion = 8;
}

// eslint-disable-next-line no-unused-vars
class GeneralTest extends Contract {
  scratch = ScratchSlot<uint64>(0);

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

  /**
   * This is my event
   * It has some args
   */
  myEvent = new EventLogger<{
    /** Some app */
    app: Application;
    /** Some number */
    num: number;
  }>();

  events(): void {
    this.myEvent.log({ app: this.app, num: 1 });
  }

  letOptimization(a: uint64[]): uint64[] {
    assert(a[0]);
    let b = a;
    b = [1, 2, 3];

    return b;
  }

  staticContractProperties(): void {
    sendAppCall({
      onCompletion: OnCompletion.NoOp,
      approvalProgram: DummyContract.approvalProgram(),
      clearStateProgram: DummyContract.clearProgram(),
      localNumByteSlice: DummyContract.schema.local.numByteSlice,
      localNumUint: DummyContract.schema.local.numUint,
      globalNumByteSlice: DummyContract.schema.global.numByteSlice,
      globalNumUint: DummyContract.schema.global.numUint,
    });
  }

  numberToString(): void {
    const n = 1;
    const s = '1';
    assert(n.toString() === s);
  }

  methodOnParens(): void {
    assert((1 + 2).toString() === '3');
  }

  stringSubstring(): void {
    const s = 'abcdef';
    assert(s.substring(1, 3) === 'bc');
  }

  idProperty(): void {
    const app = Application.zeroIndex;
    assert(Application.fromID(app.id) === app);

    const asa = Asset.zeroIndex;
    assert(Asset.fromID(asa.id) === asa);
  }

  scratchSlot(): void {
    this.scratch.value = 1337;
    assert(this.scratch.value === 1337);
  }

  ecdsa(): [uint<256>, uint<256>] {
    ecdsa_verify('Secp256k1', '' as StaticArray<byte, 32>, 1, 2, 3, 4);
    ecdsa_pk_decompress('Secp256k1', '' as StaticArray<byte, 33>);
    return ecdsa_pk_recover('Secp256k1', '' as StaticArray<byte, 32>, 1, 2, 3);
  }

  verifyTxnTypes(): void {
    verifyPayTxn(this.txnGroup[0], {
      amount: { greaterThan: 0 },
    });

    verifyAppCallTxn(this.txnGroup[0], {
      applicationID: Application.fromID(0),
    });

    verifyAssetTransferTxn(this.txnGroup[0], {
      assetReceiver: this.app.address,
    });

    verifyAssetConfigTxn(this.txnGroup[0], {
      configAsset: Asset.fromID(0),
    });

    verifyKeyRegTxn(this.txnGroup[0], {
      voteFirst: 1337,
    });
  }

  stringPlusEquals(): void {
    let s = 'foo';
    s += 'bar';
    assert(s === 'foobar');
  }

  importedProgram(): bytes {
    return IfTest.approvalProgram();
  }

  callPrivateDefinedLater(): void {
    log(this.privateMethod('hello'));
  }

  private privateMethod(msg: string): string {
    return msg;
  }

  interalPublicMethod(a: uint64, b: uint64): uint64 {
    return a + b;
  }

  callInternalPublicMethod(): void {
    assert(this.interalPublicMethod(1, 2) === 3);
  }

  appLoadScratch(): void {
    log(this.txnGroup[1].loadScratch(2) as bytes);
  }
}
