---
title: "6. Writing a Test"
---

Now we need to go `__test__/hello_world.test.ts` and modify our test to properly call our contract.

We can do so by removing `test("sum")` and `test("difference")` and write our own test:

```ts
  test("helloWorld", async () => {
    const message = await appClient.hello({ name: "AlgoDev" });
    expect(message.return?.valueOf()).toBe("Hello, AlgoDev");
  });
```

The important thing here is that `await appClient.doMath` was changed to `await appClient.hello` and the argument was changed to `{ name: "AlgoDev" }`. Finally, we changed the test to expect `"Hello, AlgoDev"` since the argument we passed in was `"AlgoDev"`.


## Running The Test

To run the test, run the script `npm run test`, which should show all tests passing:

```bash
 PASS  __test__/hello_world.test.ts
  HelloWorld
    ✓ helloWorld (766 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```