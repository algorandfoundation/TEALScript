/* eslint-disable no-unused-vars */
import { Contract } from '../../src/lib/index';

type CustomType = {
  foo: uint<16>;
  bar: string;
};

class ABITestStaticArray extends Contract {
  staticArray(): uint64 {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    return a[1];
  }
}

class ABITestReturnStaticArray extends Contract {
  returnStaticArray(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    return a;
  }
}

class ABITestStaticArrayArg extends Contract {
  staticArrayArg(a: StaticArray<uint64, 3>): uint64 {
    return a[1];
  }
}

class ABITestNonLiteralStaticArrayElements extends Contract {
  nonLiteralStaticArrayElements(): uint64 {
    const n1 = 11;
    const n2 = 22;
    const n3 = 33;
    const a: StaticArray<uint64, 3> = [n1, n2, n3];

    return a[1];
  }
}

class ABITestMixedStaticArrayElements extends Contract {
  mixedStaticArrayElements(): uint64 {
    const n1 = 3;
    const n2 = 4;
    const n3 = 5;
    const a: StaticArray<uint64, 9> = [0, 1, 2, n1, n2, n3, 6, 7, 8];

    return a[1] + a[4] + a[7];
  }
}

class ABITestNonLiteralStaticArrayAccess extends Contract {
  nonLiteralStaticArrayAccess(): uint64 {
    const a: StaticArray<uint64, 3> = [11, 22, 33];
    const n = 2;

    return a[n];
  }
}

class ABITestSetStaticArrayElement extends Contract {
  setStaticArrayElement(): uint64 {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    a[1] = 222;

    return a[1];
  }
}

class ABITestStaticArrayInStorageRef extends Contract {
  gRef = GlobalStateKey<StaticArray<uint64, 3>>({ key: 'gRef' });

  lRef = LocalStateKey<StaticArray<uint64, 3>>({ key: 'lRef' });

  bRef = BoxKey<StaticArray<uint64, 3>>({ key: 'bRef' });

  gMap = GlobalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  lMap = LocalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  bMap = BoxMap<bytes, StaticArray<uint64, 3>>({ allowPotentialCollisions: true });

  @allow.call('OptIn')
  staticArrayInStorageRef(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gRef.value = a;
    this.lRef(this.txn.sender).value = a;
    this.bRef.value = a;

    const ret: StaticArray<uint64, 3> = [this.gRef.value[1], this.lRef(this.txn.sender).value[1], this.bRef.value[1]];

    return ret;
  }
}

class ABITestUpdateStaticArrayInStorageRef extends Contract {
  gRef = GlobalStateKey<StaticArray<uint64, 3>>({ key: 'gRef' });

  lRef = LocalStateKey<StaticArray<uint64, 3>>({ key: 'lRef' });

  bRef = BoxKey<StaticArray<uint64, 3>>({ key: 'bRef' });

  gMap = GlobalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  lMap = LocalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  bMap = BoxMap<bytes, StaticArray<uint64, 3>>({ allowPotentialCollisions: true });

  @allow.call('OptIn')
  updateStaticArrayInStorageRef(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gRef.value = a;
    this.lRef(this.txn.sender).value = a;
    this.bRef.value = a;

    this.gRef.value[1] = 111;
    this.lRef(this.txn.sender).value[1] = 222;
    this.bRef.value[1] = 333;

    const ret: StaticArray<uint64, 3> = [this.gRef.value[1], this.lRef(this.txn.sender).value[1], this.bRef.value[1]];

    return ret;
  }
}

class ABITestStaticArrayInStorageMap extends Contract {
  gRef = GlobalStateKey<StaticArray<uint64, 3>>({ key: 'gRef' });

  lRef = LocalStateKey<StaticArray<uint64, 3>>({ key: 'lRef' });

  bRef = BoxKey<StaticArray<uint64, 3>>({ key: 'bRef' });

  gMap = GlobalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  lMap = LocalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  bMap = BoxMap<bytes, StaticArray<uint64, 3>>({ allowPotentialCollisions: true });

