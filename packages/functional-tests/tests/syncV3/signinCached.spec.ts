/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SigninPage } from '../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test.describe('sync signin cached', () => {
    test('sign in on desktop then specify a different email on query parameter continues to cache desktop signin', async ({
      target,
      syncBrowserPages: { page, settings, signin, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        signin,
        testAccountTracker
      );
      const query = { email: credentials.email };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      //Check prefilled email
      await expect(signin.passwordFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/connect_another_device/);
      await connectAnotherDevice.clickNotNow();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Reset prefill and context
      await signin.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
      await signin.useDifferentAccountLink.click();
      await expect(signin.emailFirstHeading).toBeVisible();
    });

    test('sign in with desktop context then no context, desktop credentials should persist', async ({
      target,
      syncBrowserPages: { page, settings, signin },
      testAccountTracker,
    }) => {
      const syncCredentials = await signInSyncAccount(
        target,
        page,
        signin,
        testAccountTracker
      );
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
      await signin.useDifferentAccountLink.click();
      await expect(signin.emailFirstHeading).toBeVisible();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Reset prefill and context
      await signin.clearSessionStorage();

      //Testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await expect(page.getByText(syncCredentials.email)).toBeVisible();
      await signin.useDifferentAccountLink.click();
      await expect(signin.emailFirstHeading).toBeVisible();
    });
  });
});

async function signInSyncAccount(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpSync();
  await page.goto(
    `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
  );
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  //Verify sign up code header is visible
  await expect(page).toHaveURL(/signin_token_code/);
  return credentials;
}
