---
editUrl: false
next: false
prev: false
title: "ecdsaVerify"
---

> **ecdsaVerify**(`curve`, `data`, `sSignatureComponent`, `rSignatureComponent`, `xPubkeyComponent`, `yPubkeyComponent`): `boolean`

## Parameters

• **curve**: `"Secp256k1"` \| `"Secp256r1"`

The curve being used

• **data**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The data that was signed

• **sSignatureComponent**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The s component of the lower-S signature

• **rSignatureComponent**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The r component of the lower-S signature

• **xPubkeyComponent**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The x component of the public key

• **yPubkeyComponent**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The y component of the public key

## Returns

`boolean`

true if the signature is valid, false otherwise

## Source

[types/global.d.ts:1073](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1073)
