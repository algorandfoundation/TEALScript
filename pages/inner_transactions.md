Algorand Smart Contracts have the ability to send transactions from the application's contract address. Transactions sent from a contract address via an application call is called an inner transaction. 

## Inner Transaction

To send a single inner transaction, one of the following methods can be used.

| Function                           | Usage                                         |
| ---------------------------------- | --------------------------------------------- |
| {@link sendPayment}                | Send a payment transaction                    |
| {@link sendAssetTransfer}          | Send an asset transfer transaction            |
| {@link sendAssetCreation}          | Send a transcation that creates a transcation |
| {@link sendAssetConfig}            | Send an asset config transaction              |
| {@link sendAssetFreeze}            | Send an asset freeze transaction              |
| {@link sendAppCall}                | Send an application call                      |
| {@link sendMethodCall}             | Call an ABI method of another app             |
| {@link sendOnlineKeyRegistration}  | Send a rekreg transaction to register offline |
| {@link sendOfflineKeyRegistration} | Send a rekreg transaction to register offline |

## Inner Transaction Group

You can also send multiple inner transactions in the same group. To add transactions to a group, {@link Contract.pendingGroup this.pendingGroup} is used. It should be noted that at any given time only one group can be constructed at a time. This means 

| Function                                                                                   | Usage                                        |
| ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| {@link PendingGroup.addPayment this.pendingGroup.addPayment}                               | Add a payment transaction                    |
| {@link PendingGroup.addAssetTransfer this.pendingGroup.addAssetTransfer}                   | Add an asset transfer transaction            |
| {@link PendingGroup.addAssetCreation this.pendingGroup.addAssetCreation}                   | Add a transcation that creates a transcation |
| {@link PendingGroup.addAssetConfig this.pendingGroup.addAssetConfig}                       | Add an asset config transaction              |
| {@link PendingGroup.addAssetFreeze this.pendingGroup.addAssetFreeze}                       | Add an asset freeze transaction              |
| {@link PendingGroup.addAppCall this.pendingGroup.addAppCall}                               | Add an application call                      |
| {@link PendingGroup.addMethodCall this.pendingGroup.addMethodCall}                         | Add an ABI method call to another app        |
| {@link PendingGroup.addOnlineKeyRegistration this.pendingGroup.addOnlineKeyRegistration}   | Add a rekreg transaction to register offline |
| {@link PendingGroup.addOfflineKeyRegistration this.pendingGroup.addOfflineKeyRegistration} | Add a rekreg transaction to register offline |

Once transactions have been added to the pending group, the group can be submitted via {@link PendingGroup.submit this.pendingGroup.submit()}

## Inner Transaction Fields

The fields of the most recent inner transaction can be read via {@link Contract.itxn | this.itxn}