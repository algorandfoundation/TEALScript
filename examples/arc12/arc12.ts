/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */
import {
  Contract, Account, BoxMap, Global, PayTxn, AssetTransferTxn, Application, Asset,
} from '../../tealscript';

class Vault extends Contract {
  creator = new Global<Account>({ key: 'creator' });

  master = new Global<Application>({ key: 'master' });

  receiver = new Global<Account>({ key: 'receiver' });

  funderMap = new BoxMap<Asset, Account>({ defaultSize: 32 });

  private closeAcct(vaultCreator: Account): void {
    assert(vaultCreator === this.creator.get());

    sendPayment({
      receiver: vaultCreator,
      amount: this.global.currentApplicationAddress.minBalance,
      fee: 0,
      closeRemainderTo: this.txn.sender,
    });

    const deleteVaultTxn = this.groupTxns[this.global.groupIndex + 1];
    assert(deleteVaultTxn.applicationID === this.master.get());
  }

  create(receiver: Account, sender: Account): void {
    this.creator.put(sender);
    this.receiver.put(receiver);
    this.master.put(this.global.callerApplication);
  }

  reject(asaCreator: Account, feeSink: Account, asa: Asset, vaultCreator: Account): void {
    assert(this.txn.sender === this.receiver.get());
    assert(feeSink === addr('Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA'));
    const preMbr = this.global.currentApplicationAddress.minBalance;

    sendAssetTransfer({
      assetReceiver: asaCreator,
      xferAsset: asa,
      assetAmount: 0,
      assetCloseTo: asaCreator,
      fee: 0,
    });

    this.funderMap.delete(asa);

    const mbrAmt = preMbr - this.global.currentApplicationAddress.minBalance;

    sendPayment({
      receiver: feeSink,
      amount: mbrAmt - this.txn.fee,
      fee: 0,
    });

    sendPayment({
      receiver: this.txn.sender,
      amount: this.txn.fee,
      fee: 0,
    });

    if (this.global.currentApplicationAddress.assets === 0) this.closeAcct(vaultCreator);
  }

  optIn(asa: Asset, mbrPayment: PayTxn): void {
    assert(this.funderMap.exists(asa));
    assert(mbrPayment.sender === this.txn.sender);
    assert(mbrPayment.receiver === this.global.currentApplicationAddress);

    const preMbr = this.global.currentApplicationAddress.minBalance;

    this.funderMap.put(asa, this.txn.sender);

    sendAssetTransfer({
      assetReceiver: this.global.currentApplicationAddress,
      assetAmount: 0,
      fee: 0,
      xferAsset: asa,
    });

    assert(mbrPayment.amount === this.global.currentApplicationAddress.minBalance - preMbr);
  }

  claim(asa: Asset, creator: Account, asaMbrFunder: Account): void {
    assert(this.funderMap.exists(asa));
    assert(asaMbrFunder === this.funderMap.get(asa));
    assert(this.txn.sender === this.receiver.get());
    assert(this.creator.get() === creator);

    const initialMbr = this.global.currentApplicationAddress.minBalance;

    this.funderMap.delete(asa);

    sendAssetTransfer({
      assetReceiver: this.txn.sender,
      fee: 0,
      assetAmount: this.global.currentApplicationAddress.assetBalance(asa),
      xferAsset: asa,
      assetCloseTo: this.txn.sender,
    });

    sendPayment({
      receiver: asaMbrFunder,
      amount: initialMbr - this.global.currentApplicationAddress.minBalance,
      fee: 0,
    });

    if (this.global.currentApplicationAddress.assets === 0) this.closeAcct(creator);
  }

  delete(): void {
    assert(this.global.currentApplicationAddress.balance === 0);
    assert(this.txn.sender === this.global.creatorAddress);
  }
}

class Master extends Contract {
  vaultMap = new BoxMap<Account, Application>({ defaultSize: 8 });

  createVault(receiver: Account, mbrPayment: PayTxn): Application {
    assert(this.vaultMap.exists(receiver));
    assert(mbrPayment.receiver === this.global.currentApplicationAddress);
    assert(mbrPayment.sender === this.txn.sender);
    assert(mbrPayment.closeRemainderTo === this.global.zeroAddress);

    const preCreateMBR = this.global.currentApplicationAddress.minBalance;

    // TODO: approval program
    sendMethodCall<[Account, Account], void>({
      name: 'create',
      onComplete: 'NoOp',
      fee: 0,
      methodArgs: [receiver, this.txn.sender],
      clearStateProgram: this.app.clearStateProgram,
    });

    const vault = this.itxn.createdApplicationID;

    sendPayment({
      receiver: vault.address,
      amount: this.global.minBalance,
      fee: 0,
    });

    this.vaultMap.put(receiver, vault);

    // eslint-disable-next-line max-len
    assert(mbrPayment.amount === (this.global.currentApplicationAddress.minBalance - preCreateMBR) + this.global.minBalance);

    return vault;
  }

  verifyAxfer(receiver: Account, vaultAxfer: AssetTransferTxn, vault: Application): void {
    assert(this.vaultMap.exists(receiver));

    assert(this.vaultMap.get(receiver) === vault);
    assert(vaultAxfer.assetReceiver === vault.address);
    assert(vaultAxfer.assetCloseTo === this.global.zeroAddress);
  }

  getVaultId(receiver: Account): Application {
    return this.vaultMap.get(receiver);
  }

  getVaultAddr(receiver: Account): Account {
    assert(this.vaultMap.exists(receiver));
    return this.vaultMap.get(receiver).address;
  }

  deleteVault(vault: Application, creator: Account): void {
    assert(this.txn.fee === 0);
    assert(vault === this.vaultMap.get(this.txn.sender));

    const vaultCreator = vault.global('creator') as Account;
    assert(vaultCreator === creator);

    const preDeleteMBR = this.global.currentApplicationAddress.minBalance;

    sendMethodCall<[], void>({
      applicationID: vault,
      onComplete: 'DeleteApplication',
      name: 'delete',
      fee: 0,
    });

    this.vaultMap.delete(this.txn.sender);

    sendPayment({
      receiver: vaultCreator,
      amount: preDeleteMBR - this.global.currentApplicationAddress.minBalance,
      fee: 0,
    });
  }
}
