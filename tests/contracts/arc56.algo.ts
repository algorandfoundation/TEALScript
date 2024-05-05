import { Contract } from '../../src/lib';

type Inputs = { a: uint64; b: uint64 };
type Outputs = { sum: uint64; product: uint64 };

export class ARC56Test extends Contract {
  foo(inputs: Inputs): Outputs {
    if (inputs.a === 0 || inputs.b === 0) throw Error('inputs must be non-zero');
    return {
      sum: inputs.a + inputs.b,
      product: inputs.a * inputs.b,
    };
  }
}
