/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('react signin cached', () => {
    test('sign in twice, on second attempt email will be cached', async ({
      page,
      pages: { settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      await signin.clearSessionStorage();

      // Return to sign in without signing out
      await signin.goto();

      await expect(signin.cachedSigninHeading).toBeVisible();
      // email is prefilled and password is not required to sign in
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();

      // Verify successfully navigated to settings
      await expect(page).toHaveURL(/settings/);

      // Sign out
      await settings.signOut();
    });
  });
});
