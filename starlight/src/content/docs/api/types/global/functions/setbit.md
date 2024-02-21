---
editUrl: false
next: false
prev: false
title: "setbit"
---

> **setbit**\<`InputType`\>(`data`, `bitIndex`, `value`): `InputType` extends `string` ? [`bytes`](../type-aliases/bytes.md) : [`uint64`](../type-aliases/uint64.md)

## Type parameters

• **InputType** extends [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\> \| [`uint64`](../type-aliases/uint64.md)

## Parameters

• **data**: `InputType`

The input data to update

• **bitIndex**: [`uint64`](../type-aliases/uint64.md)

The index of the bit to update

• **value**: `boolean`

The value to set the bit to

## Returns

`InputType` extends `string` ? [`bytes`](../type-aliases/bytes.md) : [`uint64`](../type-aliases/uint64.md)

The updated data

## Source

[types/global.d.ts:966](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L966)