  @allow.call('OptIn')
  staticArrayInStorageMap(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gMap('gMap').value = a;
    this.lMap(this.txn.sender, 'lMap').value = a;
    this.bMap('bMap').value = a;

    const ret: StaticArray<uint64, 3> = [
      this.gMap('gMap').value[1],
      this.lMap(this.txn.sender, 'lMap').value[1],
      this.bMap('bMap').value[1],
    ];

    return ret;
  }
}

class ABITestUpdateStaticArrayInStorageMap extends Contract {
  gRef = GlobalStateKey<StaticArray<uint64, 3>>({ key: 'gRef' });

  lRef = LocalStateKey<StaticArray<uint64, 3>>({ key: 'lRef' });

  bRef = BoxKey<StaticArray<uint64, 3>>({ key: 'bRef' });

  gMap = GlobalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  lMap = LocalStateMap<bytes, StaticArray<uint64, 3>>({ maxKeys: 1, allowPotentialCollisions: true });

  bMap = BoxMap<bytes, StaticArray<uint64, 3>>({ allowPotentialCollisions: true });

  @allow.call('OptIn')
  updateStaticArrayInStorageMap(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gMap('gMap').value = a;
    this.lMap(this.txn.sender, 'lMap').value = a;
    this.bMap('bMap').value = a;

    this.gMap('gMap').value[1] = 1111;
    this.lMap(this.txn.sender, 'lMap').value[1] = 2222;
    this.bMap('bMap').value[1] = 3333;

    const ret: StaticArray<uint64, 3> = [
      this.gMap('gMap').value[1],
      this.lMap(this.txn.sender, 'lMap').value[1],
      this.bMap('bMap').value[1],
    ];

    return ret;
  }
}

class ABITestNestedStaticArray extends Contract {
  nestedStaticArray(): uint64 {
    const a: StaticArray<StaticArray<uint64, 3>, 3> = [
      [11, 22, 33],
      [44, 55, 66],
      [77, 88, 99],
    ];

    return a[1][1];
  }
}

class ABITestUpdateNestedStaticArrayElement extends Contract {
  updateNestedStaticArrayElement(): uint64 {
    const a: StaticArray<StaticArray<uint64, 3>, 3> = [
      [11, 22, 33],
      [44, 55, 66],
      [77, 88, 99],
    ];

    a[1][1] = 555;

    return a[1][1];
  }
}

class ABITestUpdateNestedStaticArray extends Contract {
  updateNestedStaticArray(): uint64 {
    const a: StaticArray<StaticArray<uint64, 3>, 3> = [
      [11, 22, 33],
      [44, 55, 66],
      [77, 88, 99],
    ];

    a[1] = [444, 555, 666];

    return a[1][1];
  }
}

class ABITestThreeDimensionalUint16Array extends Contract {
  threeDimensionalUint16Array(): uint<16> {
    const a: StaticArray<StaticArray<StaticArray<uint<16>, 2>, 2>, 2> = [
      [
        [11, 22],
        [33, 44],
      ],
      [
        [55, 66],
        [77, 88],
      ],
    ];

    a[1][1] = [777, 888];

    return a[1][1][1];
  }
}

class ABITestSimpleTuple extends Contract {
  simpleTuple(): uint<16> {
    const a: [uint64, uint<16>, uint64, uint<16>] = [11, 22, 33, 44];

    return a[3];
  }
}

class ABITestArrayInTuple extends Contract {
  arrayInTuple(): uint64 {
    const a: [uint64, uint<16>, StaticArray<uint64, 2>, uint<16>] = [11, 22, [33, 44], 55];

    return a[2][1];
  }
}

class ABITestTupleInArray extends Contract {
  tupleInArray(): uint<16> {
    const a: StaticArray<[uint64, uint<16>], 2> = [
      [11, 22],
      [33, 44],
    ];

    return a[1][1];
  }
}

