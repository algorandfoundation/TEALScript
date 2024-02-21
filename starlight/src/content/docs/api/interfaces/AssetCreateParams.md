---
editUrl: false
next: false
prev: false
title: "AssetCreateParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

### configAssetClawback?

> **`optional`** **configAssetClawback**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:712](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L712)

***

### configAssetDecimals?

> **`optional`** **configAssetDecimals**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:708](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L708)

***

### configAssetDefaultFrozen?

> **`optional`** **configAssetDefaultFrozen**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:713](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L713)

***

### configAssetFreeze?

> **`optional`** **configAssetFreeze**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:711](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L711)

***

### configAssetManager?

> **`optional`** **configAssetManager**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:709](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L709)

***

### configAssetMetadataHash?

> **`optional`** **configAssetMetadataHash**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:715](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L715)

***

### configAssetName?

> **`optional`** **configAssetName**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:705](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L705)

***

### configAssetReserve?

> **`optional`** **configAssetReserve**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:710](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L710)

***

### configAssetTotal

> **configAssetTotal**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:707](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L707)

***

### configAssetURL?

> **`optional`** **configAssetURL**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:714](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L714)

***

### configAssetUnitName?

> **`optional`** **configAssetUnitName**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:706](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L706)

***

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`fee`](CommonTransactionParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L633)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`note`](CommonTransactionParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L639)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`rekeyTo`](CommonTransactionParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)
