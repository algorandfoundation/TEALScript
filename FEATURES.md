# Supported AVM Features

## ARCS
| ARC | Name | Description |
| --- | --- | --- |
| 4 | Application Binary Interface (ABI)	 | ABI method routing is automatically down for public methods. All ABI types are natively supported. Compiler outputs ARC4 JSON |
| 22 | Add `read-only` annotation to ABI methods | Decorating a method with `@abi.readonly` will mark it as readonly |
| 28 | Algorand Event Log Spec | Use `EventLogger` to log ARC28 events |
| 32 | Application Specification | Compiler generates an arc32 JSON file |

## ABI Types
| ABI Type | TEALScript |
| --- | --- |
| `address` | `Address` |
| `uintN` | `uint64`, `uint32`, `uint16`, `uint8`, `uint128`, `uint256`, or `uint<N>`. `AssetID` and `AppID` are encoded as `uint64` |
| `bool` | `boolean` |
| `ufixedNxM` | `ufixed<N, M>` |
| `T[]` | `T[]` |
| `T[N]` | `StaticArray<T, N>`. `bytes32`, `bytes64`, or `bytes<N> for static byte arrays` |
| `[T1, T2, ..., TN]` | `[T1, T2, ..., TN]` or `{keyone: T1, keytwo: T2, ..., keyN: TN}` |
| `string` | `string` |
| `application` | `AppReference` |
| `asset` | `AssetReference` |
| `account` | `AccountReference` |
| `txn` | `Txn` |
| `pay` | `PayTxn` |
| `keyreg` | `KeyRegTxn` |
| `acfg` | `AssetConfigTxn` |
| `axfer` | `AssetTransferTxn` |
| `afrz` | `AssetFreezeTxn` |
## Opcodes

### Flow Control
| Opcode | TEALScript |
| --- | --- |
| `err` | `throw Error()` |
| `bnz` | Used automatically in loops and conditionals |
| `bz` | Used automatically in loops and conditionals |
| `b` | Used automatically in loops and conditionals |
| `return` | Used when the top-level function returns |
| `assert` | `assert` |
| `bury` | Stack manipulation is not officially supported |
| `popn` | Stack manipulation is not officially supported |
| `dupn` | Stack manipulation is not officially supported |
| `pop` | Stack manipulation is not officially supported |
| `dup` | Stack manipulation is not officially supported |
| `dup2` | Stack manipulation is not officially supported |
| `dig` | Stack manipulation is not officially supported |
| `swap` | Stack manipulation is not officially supported |
| `select` | Not officially supported yet, but could be used to optimize conditionals in the future |
| `cover` | Stack manipulation is not officially supported |
| `uncover` | Stack manipulation is not officially supported |
| `callsub` | Used when calling a function |
| `retsub` | `return` |
| `proto` | Used automatically in functions |
| `frame_dig` | Used automatically in functions |
| `frame_bury` | Used automatically in functions |
| `switch` | Not officially supported yet, but could be used to optimize conditionals in the future |
| `match` | Not officially supported yet, but could be used to optimize conditionals in the future |

### Cryptography
| Opcode | TEALScript |
| --- | --- |
| `sha256` | `sha256` |
| `keccak256` | `keccak256` |
| `sha512_256` | `sha512_256` |
| `ed25519verify` | `ed25519Verify` |
| `ecdsa_verify` | `ecdsaVerify` |
| `ecdsa_pk_decompress` | `ecdsaPkDecompress` |
| `ecdsa_pk_recover` | `ecdsaPkRecover` |
| `ed25519verify_bare` | `ed25519VerifyBare` |
| `sha3_256` | `sha3_256` |
| `vrf_verify` | `vrfVerify` |
| `ec_add` | `ecAdd` |
| `ec_scalar_mul` | `ecScalarMul` |
| `ec_pairing_check` | `ecPairingCheck` |
| `ec_multi_scalar_mul` | `ecMultiScalarMul` |
| `ec_subgroup_check` | `ecSubgroupCheck` |
| `ec_map_to` | `ecMapTo` |

### Arithmetic
| Opcode | TEALScript |
| --- | --- |
| `+` | Natively supported |
| `-` | Natively supported |
| `/` | Natively supported |
| `*` | Natively supported |
| `<` | Natively supported |
| `>` | Natively supported |
| `<=` | Natively supported |
| `>=` | Natively supported |
| `&&` | Natively supported |
| `\|\|` | Natively supported |
| `==` | Natively supported |
| `!=` | Natively supported |
| `!` | Natively supported |
| `itob` | Natively supported |
| `btoi` | Natively supported |
| `%` | Natively supported |
| `\|` | Natively supported |
| `&` | Natively supported |
| `^` | Natively supported |
| `~` | Natively supported |
| `mulw` | `mulw` |
| `addw` | `addw` |
| `divmodw` | `divmodw` |
| `shl` | `<<` |
| `shr` | `>>` |
| `sqrt` | Natively supported |
| `bitlen` | `bitlen` |
| `exp` | `**` |
| `expw` | `expw` |
| `divw` | `divw` |

### Byte Array Manipulation
| Opcode | TEALScript |
| --- | --- |
| `len` | `.length` on bytes |
| `concat` | `concat` or `+` |
| `substring` | `String.substring` or `substring` |
| `substring3` | `String.substring` or `substring` |
| `getbit` | `getbit` |
| `setbit` | `setbit` |
| `getbyte` | `getbyte` |
| `setbyte` | `setbyte` |
| `extract` | `extract3` |
| `extract3` | `extract3` |
| `extract_uint16` | `extractUint16` |
| `extract_uint32` | `extractUint32` |
| `extract_uint64` | `extractUint64` |
| `replace2` | `replace3` |
| `replace3` | `replace3` |
| `base64_decode` | `base64Decode` |
| `json_ref` | `jsonRef` |

