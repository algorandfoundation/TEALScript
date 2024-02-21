---
editUrl: false
next: false
prev: false
title: "ecdsaPkDecompress"
---

> **ecdsaPkDecompress**(`curve`, `pubKey`): [`ECDSAPubKey`](../type-aliases/ECDSAPubKey.md)

## Parameters

• **curve**: `"Secp256k1"` \| `"Secp256r1"`

The curve being used

• **pubKey**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`33`\>

The public key to decompress

## Returns

[`ECDSAPubKey`](../type-aliases/ECDSAPubKey.md)

The X and Y components of the decompressed public key

## Source

[types/global.d.ts:1091](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L1091)
