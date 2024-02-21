---
editUrl: false
next: false
prev: false
title: "bitlen"
---

> **bitlen**(`input`): [`uint64`](../type-aliases/uint64.md)

The highest set bit in the input. If the input is a byte-array, it is interpreted as a big-endian unsigned integer. bitlen of 0 is 0, bitlen of 8 is 4

## Parameters

• **input**: `any`

The input to get the higher bit from

## Returns

[`uint64`](../type-aliases/uint64.md)

## Source

[types/global.d.ts:1371](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1371)
