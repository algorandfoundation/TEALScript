---
title: PyTeal Migration
---

## Classes and Functions
| PyTeal       | TEALScript                                  |
| ------------ | ------------------------------------------- |
| `Txn`        | `this.txn`                                  |
| `Global`     | `globals`                                   |
| `Itxn`       | `this.itxn`                                 |
| `Assert`     | `assert`                                    |
| `NamedTuple` | See Objects section [here](types/tuples.md) |
| `Gtxn`       | `this.txnGroup`                             |

## Maybe Values

In TEALScript, there is no concept of `MaybeValue`. For every opcode that would return a `MaybeValue` in PyTeal, TEALScript exposes two methods. One to get the value and one to get whether the value exists. Simply getting the value will always assert that the value exists. For boxes, the means needing to call `exist` prior to `get`. Otherwise there will be two methods, with one prefixed with `has` to indicate it is getting whether the value exists or not.

### Example

```ts
class BalanceApp extends Contract {
    counters = BoxMap<Account, number>();

    getBalance(acct: Account): void {
        // Set balance to 0 if acct balance doesn't exist
        const balance = acct.hasBalance ? acct.balance : 0

        // set counter to 1 if it doesn't already exist
        const newCounter = this.counters(acct).exists ? this.counters(acct).value + 1 : 1
        this.counters(acct).value = newCounter
    }
}
```