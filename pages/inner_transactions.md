## Functions
| Function                  | Usage                                         |
| ------------------------- | --------------------------------------------- |
| {@link sendPayment}       | Send a payment transaction                    |
| {@link sendAssetTransfer} | Send an asset transfer transaction            |
| {@link sendAppCall}       | Send an application call                      |
| {@link sendAssetCreation} | Send a transcation that creates a transcation |
| {@link sendMethodCall}    | Call an ABI method of another app             |


## Inner Transaction Fields

The fields of the most recent inner transaction can be read via {@link Contract.itxn | this.itxn}