import React, { useState } from 'react';
import { User, Users, Calendar, FileText, DollarSign, Clock, AlertTriangle, Settings, CheckCircle, Calculator } from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'in-progress' | 'review' | 'completed' | 'filed';
  lastUpdated: Date;
  taxYear: number;
  estimatedRefund: number;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: User },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tools', label: 'Tools', icon: Settings }
] as const;

export const TaxPreparerMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('dashboard');
  const [clients] = useState<Client[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      status: 'in-progress',
      lastUpdated: new Date('2025-02-15'),
      taxYear: 2025,
      estimatedRefund: 2500,
      priority: 'high',
      notes: 'Self-employed, needs Schedule C'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 987-6543',
      status: 'review',
      lastUpdated: new Date('2025-02-14'),
      taxYear: 2025,
      estimatedRefund: 1200,
      priority: 'medium',
      notes: 'First-time homebuyer credit'
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mbrown@email.com',
      phone: '(555) 456-7890',
      status: 'new',
      lastUpdated: new Date('2025-02-16'),
      taxYear: 2025,
      estimatedRefund: 0,
      priority: 'low',
      notes: 'Simple return, W-2 only'
    }
  ]);

  const [_selectedClient, setSelectedClient] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'review': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'filed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const dashboardStats = {
    totalClients: clients.length,
    newClients: clients.filter(c => c.status === 'new').length,
    inProgress: clients.filter(c => c.status === 'in-progress').length,
    completed: clients.filter(c => c.status === 'completed').length,
    totalRefunds: clients.reduce((sum, c) => sum + (c.estimatedRefund > 0 ? c.estimatedRefund : 0), 0),
    avgRefund: clients.filter(c => c.estimatedRefund > 0).reduce((sum, c, _, arr) =>
      sum + c.estimatedRefund / arr.length, 0
    )
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRefunds.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {clients.slice(0, 5).map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Updated {client.lastUpdated.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                  {client.status.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadlines & Reminders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Tax Filing Deadline</p>
                <p className="text-sm text-red-600">April 15, 2026 - 58 days remaining</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Q1 Estimated Taxes</p>
                <p className="text-sm text-yellow-600">April 15, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Business Returns (1120)</p>
                <p className="text-sm text-blue-600">March 15, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Client Management</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add New Client
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Refund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-sm text-gray-500">Tax Year {client.taxYear}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email}</div>
                  <div className="text-sm text-gray-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                    {client.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(client.priority)}`}>
                    {client.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${client.estimatedRefund.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.lastUpdated.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedClient(client.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Season Calendar</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Dates */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Key Dates 2026</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-800">Individual Returns Due</p>
                <p className="text-sm text-red-600">Form 1040</p>
              </div>
              <p className="text-red-800 font-bold">Apr 15</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">Corporate Returns Due</p>
                <p className="text-sm text-orange-600">Form 1120</p>
              </div>
              <p className="text-orange-800 font-bold">Mar 15</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Partnership Returns Due</p>
                <p className="text-sm text-blue-600">Form 1065</p>
              </div>
              <p className="text-blue-800 font-bold">Mar 15</p>
            </div>
          </div>
        </div>

        {/* Client Appointments */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Upcoming Appointments</h4>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">Tax review meeting</p>
                </div>
                <p className="text-sm text-gray-500">Today 2:00 PM</p>
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Document collection</p>
                </div>
                <p className="text-sm text-gray-500">Tomorrow 10:00 AM</p>
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Michael Brown</p>
                  <p className="text-sm text-gray-600">Initial consultation</p>
                </div>
                <p className="text-sm text-gray-500">Friday 3:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-6">
      {/* Professional Tools */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <FileText className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Form Generator</h4>
            <p className="text-sm text-gray-600">Generate IRS forms automatically</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <Calculator className="h-8 w-8 text-green-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Tax Calculator</h4>
            <p className="text-sm text-gray-600">Advanced tax calculation engine</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <Users className="h-8 w-8 text-purple-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Client Portal</h4>
            <p className="text-sm text-gray-600">Secure document sharing</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <DollarSign className="h-8 w-8 text-yellow-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Fee Calculator</h4>
            <p className="text-sm text-gray-600">Calculate service fees</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <Settings className="h-8 w-8 text-gray-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Settings</h4>
            <p className="text-sm text-gray-600">Configure preferences</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <Clock className="h-8 w-8 text-red-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Time Tracking</h4>
            <p className="text-sm text-gray-600">Track billable hours</p>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-900">PTIN Registration Current</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-900">Continuing Education Complete</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-gray-900">E&O Insurance Renewal Due</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-gray-900">IRS Power of Attorney Forms</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tax Preparer Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your tax preparation practice</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tax Season 2025</p>
                <p className="text-lg font-semibold text-gray-900">58 days remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'clients' && renderClients()}
          {activeTab === 'calendar' && renderCalendar()}
          {activeTab === 'tools' && renderTools()}
        </div>
      </div>
    </div>
  );
};
