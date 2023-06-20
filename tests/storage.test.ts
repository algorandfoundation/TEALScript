/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe, test, expect } from '@jest/globals';
import { getMethodTeal, artifactsTest } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/storage.algo.ts', 'StorageTest', methodName);
}

artifactsTest('StorageTest', 'tests/contracts/storage.algo.ts', 'tests/contracts/artifacts/', 'StorageTest');

const ops: {[type: string]: {[method: string]: string}} = {
  global: {
    Get: 'app_global_get',
    Put: 'app_global_put',
    Delete: 'app_global_del',
    Exists: 'app_global_get_ex',
  },
  local: {
    Get: 'app_local_get',
    Put: 'app_local_put',
    Delete: 'app_local_del',
    Exists: 'app_local_get_ex',
  },
  box: {
    Get: 'box_get',
    Put: 'box_put',
    Delete: 'box_del',
    Exists: 'box_get',
  },
};

['global', 'local', 'box'].forEach((storageType) => {
  ['Key', 'Map'].forEach((storageClass) => {
    describe(`${storageType}${storageClass}`, function () {
      ['Put', 'Get', 'Delete', 'Exists'].forEach((method) => {
        test(`${storageType}${storageClass}${method}`, async function () {
          const teal = await getTeal(`${storageType}${storageClass}${method}`);
          const expectedTeal: string[] = [];

          if (storageType === 'local') expectedTeal.push('frame_dig -1 // a: account');

          if (['local', 'global'].includes(storageType) && method === 'Exists') expectedTeal.push('txna Applications 0');

          expectedTeal.push('byte "foo"');

          if (method === 'Put') {
            expectedTeal.push('byte "bar"');
          }

          expectedTeal.push(ops[storageType][method]);

          if (method === 'Exists') {
            expectedTeal.push('swap');
            expectedTeal.push('pop');
          }

          if (method === 'Get') {
            if (storageType === 'box') expectedTeal.push('assert');
            expectedTeal.push('byte "bar"');
            expectedTeal.push('==');
            expectedTeal.push('assert');
          }

          expect(teal.slice(1)).toEqual(expectedTeal);
        });
      });
    });
  });
});
