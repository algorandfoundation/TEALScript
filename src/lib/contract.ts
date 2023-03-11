/* eslint-disable no-undef */
/// <reference path="../../types/global.d.ts" />

export default class Contract {
  itxn!: {
      createdApplicationID: Application
      createdAssetID: Asset
    };

  txn!: ThisTxnParams;

  txnGroup!: Transaction[];

  app!: Application;
}
