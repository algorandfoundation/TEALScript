---
editUrl: false
next: false
prev: false
title: "CommonOnChainTransactionParams"
---

## Extends

- `Required`\<[`CommonTransactionParams`](CommonTransactionParams.md)\>

## Properties

### fee

> **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

`Required.fee`

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L633)

***

### groupIndex

> **groupIndex**: [`uint64`](../type-aliases/uint64.md)

The index of this transaction in its group

#### Source

[types/global.d.ts:644](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L644)

***

### note

> **note**: `string`

The note field for this transaction

#### Inherited from

`Required.note`

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L639)

***

### rekeyTo

> **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

`Required.rekeyTo`

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L637)

***

### sender

> **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

`Required.sender`

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)

***

### txID

> **txID**: `string`

The transaction ID for this transaction

#### Source

[types/global.d.ts:646](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L646)
