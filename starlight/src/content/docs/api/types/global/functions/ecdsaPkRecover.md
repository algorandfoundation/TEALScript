---
editUrl: false
next: false
prev: false
title: "ecdsaPkRecover"
---

> **ecdsaPkRecover**(`curve`, `data`, `recoveryID`, `sSignatureComponent`, `rSignatureComponent`): [`ECDSAPubKey`](../type-aliases/ECDSAPubKey.md)

## Parameters

• **curve**: `"Secp256k1"` \| `"Secp256r1"`

The curve being used

• **data**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The data that was signed

• **recoveryID**: [`uint64`](../type-aliases/uint64.md)

The recovery ID

• **sSignatureComponent**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The s component of the lower-S signature

• **rSignatureComponent**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The r component of the lower-S signature

## Returns

[`ECDSAPubKey`](../type-aliases/ECDSAPubKey.md)

The X and Y components of the recovered public key

## Source

[types/global.d.ts:1103](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L1103)
