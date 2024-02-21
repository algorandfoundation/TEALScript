---
editUrl: false
next: false
prev: false
title: "CommonTxnVerificationFields"
---

> **CommonTxnVerificationFields**: `Object`

## Type declaration

### fee?

> **`optional`** **fee**: [`IntLike`](IntLike.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

The fee to pay for the transaction

### firstValid?

> **`optional`** **firstValid**: [`IntLike`](IntLike.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

The first round that the transaction is valid

### firstValidTime?

> **`optional`** **firstValidTime**: [`IntLike`](IntLike.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

### groupIndex?

> **`optional`** **groupIndex**: [`IntLike`](IntLike.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

### lastValid?

> **`optional`** **lastValid**: [`IntLike`](IntLike.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

The last round that the transaction is valid

### lease?

> **`optional`** **lease**: [`bytes32`](bytes32.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

### note?

> **`optional`** **note**: [`BytesLike`](BytesLike.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

The note field of the transaction

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

The sender of the transaction. This is the account that pays the fee (if non-zero)

### txID?

> **`optional`** **txID**: [`bytes32`](bytes32.md) \| [`TxnVerificationTests`](TxnVerificationTests.md)

## Source

[types/global.d.ts:275](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L275)
