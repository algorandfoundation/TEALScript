# Big Box Example

This is an example contract that is designed to make uploading large amounts of data into box storage easy.

[big_box.algo.ts](./big_box.algo.ts) is the contract that is used to store the data. The process of uploading data is as follows:

1. Call the `startUpload` method with the following arguments and an atomic MBR payment for the boxes
   1. A unique identifier for the data
   2. The number of boxes the data will take up
   3. The size of the last box
2. Chunk the data into 32768-byte chunks
3. Chunk the 32kb chunks into smaller 1964-byte chunks
4. Start uploading the 1964-byte chunks via the `upload` method
5. Once all data is uploaded, call `setStatus` to signify the data is `READY` or `IMMUTABLE`

This is demonstrated in the test file [upload_client.test.ts](./upload_client.test.ts)

# Missing Features

Right now there is no way to resize data. This could be done by deleting existing boxes, reserving a new slice of boxes, and then uploading the new data. This could also include some sort of refund mechanism for the reduced box MBR.
