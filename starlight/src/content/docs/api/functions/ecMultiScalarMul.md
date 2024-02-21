---
editUrl: false
next: false
prev: false
title: "ecMultiScalarMul"
---

> **ecMultiScalarMul**(`group`, `points`, `scalars`): [`bytes`](../type-aliases/bytes.md)

for curve points A and scalars B, return curve point B0A0 + B1A1 + B2A2 + ... + BnAn

## Parameters

• **group**: [`ECGroup`](../type-aliases/ECGroup.md)

The target group

• **points**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The concatenated points to multiply

• **scalars**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>[]

The scalars to multiply

## Returns

[`bytes`](../type-aliases/bytes.md)

## Source

[types/global.d.ts:1338](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1338)
