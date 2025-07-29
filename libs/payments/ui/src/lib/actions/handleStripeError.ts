/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { StripeError } from '@stripe/stripe-js';
import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { stripeErrorToErrorReasonId } from '@fxa/payments/cart';
import { URLSearchParams } from 'url';

export const handleStripeErrorAction = async (
  cartId: string,
  stripeError: StripeError,
  searchParams?: Record<string, string | string[]>
) => {
  const errorReasonId = stripeErrorToErrorReasonId(stripeError);
  const urlSearchParams = new URLSearchParams(searchParams);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';

  await getApp().getActionsService().finalizeCartWithError({
    cartId,
    errorReasonId,
  });

  redirect(`error${params}`);
};
