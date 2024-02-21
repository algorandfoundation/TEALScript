---
editUrl: false
next: false
prev: false
title: "AssetConfigParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

### configAsset

> **configAsset**: [`Asset`](../classes/Asset.md)

#### Source

[types/global.d.ts:697](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L697)

***

### configAssetClawback?

> **`optional`** **configAssetClawback**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:701](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L701)

***

### configAssetFreeze?

> **`optional`** **configAssetFreeze**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:700](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L700)

***

### configAssetManager?

> **`optional`** **configAssetManager**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:698](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L698)

***

### configAssetReserve?

> **`optional`** **configAssetReserve**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:699](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L699)

***

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`fee`](CommonTransactionParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L633)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`note`](CommonTransactionParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L639)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`rekeyTo`](CommonTransactionParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L635)
