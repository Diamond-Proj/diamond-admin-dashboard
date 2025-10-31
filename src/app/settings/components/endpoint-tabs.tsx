'use client';

interface EndpointTabsProps {
  activeTab: 'managed' | 'available';
  onTabChange: (tab: 'managed' | 'available') => void;
}

export function EndpointTabs({ activeTab, onTabChange }: EndpointTabsProps) {
  return (
    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onTabChange('managed')}
        className={`relative cursor-pointer px-4 py-3 text-sm font-medium transition-colors ${
          activeTab === 'managed'
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        Managed Endpoints
        {activeTab === 'managed' && (
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
        )}
      </button>
      <button
        onClick={() => onTabChange('available')}
        className={`relative cursor-pointer px-4 py-3 text-sm font-medium transition-colors ${
          activeTab === 'available'
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        Available Endpoints
        {activeTab === 'available' && (
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
        )}
      </button>
    </div>
  );
}
