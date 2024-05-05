import { Contract } from '../../src/lib';

type Inputs = { add: { a: uint64; b: uint64 }; subtract: { a: uint64; b: uint64 } };
type Outputs = { sum: uint64; difference: uint64 };

export class ARC56Test extends Contract {
  foo(inputs: Inputs): Outputs {
    if (inputs.subtract.a < inputs.subtract.b) throw Error('subtract.a must be greater than subtract.b');
    return {
      sum: inputs.add.a + inputs.add.b,
      difference: inputs.subtract.a - inputs.subtract.b,
    };
  }
}