class ABITestTupleInTuple extends Contract {
  tupleInTuple(): uint64 {
    const a: [uint<16>, uint<16>, [uint64, uint<16>], [uint<16>, uint64]] = [11, 22, [33, 44], [55, 66]];

    return a[3][1];
  }
}

class ABITestShortTypeNotation extends Contract {
  shortTypeNotation(): uint<16> {
    const a: [StaticArray<uint<16>, 2>, StaticArray<uint64, 2>, StaticArray<uint<16>, 2>] = [
      [11, 22],
      [33, 44],
      [55, 66],
    ];

    return a[2][1];
  }
}

class ABITestDisgusting extends Contract {
  disgusting(): uint64 {
    const a: StaticArray<
      [StaticArray<uint<16>, 2>, uint64, [uint<16>, uint64], StaticArray<StaticArray<uint64, 2>, 2>],
      2
    > = [
      [
        [11, 22],
        33,
        [44, 55],
        [
          [66, 77],
          [88, 99],
        ],
      ],
      [
        [111, 222],
        333,
        [444, 555],
        [
          [666, 777],
          [888, 999],
        ],
      ],
    ];

    a[1][3][1] = [8888, 9999];
    return a[1][3][1][0]; // 8888
  }
}

class ABITestReturnTuple extends Contract {
  returnTuple(): [uint64, uint<16>, uint64] {
    const a: [uint64, uint<16>, uint64] = [11, 22, 33];
    return a;
  }
}

class ABITestTupleArg extends Contract {
  tupleArg(a: [uint64, uint<16>, uint64]): uint<16> {
    return a[1];
  }
}

class ABITestDynamicArray extends Contract {
  dynamicArray(): uint64 {
    const a: uint64[] = [11, 22, 33];

    return a[1];
  }
}

class ABITestReturnDynamicArray extends Contract {
  returnDynamicArray(): uint64[] {
    const a: uint64[] = [11, 22, 33];
    return a;
  }
}

class ABITestDynamicArrayArg extends Contract {
  dynamicArrayArg(a: uint64[]): uint64 {
    return a[1];
  }
}

class ABITestUpdateDynamicArrayElement extends Contract {
  updateDynamicArrayElement(): uint64 {
    const a: uint64[] = [11, 22, 33];

    a[1] = 222;

    return a[1];
  }
}

class ABITestDynamicTupleArray extends Contract {
  dynamicTupleArray(): uint64 {
    const a: [uint<16>, uint64][] = [
      [11, 22],
      [33, 44],
    ];

    return a[1][1];
  }
}

class ABITestReturnTupleWithDyamicArray extends Contract {
  returnTupleWithDyamicArray(): [uint64, uint<16>, uint64[], uint<16>[]] {
    const a: [uint64, uint<16>, uint64[], uint<16>[]] = [1, 2, [3, 4], [5, 6]];

    return a;
  }
}

class ABITestReturnDynamicArrayFromTuple extends Contract {
  returnDynamicArrayFromTuple(): uint<8>[] {
    const a: [uint<8>, uint<16>, uint<8>[], uint<16>[], uint<8>[]] = [1, 2, [3, 4], [5, 6], [7, 8]];

    return a[4]; // [7, 8]
  }
}

class ABITestUpdateDynamicArrayInTuple extends Contract {
  updateDynamicArrayInTuple(): [uint<8>, uint<16>[], uint<8>[], uint<16>[], uint<8>[]] {
    const a: [uint<8>, uint<16>[], uint<8>[], uint<16>[], uint<8>[]] = [9, [8], [7], [6], [5]];

    a[0] = 99 as uint<8>;
    a[1] = [10, 11];
    a[2] = [12, 13];
    a[3] = [14, 15];
    a[4] = [16, 17];

    return a;
  }
}

