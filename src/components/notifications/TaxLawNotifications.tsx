import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Calendar, Info, CheckCircle, X, ExternalLink } from 'lucide-react';

interface TaxNotification {
  id: string;
  title: string;
  description: string;
  type: 'deadline' | 'law_change' | 'tip' | 'alert' | 'update';
  priority: 'high' | 'medium' | 'low';
  date: Date;
  expiryDate?: Date;
  actionRequired: boolean;
  category: 'federal' | 'state' | 'forms' | 'deductions' | 'credits';
  affectedStates?: string[];
  relevantForms?: string[];
  learnMoreUrl?: string;
  dismissed?: boolean;
}

interface TaxLawNotificationsProps {
  selectedState?: string;
  filingStatus?: string;
  t: (key: string) => string;
}

export const TaxLawNotifications: React.FC<TaxLawNotificationsProps> = ({
  selectedState = '',
  filingStatus = '',
  t
}) => {
  const [notifications, setNotifications] = useState<TaxNotification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Generate relevant notifications based on current date and user's situation
    const currentNotifications = generateNotifications(selectedState, filingStatus);
    setNotifications(currentNotifications);
  }, [selectedState, filingStatus]);

  const generateNotifications = (state: string, filing: string): TaxNotification[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const baseNotifications: TaxNotification[] = [
      {
        id: 'filing-deadline-2025',
        title: '2025 Tax Filing Deadline Approaching',
        description: 'Federal tax returns for 2025 are due by April 15, 2026. Start gathering your documents now.',
        type: 'deadline',
        priority: 'high',
        date: new Date(currentYear + 1, 3, 15), // April 15, next year
        actionRequired: true,
        category: 'federal',
        relevantForms: ['1040', 'Schedule A', 'Schedule C'],
        learnMoreUrl: 'https://www.irs.gov/filing'
      },
      {
        id: 'standard-deduction-2025',
        title: '2025 Standard Deduction Amounts Updated',
        description: 'The IRS has announced new standard deduction amounts for 2025. Single filers: $15,000, Married filing jointly: $30,000.',
        type: 'law_change',
        priority: 'medium',
        date: new Date(currentYear, 10, 15), // November 15
        actionRequired: false,
        category: 'deductions'
      },
      {
        id: 'retirement-contribution-limits',
        title: '2025 Retirement Contribution Limits Increased',
        description: '401(k) contribution limit increased to $23,500 for 2025. Catch-up contributions for 50+ increased to $7,500.',
        type: 'update',
        priority: 'medium',
        date: new Date(currentYear, 10, 1), // November 1
        actionRequired: false,
        category: 'credits',
        learnMoreUrl: 'https://www.irs.gov/retirement-plans'
      },
      {
        id: 'quarterly-payments-q4',
        title: 'Q4 2025 Estimated Tax Payment Due',
        description: 'Fourth quarter estimated tax payments are due by January 15, 2026.',
        type: 'deadline',
        priority: 'high',
        date: new Date(currentYear + 1, 0, 15), // January 15, next year
        actionRequired: true,
        category: 'federal'
      },
      {
        id: 'tax-software-update',
        title: 'Enhanced State Tax Calculator Available',
        description: 'Our calculator now supports all 50 states with real-time tax calculations and detailed breakdowns.',
        type: 'tip',
        priority: 'low',
        date: new Date(),
        actionRequired: false,
        category: 'forms'
      }
    ];

    // Add state-specific notifications
    if (state) {
      const stateNotifications = getStateSpecificNotifications(state, currentYear);
      baseNotifications.push(...stateNotifications);
    }

    // Add filing status specific notifications
    if (filing === 'marriedJointly') {
      baseNotifications.push({
        id: 'married-filing-jointly-tip',
        title: 'Married Filing Jointly Benefits',
        description: 'You may be eligible for additional tax credits and higher income thresholds. Consider the Child Tax Credit and Earned Income Credit.',
        type: 'tip',
        priority: 'medium',
        date: new Date(),
        actionRequired: false,
        category: 'credits'
      });
    }

    // Filter out dismissed notifications and sort by priority/date
    return baseNotifications
      .filter(n => !n.dismissed)
      .filter(n => !n.expiryDate || n.expiryDate > currentDate)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        if (aPriority !== bPriority) return bPriority - aPriority;
        return b.date.getTime() - a.date.getTime();
      });
  };

  const getStateSpecificNotifications = (state: string, year: number): TaxNotification[] => {
    const stateNotifications: Record<string, TaxNotification[]> = {
      'CA': [
        {
          id: 'ca-state-deadline',
          title: 'California State Tax Deadline',
          description: 'California state tax returns are also due by April 15, 2026. Don\'t forget to file your CA state return.',
          type: 'deadline',
          priority: 'high',
          date: new Date(year + 1, 3, 15),
          actionRequired: true,
          category: 'state',
          affectedStates: ['CA']
        }
      ],
      'NY': [
        {
          id: 'ny-state-changes',
          title: 'New York Tax Law Changes',
          description: 'New York has updated its tax brackets for 2025. Review the new rates to ensure accurate calculations.',
          type: 'law_change',
          priority: 'medium',
          date: new Date(year, 11, 1),
          actionRequired: false,
          category: 'state',
          affectedStates: ['NY']
        }
      ],
      'FL': [
        {
          id: 'fl-no-income-tax',
          title: 'Florida - No State Income Tax',
          description: 'Great news! Florida has no state income tax. You only need to file federal returns.',
          type: 'tip',
          priority: 'low',
          date: new Date(),
          actionRequired: false,
          category: 'state',
          affectedStates: ['FL']
        }
      ],
      'TX': [
        {
          id: 'tx-no-income-tax',
          title: 'Texas - No State Income Tax',
          description: 'Texas has no state income tax. Focus on optimizing your federal tax situation.',
          type: 'tip',
          priority: 'low',
          date: new Date(),
          actionRequired: false,
          category: 'state',
          affectedStates: ['TX']
        }
      ]
    };

    return stateNotifications[state] || [];
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Calendar className="h-4 w-4" />;
      case 'law_change': return <AlertCircle className="h-4 w-4" />;
      case 'tip': return <Info className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'update': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return type === 'deadline' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50';
    }
    if (priority === 'medium') {
      return 'border-yellow-500 bg-yellow-50';
    }
    return 'border-blue-500 bg-blue-50';
  };

  const getNotificationTextColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return type === 'deadline' ? 'text-red-700' : 'text-orange-700';
    }
    if (priority === 'medium') {
      return 'text-yellow-700';
    }
    return 'text-blue-700';
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, dismissed: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return !n.dismissed;
    return n.type === filter && !n.dismissed;
  });

  const displayNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tax Law Updates & Deadlines</h3>
          {notifications.filter(n => !n.dismissed).length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications.filter(n => !n.dismissed && n.priority === 'high').length}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'deadline', label: 'Deadlines' },
          { key: 'law_change', label: 'Law Changes' },
          { key: 'tip', label: 'Tips' },
          { key: 'update', label: 'Updates' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === filterOption.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No notifications at this time</p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-lg p-4 ${getNotificationColor(notification.type, notification.priority)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <div className={`mt-1 ${getNotificationTextColor(notification.type, notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${getNotificationTextColor(notification.type, notification.priority)}`}>
                        {notification.title}
                      </h4>
                      {notification.actionRequired && (
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${getNotificationTextColor(notification.type, notification.priority)} opacity-90`}>
                      {notification.description}
                    </p>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                      {notification.relevantForms && (
                        <span className="text-gray-600">
                          Forms: {notification.relevantForms.join(', ')}
                        </span>
                      )}
                      {notification.affectedStates && (
                        <span className="text-gray-600">
                          States: {notification.affectedStates.join(', ')}
                        </span>
                      )}
                      <span className="text-gray-500">
                        {notification.date.toLocaleDateString()}
                      </span>
                    </div>

                    {notification.learnMoreUrl && (
                      <a
                        href={notification.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 mt-2 text-sm ${getNotificationTextColor(notification.type, notification.priority)} hover:underline`}
                      >
                        Learn More <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More/Less Button */}
      {filteredNotifications.length > 3 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAll ? 'Show Less' : `Show All ${filteredNotifications.length} Notifications`}
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
            Set Deadline Reminders
          </button>
          <button className="text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
            Subscribe to Updates
          </button>
          <button className="text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700">
            View Tax Calendar
          </button>
        </div>
      </div>
    </div>
  );
};