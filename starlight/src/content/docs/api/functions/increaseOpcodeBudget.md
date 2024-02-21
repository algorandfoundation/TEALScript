---
editUrl: false
next: false
prev: false
title: "increaseOpcodeBudget"
---

> **increaseOpcodeBudget**(): `any`

Send an inner transaction app call to increase the current opcode budget.
This will also send any pending transaction in the same group.
For every call of this function, the required fee is increased by 1000 microAlgos.

## Returns

`any`

## Source

[types/global.d.ts:1284](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1284)
