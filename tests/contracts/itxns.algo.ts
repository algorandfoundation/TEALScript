import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class ItxnsTest extends Contract {
  payment(): void {
    this.txnComposer.send(
      new PayTxn({
        amount: 100,
        receiver: this.app.address,
        closeRemainderTo: globals.zeroAddress,
        sender: this.app.address,
        rekeyTo: globals.zeroAddress,
        note: 'Hello World!',
      })
    );
  }

  assetCreation(): AssetID {
    return this.txnComposer.send(
      new AssetCreateTxn({
        configAssetName: 'name',
        configAssetUnitName: 'unit',
        configAssetTotal: 1,
        configAssetManager: this.app.address,
        configAssetReserve: this.app.address,
        configAssetFreeze: this.app.address,
        configAssetClawback: this.app.address,
        configAssetDefaultFrozen: 0,
        configAssetURL: 'url',
        configAssetMetadataHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      })
    );
  }

  appCall(): void {
    this.txnComposer.send(
      new AppCallTxn({
        accounts: [this.app.address],
        applicationArgs: ['arg1', 'arg2'],
        applicationID: this.app,
        applications: [this.app],
        approvalProgram: 'approval',
        assets: [AssetID.zeroIndex],
        clearStateProgram: 'clear',
        globalNumByteSlice: 1,
        globalNumUint: 1,
        localNumByteSlice: 1,
        localNumUint: 1,
        note: 'note',
      })
    );
  }

  assetConfig(): void {
    this.txnComposer.send(
      new AssetConfigTxn({
        configAsset: AssetID.zeroIndex,
        configAssetManager: this.app.address,
        configAssetReserve: this.app.address,
        configAssetFreeze: this.app.address,
        configAssetClawback: this.app.address,
      })
    );
  }

  assetFreeze(): void {
    this.txnComposer.send(
      new AssetFreezeTxn({
        freezeAssetFrozen: true,
        freezeAssetAccount: this.app.address,
        freezeAsset: AssetID.zeroIndex,
      })
    );
  }

  assetTransfer(): void {
    this.txnComposer.send(
      new AssetTransferTxn({
        assetAmount: 1,
        assetCloseTo: this.app.address,
        assetReceiver: this.app.address,
        assetSender: this.app.address,
        xferAsset: AssetID.zeroIndex,
      })
    );
  }

  methodCall(): AssetID {
    return this.txnComposer.send(
      new MethodCallTxn<[AppID, AssetID], AssetID>({
        name: 'method',
        methodArgs: [this.app, AssetID.zeroIndex],
      })
    );
  }

  onlineKeyRegistration(): void {
    this.txnComposer.send(
      new KeyRegTxn({
        selectionPK: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        stateProofPK: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        voteFirst: 1,
        voteKeyDilution: 1,
        voteLast: 1,
        votePK: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      })
    );
  }

  offlineKeyRegistration(): void {
    this.txnComposer.send(new KeyRegTxn({}));
  }

  innerGeneric(): void {
    this.txnComposer.send(
      new MethodCallTxn<[InnerTxn<InnerAssetCreation>], void>({
        name: 'foo',
        methodArgs: [{ configAssetTotal: 1 }],
      })
    );
  }
}
