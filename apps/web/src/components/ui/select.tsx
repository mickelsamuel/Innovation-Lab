'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within Select');
  }
  return context;
}

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Select({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export function SelectTrigger({ children, className = '', placeholder }: SelectTriggerProps) {
  const { open, setOpen, value } = useSelect();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [open, setOpen]);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <span className={!value && placeholder ? 'text-slate-500 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}>
        {children || placeholder || 'Select...'}
      </span>
      <ChevronDown
        className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelect();

  if (!value && placeholder) {
    return <span className="text-slate-500 dark:text-slate-300">{placeholder}</span>;
  }

  // The actual value will be rendered by SelectItem when selected
  return <span className="text-slate-900 dark:text-slate-100">{value}</span>;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const { open } = useSelect();

  if (!open) return null;

  return (
    <div
      className={`absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-lg ${className}`}
    >
      <div className="max-h-96 overflow-auto p-1" role="listbox">
        {children}
      </div>
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({
  value: itemValue,
  children,
  className = '',
  disabled = false,
}: SelectItemProps) {
  const { value, onValueChange } = useSelect();
  const isSelected = value === itemValue;

  return (
    <div
      onClick={() => !disabled && onValueChange(itemValue)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-slate-900 dark:text-slate-100 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 ${
        isSelected ? 'bg-slate-50 dark:bg-slate-900' : ''
      } ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      role="option"
      aria-selected={isSelected}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </span>
      {children}
    </div>
  );
}

interface SelectGroupProps {
  children: React.ReactNode;
}

export function SelectGroup({ children }: SelectGroupProps) {
  return <div className="py-1">{children}</div>;
}

interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectLabel({ children, className = '' }: SelectLabelProps) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 ${className}`}>
      {children}
    </div>
  );
}

interface SelectSeparatorProps {
  className?: string;
}

export function SelectSeparator({ className = '' }: SelectSeparatorProps) {
  return <div className={`-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800 ${className}`} />;
}
