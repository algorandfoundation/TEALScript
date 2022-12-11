import { writeFileSync } from 'fs';
import {
  Contract, Account, Compiler, BoxMap, uint64, Box, Global, GlobalMap, PayTxn,
} from './tealscript';

class ExampleTEALScriptApp extends Contract {
  accountBalanceBox = new BoxMap<Account, uint64>({ defaultSize: 8 });

  favoriteNumber = new Box<uint64>({ defaultSize: 8, key: 'fn' });

  someGlobal = new Global<uint64>({ key: 'sg' });

  aGlobalMap = new GlobalMap<string, uint64>();

  exampleAbiMethod(firstAccount: Account, secondAccount: Account, payment: PayTxn): uint64 {
    this.log(this.itob(payment.sender.assetBalance(123)));

    this.accountBalanceBox.put(firstAccount, firstAccount.balance);
    this.accountBalanceBox.put(secondAccount, secondAccount.balance);
    this.favoriteNumber.put(42);

    this.someGlobal.put(123);
    this.aGlobalMap.put('foo', 456);

    this.sendPayment({
      fee: 0,
      receiver: firstAccount,
      amount: 100_000,
    });

    this.sendAppCall({
      fee: 0,
      applicationID: 1337,
      applicationArgs: ['foo', 'bar'],
      onComplete: 'NoOp',
    });

    this.sendMethodCall<[Account, uint64], void>({
      fee: 0,
      applicationID: 1337,
      onComplete: 'NoOp',
      name: 'exampleExternalMethod',
      methodArgs: [firstAccount, 42],
    });

    this.log(this.itob(this.accountBalanceBox.get(firstAccount)));
    const msg = 'HERE';
    this.log(msg);
    this.log(firstAccount);
    this.log(secondAccount);

    if (firstAccount.hasBalance && secondAccount.hasBalance) {
      this.log('Both accounts have a balance!');
    }

    const totalBalance = firstAccount.balance + secondAccount.balance;

    if (totalBalance === 0) {
      this.log('These accounts have nothing');
    } else if (totalBalance > 100_000_000e6) {
      this.log('At least one of these accounts is a whale');
    } else if (totalBalance > 1_000_000e6) {
      this.log('At least one of these accounts is rich');
    } else {
      this.log('These accounts have a reasonable balance');
    }

    const id = 456;
    const acct = new Account(id);
    if (acct.hasBalance) {
      this.log(this.itob(acct.balance));
    }

    this.exampleInteralSubroutine(firstAccount);

    return totalBalance;
  }

  private exampleInteralSubroutine(account: Account): uint64 {
    const bal = this.global.currentApplication.address.balance;
    this.log(this.itob(bal));
    this.log(this.itob(account.assetBalance(1337)));
    this.log(this.itob(this.global.currentApplication.address.assetBalance(42)));
    this.log(this.itob(this.txn.sender.assetBalance(777)));
    return account.balance;
  }
}
const contract = new Compiler(__filename.replace('.js', '.ts'));
writeFileSync('approval.teal', contract.teal.join('\n'));
writeFileSync('abi.json', JSON.stringify(contract.abi, null, 2));
