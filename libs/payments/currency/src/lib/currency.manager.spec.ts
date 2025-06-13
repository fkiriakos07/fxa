/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { CurrencyManager } from './currency.manager';
import {
  CurrencyCodeInvalidError,
  CountryCodeInvalidError,
  CurrencyCountryMismatchError,
  CurrencyCodeMissingError,
  CountryCodeMissingError,
} from './currency.error';
import { CURRENCIES_TO_COUNTRIES } from './currency.constants';
import { CurrencyConfig, MockCurrencyConfigProvider } from './currency.config';

describe('CurrencyManager', () => {
  let currencyManager: CurrencyManager;
  let mockCurrencyConfig: CurrencyConfig;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockCurrencyConfigProvider, CurrencyManager],
    }).compile();

    currencyManager = module.get(CurrencyManager);
    mockCurrencyConfig = module.get(CurrencyConfig);
  });

  describe('assertCurrencyCompatibleWithCountry', () => {
    const validCountry = faker.helpers.arrayElement(
      CURRENCIES_TO_COUNTRIES.USD
    );
    const validCurrency = 'USD';

    it('asserts when currency to country is valid', () => {
      currencyManager.assertCurrencyCompatibleWithCountry(
        validCurrency,
        validCountry
      );
    });

    it('throws an error when currency is empty', () => {
      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry('', validCountry)
      ).toThrow(CurrencyCodeMissingError);
    });

    it('throws an error when currency is invalid', () => {
      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry('KPW', validCountry)
      ).toThrow(CurrencyCodeInvalidError);
    });

    it('throws an error when country is missing', () => {
      const countryCode = '';

      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry(
          validCurrency,
          countryCode
        )
      ).toThrow(CountryCodeMissingError);
    });

    it('throws an error when country is invalid', () => {
      const countryCode = faker.location.countryCode('alpha-3');

      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry(
          validCurrency,
          countryCode
        )
      ).toThrow(CountryCodeInvalidError);
    });

    it('throws an error when currency to country do not match', () => {
      const currencyCode = 'EUR';

      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry(
          currencyCode,
          validCountry
        )
      ).toThrow(CurrencyCountryMismatchError);
    });
  });

  describe('getTaxId', () => {
    it('returns the correct tax id for currency', async () => {
      const mockCurrency = Object.entries(mockCurrencyConfig.taxIds)[0];

      const result = currencyManager.getTaxId(mockCurrency[0]);
      expect(result).toEqual(mockCurrency[1]);
    });

    it('returns empty string when no  tax id found', async () => {
      const result = currencyManager.getTaxId('DOES NOT EXIST');
      expect(result).toEqual(undefined);
    });
  });
});
