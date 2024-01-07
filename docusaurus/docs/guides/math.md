---
title: Math
---

**Reminder:** In TEALScript, `uint64` and `number` are the same.

## Opcode Cost

Every app call has a limited compute budget, measured by opcode budget. Working with the native AVM number type in TEALScript (`uint64`) is the most efficient in terms of opcode cost. 

Performing math operations with a integer with a width less than 64 bits is **2x more expensive** than working with the same value as `uint64`. Performing math operations with a integer width more than 64 bits can be up to **20x more expensive** (see table below). As such, if you find yourself running out of opcode budget, it is best to manually cast to `uint64` and then cast back when possible.


### Opcode Costs

| Bit Width | Operations | Cost |
| --------- | ---------- | ---- |
| 64        | `+` or `-` | 1    |
| 64        | `*` or `/` | 1    |
| < 64      | `+` or `-` | 2    |
| < 64      | `*` or `/` | 2    |
| > 64      | `+` or `-` | 10   |
| > 64      | `*` or `/` | 20   |

## Overflows

The AVM will panic if the result of arithmetic with two `uint64` value is larger than 64 bits. This means the AVM has native overflow checks for `uint64`. Other bit widths, however, do not have native overflow protection. This means that some of the opcode budget is burned when perorming overflow checks for these types, making arithemtic with non-`uint64` numbers even more expensive overall.

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