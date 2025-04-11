import { Contract } from '../../../src/lib/index';

export class MutableRefInArrayAssignment extends Contract {
  mutableRefInArray() {
    const arr: uint64[] = [1, 2, 3];
    const arrArr: uint64[][] = [arr];

    arrArr[0] = arr;

    assert(arr[0] === arrArr[0][0]);
  }
}
