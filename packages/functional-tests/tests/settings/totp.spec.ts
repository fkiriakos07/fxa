/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninPage } from '../../pages/signin';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test('add and remove totp', async ({
      target,
      pages: { page, settings, totp, signin, configPage },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.updated2faSetupFlow,
        'TODO in FXA-11935 - add test for new flow'
      );
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await addTotp(settings, totp);
      await settings.disconnectTotp();
      // Signin to verify no prompt for code
      await settings.signOut();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('totp use QR code', async ({
      target,
      pages: { page, settings, signin, totp, configPage },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.updated2faSetupFlow,
        'TODO in FXA-11935 - add test for new flow'
      );
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Disabled');

      await settings.totp.addButton.click();
      await totp.fillOutStep1FormQR();
      const recoveryCodes = await totp.fillOutStep2Form();
      await totp.fillOutStep3Form(recoveryCodes[0]);

      await page.waitForURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
    });

    test('add TOTP and sign in', async ({
      target,
      pages: { page, settings, signin, signinTotpCode, totp, configPage },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.updated2faSetupFlow,
        'TODO in FXA-11935 - add test for new flow'
      );
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      const { secret } = await addTotp(settings, totp);
      await settings.signOut();

      await signinWithTotp(
        credentials,
        secret,
        page,
        settings,
        signin,
        signinTotpCode
      );

      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
    });

    test('delete account with totp enabled', async ({
      target,
      pages: {
        page,
        deleteAccount,
        settings,
        signin,
        signinTotpCode,
        totp,
        configPage,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.updated2faSetupFlow,
        'TODO in FXA-11935 - add test for new flow'
      );
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      await settings.signOut();
      await signinWithTotp(
        credentials,
        secret,
        page,
        settings,
        signin,
        signinTotpCode
      );

      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
}

async function addTotp(
  settings: SettingsPage,
  totp: TotpPage
): Promise<TotpCredentials> {
  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.totp.status).toHaveText('Disabled');

  await settings.totp.addButton.click();
  const totpCredentials = await totp.fillOutTotpForms();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    'Two-step authentication has been enabled'
  );
  await expect(settings.totp.status).toHaveText('Enabled');

  return totpCredentials;
}

async function signinWithTotp(
  credentials: Credentials,
  secret: string,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  signinTotpCode: SigninTotpCodePage
): Promise<void> {
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await expect(page).toHaveURL(/signin_totp_code/);
  const code = await getCode(secret);
  await signinTotpCode.fillOutCodeForm(code);
  await expect(settings.settingsHeading).toBeVisible();
}
