'use client';

import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DatasetControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: 'all' | 'public' | 'private';
  setFilter: (filter: 'all' | 'public' | 'private') => void;
  onCreateDataset: () => void;
}

const filterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' }
] as const;

export function DatasetControls({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  onCreateDataset
}: DatasetControlsProps) {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-purple-400"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex min-w-[140px] cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:focus:border-purple-400"
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
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
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

        <button
          onClick={onCreateDataset}
          className="group flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-700 hover:to-purple-800 hover:shadow-md focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          Create Dataset
        </button>
      </div>
    </div>
  );
}
