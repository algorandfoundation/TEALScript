---
editUrl: false
next: false
prev: false
title: "ecSubgroupCheck"
---

> **ecSubgroupCheck**(`group`, `point`): `boolean`

Checks if the given point is in the main prime-order subgroup of the target group. Fails if the point is not in the group at all.

## Parameters

• **group**: [`ECGroup`](../type-aliases/ECGroup.md)

The target group

• **point**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The point to check

## Returns

`boolean`

## Source

[types/global.d.ts:1347](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1347)
