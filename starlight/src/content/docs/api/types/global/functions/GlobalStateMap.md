---
editUrl: false
next: false
prev: false
title: "GlobalStateMap"
---

> **GlobalStateMap**\<`KeyType`, `ValueType`\>(`options`): (`key`) => [`GlobalStateValue`](../type-aliases/GlobalStateValue.md)\<`ValueType`\>

A mapping of one type to another in global state

## Type parameters

• **KeyType**

• **ValueType**

## Parameters

• **options**

• **options\.allowPotentialCollisions?**: `boolean`

• **options\.maxKeys**: `number`

• **options\.prefix?**: `string`

## Returns

`Function`

> ### Parameters
>
> • **key**: `KeyType`
>
> ### Returns
>
> [`GlobalStateValue`](../type-aliases/GlobalStateValue.md)\<`ValueType`\>
>

## Source

[types/global.d.ts:607](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L607)
