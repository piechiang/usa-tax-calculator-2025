import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, AlertTriangle, CheckCircle, Plus, Trash2, Settings } from 'lucide-react';

interface TaxDeadline {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'federal' | 'state' | 'quarterly' | 'personal' | 'business';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  reminderDays: number[];
  recurring: boolean;
  recurrencePattern?: 'yearly' | 'quarterly' | 'monthly';
  applicableStates?: string[];
  applicableFilingStatus?: string[];
  category: 'filing' | 'payment' | 'document' | 'planning';
  actions: string[];
  estimatedTime: number; // in hours
  dependencies?: string[];
}

interface Reminder {
  id: string;
  deadlineId: string;
  title: string;
  message: string;
  daysUntil: number;
  priority: TaxDeadline['priority'];
  actions: string[];
}

interface DeadlineReminderProps {
  selectedState?: string;
}

export const DeadlineReminder: React.FC<DeadlineReminderProps> = ({
  selectedState = ''
}) => {
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);
  const [customDeadlines, setCustomDeadlines] = useState<TaxDeadline[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedView, setSelectedView] = useState<'upcoming' | 'all' | 'completed' | 'settings'>('upcoming');
  const [notificationSettings, setNotificationSettings] = useState({
    enableNotifications: true,
    soundEnabled: true,
    emailReminders: false,
    defaultReminderDays: [30, 14, 7, 1]
  });

  const [newDeadline, setNewDeadline] = useState<Partial<TaxDeadline>>({
    title: '',
    description: '',
    date: new Date(),
    type: 'personal',
    priority: 'medium',
    completed: false,
    reminderDays: [7, 1],
    recurring: false,
    category: 'filing',
    actions: [],
    estimatedTime: 1
  });

  useEffect(() => {
    // Initialize with standard tax deadlines
    const currentYear = new Date().getFullYear();
    const standardDeadlines: TaxDeadline[] = [
      {
        id: 'federal-filing-deadline',
        title: `${currentYear} Federal Tax Return Filing Deadline`,
        description: 'File your federal income tax return (Form 1040) or request an extension',
        date: new Date(currentYear + 1, 3, 15), // April 15
        type: 'federal',
        priority: 'high',
        completed: false,
        reminderDays: [90, 60, 30, 14, 7, 3, 1],
        recurring: true,
        recurrencePattern: 'yearly',
        category: 'filing',
        actions: [
          'Gather all tax documents (W-2s, 1099s, receipts)',
          'Complete and file Form 1040',
          'Pay any taxes owed or request extension',
          'Keep copies of all documents'
        ],
        estimatedTime: 4
      },
      {
        id: 'q4-estimated-payment',
        title: 'Q4 Estimated Tax Payment',
        description: 'Fourth quarter estimated tax payment deadline',
        date: new Date(currentYear + 1, 0, 15), // January 15
        type: 'quarterly',
        priority: 'high',
        completed: false,
        reminderDays: [30, 14, 7, 1],
        recurring: true,
        recurrencePattern: 'quarterly',
        category: 'payment',
        actions: [
          'Calculate quarterly tax liability',
          'Submit payment via EFTPS or Form 1040ES',
          'Update records for next quarter'
        ],
        estimatedTime: 1
      },
      {
        id: 'q1-estimated-payment',
        title: 'Q1 Estimated Tax Payment',
        description: 'First quarter estimated tax payment deadline',
        date: new Date(currentYear + 1, 3, 15), // April 15
        type: 'quarterly',
        priority: 'medium',
        completed: false,
        reminderDays: [30, 14, 7, 1],
        recurring: true,
        recurrencePattern: 'quarterly',
        category: 'payment',
        actions: [
          'Calculate Q1 estimated taxes',
          'Submit payment for current year',
          'Adjust estimates based on income changes'
        ],
        estimatedTime: 1
      },
      {
        id: 'document-collection',
        title: 'Tax Document Collection Deadline',
        description: 'Ensure all tax documents are received and organized',
        date: new Date(currentYear + 1, 2, 1), // March 1
        type: 'personal',
        priority: 'medium',
        completed: false,
        reminderDays: [60, 30, 14],
        recurring: true,
        recurrencePattern: 'yearly',
        category: 'document',
        actions: [
          'Collect all W-2s and 1099s',
          'Gather charitable donation receipts',
          'Organize business expense records',
          'Verify all documents are complete'
        ],
        estimatedTime: 2
      },
      {
        id: 'retirement-contribution',
        title: 'IRA Contribution Deadline',
        description: 'Last day to make IRA contributions for the tax year',
        date: new Date(currentYear + 1, 3, 15), // April 15
        type: 'personal',
        priority: 'medium',
        completed: false,
        reminderDays: [60, 30, 14, 7],
        recurring: true,
        recurrencePattern: 'yearly',
        category: 'planning',
        actions: [
          'Review retirement contribution limits',
          'Make traditional or Roth IRA contributions',
          'Consider catch-up contributions if 50+',
          'Document contributions for tax filing'
        ],
        estimatedTime: 1
      }
    ];

    // Add state-specific deadlines
    if (selectedState) {
      const stateDeadline: TaxDeadline = {
        id: `${selectedState.toLowerCase()}-state-deadline`,
        title: `${selectedState} State Tax Return Deadline`,
        description: `File your ${selectedState} state income tax return`,
        date: new Date(currentYear + 1, 3, 15), // Most states follow federal deadline
        type: 'state',
        priority: 'high',
        completed: false,
        reminderDays: [60, 30, 14, 7, 1],
        recurring: true,
        recurrencePattern: 'yearly',
        applicableStates: [selectedState],
        category: 'filing',
        actions: [
          `Complete ${selectedState} state tax form`,
          'Calculate state tax liability',
          'Submit state return and payment',
          'Keep copies for records'
        ],
        estimatedTime: 2
      };
      standardDeadlines.push(stateDeadline);
    }

    setDeadlines(standardDeadlines);

    // Load custom deadlines from localStorage
    const savedCustom = localStorage.getItem('custom_tax_deadlines');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom).map((d: { date: string; [key: string]: unknown }) => ({
        ...d,
        date: new Date(d.date)
      }));
      setCustomDeadlines(parsed);
    }

    // Load notification settings
    const savedSettings = localStorage.getItem('deadline_notification_settings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings) as typeof notificationSettings);
    }
  }, [selectedState]);

  useEffect(() => {
    // Generate active reminders
    const allDeadlines = [...deadlines, ...customDeadlines];
    const now = new Date();
    const activeReminders: Reminder[] = [];

    allDeadlines.forEach(deadline => {
      if (!deadline.completed) {
        deadline.reminderDays.forEach(days => {
          const reminderDate = new Date(deadline.date);
          reminderDate.setDate(reminderDate.getDate() - days);

          if (reminderDate <= now && deadline.date > now) {
            const daysUntil = Math.ceil((deadline.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            activeReminders.push({
              id: `${deadline.id}-${days}`,
              deadlineId: deadline.id,
              title: deadline.title,
              message: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
              priority: deadline.priority,
              daysUntil,
              actions: deadline.actions
            });
          }
        });
      }
    });

    // Sort by urgency
    activeReminders.sort((a, b) => a.daysUntil - b.daysUntil);
    setReminders(activeReminders);

    // Show browser notifications if enabled
    if (notificationSettings.enableNotifications && activeReminders.length > 0) {
      const urgentReminders = activeReminders.filter(r => r.daysUntil <= 3);
      urgentReminders.forEach(reminder => {
        if (Notification.permission === 'granted') {
          new Notification(`Tax Deadline Reminder: ${reminder.title}`, {
            body: reminder.message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }, [deadlines, customDeadlines, notificationSettings]);

  useEffect(() => {
    // Save custom deadlines
    localStorage.setItem('custom_tax_deadlines', JSON.stringify(customDeadlines));
  }, [customDeadlines]);

  useEffect(() => {
    // Save notification settings
    localStorage.setItem('deadline_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const addCustomDeadline = () => {
    if (!newDeadline.title || !newDeadline.date) return;

    const deadline: TaxDeadline = {
      id: `custom_${Date.now()}`,
      title: newDeadline.title!,
      description: newDeadline.description || '',
      date: newDeadline.date!,
      type: newDeadline.type!,
      priority: newDeadline.priority!,
      completed: false,
      reminderDays: newDeadline.reminderDays || [7, 1],
      recurring: newDeadline.recurring || false,
      recurrencePattern: newDeadline.recurrencePattern,
      category: newDeadline.category!,
      actions: newDeadline.actions || [],
      estimatedTime: newDeadline.estimatedTime || 1
    };

    setCustomDeadlines(prev => [...prev, deadline]);
    setNewDeadline({
      title: '',
      description: '',
      date: new Date(),
      type: 'personal',
      priority: 'medium',
      completed: false,
      reminderDays: [7, 1],
      recurring: false,
      category: 'filing',
      actions: [],
      estimatedTime: 1
    });
    setShowAddForm(false);
  };

  const toggleDeadlineCompletion = (deadlineId: string) => {
    const updateDeadlines = (deadlinesList: TaxDeadline[]) =>
      deadlinesList.map(d =>
        d.id === deadlineId ? { ...d, completed: !d.completed } : d
      );

    setDeadlines(updateDeadlines);
    setCustomDeadlines(updateDeadlines);
  };

  const deleteCustomDeadline = (deadlineId: string) => {
    if (confirm('Are you sure you want to delete this deadline?')) {
      setCustomDeadlines(prev => prev.filter(d => d.id !== deadlineId));
    }
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationSettings(prev => ({
        ...prev,
        enableNotifications: permission === 'granted'
      }));
    }
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return [...deadlines, ...customDeadlines]
      .filter(d => !d.completed && d.date >= now && d.date <= thirtyDaysFromNow)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tax Deadline Reminders</h3>
          {reminders.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {reminders.length} active
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('settings')}
            className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Deadline
          </button>
        </div>
      </div>

      {/* Active Reminders Banner */}
      {reminders.length > 0 && selectedView !== 'settings' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">Urgent Deadlines</span>
          </div>
          <div className="space-y-2">
            {reminders.slice(0, 3).map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between text-sm">
                <span className="text-red-800">{reminder.title}</span>
                <span className="font-medium text-red-900">{reminder.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Navigation */}
      {selectedView !== 'settings' && (
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'upcoming', label: 'Upcoming', count: getUpcomingDeadlines().length },
            { id: 'all', label: 'All Deadlines', count: deadlines.length + customDeadlines.length },
            { id: 'completed', label: 'Completed', count: [...deadlines, ...customDeadlines].filter(d => d.completed).length }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as 'upcoming' | 'all' | 'completed')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                selectedView === view.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {view.label}
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {view.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Settings View */}
      {selectedView === 'settings' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Browser Notifications</span>
                  <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                </div>
                <div className="flex items-center gap-2">
                  {Notification.permission === 'default' && (
                    <button
                      onClick={requestNotificationPermission}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Enable
                    </button>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.enableNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        enableNotifications: e.target.checked
                      }))}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full ${
                      notificationSettings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`dot absolute w-4 h-4 rounded-full bg-white transition transform ${
                        notificationSettings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} style={{ top: '4px' }}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Reminder Days
                </label>
                <input
                  type="text"
                  value={notificationSettings.defaultReminderDays.join(', ')}
                  onChange={(e) => {
                    const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                    setNotificationSettings(prev => ({ ...prev, defaultReminderDays: days }));
                  }}
                  placeholder="30, 14, 7, 1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of days before deadline to send reminders
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setSelectedView('upcoming')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Deadlines
            </button>
          </div>
        </div>
      )}

      {/* Deadlines List */}
      {selectedView !== 'settings' && (
        <div className="space-y-4">
          {(selectedView === 'upcoming' ? getUpcomingDeadlines() :
            selectedView === 'completed' ? [...deadlines, ...customDeadlines].filter(d => d.completed) :
            [...deadlines, ...customDeadlines]
          ).map((deadline) => {
            const daysUntil = getDaysUntil(deadline.date);
            const isOverdue = daysUntil < 0;
            const isCustom = deadline.id.startsWith('custom_');

            return (
              <div
                key={deadline.id}
                className={`border-l-4 rounded-lg p-4 ${getPriorityColor(deadline.priority)} ${
                  deadline.completed ? 'opacity-60' : ''
                } ${isOverdue ? 'bg-red-100 border-red-600' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(deadline.priority)}
                      <h4 className={`font-medium ${deadline.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {deadline.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        deadline.type === 'federal' ? 'bg-blue-100 text-blue-800' :
                        deadline.type === 'state' ? 'bg-green-100 text-green-800' :
                        deadline.type === 'quarterly' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deadline.type}
                      </span>
                      {isOverdue && !deadline.completed && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{deadline.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">{formatDate(deadline.date)}</span>
                          {!deadline.completed && (
                            <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                              ({isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>Est. {deadline.estimatedTime} hour{deadline.estimatedTime !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {deadline.actions.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Actions Required:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {deadline.actions.slice(0, 2).map((action, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-gray-400">•</span>
                                {action}
                              </li>
                            ))}
                            {deadline.actions.length > 2 && (
                              <li className="text-gray-500 italic">
                                +{deadline.actions.length - 2} more actions
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => toggleDeadlineCompletion(deadline.id)}
                      className={`p-2 rounded ${
                        deadline.completed
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={deadline.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => deleteCustomDeadline(deadline.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {(selectedView === 'upcoming' ? getUpcomingDeadlines() :
            selectedView === 'completed' ? [...deadlines, ...customDeadlines].filter(d => d.completed) :
            [...deadlines, ...customDeadlines]
          ).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No deadlines to show</p>
              <p className="text-sm">
                {selectedView === 'upcoming' && 'All deadlines are more than 30 days away'}
                {selectedView === 'completed' && 'No completed deadlines'}
                {selectedView === 'all' && 'Add your first deadline to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Deadline Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Add Custom Deadline</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newDeadline.title || ''}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter deadline title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newDeadline.description || ''}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter deadline description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newDeadline.date?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newDeadline.priority || 'medium'}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newDeadline.type || 'personal'}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, type: e.target.value as 'federal' | 'state' | 'quarterly' | 'personal' | 'business' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="federal">Federal</option>
                    <option value="state">State</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newDeadline.category || 'filing'}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, category: e.target.value as 'filing' | 'payment' | 'document' | 'planning' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="filing">Filing</option>
                    <option value="payment">Payment</option>
                    <option value="document">Document Collection</option>
                    <option value="planning">Tax Planning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newDeadline.estimatedTime || 1}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, estimatedTime: parseFloat(e.target.value) || 1 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Days</label>
                  <input
                    type="text"
                    value={newDeadline.reminderDays?.join(', ') || '7, 1'}
                    onChange={(e) => {
                      const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                      setNewDeadline(prev => ({ ...prev, reminderDays: days }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="7, 3, 1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days before deadline to send reminders</p>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newDeadline.recurring || false}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, recurring: e.target.checked }))}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-700">This is a recurring deadline</label>
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
                  onClick={addCustomDeadline}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Deadline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

