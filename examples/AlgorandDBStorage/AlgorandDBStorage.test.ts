/* eslint-disable no-plusplus */
import * as algokit from "@algorandfoundation/algokit-utils";
import { describe, test, expect, beforeAll } from "@jest/globals";
import algosdk from "algosdk";
import { algodClient, kmdClient } from "../../tests/common";
import { AlgorandDbStorageClient } from "./AlgorandDBStorageClient";
import { fail } from "assert";

describe("AlgorandDBStorage", () => {
  let appClient: AlgorandDbStorageClient;
  let sender: algosdk.Account;
  let appID: number;
  beforeAll(async () => {
    sender = await algokit.getDispenserAccount(algodClient, kmdClient);

    const suggestedParams = await algodClient.getTransactionParams().do();

    await algokit.ensureFunded(
      {
        accountToFund: sender,
        minSpendingBalance: algokit.microAlgos(10_000_000),
        suppressLog: true,
      },
      algodClient,
      kmdClient
    );
    appClient = new AlgorandDbStorageClient(
      {
        resolveBy: "id",
        id: 0,
        sender,
      },
      algodClient
    );
    const { appAddress, appId } = await appClient.appClient.create({
      sendParams: { suppressLog: true },
    });

    await algokit.ensureFunded(
      {
        accountToFund: appAddress,
        minSpendingBalance: algokit.microAlgos(10_000_000),
        suppressLog: true,
      },
      algodClient,
      kmdClient
    );
    appID = appId as number;
  });

  test("test add", async () => {
    const dataName = new Uint8Array(Buffer.from("1"));
    const dataValue = new Uint8Array(Buffer.from("11"));
    const dataValueErr = new Uint8Array(Buffer.from("111"));

    const funded = await algokit.ensureFunded(
      {
        accountToFund: sender.addr,
        minSpendingBalance: algokit.microAlgos(10_000_000),
        suppressLog: true,
      },
      algodClient,
      kmdClient
    );
    console.log("funded", sender.addr, funded);

    const addResult = await appClient.add(
      { key: "1", value: dataValue },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    console.log("addResult.transaction", addResult.transaction.txID());
    let res = await appClient.appClient.getBoxValue("1");
    expect(Buffer.from(res).toString("ascii")).toBe("11");

    try {
      const addResult2 = await appClient.add(
        { key: "1", value: dataValueErr },
        {
          boxes: [dataName],
          sender: sender,
        }
      );
    } catch (err: any) {
      console.log("Error on purpose", err.toString());
    }
    res = await appClient.appClient.getBoxValue("1");
    expect(Buffer.from(res).toString("ascii")).toBe("11");
  });
  test("test update", async () => {
    const dataNameStr = "2";
    const dataName = new Uint8Array(Buffer.from(dataNameStr));
    const dataValue = new Uint8Array(Buffer.from("22"));
    const dataValue2 = new Uint8Array(Buffer.from("222"));

    const funded = await algokit.ensureFunded(
      {
        accountToFund: sender.addr,
        minSpendingBalance: algokit.microAlgos(10_000_000),
        suppressLog: true,
      },
      algodClient,
      kmdClient
    );
    console.log("funded", sender.addr, funded);

    const addResult = await appClient.add(
      { key: dataNameStr, value: dataValue },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    console.log("addResult.transaction", addResult.transaction.txID());
    let res = await appClient.appClient.getBoxValue(dataNameStr);
    expect(Buffer.from(res).toString("ascii")).toBe("22");

    await appClient.update(
      { key: dataNameStr, value: dataValue2 },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    res = await appClient.appClient.getBoxValue(dataNameStr);
    expect(Buffer.from(res).toString("ascii")).toBe("222");
  });
  test("test upsert", async () => {
    const dataNameStr = "3";
    const dataName = new Uint8Array(Buffer.from(dataNameStr));
    const dataValue = new Uint8Array(Buffer.from("33"));
    const dataValue2 = new Uint8Array(Buffer.from("333"));

    const funded = await algokit.ensureFunded(
      {
        accountToFund: sender.addr,
        minSpendingBalance: algokit.microAlgos(10_000_000),
        suppressLog: true,
      },
      algodClient,
      kmdClient
    );
    console.log("funded", sender.addr, funded);

    const addResult = await appClient.upsert(
      { key: dataNameStr, value: dataValue },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    console.log("addResult.transaction", addResult.transaction.txID());
    let res = await appClient.appClient.getBoxValue(dataNameStr);
    expect(Buffer.from(res).toString("ascii")).toBe("33");

    await appClient.upsert(
      { key: dataNameStr, value: dataValue2 },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    res = await appClient.appClient.getBoxValue(dataNameStr);
    expect(Buffer.from(res).toString("ascii")).toBe("333");
  });
  test("test delete", async () => {
    const dataNameStr = "4";
    const dataName = new Uint8Array(Buffer.from(dataNameStr));
    const dataValue = new Uint8Array(Buffer.from("44"));

    const funded = await algokit.ensureFunded(
      {
        accountToFund: sender.addr,
        minSpendingBalance: algokit.microAlgos(10_000_000),
        suppressLog: true,
      },
      algodClient,
      kmdClient
    );
    console.log("funded", sender.addr, funded);

    const addResult = await appClient.upsert(
      { key: dataNameStr, value: dataValue },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    console.log("addResult.transaction", addResult.transaction.txID());
    let res = await appClient.appClient.getBoxValue(dataNameStr);
    expect(Buffer.from(res).toString("ascii")).toBe("44");

    await appClient.delete(
      { key: dataNameStr },
      {
        boxes: [dataName],
        sender: sender,
      }
    );
    try {
      res = await appClient.appClient.getBoxValue(dataNameStr);
      fail(`${dataNameStr} should not exist`);
    } catch (err: any) {
      console.log("Expected err", err.toString());
    }
  });
});
