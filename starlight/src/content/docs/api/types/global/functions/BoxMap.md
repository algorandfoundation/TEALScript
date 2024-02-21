---
editUrl: false
next: false
prev: false
title: "BoxMap"
---

> **BoxMap**\<`KeyType`, `ValueType`\>(`options`?): (`key`) => [`BoxValue`](../type-aliases/BoxValue.md)\<`ValueType`\>

A mapping of one type to another in box storage. Each key is a seperate box.

## Type parameters

• **KeyType**

• **ValueType**

## Parameters

• **options?**

• **options\.allowPotentialCollisions?**: `boolean`

• **options\.dynamicSize?**: `boolean`

• **options\.prefix?**: `string`

## Returns

`Function`

> ### Parameters
>
> • **key**: `KeyType`
>
> ### Returns
>
> [`BoxValue`](../type-aliases/BoxValue.md)\<`ValueType`\>
>

## Source

[types/global.d.ts:591](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L591)
