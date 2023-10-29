/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/// <reference path="../../types/global.d.ts" />

export default abstract class LogicSig {
  static address: () => bytes;

  static program: () => bytes;

  txn!: Txn;

  txnGroup!: Txn[];
}
