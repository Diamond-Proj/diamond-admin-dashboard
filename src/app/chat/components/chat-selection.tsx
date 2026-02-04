'use client';

import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatSelectionProps {
  llm: string;
  setLLM: (llm: string) => void;
  conversation: string;
  setConversation: (conversation: string) => void;
  onCreateNewConversation: () => void;
}

const llmOptions = [
  { value: 'chatbot-123', label: 'chatbot-123' },
  { value: 'qwen-test', label: 'qwen-test' },
  { value: 'gpt8-preview', label: 'gpt8-preview' },
] as const;

const conversationOptions = [
  { value: 'conversation-1', label: 'My First Chat' },
  { value: 'conversation-2', label: 'Project Discussion' },
  { value: 'conversation-3', label: 'Research Ideas' },
] as const;

export function ChatSelection({
  llm,
  setLLM,
  conversation,
  setConversation,
  onCreateNewConversation,
}: ChatSelectionProps) {
  const [isLlmDropdownOpen, setIsLlmDropdownOpen] = useState(false);
  const [isConversationDropdownOpen, setIsConversationDropdownOpen] = useState(false);
  const llmDropdownRef = useRef<HTMLDivElement>(null);
  const conversationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        llmDropdownRef.current &&
        !llmDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLlmDropdownOpen(false);
      }
      if (
        conversationDropdownRef.current &&
        !conversationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsConversationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLlmOption = llmOptions.find((option) => option.value === llm);
  const currentConversationOption = conversationOptions.find((option) => option.value === conversation);

  return (
    <div className="mb-8 rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* LLM Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="relative" ref={llmDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
                Select an LLM
              </label>
              <button
                onClick={() => setIsLlmDropdownOpen(!isLlmDropdownOpen)}
                className="flex min-w-[200px] cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:focus:border-blue-400"
              >
                <span>{currentLlmOption?.label || 'Select LLM'}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isLlmDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isLlmDropdownOpen && (
                <div
                  className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  {llmOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setLLM(option.value);
                        setIsLlmDropdownOpen(false);
                      }}
                      className={`w-full cursor-pointer px-4 py-3 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 dark:hover:bg-gray-600 ${
                        llm === option.value
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

          {/* Conversation Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="relative" ref={conversationDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
                Select a Conversation
              </label>
              <button
                onClick={() => setIsConversationDropdownOpen(!isConversationDropdownOpen)}
                className="flex min-w-[200px] cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:focus:border-blue-400"
              >
                <span>{currentConversationOption?.label || 'Select Conversation'}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isConversationDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isConversationDropdownOpen && (
                <div
                  className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  {conversationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setConversation(option.value);
                        setIsConversationDropdownOpen(false);
                      }}
                      className={`w-full cursor-pointer px-4 py-3 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 dark:hover:bg-gray-600 ${
                        conversation === option.value
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

        {/* Create New Conversation Button */}
        <button
          onClick={onCreateNewConversation}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </button>
      </div>
    </div>
  );
}

