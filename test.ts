import { Contract, Account, Compiler } from './tealscript';

class Approval extends Contract {
  getTotalBalance(firstAccount: Account, secondAccount: Account): number {
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

    return totalBalance;
  }
}

const contract = new Compiler(__filename.replace('.js', '.ts'));
console.log(contract.teal.join('\n'));

if (contract.unprocessedNodes[0]) console.log(contract.unprocessedNodes[0]);
