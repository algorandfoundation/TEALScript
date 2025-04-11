import { Contract } from '../../../src/lib/index';

export class MutableRefInArrayLiteral extends Contract {
  mutableRefInArray() {
    const arr: uint64[] = [1, 2, 3];
    const arrArr: uint64[][] = [arr];

    arr[0] = 4;
    arrArr[0][0] = 5;

    assert(arr[0] === arrArr[0][0]);
  }
}
