---
editUrl: false
next: false
prev: false
title: "ed25519Verify"
---

> **ed25519Verify**(`data`, `signature`, `pubkey`): `boolean`

Verify the signature of ("ProgData" || program_hash || data) against the pubkey.
The program_hash is the hash of the program source code

## Parameters

• **data**: [`BytesLike`](../type-aliases/BytesLike.md)

Data be verified

• **signature**: [`BytesLike`](../type-aliases/BytesLike.md)

The signature to verify

• **pubkey**: [`BytesLike`](../type-aliases/BytesLike.md)

The public key to verify the signature with

## Returns

`boolean`

true if the signature is valid, false otherwise

## Source

[types/global.d.ts:930](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L930)
