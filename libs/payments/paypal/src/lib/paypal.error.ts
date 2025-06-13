/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError, BaseMultiError } from '@fxa/shared/error';
import { NVPErrorResponse } from './paypal.client.types';

/// PayPal error codes
/**
 * Error Codes representing an error that is temporary to PayPal
 * and should be retried again without changes.
 */
export const PAYPAL_RETRY_ERRORS = [10014, 10445, 11453, 11612];

/**
 * Errors Codes representing an error with the customers funding
 * source, such as the AVS, CVV2, funding, etc. not being valid.
 *
 * The customer should be prompted to login to PayPal and fix their
 * funding source.
 */
export const PAYPAL_SOURCE_ERRORS = [
  10069, 10203, 10204, 10205, 10207, 10210, 10212, 10216, 10417, 10502, 10504,
  10507, 10525, 10527, 10537, 10546, 10554, 10555, 10556, 10560, 10567, 10600,
  10601, 10606, 10606, 10748, 10752, 11084, 11091, 11458, 11611, 13109, 13122,
  15012, 18014,
];

/**
 * Error codes representing an error in how we called PayPal and/or
 * the arguments we passed them. These can only be fixed by fixing our
 * code.
 */
export const PAYPAL_APP_ERRORS = [
  10004, 10009, 10211, 10213, 10214, 10402, 10406, 10412, 10414, 10443, 10538,
  10539, 10613, 10747, 10755, 11302, 11452,
];

/**
 * Returned when the paypal billing agreement is no longer valid.
 */
export const PAYPAL_BILLING_AGREEMENT_INVALID = 10201;

/**
 * Returned with a transaction if the message sub id was seen before.
 */
export const PAYPAL_REPEAT_MESSAGE_SUB_ID = 11607;

/**
 * Returned with a transaction where the billing agreement was created
 * with a different business account.
 *
 * Should only occur when using multiple dev apps on the same Stripe account.
 */
export const PAYPAL_BILLING_TRANSACTION_WRONG_ACCOUNT = 11451;

export class PayPalClientError extends BaseMultiError {
  public raw: string;
  public data: NVPErrorResponse;

  constructor(errors: PayPalNVPError[], raw: string, data: NVPErrorResponse) {
    super(errors);
    this.raw = raw;
    this.data = data;
    this.name = 'PayPalClientError';
  }

  getPrimaryError(): PayPalNVPError {
    // TS is not picking up the type otherwise, so have to cast.
    return this.errors()[0] as PayPalNVPError;
  }

  static hasPayPalNVPError(err: Error | PayPalClientError): boolean {
    return (
      err instanceof PayPalClientError &&
      err.getPrimaryError() instanceof PayPalNVPError
    );
  }

  static throwPaypalCodeError(err: PayPalClientError) {
    const primaryError = err.getPrimaryError();
    const code = primaryError.errorCode;
    if (!code || PAYPAL_APP_ERRORS.includes(code)) {
      throw new UnexpectedPayPalErrorCode(code, err);
    }
    if (
      PAYPAL_SOURCE_ERRORS.includes(code) ||
      code === PAYPAL_BILLING_AGREEMENT_INVALID
    ) {
      throw new PayPalPaymentMethodError(code, err);
    }
    if (PAYPAL_RETRY_ERRORS.includes(code)) {
      throw new PayPalServiceUnavailableError(code, err);
    }
    throw new UnexpectedPayPalError(err);
  }
}

export class PayPalNVPError extends BaseError {
  public raw: string;
  public data: NVPErrorResponse;
  public errorCode: number;

  constructor(raw: string, data: NVPErrorResponse, params: any) {
    const { message, cause, errorCode } = params;
    super(message, {
      cause,
      info: {
        raw,
        data,
        errorCode,
      },
    });
    this.raw = raw;
    this.data = data;
    this.errorCode = errorCode;
    this.name = 'PayPalNVPError';
  }
}

/**
 * PayPalError is not intended for direct use, except for type-checking errors.
 * When throwing a new PayPalError, create a unique extension of the class.
 */
export class PayPalError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'PayPalError';
  }
}

export class PayPalActiveSubscriptionsMissingAgreementError extends PayPalError {
  constructor(uid: string) {
    super('PayPal customer has active subscriptions but no billing agreement', {
      uid,
    });
    this.name = 'PayPalActiveSubscriptionsMissingAgreementError';
  }
}

export class PaypalBillingAgreementMissingTokenError extends PayPalError {
  constructor(uid: string) {
    super(
      'Must pay using PayPal token if customer has no existing billing agreement',
      { uid }
    );
    this.name = 'PaypalBillingAgreementMissingTokenError';
  }
}

export class AmountExceedsPayPalCharLimitError extends PayPalError {
  constructor(amountInCents: number, currency: string) {
    super('Amount must be less than 10 characters', {
      amountInCents,
      currency,
    });
    this.name = 'AmountExceedsPayPalCharLimitError';
  }
}

export class UnexpectedPayPalError extends PayPalError {
  constructor(error: Error) {
    super('An unexpected PayPal error occured', {}, error);
    this.name = 'UnexpectedPayPalError';
  }
}

export class UnexpectedPayPalErrorCode extends PayPalError {
  constructor(code: number, error: Error) {
    super('Encountered an unexpected PayPal error code', { code }, error);
    this.name = 'UnexpectedPayPalErrorCode';
  }
}

export class PayPalPaymentMethodError extends PayPalError {
  constructor(code: number, error: Error) {
    super('PayPal payment method failed', { code }, error);
    this.name = 'PayPalPaymentMethodError';
  }
}

export class PayPalServiceUnavailableError extends PayPalError {
  constructor(code: number, error: Error) {
    super('PayPal service is temporarily unavailable', { code }, error);
    this.name = 'PayPalServiceUnavailableError';
  }
}
