---
title: Inner Transactions
---

Algorand Smart Contracts have the ability to send transactions from the application's contract address. Transactions sent from a contract address via an application call is called an inner transaction. 

## Inner Transaction

To send a single inner transaction, one of the following methods can be used.

| Function                     | Usage                                         |
| ---------------------------- | --------------------------------------------- |
| `sendPayment`                | Send a payment transaction                    |
| `sendAssetTransfer`          | Send an asset transfer transaction            |
| `sendAssetCreation`          | Send a transcation that creates a transcation |
| `sendAssetConfig`            | Send an asset config transaction              |
| `sendAssetFreeze`            | Send an asset freeze transaction              |
| `sendAppCall`                | Send an application call                      |
| `sendMethodCall`             | Call an ABI method of another app             |
| `sendOnlineKeyRegistration`  | Send a rekreg transaction to register offline |
| `sendOfflineKeyRegistration` | Send a rekreg transaction to register offline |

## Inner Transaction Group

You can also send multiple inner transactions in the same group. To add transactions to a group, `this.pendingGroup` is used. It should be noted that at any given time only one group can be constructed at a time. This means 

| Function                                      | Usage                                        |
| --------------------------------------------- | -------------------------------------------- |
| `this.pendingGroup.addPayment`                | Add a payment transaction                    |
| `this.pendingGroup.addAssetTransfer`          | Add an asset transfer transaction            |
| `this.pendingGroup.addAssetCreation`          | Add a transcation that creates a transcation |
| `this.pendingGroup.addAssetConfig`            | Add an asset config transaction              |
| `this.pendingGroup.addAssetFreeze`            | Add an asset freeze transaction              |
| `this.pendingGroup.addAppCall`                | Add an application call                      |
| `this.pendingGroup.addMethodCall`             | Add an ABI method call to another app        |
| `this.pendingGroup.addOnlineKeyRegistration`  | Add a rekreg transaction to register offline |
| `this.pendingGroup.addOfflineKeyRegistration` | Add a rekreg transaction to register offline |

Once transactions have been added to the pending group, the group can be submitted via `this.pendingGroup.submit()`

## Inner Transaction Fields

The fields of the most recent inner transaction can be read via `this.itxn`