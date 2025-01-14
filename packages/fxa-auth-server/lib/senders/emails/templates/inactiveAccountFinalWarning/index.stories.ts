/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/inactiveAccountFinalWarning',
} as Meta;

const createStory = storyWithProps(
  'inactiveAccountFinalWarning',
  'Final reminder sent to inactive account before account is deleted',
  {
    // dates will be passed in to the template already localized and formatted by the email handler
    deletionDate: 'Thursday, Jan 9, 2025',
    link: 'http://localhost:3030/signin',
  }
);

export const inactiveAccountFinalWarning = createStory();
