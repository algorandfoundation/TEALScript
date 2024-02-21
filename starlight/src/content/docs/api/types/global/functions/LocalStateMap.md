---
editUrl: false
next: false
prev: false
title: "LocalStateMap"
---

> **LocalStateMap**\<`KeyType`, `ValueType`\>(`options`): (`account`, `key`) => [`LocalStateValue`](../type-aliases/LocalStateValue.md)\<`ValueType`\>

A mapping of one type to another in local state

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
> • **account**: [`Address`](../classes/Address.md)
>
> • **key**: `KeyType`
>
> ### Returns
>
> [`LocalStateValue`](../type-aliases/LocalStateValue.md)\<`ValueType`\>
>

## Source

[types/global.d.ts:623](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L623)
