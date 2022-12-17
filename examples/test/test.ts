/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */

class ExampleTEALScriptApp extends Contract {
  accountBalanceBox = new BoxMap<Account, uint64>({ defaultSize: 8 });

  favoriteNumber = new Box<uint64>({ defaultSize: 8, key: 'fn' });

  someGlobal = new Global<uint64>({ key: 'sg' });

  aGlobalMap = new GlobalMap<string, uint64>();

  exampleAbiMethod(
    firstAccount: Account,
    secondAccount: Account,
    payment: PayTxn,
    axfer: AssetTransferTxn,
  ): uint64 {
    log(itob(payment.sender.assetBalance(123)));
    log(axfer.assetReceiver);

    sendAssetTransfer({
      fee: 0,
      assetReceiver: firstAccount,
      assetAmount: 100_000,
      xferAsset: 1337,
    });

    this.accountBalanceBox.put(firstAccount, firstAccount.balance);
    this.accountBalanceBox.put(secondAccount, secondAccount.balance);
    this.favoriteNumber.put(42);

    this.someGlobal.put(123);
    this.aGlobalMap.put('foo', 456);

    sendPayment({
      fee: 0,
      receiver: firstAccount,
      amount: 100_000,
    });

    sendAppCall({
      fee: 0,
      applicationID: new Application(1337),
      applicationArgs: ['foo', 'bar'],
      onComplete: 'NoOp',
    });

    sendMethodCall<[Account, uint64], void>({
      fee: 0,
      applicationID: new Application(1337),
      onComplete: 'NoOp',
      name: 'exampleExternalMethod',
      methodArgs: [firstAccount, 42],
    });

    log(itob(this.accountBalanceBox.get(firstAccount)));
    const msg = 'HERE';
    log(msg);
    log(firstAccount);
    log(secondAccount);

    if (firstAccount.hasBalance && secondAccount.hasBalance) {
      log('Both accounts have a balance!');
    }

    const totalBalance = firstAccount.balance + secondAccount.balance;

    if (totalBalance === 0) {
      log('These accounts have nothing');
    } else if (totalBalance > 100_000_000e6) {
      log('At least one of these accounts is a whale');
    } else if (totalBalance > 1_000_000e6) {
      log('At least one of these accounts is rich');
    } else {
      log('These accounts have a reasonable balance');
    }

    const id = 456;
    const acct = new Account(id);
    if (acct.hasBalance) {
      log(itob(acct.balance));
    }

    this.exampleInteralSubroutine(firstAccount);

    return totalBalance;
  }

  private exampleInteralSubroutine(account: Account): uint64 {
    const bal = global.currentApplication.address.balance;
    log(itob(bal));
    log(itob(account.assetBalance(1337)));
    log(itob(global.currentApplication.address.assetBalance(42)));
    log(itob(this.txn.sender.assetBalance(777)));
    return account.balance;
  }
}
