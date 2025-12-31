import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: TabsProps) => {
  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <div className="flex overflow-x-auto gap-1 md:gap-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3 px-3 md:px-1 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 flex-shrink-0 touch-target ${activeTab === tab.id
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700 active:text-slate-700'
              }`}
          >
            {tab.icon}
            <span className="hidden sm:inline md:inline">{tab.label}</span>
            {/* Show shorter label on mobile if icon exists */}
            {tab.icon && <span className="sm:hidden">{tab.label.length > 10 ? tab.label.substring(0, 8) + '...' : tab.label}</span>}
            {!tab.icon && <span className="sm:hidden">{tab.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};