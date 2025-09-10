import React from 'react';
import { FileText, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface IncomeFormProps {
  incomeData: any;
  k1Data: any;
  businessDetails: any;
  onIncomeChange: (field: string, value: string) => void;
  onK1Change: (field: string, value: string) => void;
  onBusinessDetailsChange: (field: string, value: string) => void;
  t: (key: string) => string;
  UncontrolledInput: React.ComponentType<any>;
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  incomeData,
  k1Data,
  businessDetails,
  onIncomeChange,
  onK1Change,
  onBusinessDetailsChange,
  t,
  UncontrolledInput
}) => {
  
  const calculateNetBusinessIncome = () => {
    return (Number(businessDetails.grossReceipts) || 0) - 
           (Number(businessDetails.costOfGoodsSold) || 0) - 
           (Number(businessDetails.businessExpenses) || 0);
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
          <UncontrolledInput
            field="wages"
            defaultValue={incomeData.wages}
            onChange={onIncomeChange}
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
          <UncontrolledInput
            field="interestIncome"
            defaultValue={incomeData.interestIncome}
            onChange={onIncomeChange}
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
          <UncontrolledInput
            field="dividends"
            defaultValue={incomeData.dividends}
            onChange={onIncomeChange}
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
          <UncontrolledInput
            field="capitalGains"
            defaultValue={incomeData.capitalGains}
            onChange={onIncomeChange}
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
          <UncontrolledInput
            field="businessIncome"
            defaultValue={incomeData.businessIncome}
            onChange={onIncomeChange}
            type="number"
            placeholder="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('income.otherIncome')}
          </label>
          <UncontrolledInput
            field="otherIncome"
            defaultValue={incomeData.otherIncome}
            onChange={onIncomeChange}
            type="number"
            placeholder="0"
            step="0.01"
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
            <UncontrolledInput
              field="ordinaryIncome"
              defaultValue={k1Data.ordinaryIncome}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.netRentalRealEstate')}
            </label>
            <UncontrolledInput
              field="netRentalRealEstate"
              defaultValue={k1Data.netRentalRealEstate}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.otherRentalIncome')}
            </label>
            <UncontrolledInput
              field="otherRentalIncome"
              defaultValue={k1Data.otherRentalIncome}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.guaranteedPayments')}
            </label>
            <UncontrolledInput
              field="guaranteedPayments"
              defaultValue={k1Data.guaranteedPayments}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.interestIncome')}
            </label>
            <UncontrolledInput
              field="k1InterestIncome"
              defaultValue={k1Data.k1InterestIncome}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.dividends')}
            </label>
            <UncontrolledInput
              field="k1Dividends"
              defaultValue={k1Data.k1Dividends}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.royalties')}
            </label>
            <UncontrolledInput
              field="royalties"
              defaultValue={k1Data.royalties}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.netShortTermCapitalGain')}
            </label>
            <UncontrolledInput
              field="netShortTermCapitalGain"
              defaultValue={k1Data.netShortTermCapitalGain}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.netLongTermCapitalGain')}
            </label>
            <UncontrolledInput
              field="netLongTermCapitalGain"
              defaultValue={k1Data.netLongTermCapitalGain}
              onChange={onK1Change}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.k1Section.otherPortfolioIncome')}
            </label>
            <UncontrolledInput
              field="otherPortfolioIncome"
              defaultValue={k1Data.otherPortfolioIncome}
              onChange={onK1Change}
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
            <UncontrolledInput
              field="grossReceipts"
              defaultValue={businessDetails.grossReceipts}
              onChange={onBusinessDetailsChange}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.businessDetails.costOfGoodsSold')}
            </label>
            <UncontrolledInput
              field="costOfGoodsSold"
              defaultValue={businessDetails.costOfGoodsSold}
              onChange={onBusinessDetailsChange}
              type="number"
              placeholder="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('income.businessDetails.businessExpenses')}
            </label>
            <UncontrolledInput
              field="businessExpenses"
              defaultValue={businessDetails.businessExpenses}
              onChange={onBusinessDetailsChange}
              type="number"
              placeholder="0"
              step="0.01"
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

export default IncomeForm;