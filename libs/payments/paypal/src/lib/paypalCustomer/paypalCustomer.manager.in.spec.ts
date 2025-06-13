/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Kysely } from 'kysely';

import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';

import { CreatePaypalCustomerFactory } from './paypalCustomer.factories';
import { PaypalCustomerManager } from './paypalCustomer.manager';
import {
  PaypalCustomerNotCreatedError,
  PaypalCustomerNotFoundError,
  PaypalCustomerNotUpdatedError,
  PaypalCustomerDeletionFailedError,
} from './paypalCustomer.error';

describe('PaypalCustomerManager', () => {
  let kyselyDb: Kysely<DB>;
  let paypalCustomerManager: PaypalCustomerManager;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup(['paypalCustomers']);

    paypalCustomerManager = new PaypalCustomerManager(kyselyDb);
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createPaypalCustomer', () => {
    it('creates a paypalCustomer successfully', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      const result = await paypalCustomerManager.createPaypalCustomer(
        paypalCustomer
      );

      expect(result).toEqual({
        ...paypalCustomer,
        createdAt: expect.anything(),
      });
    });

    it('throws a PaypalCustomerNotCreatedError when the DB throws', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory({
        billingAgreementId: 'NOT VALID LONG STRING TO CAUSE ERROR',
      });

      await expect(
        paypalCustomerManager.createPaypalCustomer(paypalCustomer)
      ).rejects.toBeInstanceOf(PaypalCustomerNotCreatedError);
    });
  });

  describe('fetchPaypalCustomer', () => {
    it('fetches an existing paypalCustomer successfully', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      await paypalCustomerManager.createPaypalCustomer(paypalCustomer);
      const result = await paypalCustomerManager.fetchPaypalCustomer(
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId
      );

      expect(result).toEqual({
        ...paypalCustomer,
        createdAt: expect.anything(),
      });
    });

    it('throws a PaypalCustomerNotFoundError when paypalCustomer does not exist', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      await expect(
        paypalCustomerManager.fetchPaypalCustomer(
          paypalCustomer.uid,
          paypalCustomer.billingAgreementId
        )
      ).rejects.toBeInstanceOf(PaypalCustomerNotFoundError);
    });
  });

  describe('fetchPaypalCustomerByUid', () => {
    it('fetches an existing paypalCustomer successfully', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      await paypalCustomerManager.createPaypalCustomer(paypalCustomer);
      const result = await paypalCustomerManager.fetchPaypalCustomersByUid(
        paypalCustomer.uid
      );

      expect(result).toEqual([
        {
          ...paypalCustomer,
          createdAt: expect.anything(),
        },
      ]);
    });

    it('returns empty set when no matching paypalCustomers are found', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      const result = await paypalCustomerManager.fetchPaypalCustomersByUid(
        paypalCustomer.uid
      );
      expect(result).toEqual([]);
    });
  });

  describe('fetchPaypalCustomerByBillingAgreementId', () => {
    it('fetches an existing paypalCustomer successfully', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      await paypalCustomerManager.createPaypalCustomer(paypalCustomer);
      const result =
        await paypalCustomerManager.fetchPaypalCustomersByBillingAgreementId(
          paypalCustomer.billingAgreementId
        );

      expect(result).toEqual([
        {
          ...paypalCustomer,
          createdAt: expect.anything(),
        },
      ]);
    });

    it('returns empty set when no matching paypalCustomers are found', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      const result =
        await paypalCustomerManager.fetchPaypalCustomersByBillingAgreementId(
          paypalCustomer.billingAgreementId
        );
      expect(result).toEqual([]);
    });
  });

  describe('updatePaypalCustomer', () => {
    it('updates an existing paypalCustomer successfully', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      await paypalCustomerManager.createPaypalCustomer(paypalCustomer);
      const updatedPaypalCustomer = {
        ...paypalCustomer,
        billingAgreementId: 'newval',
      };
      const result = await paypalCustomerManager.updatePaypalCustomer(
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId,
        updatedPaypalCustomer
      );

      expect(result).toEqual(true);
    });

    it('throws a PaypalCustomerNotUpdatedError when paypalCustomer does not exist', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      await paypalCustomerManager.createPaypalCustomer(paypalCustomer);

      const updatedPaypalCustomer = {
        ...paypalCustomer,
        billingAgreementId: 'NOT VALID LONG STRING TO CAUSE ERROR',
      };

      await expect(
        paypalCustomerManager.updatePaypalCustomer(
          paypalCustomer.uid,
          paypalCustomer.billingAgreementId,
          updatedPaypalCustomer
        )
      ).rejects.toBeInstanceOf(PaypalCustomerNotUpdatedError);
    });
  });

  describe('deletePaypalCustomer', () => {
    it('deletes an existing paypalCustomer successfully', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      const resultPaypalCustomer =
        await paypalCustomerManager.createPaypalCustomer(paypalCustomer);

      const result = await paypalCustomerManager.deletePaypalCustomer(
        resultPaypalCustomer
      );

      expect(result).toEqual(true);
    });

    it('throws a PaypalCustomerDeletionFailedError when paypalCustomer does not exist', async () => {
      const paypalCustomer = CreatePaypalCustomerFactory();

      const resultPaypalCustomer =
        await paypalCustomerManager.createPaypalCustomer(paypalCustomer);

      await paypalCustomerManager.deletePaypalCustomer(resultPaypalCustomer);

      // Customer is already deleted, this should now throw
      await expect(
        paypalCustomerManager.deletePaypalCustomer(resultPaypalCustomer)
      ).rejects.toBeInstanceOf(PaypalCustomerDeletionFailedError);
    });
  });

  describe('deletePaypalCustomersByUid', () => {
    it('deletes existing paypalCustomers successfully', async () => {
      const paypalCustomer1 = CreatePaypalCustomerFactory();
      const paypalCustomer2 = CreatePaypalCustomerFactory({
        uid: paypalCustomer1.uid,
      });

      await paypalCustomerManager.createPaypalCustomer(paypalCustomer1);
      await paypalCustomerManager.createPaypalCustomer(paypalCustomer2);

      const result = await paypalCustomerManager.deletePaypalCustomersByUid(
        paypalCustomer1.uid
      );

      expect(result).toEqual(BigInt(2));
    });
  });
});
