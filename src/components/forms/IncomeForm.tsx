import React from 'react';
import { FileText, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ValidatedInput } from '../ui/InputField';

interface IncomeFormProps {
  incomeData: Record<string, string | number | undefined>;
  k1Data: Record<string, string | number | undefined>;
  businessDetails: Record<string, string | number | undefined>;
  onIncomeChange: (field: string, value: string) => void;
  onK1Change: (field: string, value: string) => void;
  onBusinessDetailsChange: (field: string, value: string) => void;
  t: (key: string) => string;
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  incomeData,
  k1Data,
  businessDetails,
  onIncomeChange,
  onK1Change,
  onBusinessDetailsChange,
  t,
}) => {
  const calculateNetBusinessIncome = () => {
    return (
      (Number(businessDetails.grossReceipts) || 0) -
      (Number(businessDetails.costOfGoodsSold) || 0) -
      (Number(businessDetails.businessExpenses) || 0)
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('income.title')}</h3>

      {/* Basic Income Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.wages')}
          </label>
          <ValidatedInput
            field="wages"
            value={String(incomeData.wages || '')}
            onChange={onIncomeChange}
            section="income"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('income.help.wages')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.interestIncome')}
          </label>
          <ValidatedInput
            field="interestIncome"
            value={String(incomeData.interestIncome || '')}
            onChange={onIncomeChange}
            section="income"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('income.help.interestIncome')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.dividends')}
          </label>
          <ValidatedInput
            field="dividends"
            value={String(incomeData.dividends || '')}
            onChange={onIncomeChange}
            section="income"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            help={t('income.help.dividends')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.capitalGains')}
          </label>
          <ValidatedInput
            field="capitalGains"
            value={String(incomeData.capitalGains || '')}
            onChange={onIncomeChange}
            section="income"
            type="number"
            placeholder="0"
            step="0.01"
            help={t('income.help.capitalGains')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.businessIncome')}
          </label>
          <ValidatedInput
            field="businessIncome"
            value={String(incomeData.businessIncome || '')}
            onChange={onIncomeChange}
            section="income"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.otherIncome')}
          </label>
          <ValidatedInput
            field="otherIncome"
            value={String(incomeData.otherIncome || '')}
            onChange={onIncomeChange}
            section="income"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* K-1 Forms Section */}
      <div className="bg-blue-50 p-4 rounded-lg mt-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('income.k1Section.title')}
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.ordinaryIncome')}
            </label>
            <ValidatedInput
              field="ordinaryIncome"
              value={String(k1Data.ordinaryIncome || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.netRentalRealEstate')}
            </label>
            <ValidatedInput
              field="netRentalRealEstate"
              value={String(k1Data.netRentalRealEstate || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.otherRentalIncome')}
            </label>
            <ValidatedInput
              field="otherRentalIncome"
              value={String(k1Data.otherRentalIncome || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.guaranteedPayments')}
            </label>
            <ValidatedInput
              field="guaranteedPayments"
              value={String(k1Data.guaranteedPayments || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.interestIncome')}
            </label>
            <ValidatedInput
              field="k1InterestIncome"
              value={String(k1Data.k1InterestIncome || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.dividends')}
            </label>
            <ValidatedInput
              field="k1Dividends"
              value={String(k1Data.k1Dividends || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.royalties')}
            </label>
            <ValidatedInput
              field="royalties"
              value={String(k1Data.royalties || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.netShortTermCapitalGain')}
            </label>
            <ValidatedInput
              field="netShortTermCapitalGain"
              value={String(k1Data.netShortTermCapitalGain || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.netLongTermCapitalGain')}
            </label>
            <ValidatedInput
              field="netLongTermCapitalGain"
              value={String(k1Data.netLongTermCapitalGain || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.otherPortfolioIncome')}
            </label>
            <ValidatedInput
              field="otherPortfolioIncome"
              value={String(k1Data.otherPortfolioIncome || '')}
              onChange={onK1Change}
              section="k1"
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Detailed Business Income Section */}
      <div className="bg-green-50 p-4 rounded-lg mt-6">
        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('income.businessDetails.title')}
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.businessDetails.grossReceipts')}
            </label>
            <ValidatedInput
              field="grossReceipts"
              value={String(businessDetails.grossReceipts || '')}
              onChange={onBusinessDetailsChange}
              section="businessDetails"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.businessDetails.costOfGoodsSold')}
            </label>
            <ValidatedInput
              field="costOfGoodsSold"
              value={String(businessDetails.costOfGoodsSold || '')}
              onChange={onBusinessDetailsChange}
              section="businessDetails"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.businessDetails.businessExpenses')}
            </label>
            <ValidatedInput
              field="businessExpenses"
              value={String(businessDetails.businessExpenses || '')}
              onChange={onBusinessDetailsChange}
              section="businessDetails"
              type="number"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div className="bg-white p-3 rounded border-2 border-green-300">
            <label className="block text-sm font-medium text-green-800 mb-1">
              {t('income.businessDetails.netBusinessIncome')}
            </label>
            <div className="text-lg font-bold text-green-700">
              {formatCurrency(calculateNetBusinessIncome())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(IncomeForm);
