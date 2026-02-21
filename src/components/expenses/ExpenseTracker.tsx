import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  Tag,
  Calendar,
  DollarSign,
  Search,
  Trash2,
  Receipt,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { logger } from '../../utils/logger';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  subcategory: string;
  receipt?: string;
  isDeductible: boolean;
  notes?: string;
  tags: string[];
  businessUse?: number; // Percentage for mixed-use expenses
}

interface ExpenseCategory {
  id: string;
  name: string;
  deductionType: 'business' | 'itemized' | 'adjustment' | 'credit';
  subcategories: string[];
  description: string;
  limits?: {
    percentage?: number;
    maxAmount?: number;
    incomeThreshold?: number;
  };
}

interface ExpenseTrackerProps {
  onExpenseUpdate: (expenses: Expense[]) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ onExpenseUpdate }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState<ExpenseCategory[]>([
    {
      id: 'medical',
      name: 'Medical & Health',
      deductionType: 'itemized',
      subcategories: [
        'Doctor Visits',
        'Prescriptions',
        'Health Insurance',
        'Dental',
        'Vision',
        'Medical Equipment',
      ],
      description: 'Medical expenses exceeding 7.5% of AGI',
      limits: { percentage: 7.5 },
    },
    {
      id: 'charitable',
      name: 'Charitable Donations',
      deductionType: 'itemized',
      subcategories: [
        'Cash Donations',
        'Non-Cash Donations',
        'Volunteer Expenses',
        'Religious Organizations',
      ],
      description: 'Donations to qualified organizations',
      limits: { percentage: 60 },
    },
    {
      id: 'taxes',
      name: 'State & Local Taxes',
      deductionType: 'itemized',
      subcategories: ['State Income Tax', 'Property Tax', 'Sales Tax', 'Personal Property Tax'],
      description: 'State and local tax deductions',
      limits: { maxAmount: 10000 },
    },
    {
      id: 'mortgage',
      name: 'Mortgage Interest',
      deductionType: 'itemized',
      subcategories: ['Primary Residence', 'Second Home', 'Points', 'PMI'],
      description: 'Mortgage interest on qualified residences',
    },
    {
      id: 'business',
      name: 'Business Expenses',
      deductionType: 'business',
      subcategories: [
        'Office Supplies',
        'Travel',
        'Meals',
        'Equipment',
        'Software',
        'Professional Services',
        'Marketing',
      ],
      description: 'Ordinary and necessary business expenses',
    },
    {
      id: 'education',
      name: 'Education',
      deductionType: 'credit',
      subcategories: ['Tuition', 'Books', 'Supplies', 'Student Loan Interest'],
      description: 'Education expenses and credits',
    },
    {
      id: 'retirement',
      name: 'Retirement Contributions',
      deductionType: 'adjustment',
      subcategories: ['Traditional IRA', 'SEP-IRA', 'SIMPLE IRA', '401(k)', 'HSA'],
      description: 'Pre-tax retirement contributions',
    },
  ]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    date: new Date(),
    category: categories[0],
    subcategory: '',
    isDeductible: true,
    notes: '',
    tags: [],
    businessUse: 100,
  });

  const [filter, setFilter] = useState({
    category: '',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
    deductibleOnly: false,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    // Load expenses from localStorage
    const savedExpenses = localStorage.getItem('tax_expenses');
    if (!savedExpenses) return;

    try {
      type StoredExpense = Omit<Expense, 'date'> & { date: string };

      const parsedExpenses = JSON.parse(savedExpenses) as StoredExpense[];
      const normalizedExpenses: Expense[] = parsedExpenses.map((exp) => ({
        ...exp,
        date: new Date(exp.date),
      }));

      setExpenses(normalizedExpenses);
    } catch (error) {
      logger.error('Failed to parse stored expenses', error instanceof Error ? error : undefined);
    }
  }, []);

  useEffect(() => {
    // Save expenses to localStorage
    localStorage.setItem('tax_expenses', JSON.stringify(expenses));
    onExpenseUpdate(expenses);
  }, [expenses, onExpenseUpdate]);

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      return;
    }

    const expense: Expense = {
      id: `exp_${Date.now()}`,
      description: newExpense.description,
      amount: newExpense.amount,
      date: newExpense.date || new Date(),
      category: newExpense.category,
      subcategory: newExpense.subcategory || '',
      isDeductible: newExpense.isDeductible ?? true,
      notes: newExpense.notes || '',
      tags: newExpense.tags || [],
      businessUse: newExpense.businessUse || 100,
    };

    setExpenses((prev) => [expense, ...prev]);
    setNewExpense({
      description: '',
      amount: 0,
      date: new Date(),
      category: categories[0],
      subcategory: '',
      isDeductible: true,
      notes: '',
      tags: [],
      businessUse: 100,
    });
    setShowAddForm(false);
  };

  const deleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filter.category && expense.category.id !== filter.category) return false;
    if (filter.deductibleOnly && !expense.isDeductible) return false;
    if (
      filter.searchTerm &&
      !expense.description.toLowerCase().includes(filter.searchTerm.toLowerCase())
    )
      return false;
    if (filter.minAmount && expense.amount < parseFloat(filter.minAmount)) return false;
    if (filter.maxAmount && expense.amount > parseFloat(filter.maxAmount)) return false;

    if (filter.dateRange !== 'all') {
      const now = new Date();
      const expenseDate = expense.date;

      switch (filter.dateRange) {
        case 'thisMonth':
          if (
            expenseDate.getMonth() !== now.getMonth() ||
            expenseDate.getFullYear() !== now.getFullYear()
          )
            return false;
          break;
        case 'thisYear':
          if (expenseDate.getFullYear() !== now.getFullYear()) return false;
          break;
        case 'lastYear':
          if (expenseDate.getFullYear() !== now.getFullYear() - 1) return false;
          break;
      }
    }

    return true;
  });

  const getTotalByCategory = () => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((expense) => {
      if (expense.isDeductible) {
        const categoryName = expense.category.name;
        totals[categoryName] = (totals[categoryName] || 0) + expense.amount;
      }
    });
    return totals;
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Category',
      'Subcategory',
      'Deductible',
      'Business Use %',
      'Notes',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map((exp) =>
        [
          exp.date.toLocaleDateString(),
          `"${exp.description}"`,
          exp.amount,
          exp.category.name,
          exp.subcategory,
          exp.isDeductible ? 'Yes' : 'No',
          exp.businessUse || 100,
          `"${exp.notes || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-expenses-${new Date().getFullYear()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Expense Tracker</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {filteredExpenses.length} expenses
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <PieChart className="h-4 w-4" />
            Analytics
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Expense Analytics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Total Deductible</div>
              <div className="text-xl font-bold text-green-600">
                $
                {filteredExpenses
                  .filter((e) => e.isDeductible)
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Total Tracked</div>
              <div className="text-xl font-bold text-blue-600">
                ${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Potential Savings</div>
              <div className="text-xl font-bold text-purple-600">
                $
                {(
                  filteredExpenses
                    .filter((e) => e.isDeductible)
                    .reduce((sum, e) => sum + e.amount, 0) * 0.22
                ).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Est. at 22% tax rate</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">By Category</h5>
            <div className="space-y-2">
              {Object.entries(getTotalByCategory()).map(([category, total]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">${total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter((prev) => ({ ...prev, dateRange: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={filter.searchTerm}
                onChange={(e) => setFilter((prev) => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search expenses..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.deductibleOnly}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, deductibleOnly: e.target.checked }))
                }
                className="rounded"
              />
              <span className="text-sm text-gray-700">Deductible only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No expenses found</p>
            <p className="text-sm">Add your first expense to get started</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{expense.description}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        expense.isDeductible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {expense.isDeductible ? 'Deductible' : 'Non-deductible'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {expense.category.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium text-lg text-gray-900">
                        ${expense.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {expense.date.toLocaleDateString()}
                    </div>
                    {expense.subcategory && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {expense.subcategory}
                      </div>
                    )}
                    {expense.businessUse && expense.businessUse < 100 && (
                      <div className="text-orange-600">{expense.businessUse}% business use</div>
                    )}
                  </div>

                  {expense.notes && <p className="text-sm text-gray-600 mt-2">{expense.notes}</p>}
                </div>

                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Add New Expense</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={newExpense.description || ''}
                    onChange={(e) =>
                      setNewExpense((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter expense description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount || ''}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newExpense.date?.toISOString().split('T')[0] || ''}
                    onChange={(e) =>
                      setNewExpense((prev) => ({ ...prev, date: new Date(e.target.value) }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newExpense.category?.id || ''}
                    onChange={(e) => {
                      const category = categories.find((cat) => cat.id === e.target.value);
                      setNewExpense((prev) => ({ ...prev, category, subcategory: '' }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={newExpense.subcategory || ''}
                    onChange={(e) =>
                      setNewExpense((prev) => ({ ...prev, subcategory: e.target.value }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={!newExpense.category}
                  >
                    <option value="">Select subcategory</option>
                    {newExpense.category?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {newExpense.category?.deductionType === 'business' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Use %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newExpense.businessUse || 100}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          businessUse: parseInt(e.target.value) || 100,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newExpense.notes || ''}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Additional notes or details"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newExpense.isDeductible ?? true}
                    onChange={(e) =>
                      setNewExpense((prev) => ({ ...prev, isDeductible: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <label className="text-sm text-gray-700">This expense is tax deductible</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addExpense}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
