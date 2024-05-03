import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class NFTFactory extends Contract {
  createNFT(name: string, unitName: string): AssetID {
    return this.txnComposer.send(
      new AssetCreateTxn({
        configAssetName: name,
        configAssetUnitName: unitName,
        configAssetTotal: 1,
      })
    );
  }

  transferNFT(asset: AssetID, receiver: Address): void {
    this.txnComposer.send(
      new AssetTransferTxn({
        assetReceiver: receiver,
        assetAmount: 1,
        xferAsset: asset,
      })
    );
  }
}

// eslint-disable-next-line no-unused-vars
class FactoryCaller extends Contract {
  mintAndGetAsset(): AssetID {
    this.txnComposer.send(
      new MethodCallTxn<typeof NFTFactory.prototype.createApplication>({
        clearStateProgram: NFTFactory.clearProgram(),
        approvalProgram: NFTFactory.approvalProgram(),
      })
    );

    const factoryApp = this.itxn.createdApplicationID;

    this.txnComposer.send(
      new PayTxn({
        amount: 200_000,
        receiver: factoryApp.address,
      })
    );

    const createdAsset = this.txnComposer.send(
      new MethodCallTxn<typeof NFTFactory.prototype.createNFT>({
        applicationID: factoryApp,
        methodArgs: ['My NFT', 'MNFT'],
      })
    );

    this.txnComposer.send(
      new AssetTransferTxn({
        assetReceiver: this.app.address,
        assetAmount: 0,
        xferAsset: createdAsset,
      })
    );

    this.txnComposer.send(
      new MethodCallTxn<typeof NFTFactory.prototype.transferNFT>({
        applicationID: factoryApp,
        methodArgs: [createdAsset, this.app.address],
      })
    );

    return createdAsset;
  }
}
