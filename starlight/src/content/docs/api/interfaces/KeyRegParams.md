---
editUrl: false
next: false
prev: false
title: "KeyRegParams"
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

### selectionPK?

> **`optional`** **selectionPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:761](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L761)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)

***

### stateProofPk?

> **`optional`** **stateProofPk**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:762](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L762)

***

### voteFirst?

> **`optional`** **voteFirst**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:763](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L763)

***

### voteKeyDilution?

> **`optional`** **voteKeyDilution**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:765](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L765)

***

### voteLast?

> **`optional`** **voteLast**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:764](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L764)

***

### votePk?

> **`optional`** **votePk**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:760](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L760)
