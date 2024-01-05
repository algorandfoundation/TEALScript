/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';
import { TEAL } from './goldfile';

test.describe('Web', () => {
  test('TEAL', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/');

    const teal = page.locator('#teal');

    await teal.waitFor({ state: 'visible', timeout: 5000 });

    expect(await teal.innerHTML()).toBe(TEAL);
  });
});
