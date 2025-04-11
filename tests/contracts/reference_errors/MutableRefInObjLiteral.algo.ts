import { Contract } from '../../../src/lib/index';

type ArrObj = {
  arr: uint64[];
};

export class MutableRefInObjLiteral extends Contract {
  mutableRefInObj() {
    const arr: uint64[] = [1, 2, 3];

    const arrObj: ArrObj = { arr: arr };

    arr[0] = 4;
    arrObj.arr[0] = 5;

    assert(arr[0] === arrObj.arr[0]);
  }
}