### Loading Values
| Opcode | TEALScript |
| --- | --- |
| `intcblock` | Constant block not officially supported |
| `intc` | Constant block not officially supported |
| `intc_0` | Constant block not officially supported |
| `intc_1` | Constant block not officially supported |
| `intc_2` | Constant block not officially supported |
| `intc_3` | Constant block not officially supported |
| `bytecblock` | Constant block not officially supported |
| `bytec` | Constant block not officially supported |
| `bytec_0` | Constant block not officially supported |
| `bytec_1` | Constant block not officially supported |
| `bytec_2` | Constant block not officially supported |
| `bytec_3` | Constant block not officially supported |
| `arg` | `LogicSig.logic` arguments |
| `arg_0` | `LogicSig.logic` arguments |
| `arg_1` | `LogicSig.logic` arguments |
| `arg_2` | `LogicSig.logic` arguments |
| `arg_3` | `LogicSig.logic` arguments |
| `txn` | `this.txn` |
| `global` | `globals` |
| `gtxn` | `this.txnGroup` or transaction argument |
| `load` | `ScratchSlot` |
| `store` | `ScratchSlot` |
| `txna` | `this.txn` |
| `gtxna` | `this.txnGroup` or transaction argument |
| `gtxns` | `this.txnGroup` or transaction argument |
| `gtxnsa` | `this.txnGroup` or transaction argument |
| `gload` | `Txn.load` |
| `gloads` | `Txn.load` |
| `gaid` | `this.txnGroup` or transaction argument |
| `gaids` | `this.txnGroup` or transaction argument |
| `loads` | `ScratchSlot` |
| `stores` | `ScratchSlot` |
| `pushbytes` | Used by `TemplateVar` |
| `pushint` | Used by `TemplateVar` |
| `pushbytess` | Not used yet, but could be used for optimizations in future |
| `pushints` | Not used yet, but could be used for optimizations in future |
| `bzero` | `bzero` |
| `txnas` | `this.txn` |
| `gtxnas` | `this.txnGroup` or transaction argument |
| `gtxnsas` | `this.txnGroup` or transaction argument |
| `args` | `LogicSig.logic` arguments |
| `gloadss` | `Txn.load` |

### State Access
| Opcode | TEALScript |
| --- | --- |
| `balance` | `Address.balance` and `Address.hasBalance` |
| `app_opted_in` | `Address.isOptedInToApp()` |
| `app_local_get` | Method call on LocalStateKey on `LocalStateMap` |
| `app_local_get_ex` | `Application.local()` |
| `app_global_get` | Method call on `GlobalStateKey` on `GlobalStateMap` |
| `app_global_get_ex` | `Application.global()` |
| `app_local_put` | Method call on LocalStateKey on `LocalStateMap` |
| `app_global_put` | Method call on `GlobalStateKey` on `GlobalStateMap` |
| `app_local_del` | Method call on LocalStateKey on `LocalStateMap` |
| `app_global_del` | Method call on `GlobalStateKey` on `GlobalStateMap` |
| `asset_holding_get` | `Address.assetBalance` and `Address.hasAsset` |
| `asset_params_get` | Method calls on `Asset` |
| `app_params_get` | Method calls on `Application` |
| `acct_params_get` | Method calls on `Address` |
| `min_balance` | `Address.minBalance` |
| `log` | `log` or `EventEmitter` |
| `block` | `blocks` |

### Byte Array Arithmetic
| Opcode | TEALScript |
| --- | --- |
| `bsqrt` | Natively supported |
| `b+` | Natively supported |
| `b-` | Natively supported |
| `b/` | Natively supported |
| `b*` | Natively supported |
| `b<` | Natively supported |
| `b>` | Natively supported |
| `b<=` | Natively supported |
| `b>=` | Natively supported |
| `b==` | Natively supported |
| `b!=` | Natively supported |
| `b%` | Natively supported |

### Byte Array Logic
| Opcode | TEALScript |
| --- | --- |
| `b\|` | Natively supported |
| `b&` | Natively supported |
| `b^` | Natively supported |
| `b~` | Natively supported |

### Inner Transactions
| Opcode | TEALScript |
| --- | --- |
| `itxn_begin` | `this.pendingGroup.add...` or `send...` |
| `itxn_field` | `this.pendingGroup.add...` or `send...` |
| `itxn_submit` | `this.pendingGroup.execute` or `send...` |
| `itxn` | `this.itxn` |
| `itxna` | `this.itxn` |
| `itxn_next` | `this.pendingGroup.add...` |
| `gitxn` | `this.lastInnerGroup` |
| `gitxna` | `this.lastInnerGroup` |
| `itxnas` | `this.itxn` |
| `gitxnas` | `this.lastInnerGroup` |

### Box Access
| Opcode | TEALScript |
| --- | --- |
| `box_create` | Method call on `BoxKey` or `BoxMap` |
| `box_extract` | Method call on `BoxKey` or `BoxMap` |
| `box_replace` | Method call on `BoxKey` or `BoxMap` |
| `box_del` | Method call on `BoxKey` or `BoxMap` |
| `box_len` | Method call on `BoxKey` or `BoxMap` |
| `box_get` | Method call on `BoxKey` or `BoxMap` |
| `box_put` | Method call on `BoxKey` or `BoxMap` |
| `box_splice` | Method call on `BoxKey` or `BoxMap` |
| `box_resize` | Method call on `BoxKey` or `BoxMap` |