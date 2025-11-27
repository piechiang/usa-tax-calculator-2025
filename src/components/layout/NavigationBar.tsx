import React from 'react';
import { User, DollarSign, FileText, Calculator } from 'lucide-react';

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  t: (key: string) => string;
}

const tabs = [
  { id: 'personal', icon: User },
  { id: 'income', icon: DollarSign },
  { id: 'payments', icon: FileText },
  { id: 'deductions', icon: Calculator },
] as const;

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  t,
}) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {t(`tabs.${tab.id}`)}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};
