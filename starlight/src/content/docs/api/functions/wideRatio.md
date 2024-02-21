---
editUrl: false
next: false
prev: false
title: "wideRatio"
---

> **wideRatio**(`numeratorFactors`, `denominatorFactors`): [`uint64`](../type-aliases/uint64.md)

Use this method if all inputs to the expression are uint64s,
the output fits in a uint64, and all intermediate values fit in a uint128.
Otherwise uintN division should be used.

## Parameters

• **numeratorFactors**: [`uint64`](../type-aliases/uint64.md)[]

• **denominatorFactors**: [`uint64`](../type-aliases/uint64.md)[]

## Returns

[`uint64`](../type-aliases/uint64.md)

product of numerators divided by product of denominator

## Source

[types/global.d.ts:1126](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1126)