class ABITestNonLiteralDynamicElementInTuple extends Contract {
  nonLiteralDynamicElementInTuple(): [uint<8>, uint<16>, uint<8>[], uint<16>[], uint<8>[]] {
    const e: uint<16>[] = [5, 6];
    const a: [uint<8>, uint<16>, uint<8>[], uint<16>[], uint<8>[]] = [1, 2, [3, 4], e, [7, 8]];

    return a;
  }
}

class ABITestArrayPush extends Contract {
  arrayPush(): uint<16>[] {
    const a: uint<16>[] = [1, 2];

    a.push(3 as uint<16>);

    return a;
  }
}

class ABITestArrayPop extends Contract {
  arrayPop(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3];

    a.pop()!;

    return a;
  }
}

class ABITestArrayPopValue extends Contract {
  arrayPopValue(): uint<16> {
    const a: uint<16>[] = [1, 2, 3];

    const v = a.pop()!;

    return v;
  }
}

class ABITestArraySplice extends Contract {
  arraySplice(): uint64[] {
    const a: uint64[] = [1, 2, 3];

    a.splice(1, 1);

    return a;
  }
}

class ABITestArraySpliceValue extends Contract {
  arraySpliceValue(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const i = 1;
    const l = 7;
    const v = a.splice(i, l);

    return v;
  }
}

class ABITestDynamicArrayElements extends Contract {
  dynamicArrayElements(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3];
    const newA: uint<16>[] = [a[0], a[1], a[2]];

    return newA;
  }
}

class ABITestSpliceLastElement extends Contract {
  spliceLastElement(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3];

    a.splice(2, 1);

    return a;
  }
}

class ABITestSpliceLastElementValue extends Contract {
  spliceLastElementValue(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3];

    const v = a.splice(2, 1);

    return v;
  }
}

class ABITestSpliceFirstElement extends Contract {
  spliceFirstElement(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3];

    a.splice(0, 1);

    return a;
  }
}

class ABITestSpliceFirstElementValue extends Contract {
  spliceFirstElementValue(): uint<16>[] {
    const a: uint<16>[] = [1, 2, 3];

    const v = a.splice(0, 1);

    return v;
  }
}

class ABITestStringReturn extends Contract {
  stringReturn(): string {
    return 'Hello World!';
  }
}

class ABITestStringArg extends Contract {
  stringArg(s: string): void {
    assert(s === 'Hello World!');
  }
}

class ABITestStringInTuple extends Contract {
  stringInTuple(): [uint<16>, uint<8>[], string, uint<8>[]] {
    const a: [uint<16>, uint<8>[], string, uint<8>[]] = [1, [2], 'Hello World!', [3]];

    return a;
  }
}

class ABITestAccesStringInTuple extends Contract {
  accesStringInTuple(): string {
    const a: [uint<16>, uint<8>[], string, uint<8>[]] = [1, [2], 'Hello World!', [3]];

    assert(a[2] === 'Hello World!');

    return a[2];
  }
}

class ABITestUpdateStringInTuple extends Contract {
  updateStringInTuple(): [uint<8>, uint<16>[], string, uint<16>[], uint<8>[]] {
    const a: [uint<8>, uint<16>[], string, uint<16>[], uint<8>[]] = [9, [8], 'Hi?', [6], [5]];

    a[0] = 99 as uint<8>;
    a[1] = [10, 11];
    a[2] = 'Hello World!';
    a[3] = [14, 15];
    a[4] = [16, 17];

    return a;
  }
}

class ABITestUpdateTupleWithOnlyDynamicTypes extends Contract {
  updateTupleWithOnlyDynamicTypes(): [uint<16>[], uint<16>[], uint<16>[]] {
    const a: [uint<16>[], uint<16>[], uint<16>[]] = [[1], [2], [3]];

    a[0] = [4, 5];
    a[1] = [6, 7];
    a[2] = [8, 9];

    return a;
  }
}

