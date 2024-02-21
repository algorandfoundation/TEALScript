---
editUrl: false
next: false
prev: false
title: "OnlineKeyRegParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

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

### selectionPK

> **selectionPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:770](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L770)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)

***

### stateProofPK

> **stateProofPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:771](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L771)

***

### voteFirst

> **voteFirst**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:772](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L772)

***

### voteKeyDilution

> **voteKeyDilution**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:774](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L774)

***

### voteLast

> **voteLast**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:773](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L773)

***

### votePK

> **votePK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:769](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L769)
