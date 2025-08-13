/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, Page } from '@playwright/test';
import { BaseLayout } from '../layout';

export abstract class SettingsLayout extends BaseLayout {
  get settingsHeading() {
    return this.page.getByRole('heading', { name: /^Settings/ });
  }

  get helpLink() {
    return this.page.getByRole('link', { name: 'Help' });
  }

  get bentoDropDownMenu() {
    return this.page.getByTestId('drop-down-bento-menu');
  }

  get bentoDropDownMenuToggle() {
    return this.page.getByTestId('drop-down-bento-menu-toggle');
  }

  get alertBar() {
    return this.page.getByRole('alert');
  }

  get alertBarDismissButton() {
    return this.page
      .getByRole('alert')
      .getByRole('button', { name: 'Close message' });
  }

  get avatarDropDownMenu() {
    return this.page.getByTestId('drop-down-avatar-menu');
  }

  get avatarDropDownMenuToggle() {
    return this.page.getByTestId('drop-down-avatar-menu-toggle');
  }

  get avatarDropDownMenuPhoto() {
    return this.page
      .getByTestId('drop-down-avatar-menu-toggle')
      .getByTestId('avatar-nondefault');
  }

  get avatarMenuSignOut() {
    return this.page.getByTestId('avatar-menu-sign-out');
  }

  get avatarIcon() {
    return this.page.getByTestId('avatar');
  }

  get recoveryKeyModalHeading() {
    return this.page.getByRole('heading', {
      name: 'Remove account recovery key?',
    });
  }

  get modalConfirmButton() {
    return this.page.getByTestId('modal-confirm');
  }

  goto(query?: string) {
    return super.goto('load', query);
  }

  clickModalConfirm() {
    return this.page.locator('[data-testid=modal-confirm]').click();
  }

  clickChangePassword() {
    return this.page.locator('[data-testid=password-unit-row-route]').click();
  }

  async clickHelp(): Promise<Page> {
    const pagePromise = this.page.context().waitForEvent('page');
    await this.helpLink.click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    return newPage;
  }

  async signOut() {
    await this.avatarDropDownMenuToggle.click();
    await this.avatarMenuSignOut.click();

    await expect(this.page).not.toHaveURL(/settings/);
  }
}
