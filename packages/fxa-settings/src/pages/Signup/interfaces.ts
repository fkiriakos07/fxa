/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../lib/error-utils';
import {
  BaseIntegration,
  IntegrationType,
  OAuthIntegration,
} from '../../models';
import { SignupQueryParams } from '../../models/pages/signup';
import { MetricsContext } from 'fxa-auth-client/browser';

export interface BeginSignupResponse {
  signUp: {
    uid: string;
    sessionToken: hexstring;
    authAt: number;
    // keyFetchToken and unwrapBKey are included if options.keys=true
    keyFetchToken?: hexstring;
  };
  unwrapBKey?: hexstring;
}

// full list @ fxa-auth-client/lib/client.ts, probably port over?
export interface BeginSignUpOptions {
  service?: string;
  verificationMethod?: string;
  keys?: boolean;
  atLeast18AtReg: true | null;
  metricsContext: MetricsContext;
}

export type BeginSignupHandler = (
  email: string,
  password: string,
  atLeast18AtReg: true | null
) => Promise<BeginSignupResult>;

export interface BeginSignupResult {
  data?: BeginSignupResponse;
  error?: HandledError;
}

export interface SignupProps {
  integration: SignupIntegration;
  queryParamModel: SignupQueryParams;
  beginSignupHandler: BeginSignupHandler;
  webChannelEngines: string[] | undefined;
}

export type SignupIntegration = SignupOAuthIntegration | SignupBaseIntegration;

export interface SignupOAuthIntegration {
  type: IntegrationType.OAuthWeb | IntegrationType.OAuthNative;
  isSync: () => ReturnType<OAuthIntegration['isSync']>;
  getRedirectUri: () => ReturnType<OAuthIntegration['getRedirectUri']>;
  saveOAuthState: () => ReturnType<OAuthIntegration['saveOAuthState']>;
  getService: () => ReturnType<OAuthIntegration['getService']>;
}

export interface SignupBaseIntegration {
  type: IntegrationType;
  isSync: () => ReturnType<BaseIntegration['isSync']>;
  getService: () => ReturnType<BaseIntegration['getService']>;
}

export interface SignupFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
  age: string;
}
