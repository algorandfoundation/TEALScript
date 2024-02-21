---
editUrl: false
next: false
prev: false
title: "vrfVefiry"
---

> **vrfVefiry**(`standard`, `message`, `proof`, `pubkey`): [`VRFReturnValues`](../type-aliases/VRFReturnValues.md)

Verify VRF proof of a message against the given public key

## Parameters

• **standard**: `"VrfAlgorand"`

VRF standard to use. Currently only VrfAlgorand is supported which is ECVRF-ED25519-SHA512-Elligator2, specified in the IETF internet draft [draft-irtf-cfrg-vrf-03](https://datatracker.ietf.org/doc/draft-irtf-cfrg-vrf/03/).

• **message**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

The message to verify

• **proof**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`80`\>

The VRF proof

• **pubkey**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The VRF public key

## Returns

[`VRFReturnValues`](../type-aliases/VRFReturnValues.md)

## Source

[types/global.d.ts:1298](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1298)
