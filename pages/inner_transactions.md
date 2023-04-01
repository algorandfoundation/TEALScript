## Functions
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

## Inner Transaction Fields

The fields of the most recent inner transaction can be read via {@link Contract.itxn | this.itxn}