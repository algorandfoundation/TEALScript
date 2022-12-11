/* eslint-disable max-classes-per-file */
import {
  Contract, Account, BoxMap, Global, PayTxn, AssetTransferTxn, TEALScript, Application, Asset,
} from '../../tealscript';

class Vault extends Contract {
  creator = new Global<Account>({ key: 'creator' });

  master = new Global<Application>({ key: 'master' });

  receiver = new Global<Account>({ key: 'receiver' });

  funderMap = new BoxMap<Asset, Account>({ defaultSize: 32 });

  private closeAcct(vaultCreator: Account): void {
    this.assert(vaultCreator === this.creator.get());

    this.sendPayment({
      receiver: vaultCreator,
      amount: this.global.currentApplicationAddress.minBalance,
      fee: 0,
      closeRemainderTo: this.txn.sender,
    });

    const deleteVaultTxn = this.groupTxns[this.global.groupIndex + 1];
    this.assert(deleteVaultTxn.applicationID === this.master.get());
  }

  create(receiver: Account, sender: Account): void {
    this.creator.put(sender);
    this.receiver.put(receiver);
    this.master.put(this.global.callerApplication);
  }

  reject(asaCreator: Account, feeSink: Account, asa: Asset, vaultCreator: Account): void {
    this.assert(this.txn.sender === this.receiver.get());
    this.assert(feeSink === this.addr('Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA'));
    const preMbr = this.global.currentApplicationAddress.minBalance;

    this.sendAssetTransfer({
      assetReceiver: asaCreator,
      xferAsset: asa,
      assetAmount: 0,
      assetCloseTo: asaCreator,
      fee: 0,
    });

    this.funderMap.delete(asa);

    const mbrAmt = preMbr - this.global.currentApplicationAddress.minBalance;

    this.sendPayment({
      receiver: feeSink,
      amount: mbrAmt - this.txn.fee,
      fee: 0,
    });

    this.sendPayment({
      receiver: this.txn.sender,
      amount: this.txn.fee,
      fee: 0,
    });

    // TODO: if (this.global.currentApplicationAddress.assets === 0) this.closeAcct(vaultCreator);
  }

  optIn(asa: Asset, mbrPayment: PayTxn): void {
    // TODO: this.assert(this.funderMap.exists(asa));
    this.assert(mbrPayment.sender === this.txn.sender);
    this.assert(mbrPayment.receiver === this.global.currentApplicationAddress);

    const preMbr = this.global.currentApplicationAddress.minBalance;

    this.funderMap.put(asa, this.txn.sender);

    this.sendAssetTransfer({
      assetReceiver: this.global.currentApplicationAddress,
      assetAmount: 0,
      fee: 0,
      xferAsset: asa,
    });

    this.assert(mbrPayment.amount === this.global.currentApplicationAddress.minBalance - preMbr);
  }

  claim(asa: Asset, creator: Account, asaMbrFunder: Account): void {
    // TODO: this.assert(this.funderMap.exists(asa));
    this.assert(asaMbrFunder === this.funderMap.get(asa));
    this.assert(this.txn.sender === this.receiver.get());
    this.assert(this.creator.get() === creator);

    const initialMbr = this.global.currentApplicationAddress.minBalance;

    this.funderMap.delete(asa);

    this.sendAssetTransfer({
      assetReceiver: this.txn.sender,
      fee: 0,
      assetAmount: this.global.currentApplicationAddress.assetBalance(asa),
      xferAsset: asa,
      assetCloseTo: this.txn.sender,
    });

    this.sendPayment({
      receiver: asaMbrFunder,
      amount: initialMbr - this.global.currentApplicationAddress.minBalance,
      fee: 0,
    });

    // TODO: if (this.global.currentApplicationAddress.assets === 0) this.closeAcct(creator);
  }

  delete(): void {
    this.assert(this.global.currentApplicationAddress.balance === 0);
    this.assert(this.txn.sender === this.global.creatorAddress);
  }
}

class Master extends Contract {
  vaultMap = new BoxMap<Account, Application>({ defaultSize: 8 });

  createVault(receiver: Account, mbrPayment: PayTxn): Application {
    // TODO: this.assert(this.vaultMap.exists(receiver))
    this.assert(mbrPayment.receiver === this.global.currentApplicationAddress);
    this.assert(mbrPayment.sender === this.txn.sender);
    this.assert(mbrPayment.closeRemainderTo === this.global.zeroAddress);

    const preCreateMBR = this.global.currentApplicationAddress.minBalance;

    // TODO: approval/clear program
    this.sendMethodCall<[Account, Account], void>({
      name: 'create',
      onComplete: 'NoOp',
      fee: 0,
      methodArgs: [receiver, this.txn.sender],
    });

    const vault = this.itxn.createdApplicationID;

    this.sendPayment({
      receiver: vault.address,
      amount: this.global.minBalance,
      fee: 0,
    });

    this.vaultMap.put(receiver, vault);

    // eslint-disable-next-line max-len
    this.assert(mbrPayment.amount === (this.global.currentApplicationAddress.minBalance - preCreateMBR) + this.global.minBalance);

    return vault;
  }

  verifyAxfer(receiver: Account, vaultAxfer: AssetTransferTxn, vault: Application): void {
    // TODO: this.assert(this.vaultMap.exists(receiver))

    this.assert(this.vaultMap.get(receiver) === vault);
    this.assert(vaultAxfer.assetReceiver === vault.address);
    this.assert(vaultAxfer.assetCloseTo === this.global.zeroAddress);
  }

  getVaultId(receiver: Account): Application {
    return this.vaultMap.get(receiver);
  }

  getVaultAddr(receiver: Account): Account {
    // TODO: this.assert(this.vaultMap.exists(receiver))
    return this.vaultMap.get(receiver).address;
  }

  deleteVault(vault: Application, creator: Account): void {
    this.assert(this.txn.fee === 0);
    this.assert(vault === this.vaultMap.get(this.txn.sender));

    // TODO: const vaultCreator = vault.global<Account>('creator')
    // this.assert(vaultCreator === creator);

    const preDeleteMBR = this.global.currentApplicationAddress.minBalance;

    this.sendMethodCall<[], void>({
      applicationID: vault,
      onComplete: 'DeleteApplication',
      name: 'delete',
      fee: 0,
    });

    this.vaultMap.delete(this.txn.sender);
    /*
    this.sendPayment({
      receiver: vaultCreator,
      amount: preDeleteMBR - this.global.currentApplicationAddress.minBalance,
      fee: 0,
    });
    */
  }
}

// eslint-disable-next-line no-new
new TEALScript(__filename.replace('.js', '.ts'));