class ABITestShortenDynamicElementInTuple extends Contract {
  shortenDynamicElementInTuple(): [uint<16>[], uint<16>[], uint<16>[]] {
    const a: [uint<16>[], uint<16>[], uint<16>[]] = [
      [1, 2],
      [2, 3],
      [3, 4],
    ];

    a[0] = [5];
    a[1] = [6];
    a[2] = [7];

    return a;
  }
}

class ABITestNamedTuple extends Contract {
  namedTuple(): string {
    const a: {
      foo: uint<16>;
      bar: string;
    } = {
      foo: 1,
      bar: 'Hello World!',
    };

    return a.bar;
  }
}

class ABITestUpdateNamedTuple extends Contract {
  updateNamedTuple(): string {
    const a: {
      foo: uint<16>;
      bar: string;
    } = {
      foo: 1,
      bar: 'Hi?',
    };

    a.bar = 'Hello World!';

    return a.bar;
  }
}

class ABITestCustomTypes extends Contract {
  customTypes(): string {
    const aa: CustomType = {
      foo: 1,
      bar: 'Hi?',
    };

    aa.bar = 'Hello World!';

    return aa.bar;
  }
}

class ABITestStaticStringArrayArg extends Contract {
  staticStringArrayArg(a: StaticArray<string, 3>): string {
    return a[1];
  }
}

class ABITestDynamicAccessOfDynamicElementInStaticArray extends Contract {
  dynamicAccessOfDynamicElementInStaticArray(a: StaticArray<string, 3>): string {
    const i = 1;
    return a[i];
  }
}

class ABITestDynamicArrayInMiddleOfTuple extends Contract {
  dynamicArrayInMiddleOfTuple(): [uint<16>, uint<8>[], uint<16>] {
    const a: [uint<16>, uint<8>[], uint<16>] = [1, [2], 3];

    return a;
  }
}

class ABITestAccessDynamicArrayInMiddleOfTuple extends Contract {
  accessDynamicArrayInMiddleOfTuple(): uint<8>[] {
    const a: [uint<16>, uint<8>[], uint<16>] = [1, [2], 3];

    return a[1];
  }
}

class ABITestAccessDynamicArrayElementInTuple extends Contract {
  accessDynamicArrayElementInTuple(): uint<8> {
    const a: [uint<16>, uint<8>[]] = [11, [22, 33, 44]];

    return a[1][1];
  }
}

class ABITestUpdateDynamicArrayInMiddleOfTuple extends Contract {
  updateDynamicArrayInMiddleOfTuple(): [uint<16>, uint<8>[], uint<16>] {
    const a: [uint<16>, uint<8>[], uint<16>] = [1, [2], 3];

    a[1] = [4, 5];

    return a;
  }
}

class ABITestNestedTuple extends Contract {
  nestedTuple(): [uint<16>, [uint<8>, string], [uint<16>, string]] {
    const a: [uint<16>, [uint<8>, string], [uint<16>, string]] = [11, [22, 'foo'], [33, 'bar']];

    return a;
  }
}

class ABITestUpdateDynamicElementInTupleWithSameLength extends Contract {
  updateDynamicElementInTupleWithSameLength(): [uint<16>, uint<8>[], uint<16>, uint<8>[], uint<16>] {
    const a: [uint<16>, uint<8>[], uint<16>, uint<8>[], uint<16>] = [1, [2, 3, 4], 5, [6, 7, 8], 9];

    a[1] = [10, 11, 12];

    return a;
  }
}

class ABITestAccessDynamicStringArray extends Contract {
  accessDynamicStringArray(): string {
    const a: string[] = ['Hello', 'World', '!'];

    return a[1];
  }
}

class ABITestTxnTypes extends Contract {
  txnTypes(
    t: Txn,
    a: AppCallTxn,
    ac: AssetConfigTxn,
    af: AssetFreezeTxn,
    at: AssetTransferTxn,
    kr: KeyRegTxn,
    p: PayTxn
  ): void {
    assert(t.sender === a.sender);
    assert(ac.sender === af.sender);
    assert(at.sender === kr.sender);
    assert(p.sender === t.sender);
  }
}

