import React from 'react';
import type { PersonalInfo } from '../../types/CommonTypes';

interface PaymentsFormProps {
  paymentsData: Record<string, string | number | undefined>;
  personalInfo: PersonalInfo;
  onChange: (field: string, value: string) => void;
  t: (key: string) => string;
  ValidatedInput: React.ComponentType<{
    field: string;
    value: string | number;
    onChange: (field: string, value: string) => void;
    section?: string;
    type?: string;
    placeholder?: string;
    [key: string]: unknown;
  }>;
}

const PaymentsForm: React.FC<PaymentsFormProps> = ({
  paymentsData,
  personalInfo,
  onChange,
  t,
  ValidatedInput,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payments.title')}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payments.federalWithholding')}
          </label>
          <ValidatedInput
            field="federalWithholding"
            value={String(paymentsData.federalWithholding || '')}
            onChange={onChange}
            section="payments"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('payments.descriptions.federalWithholding')}
          />
        </div>

        {personalInfo.isMaryland && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payments.stateWithholding')}
            </label>
            <ValidatedInput
              field="stateWithholding"
              value={String(paymentsData.stateWithholding || '')}
              onChange={onChange}
              section="payments"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
              help={t('payments.descriptions.stateWithholding')}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payments.estimatedTaxPayments')}
          </label>
          <ValidatedInput
            field="estimatedTaxPayments"
            value={String(paymentsData.estimatedTaxPayments || '')}
            onChange={onChange}
            section="payments"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('payments.descriptions.estimatedTaxPayments')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payments.priorYearOverpayment')}
          </label>
          <ValidatedInput
            field="priorYearOverpayment"
            value={String(paymentsData.priorYearOverpayment || '')}
            onChange={onChange}
            section="payments"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('payments.descriptions.priorYearOverpayment')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payments.otherPayments')}
          </label>
          <ValidatedInput
            field="otherPayments"
            value={String(paymentsData.otherPayments || '')}
            onChange={onChange}
            section="payments"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('payments.descriptions.otherPayments')}
          />
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(PaymentsForm);
