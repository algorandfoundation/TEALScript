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
    NFTFactory.create().createApplication();

    const factoryApp = this.itxn.createdApplicationID;

    this.txnComposer.send(
      new PayTxn({
        amount: 200_000,
        receiver: factoryApp.address,
      })
    );

    const createdAsset = NFTFactory.call({ applicationID: factoryApp }).createNFT('My NFT', 'MNFT');

    this.txnComposer.send(
      new AssetTransferTxn({
        assetReceiver: this.app.address,
        assetAmount: 0,
        xferAsset: createdAsset,
      })
    );

    NFTFactory.call({ applicationID: factoryApp }).transferNFT(createdAsset, this.app.address);

    return createdAsset;
  }
}
