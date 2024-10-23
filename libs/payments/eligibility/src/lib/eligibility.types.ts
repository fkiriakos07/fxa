/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum EligibilityStatus {
  CREATE = 'create',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  BLOCKED_IAP = 'blocked_iap',
  INVALID = 'invalid',
}

// Used to represent offering comparison to target price
export enum OfferingComparison {
  SAME = 'same',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
}

// Used to represent an interval comparison to another interval
export enum IntervalComparison {
  SAME = 'same',
  LONGER = 'longer',
  SHORTER = 'shorter',
}

export type OfferingOverlapResult = {
  comparison: OfferingComparison;
  priceId: string;
};

export type Interval = {
  unit: 'day' | 'week' | 'month' | 'year';
  count: number;
};
