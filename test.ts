import { writeFileSync } from 'fs';
import {
  Contract, Account, Compiler, BoxMap, uint64,
} from './tealscript';

class ExampleTEALScriptApp extends Contract {
  accountBalanceBox = new BoxMap<Account, uint64>({ defaultSize: 8 });

  /*
  favoriteNumber = new Box<uint64>({ defaultSize: 8, key: 'fn' });

  exampleGlobalMap = new GlobalMap<string, uint64>({ amount: 32 });

  exampleGlobal = new Global<string, uint64>({ key: 'g' });
  */

  exampleAbiMethod(firstAccount: Account, secondAccount: Account): uint64 {
    this.accountBalanceBox.put(firstAccount, firstAccount.balance);
    this.accountBalanceBox.put(secondAccount, secondAccount.balance);

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

    const id = this.dig(3) as uint64;
    const acct = new Account(id);
    if (acct.hasBalance) {
      this.log(this.itob(acct.balance));
    }
    this.match('foo', 'bar');

    return totalBalance;
  }

  private exampleInteralSubroutine(account: Account): uint64 {
    this.box.put('foo', 'bar');
    return account.balance;
  }
}
const contract = new Compiler(__filename.replace('.js', '.ts'));
writeFileSync('approval.teal', contract.teal.join('\n'));
writeFileSync('abi.json', JSON.stringify(contract.abi, null, 2));
