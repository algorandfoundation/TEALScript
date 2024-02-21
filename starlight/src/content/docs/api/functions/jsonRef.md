---
editUrl: false
next: false
prev: false
title: "jsonRef"
---

> **jsonRef**\<`TypeEncoded`\>(`type`, `input`, `key`): `TypeEncoded` extends `"JSONString"` ? [`bytes`](../type-aliases/bytes.md) : `TypeEncoded` extends `"JSONUint64"` ? [`uint64`](../type-aliases/uint64.md) : [`bytes`](../type-aliases/bytes.md)

## Type parameters

• **TypeEncoded** extends `"JSONString"` \| `"JSONUint64"` \| `"JSONObject"`

## Parameters

• **type**: `TypeEncoded`

• **input**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **key**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

## Returns

`TypeEncoded` extends `"JSONString"` ? [`bytes`](../type-aliases/bytes.md) : `TypeEncoded` extends `"JSONUint64"` ? [`uint64`](../type-aliases/uint64.md) : [`bytes`](../type-aliases/bytes.md)

## Source

[types/global.d.ts:1381](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1381)
