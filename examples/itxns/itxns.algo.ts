import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class NFTFactory extends Contract {
  createNFT(name: string, unitName: string): AssetID {
    return sendAssetCreation({
      configAssetName: name,
      configAssetUnitName: unitName,
      configAssetTotal: 1,
    });
  }

  transferNFT(asset: AssetID, receiver: Address): void {
    sendAssetTransfer({
      assetReceiver: receiver,
      assetAmount: 1,
      xferAsset: asset,
    });
  }
}

// eslint-disable-next-line no-unused-vars
class FactoryCaller extends Contract {
  mintAndGetAsset(): AssetID {
    sendMethodCall<typeof NFTFactory.prototype.createApplication>({
      clearStateProgram: NFTFactory.clearProgram(),
      approvalProgram: NFTFactory.approvalProgram(),
    });

    const factoryApp = this.itxn.createdApplicationID;

    sendPayment({
      amount: 200_000,
      receiver: factoryApp.address,
    });

    const createdAsset = sendMethodCall<typeof NFTFactory.prototype.createNFT>({
      applicationID: factoryApp,
      methodArgs: ['My NFT', 'MNFT'],
    });

    sendAssetTransfer({
      assetReceiver: this.app.address,
      assetAmount: 0,
      xferAsset: createdAsset,
    });

    sendMethodCall<typeof NFTFactory.prototype.transferNFT>({
      applicationID: factoryApp,
      methodArgs: [createdAsset, this.app.address],
    });

    return createdAsset;
  }
}