class ABITestUfixed extends Contract {
  ufixed(): ufixed<64, 2> {
    const a = 1.23 as ufixed<64, 2>;
    const b = 4.56 as ufixed<64, 2>;

    return a + b;
  }
}

class ABITestArrayLength extends Contract {
  arrayLength(): uint64 {
    const a: uint<8>[] = [11, 22, 33, 44, 55];

    return a.length;
  }
}

class ABITestStringLength extends Contract {
  stringLength(): uint64 {
    const s = 'foo bar';

    return s.length;
  }
}
class ABITestArrayRef extends Contract {
  arrayRef(): uint<8>[] {
    const a: uint<8>[] = [1, 2, 3];
    const b = a;

    b[1] = 4 as uint<8>;

    return a;
  }
}

class ABITestNestedArrayRef extends Contract {
  nestedArrayRef(): StaticArray<StaticArray<uint<8>, 2>, 2> {
    const a: StaticArray<StaticArray<uint<8>, 2>, 2> = [
      [1, 2],
      [3, 4],
    ];
    const b = a[1];

    b[1] = 5 as uint<8>;

    return a;
  }
}

class ABITestNonLiteralNestedArrayRef extends Contract {
  nonLiteralNestedArrayRef(): StaticArray<StaticArray<uint<8>, 2>, 2> {
    const a: StaticArray<StaticArray<uint<8>, 2>, 2> = [
      [1, 2],
      [3, 4],
    ];

    let i = 1;
    const b = a[i];

    i = 1337;

    b[1] = 5 as uint<8>;

    return a;
  }
}

class ABITestMultiNestedArrayRef extends Contract {
  multiNestedArrayRef(): StaticArray<StaticArray<StaticArray<uint<8>, 2>, 2>, 2> {
    const a: StaticArray<StaticArray<StaticArray<uint<8>, 2>, 2>, 2> = [
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ],
    ];

    const b = a[1];
    const c = b[1];

    c[1] = 9 as uint<8>;

    return a;
  }
}

type ObjectRefType = { foo: StaticArray<StaticArray<uint<8>, 2>, 2> };

class ABITestObjectArrayRef extends Contract {
  objectArrayRef(): ObjectRefType {
    const a: ObjectRefType = {
      foo: [
        [1, 2],
        [3, 4],
      ],
    };
    const b = a.foo;
    const c = b[1];

    c[1] = 5 as uint<8>;

    return a;
  }
}

class ABITestStringAccessor extends Contract {
  stringAccessor(): string {
    const s = 'Hello World';

    return s[1];
  }
}

class ABITestEmptyStaticArray extends Contract {
  emptyStaticArray(): StaticArray<uint<16>, 3> {
    const a: StaticArray<uint<16>, 3> = [];

    return a;
  }
}

class ABITestPartialStaticArray extends Contract {
  partialStaticArray(): StaticArray<uint<16>, 3> {
    const a: StaticArray<uint<16>, 3> = [1];

    return a;
  }
}

class ABITestStorageTypeHint extends Contract {
  gKey = GlobalStateKey<StaticArray<uint<16>, 3>>();

  partialStaticArray(): StaticArray<uint<16>, 3> {
    this.gKey.value = [1, 2, 3];

    return this.gKey.value;
  }
}

class ABITestEmptyDynamicArray extends Contract {
  emptyDynamicArray(): uint64[] {
    return [];
  }
}
class ABITestBooleanArgAndReturn extends Contract {
  booleanArgAndReturn(a: boolean): boolean {
    return a;
  }
}

class ABITestBoolTuple extends Contract {
  boolTuple(): [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
    const a: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] = [
      true,
      false,
      true,
      true,
      false,
      false,
      true,
      false,
      false,
    ];

    return a;
  }
}

class ABITestStaticBoolArray extends Contract {
  staticBoolArray(): StaticArray<boolean, 9> {
    const a: StaticArray<boolean, 9> = [true, false, true, true, false, false, true, false, false];

    return a;
  }
}

