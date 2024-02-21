---
editUrl: false
next: false
prev: false
title: "PaymentParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

### amount?

> **`optional`** **amount**: [`uint64`](../type-aliases/uint64.md)

The amount, in microALGO, to transfer

#### Source

[types/global.d.ts:726](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L726)

***

### closeRemainderTo?

> **`optional`** **closeRemainderTo**: [`Address`](../classes/Address.md)

If set, bring the sender balance to 0 and send all remaining balance to this address

#### Source

[types/global.d.ts:730](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L730)

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

### receiver?

> **`optional`** **receiver**: [`Address`](../classes/Address.md)

The address of the receiver

#### Source

[types/global.d.ts:728](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L728)

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
