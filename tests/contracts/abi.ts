/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class AbiTest extends Contract {
  gRef = new GlobalReference<StaticArray<uint64, 3>>({ key: 'gRef' });

  lRef = new LocalReference<StaticArray<uint64, 3>>({ key: 'lRef' });

  bRef = new BoxReference<StaticArray<uint64, 3>>({ key: 'bRef' });

  gMap = new GlobalMap<string, StaticArray<uint64, 3>>();

  lMap = new LocalMap<string, StaticArray<uint64, 3>>();

  bMap = new BoxMap<string, StaticArray<uint64, 3>>();

  @createApplication
  create(): void {}

  @optIn
  optIn(): void {}

  staticArray(): uint64 {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    return a[1];
  }

  returnStaticArray(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    return a;
  }

  staticArrayArg(a: StaticArray<uint64, 3>): uint64 {
    return a[1];
  }

  nonLiteralStaticArrayElements(): uint64 {
    const n1 = 11;
    const n2 = 22;
    const n3 = 33;
    const a: StaticArray<uint64, 3> = [n1, n2, n3];

    return a[1];
  }

  mixedStaticArrayElements(): uint64 {
    const n1 = 3;
    const n2 = 4;
    const n3 = 5;
    const a: Static<uint64[], 9> = [0, 1, 2, n1, n2, n3, 6, 7, 8];

    return a[1] + a[4] + a[7];
  }

  nonLiteralStaticArrayAccess(): uint64 {
    const a: StaticArray<uint64, 3> = [11, 22, 33];
    const n = 1;

    return a[n];
  }

  setStaticArrayElement(): uint64 {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    a[1] = 222;

    return a[1];
  }

  staticArrayInStorageRef(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gRef.put(a);
    this.lRef.put(this.txn.sender, a);
    this.bRef.put(a);

    const ret: StaticArray<uint64, 3> = [
      this.gRef.get()[1],
      this.lRef.get(this.txn.sender)[1],
      this.bRef.get()[1],
    ];

    return ret;
  }

  updateStaticArrayInStorageRef(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gRef.put(a);
    this.lRef.put(this.txn.sender, a);
    this.bRef.put(a);

    this.gRef.get()[1] = 111;
    this.lRef.get(this.txn.sender)[1] = 222;
    this.bRef.get()[1] = 333;

    const ret: StaticArray<uint64, 3> = [
      this.gRef.get()[1],
      this.lRef.get(this.txn.sender)[1],
      this.bRef.get()[1],
    ];

    return ret;
  }

  staticArrayInStorageMap(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gMap.put('gMap', a);
    this.lMap.put(this.txn.sender, 'lMap', a);
    this.bMap.put('bMap', a);

    const ret: StaticArray<uint64, 3> = [
      this.gMap.get('gMap')[1],
      this.lMap.get(this.txn.sender, 'lMap')[1],
      this.bMap.get('bMap')[1],
    ];

    return ret;
  }

  updateStaticArrayInStorageMap(): StaticArray<uint64, 3> {
    const a: StaticArray<uint64, 3> = [11, 22, 33];

    this.gMap.put('gMap', a);
    this.lMap.put(this.txn.sender, 'lMap', a);
    this.bMap.put('bMap', a);

    this.gMap.get('gMap')[1] = 1111;
    this.lMap.get(this.txn.sender, 'lMap')[1] = 2222;
    this.bMap.get('bMap')[1] = 3333;

    const ret: StaticArray<uint64, 3> = [
      this.gMap.get('gMap')[1],
      this.lMap.get(this.txn.sender, 'lMap')[1],
      this.bMap.get('bMap')[1],
    ];

    return ret;
  }
}
