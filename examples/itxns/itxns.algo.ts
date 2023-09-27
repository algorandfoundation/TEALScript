import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class NFTFactory extends Contract {
  createNFT(name: string, unitName: string): Asset {
    return sendAssetCreation({
      configAssetName: name,
      configAssetUnitName: unitName,
      configAssetTotal: 1,
    });
  }

  transferNFT(asset: Asset, receiver: Account): void {
    sendAssetTransfer({
      assetReceiver: receiver,
      assetAmount: 1,
      xferAsset: asset,
    });
  }
}

// eslint-disable-next-line no-unused-vars
class FactoryCaller extends Contract {
  mintAndGetAsset(): Asset {
    sendMethodCall<[], void>({
      name: 'createApplication',
      clearStateProgram: this.app.clearStateProgram,
      approvalProgram: NFTFactory,
    });

    const factoryApp = this.itxn.createdApplicationID;

    sendPayment({
      amount: 200_000,
      receiver: factoryApp.address,
    });

    const createdAsset = sendMethodCall<[string, string], Asset>({
      applicationID: factoryApp,
      name: 'createNFT',
      methodArgs: ['My NFT', 'MNFT'],
    });

    sendAssetTransfer({
      assetReceiver: this.app.address,
      assetAmount: 0,
      xferAsset: createdAsset,
    });

    sendMethodCall<[Asset, Account], void>({
      applicationID: factoryApp,
      name: 'transferNFT',
      methodArgs: [createdAsset, this.app.address],
    });

    return createdAsset;
  }
}
