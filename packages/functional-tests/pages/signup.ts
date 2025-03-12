/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from './layout';
import { getReactFeatureFlagUrl } from '../lib/react-flag';

export class SignupPage extends BaseLayout {
  readonly path = 'signup';

  get emailFormHeading() {
    return this.page.getByRole('heading', {
      // Fluent inserts directional markers around "Mozilla account" so
      // just look for partial match
      name: /^Enter your email|^Continue to your/,
    });
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'Enter your email' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Sign up or sign in' });
  }

  get signupFormHeading() {
    return this.page.getByRole('heading', { name: 'Set your password' });
  }

  get passwordTextbox() {
    return this.page
      .getByLabel('Password', { exact: true }) // React
      .or(this.page.getByPlaceholder('Password', { exact: true })); // Backbone
  }

  get verifyPasswordTextbox() {
    return this.page
      .getByLabel('Repeat password', { exact: true }) // React
      .or(this.page.getByPlaceholder('Repeat password', { exact: true })); // Backbone
  }

  get ageTextbox() {
    return this.page
      .getByLabel('How old are you?') // React
      .or(this.page.getByPlaceholder('How old are you?')); // Backbone
  }

  get createAccountButton() {
    return this.page.getByRole('button', { name: 'Create account' });
  }

  get cannotCreateAccountHeading() {
    return this.page.getByRole('heading', { name: 'Cannot create account' });
  }

  get changeEmailLink() {
    return this.page.getByRole('link', { name: 'Change email' });
  }

  get CWTSEngineHeader() {
    return this.page.getByRole('heading', { name: 'Choose what to sync' });
  }

  get CWTSEngineBookmarks() {
    return this.page.getByLabel('Bookmarks', { exact: true });
  }

  get CWTSEngineHistory() {
    return this.page.getByLabel('History', { exact: true });
  }

  get CWTSEnginePasswords() {
    return this.page.getByLabel('Passwords', { exact: true });
  }

  get CWTSEngineAddons() {
    return this.page.getByLabel('Add-ons', { exact: true });
  }

  get CWTSEngineOpenTabs() {
    return this.page.getByLabel('Open Tabs', { exact: true });
  }

  get CWTSEnginePreferences() {
    return this.page.getByLabel('Preferences', { exact: true });
  }

  get CWTSEngineCreditCards() {
    return this.page.getByLabel('Payment Methods', { exact: true });
  }

  get CWTSEngineAddresses() {
    return this.page.getByLabel('Addresses', { exact: true });
  }

  get CWTSDoNotSync() {
    return this.page.getByLabel('Do not sync', { exact: true });
  }

  // for backwards compatibility with Backbone
  // not currently implemented in React, see FXA-8827
  get permissionsHeading() {
    return this.page.getByRole('heading', { name: /^Request for permission/ });
  }

  // for backwards compatibility with Backbone
  // not currently implemented in React, see FXA-8827
  get permissionsAcceptButton() {
    return this.page.getByRole('button', { name: 'Accept' });
  }

  goto(route = '/', params = new URLSearchParams()) {
    params.set('forceExperiment', 'generalizedReactApp');
    params.set('forceExperimentGroup', 'react');
    return this.page.goto(
      getReactFeatureFlagUrl(this.target, route, params.toString())
    );
  }

  async fillOutEmailForm(email: string) {
    await expect(this.emailFormHeading).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.submitButton.click();
  }

  async fillOutSignupForm(password: string, age: string) {
    await expect(this.signupFormHeading).toBeVisible();

    await this.passwordTextbox.fill(password);
    await this.verifyPasswordTextbox.fill(password);
    await this.ageTextbox.fill(age);
    await this.createAccountButton.click();
  }
}
