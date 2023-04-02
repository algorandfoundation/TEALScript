/* eslint-disable object-shorthand */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class NFTFactory extends Contract {
  @createApplication
  create(): void {}

  createNFT(name: string, unitName: string): Asset {
    return sendAssetCreation({
      configAssetName: name,
      configAssetUnitName: unitName,
      configAssetTotal: 1,
      configAssetDecimals: 0,
      fee: 0,
    });
  }

  transferNFT(asset: Asset, receiver: Account): void {
    sendAssetTransfer({
      assetReceiver: receiver,
      assetAmount: 1,
      xferAsset: asset,
      fee: 0,
    });
  }
}

// eslint-disable-next-line no-unused-vars
class FactoryCaller extends Contract {
  @createApplication
  create(): void {}

  mintAndGetAsset(): Asset {
    sendAppCall({
      onCompletion: 'NoOp',
      fee: 0,
      clearStateProgram: this.app.clearStateProgram,
      approvalProgram: NFTFactory,
    });

    const factoryApp = this.itxn.createdApplicationID;

    sendPayment({
      amount: 200_000,
      fee: 0,
      receiver: factoryApp.address,
    });

    const createdAsset = sendMethodCall<[string, string], Asset>({
      applicationID: factoryApp,
      name: 'createNFT',
      methodArgs: ['My NFT', 'MNFT'],
      onCompletion: 'NoOp',
      fee: 0,
    });

    sendAssetTransfer({
      assetReceiver: this.app.address,
      assetAmount: 0,
      xferAsset: createdAsset,
      fee: 0,
    });

    sendMethodCall<[Asset, Account], void>({
      applicationID: factoryApp,
      name: 'transferNFT',
      methodArgs: [createdAsset, this.app.address],
      fee: 0,
      onCompletion: 'NoOp',
    });

    return createdAsset;
  }
}
