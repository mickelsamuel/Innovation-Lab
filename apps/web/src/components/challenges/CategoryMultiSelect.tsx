'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Common challenge categories
const AVAILABLE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'AI',
  'Blockchain',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'IoT',
  'Game Development',
  'UI/UX Design',
  'Backend',
  'Frontend',
  'Full Stack',
  'Database',
  'API Development',
  'Automation',
  'Analytics',
  'Business Intelligence',
];

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (categories: string[]) => void;
  className?: string;
  maxSelections?: number;
}

export function CategoryMultiSelect({
  value = [],
  onChange,
  className,
  maxSelections,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, category]);
    }
  };

  const removeCategory = (category: string) => {
    onChange(value.filter(c => c !== category));
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed && !value.includes(trimmed)) {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, trimmed]);
      setCustomCategory('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Selected Categories */}
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map(category => (
          <Badge key={category} variant="secondary" className="pl-3 pr-1 py-1">
            {category}
            <button
              type="button"
              onClick={() => removeCategory(category)}
              className="ml-1 rounded-full hover:bg-slate-300 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No categories selected</p>}
      </div>

      {/* Dropdown Trigger */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span>
          {value.length > 0
            ? `${value.length} ${value.length === 1 ? 'category' : 'categories'} selected`
            : 'Select categories'}
        </span>
        {maxSelections && (
          <span className="text-xs text-slate-500 dark:text-slate-300">
            {value.length}/{maxSelections}
          </span>
        )}
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-md shadow-lg max-h-80 overflow-auto">
          <div className="p-2">
            {/* Available Categories */}
            <div className="space-y-1">
              {AVAILABLE_CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  disabled={
                    maxSelections !== undefined &&
                    value.length >= maxSelections &&
                    !value.includes(category)
                  }
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                    value.includes(category) && 'bg-slate-50 dark:bg-slate-900',
                    maxSelections !== undefined &&
                      value.length >= maxSelections &&
                      !value.includes(category) &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 border-2 rounded flex items-center justify-center',
                      value.includes(category) ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-700'
                    )}
                  >
                    {value.includes(category) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="flex-1 text-left">{category}</span>
                </button>
              ))}
            </div>

            {/* Custom Category Input */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              {!showCustomInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full"
                  disabled={maxSelections !== undefined && value.length >= maxSelections}
                >
                  + Add Custom Category
                </Button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomCategory();
                      } else if (e.key === 'Escape') {
                        setShowCustomInput(false);
                        setCustomCategory('');
                      }
                    }}
                    placeholder="Enter category name"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-card"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomCategory}
                    disabled={!customCategory.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomCategory('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
