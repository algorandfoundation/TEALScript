import { Contract } from '../../src/lib/index';

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

export class MutableRefInObjAssignment extends Contract {
  mutableRefInObj() {
    const arr: uint64[] = [1, 2, 3];

    const arrObj: ArrObj = { arr: [] as uint64[] };

    arrObj.arr = arr;

    arr[0] = 4;
    arrObj.arr[0] = 5;

    assert(arr[0] === arrObj.arr[0]);
  }
}

export class MutableRefInArrayLiteral extends Contract {
  mutableRefInArray() {
    const arr: uint64[] = [1, 2, 3];
    const arrArr: uint64[][] = [arr];

    arr[0] = 4;
    arrArr[0][0] = 5;

    assert(arr[0] === arrArr[0][0]);
  }
}

export class MutableRefInArrayAssignment extends Contract {
  mutableRefInArray() {
    const arr: uint64[] = [1, 2, 3];
    const arrArr: uint64[][] = [];
    arrArr[0] = arr;

    arr[0] = 4;
    arrArr[0][0] = 5;
  }
}

export class MutableRefInPush extends Contract {
  mutableRefInPush() {
    const arr: uint64[] = [1, 2, 3];
    const arrArr: uint64[][] = [];
    arrArr.push(arr);
    arr[0] = 4;
    arrArr[0][0] = 5;

    assert(arr[0] === arrArr[0][0]);
  }
}
