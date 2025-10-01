'use client';

import { Search, Filter, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TaskControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: 'all' | 'completed' | 'pending' | 'running' | 'failed';
  setFilter: (
    filter: 'all' | 'completed' | 'pending' | 'running' | 'failed'
  ) => void;
}

const filterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
] as const;

export function TaskControls({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter
}: TaskControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = filterOptions.find((option) => option.value === filter);

  return (
    <div className="mb-8 rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex min-w-[140px] cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:focus:border-blue-400"
            >
              <span>{currentOption?.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full cursor-pointer px-4 py-3 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 dark:hover:bg-gray-600 ${
                      filter === option.value
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
