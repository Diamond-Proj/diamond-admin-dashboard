'use client';

import { useState } from 'react';
import { TaskTemplate } from '../tasks.types';
import { X, ChevronDown, ChevronRight, LayoutTemplate } from 'lucide-react';

interface TemplateSelectorProps {
  templates: TaskTemplate[];
  activeTemplateId: string | null;
  onSelect: (template: TaskTemplate) => void;
  onClear: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Fine-tuning':
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Inference:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Evaluation:
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Training:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category] ??
    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  );
}

export function TemplateSelector({
  templates,
  activeTemplateId,
  onSelect,
  onClear,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (templates.length === 0) return null;

  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  return (
    <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
      {/* Toggle row */}
      <div className="flex items-center justify-between px-6 py-3">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
        >
          <LayoutTemplate className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Templates
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>

        {/* Active template pill + clear */}
        {activeTemplate && (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(activeTemplate.category)}`}
            >
              {activeTemplate.name}
            </span>
            <button
              type="button"
              onClick={onClear}
              title="Clear template"
              className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Collapsible card row */}
      {isOpen && (
        <div className="flex gap-3 overflow-x-auto px-6 pb-4">
          {templates.map((template) => {
            const isActive = template.id === activeTemplateId;
            return (
              <button
                key={template.id}
                type="button"
                title={template.description}
                onClick={() => {
                  onSelect(template);
                  setIsOpen(false);
                }}
                className={`flex min-w-[220px] max-w-[260px] flex-shrink-0 cursor-pointer flex-col gap-2 rounded-lg border p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
                }`}
              >
                <span
                  className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(template.category)}`}
                >
                  {template.category}
                </span>
                <span
                  className={`text-sm font-semibold leading-snug ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {template.name}
                </span>
                <span className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {template.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
