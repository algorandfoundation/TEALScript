/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class ItxnsTest extends Contract {
  payment(): void {
    sendPayment(
      {
        amount: 100,
        receiver: this.app.address,
        closeRemainderTo: globals.zeroAddress,
        fee: 0,
        sender: this.app.address,
        rekeyTo: globals.zeroAddress,
        note: 'Hello World!',
      },
    );
  }

  assetCreation(): Asset {
    return sendAssetCreation({
      fee: 0,
      name: 'name',
      unitName: 'unit',
      total: 1,
      decimals: 0,
      manager: this.app.address,
      reserve: this.app.address,
      freeze: this.app.address,
      clawback: this.app.address,
      defaultFrozen: 0,
      url: 'url',
      metadataHash: 'hash',
    });
  }

  appCall(): void {
    sendAppCall({
      accounts: [this.app.address],
      applicationArgs: ['arg1', 'arg2'],
      applicationID: this.app,
      applications: [this.app],
      approvalProgram: 'approval',
      assets: [Asset.zeroIndex],
      clearStateProgram: 'clear',
      fee: 0,
      globalNumByteSlice: 1,
      globalNumUint: 1,
      localNumByteSlice: 1,
      localNumUint: 1,
      note: 'note',
      onCompletion: 'NoOp',
    });
  }

  assetConfig(): void {
    sendAssetConfig({
      asset: Asset.zeroIndex,
      manager: this.app.address,
      reserve: this.app.address,
      freeze: this.app.address,
      clawback: this.app.address,
      fee: 0,
    });
  }

  assetFreeze(): void {
    sendAssetFreeze({
      freezeAssetFrozen: 1,
      freezeAssetAccount: this.app.address,
      freezeAsset: Asset.zeroIndex,
      fee: 0,
    });
  }

  assetTransfer(): void {
    sendAssetTransfer({
      amount: 1,
      closeTo: this.app.address,
      receiver: this.app.address,
      assetSender: this.app.address,
      asset: Asset.zeroIndex,
      fee: 0,
    });
  }

  methodCall(): Asset {
    return sendMethodCall<[Application, Asset], Asset>({
      name: 'method',
      methodArgs: [this.app, Asset.zeroIndex],
      onCompletion: 'NoOp',
      fee: 0,
    });
  }

  onlineKeyRegistration(): void {
    sendOnlineKeyRegistration({
      selectionPK: 'pk',
      stateProofPK: 'pk',
      voteFirst: 1,
      voteKeyDilution: 1,
      voteLast: 1,
      votePK: 'pk',
      fee: 0,
    });
  }

  offlineKeyRegistration(): void {
    sendOfflineKeyRegistration({
      fee: 0,
    });
  }
}