class ABITestBoolTupleAccess extends Contract {
  boolTupleAccess(): boolean {
    const a: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ];

    return a[8];
  }
}

class ABITestStaticBoolArrayAccess extends Contract {
  staticBoolArrayAccess(): boolean {
    const a: StaticArray<boolean, 9> = [true, false, true, true, false, false, true, false, false];

    return a[8];
  }
}

class ABITestDynamicBoolArray extends Contract {
  dynamicBoolArray(): boolean[] {
    const a: boolean[] = [true, false, true, true, false, false, true, false, false];

    return a;
  }
}

class ABITestDynamicBoolArrayAccess extends Contract {
  dynamicBoolArrayAccess(): boolean {
    const a: boolean[] = [true, false, true, true, false, false, true, false, false];

    return a[8];
  }
}

class ABITestStaticBoolArrayUpdate extends Contract {
  staticBoolArrayUpdate(): StaticArray<boolean, 9> {
    const a: StaticArray<boolean, 9> = [true, false, true, true, false, false, true, false, false];

    a[8] = true;

    return a;
  }
}

class ABITestDynamicBoolArrayUpdate extends Contract {
  dynamicBoolArrayUpdate(): boolean[] {
    const a: boolean[] = [true, false, true, true, false, false, true, false, false];

    a[8] = true;

    return a;
  }
}

class ABITestBoolTupleUpdate extends Contract {
  boolTupleUpdate(): [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
    const a: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] = [
      true,
      false,
      true,
      true,
      false,
      false,
      true,
      false,
      false,
    ];

    a[8] = true;
    return a;
  }
}

class ABITestObjectRef extends Contract {
  objectRef(): { foo: uint64 } {
    const o: { foo: uint64 } = { foo: 1 };

    const r = o;

    r.foo = 2;

    return o;
  }
}

class ABITestStorageRefKey extends Contract {
  gMap = GlobalStateMap<uint64, uint64[]>({ maxKeys: 1 });

  storageRefKey(): uint64 {
    this.gMap(0).value = [1, 2, 3];

    let i = 0;

    const r = this.gMap(i).value;

    i = 1;

    r[1] = 4;

    return this.gMap(0).value[1];
  }
}

class ABITestStorageRefAccount extends Contract {
  lMap = LocalStateMap<uint64, uint64[]>({ maxKeys: 1 });

  @allow.call('OptIn')
  storageRefAccount(): uint64 {
    let addr = this.txn.sender;
    this.lMap(addr, 0).value = [1, 2, 3];
    const r = this.lMap(addr, 0).value;

    addr = globals.zeroAddress;

    r[1] = 4;

    return this.lMap(this.txn.sender, 0).value[1];
  }
}

class ABITestAngularCasting extends Contract {
  angularCasting(): uint<256> {
    const x = <uint<256>>1337;

    return x;
  }
}

class ABITestStaticByteCasting extends Contract {
  staticByteCasting(): StaticArray<byte, 5> {
    return 'abc' as StaticArray<byte, 5>;
  }
}

class ABITestCastBytesFunction extends Contract {
  castBytesFunction(): StaticArray<uint<8>, 3> {
    return castBytes<StaticArray<uint<8>, 3>>(hex('0x010203'));
  }
}

class ABITestRawBytesFunction extends Contract {
  rawBytesFunction(): string {
    const a: StaticArray<uint<8>, 3> = [1, 2, 3];
    return rawBytes(a);
  }
}

type T1 = { bar: uint<8> };
class ABITestGlobalMethodInChain extends Contract {
  globalMethodInChain(): uint<8> {
    return castBytes<T1>(hex('0x00')).bar;
  }
}

class ABITestOpcodeParamFromObject extends Contract {
  opcodeParamFromObject(): Address {
    const a: { myApp: Application } = { myApp: this.app };

    return this.app.address;
  }
}

