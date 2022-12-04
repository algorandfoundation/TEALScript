import { writeFileSync } from 'fs';
import {
  Contract, Account, Compiler, BoxMap,
} from './tealscript';

class ExampleTEALScriptApp extends Contract {
  accountBalanceBox = new BoxMap<Account, number>(8);

  exampleAbiMethod(firstAccount: Account, secondAccount: Account): number {
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

    const id = this.dig(3) as number;
    const acct = new Account(id);
    if (acct.hasBalance) {
      this.log(this.itob(acct.balance));
    }
    this.match('foo', 'bar');

    return totalBalance;
  }

  private exampleInteralSubroutine(account: Account): number {
    this.box.put('foo', 'bar');
    return account.balance;
  }
}
const contract = new Compiler(__filename.replace('.js', '.ts'));
writeFileSync('approval.teal', contract.teal.join('\n'));
writeFileSync('abi.json', JSON.stringify(contract.abi, null, 2));
