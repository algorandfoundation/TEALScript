---
editUrl: false
next: false
prev: false
title: "ecMapTo"
---

> **ecMapTo**(`group`, `fieldElement`): [`bytes`](../type-aliases/bytes.md)

Maps field element to the target group.

BN254 points are mapped by the SVDW map. BLS12-381 points are mapped by the SSWU map.
G1 element inputs are base field elements and G2 element inputs are quadratic field elements,
with nearly the same encoding rules (for field elements) as defined in ec_add.

There is one difference of encoding rule: G1 element inputs do not need to be 0-padded if
they fit in less than 32 bytes for BN254 and less than 48 bytes for BLS12-381. (As usual,
the empty byte array represents 0.) G2 elements inputs need to be always have the required size.

## Parameters

• **group**: [`ECGroup`](../type-aliases/ECGroup.md)

The target group

• **fieldElement**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The field element to map

## Returns

[`bytes`](../type-aliases/bytes.md)

## Source

[types/global.d.ts:1363](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1363)