type T2 = { bar: StaticArray<uint64, 2> };
class ABITestArrayInObjectInState extends Contract {
  gMap = GlobalStateMap<Address, T2>({ maxKeys: 1 });

  arrayInObjectInState(): uint64 {
    this.gMap(this.txn.sender).value = { bar: [1, 2] };
    this.gMap(this.txn.sender).value.bar[1] = 3;
    return this.gMap(this.txn.sender).value.bar[1];
  }
}

class ABITestNestedObject extends Contract {
  nestedObject(): uint64 {
    const a: { b: { c: { d: uint64 } } } = { b: { c: { d: 1 } } };
    a.b.c.d = 2;
    return a.b.c.d;
  }
}

type T3 = { d: uint64 };
type T4 = { b: { c: T3 } };
class ABITestNestedObjectType extends Contract {
  nestedObjectType(): uint64 {
    const a: T4 = { b: { c: { d: 1 } } };
    a.b.c.d = 2;
    return a.b.c.d;
  }
}

class ABITestUpdateArrayRefInBoxStorage extends Contract {
  bMap = BoxMap<Address, [uint<8>, uint64]>();

  @allow.call('OptIn')
  updateArrayRefInBoxStorage(): [uint<8>, uint64] {
    this.bMap(this.txn.sender).value = [1, 2];

    const v = this.bMap(this.txn.sender).value;

    v[0] = 3;

    return v;
  }
}

class ABITestExtractUint extends Contract {
  extractUint(arg: number): uint<8> {
    const x = <uint<8>>arg;
    return x;
  }
}

class ABITestBytesReturn extends Contract {
  bytesReturn(): bytes {
    return 'foo';
  }
}

type T5 = {
  foo: uint64;
  bar: uint64;
};
class ABITestNestedTypesInSignature extends Contract {
  nestedTypesInSignature(): [T5, number] {
    return [bzero<T5>(), 0];
  }
}

class ABITestMaxUfixed extends Contract {
  maxUfixed(): ufixed<64, 2> {
    const u64max: ufixed<64, 2> = 184467440737095516.15;

    return u64max;
  }
}

type T6 = {
  // This is a comment
  foo: string; // this is another comment
  /** This is a yet another comment */
  bar: uint64;
  /**
   * This is a multiline comment
   */
  baz: uint64;
};
class ABITestNonE2E extends Contract {
  typeWithComments(): T6 {
    return {
      foo: 'Hello World!',
      bar: 1,
      baz: 2,
    };
  }
}

type T7 = {
  foo: Address;
};
class ABITestChainedPropertyAfterTuple extends Contract {
  chainedPropertyAfterTuple(asa: Asset): void {
    const o: T7 = { foo: this.app.address };

    assert(!o.foo.hasAsset(asa));
  }
}

class ABITestStringArray extends Contract {
  gKey = GlobalStateKey<string[]>();

  stringArray(a: string[]): void {
    this.gKey.value = a;
  }
}

class ABITestUintCasting extends Contract {
  uintCasting(a: uint<8>): uint<256> {
    return <uint<256>>a;
  }
}

class ABITestUint64Casting extends Contract {
  uint64Casting(a: uint<256>): uint64 {
    return a as uint64;
  }
}

class ABITestBytesCasting extends Contract {
  bytesCasting(a: bytes): StaticArray<byte, 2> {
    return <StaticArray<byte, 2>>a;
  }
}

class ABITestBiggerByteCasting extends Contract {
  biggerByteCasting(a: StaticArray<byte, 2>): StaticArray<byte, 4> {
    return <StaticArray<byte, 4>>a;
  }
}

class ABITestSmallerByteCasting extends Contract {
  smallerByteCasting(a: StaticArray<byte, 4>): StaticArray<byte, 2> {
    return <StaticArray<byte, 2>>a;
  }
}

class ABITestMultiBytesTuple extends Contract {
  multiBytesTuple(): [bytes, bytes] {
    return [hex('0x01'), hex('0x02')];
  }
}
