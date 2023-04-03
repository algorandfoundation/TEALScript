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
      configAssetName: 'name',
      configAssetUnitName: 'unit',
      configAssetTotal: 1,
      configAssetDecimals: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetDefaultFrozen: 0,
      configAssetURL: 'url',
      configAssetMetadataHash: 'hash',
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
      configAsset: Asset.zeroIndex,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
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
      assetAmount: 1,
      assetCloseTo: this.app.address,
      assetReceiver: this.app.address,
      assetSender: this.app.address,
      xferAsset: Asset.zeroIndex,
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
