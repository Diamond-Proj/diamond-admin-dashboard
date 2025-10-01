'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface VirtualSelectProps {
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function VirtualSelect({
  options,
  selected,
  onSelect,
  placeholder,
  disabled = false,
  loading = false,
  className = ''
}: VirtualSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition-colors">
          <span className="text-gray-500">Loading options...</span>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-2 text-left shadow-sm transition-all focus:ring-2 focus:outline-none ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            : isOpen
              ? 'border-blue-400 bg-white text-gray-900 ring-blue-100'
              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:shadow-md'
        }`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
          {selected || placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
          {/* Search Input */}
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-md border border-gray-200 bg-white py-2 pr-3 pl-10 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No options found
              </div>
            ) : (
              <div className="py-2">
                {filteredOptions.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                      index === highlightedIndex
                        ? 'bg-blue-50 text-blue-700'
                        : selected === option
                          ? 'bg-gray-50 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {selected === option && (
                      <Check className="h-4 w-4 flex-shrink-0 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
