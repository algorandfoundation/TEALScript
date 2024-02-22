---
title: Atomic Transaciton Arguments
---

## Argument Types

If you are writing a method that must be accompanied by an atomic trasnaction, you can set the argument type to one of the following types: `PayTxn`, `AssetTransferTxn`, `AppCallTxn`, `KeyRegTxn`, `AssetConfigTxn`, or `AssetFreezeTxn`

## Verifying An Atomic Transaction

Simply having an atomic trasnsaction as an argument doesn't gurantee anything about the transaction itself. As such, it's important to verify the fields of the transaction to ensure it is doing what you want. There are multiple methods for verifying the different types of transactions: `verifyPayTxn`, `verifyAssetConfigTxn`, `verifyAssetTransferTxn`, `verifyAppCallTxn`, and `verifyKeyRegTxn`. If you the transaction could be multiple different types, use the `verifyTxn` method.

### Example

```ts
fundContractAccount(payment: PayTxn): void {
    verifyPayTxn({
        receiver: this.app.address,
        amount: { greaterThan: 100_000 }
    })
}
```
