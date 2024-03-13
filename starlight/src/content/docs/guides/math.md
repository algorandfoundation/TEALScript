---
title: Math
---

## Truncation

It is important to note TEALScript only works with unsigned integers. This means that there are no fractional values or negative numbers. The AVM, and thus TEALScript, will always truncate the result of division operations. For example, `99 / 100 === 0` will be true.

## Opcode Cost

Performing math operations with a integer width more than 64 bits can be up to **20x more expensive** (see table below). As such, if you find yourself running out of opcode budget, it is best to manually cast to `uint64` and then cast back when possible.

### Opcode Costs

| Bit Width | Operations | Cost |
| --------- | ---------- | ---- |
| `<= 64`    | `+` or `-` | 1    |
| `<= 64`     | `*` or `/` | 1    |
| `> 64`      | `+` or `-` | 10   |
| `> 64`      | `*` or `/` | 20   |

## Overflows

### Runtime

During runtime, TEALscript will not perform overflow checks. This means you will only encouter an overflow panic when performing math operations and the following max values are exceeded

| Bit Width | Max Value |
| --------- | --------- |
| `<= 64`     | `2^64 - 1`  |
| `> 64`      | `2^512 - 1` |

### Encoding

Prior to encoding a number, TEALScript will ensure that the value does not exceed the respective max value. For example, it will check a `uint8` is not more than `2^8 - 1` prior to encoding it.

### Underflows

Any operation that results in a value less than 0 will cause a panic in the AVM.

## Wide Ratio

A common operation in contracts is to perform division to get the ratio between two numbers (ie. in a liquidty pool). If the numerator and/or divisor includes multiplication of `uint64` values, they might be larger than `uint64` (thus cause an overflow panic) even if the final result of the division would fit in a `uint64`. To handle such cases, TEALScript implements a global function called `wideRatio`. 

### Example

```ts
  private tokensToSwap(inAmount: uint64, inSupply: uint64, outSupply: uint64): uint64 {
    const factor = SCALE - FEE;
    return wideRatio([inAmount, factor, outSupply], [inSupply * SCALE + inAmount * factor]);
  }
```

A full AMM example can be found [here](https://github.com/algorandfoundation/TEALScript/blob/dev/examples/amm/amm.algo.ts).