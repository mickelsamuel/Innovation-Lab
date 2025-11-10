'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Common technical skills
const AVAILABLE_SKILLS = [
  // Programming Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',

  // Frontend
  'React',
  'Vue.js',
  'Angular',
  'Next.js',
  'HTML/CSS',
  'Tailwind CSS',
  'SASS/SCSS',

  // Backend
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  'ASP.NET',
  'Laravel',
  'Ruby on Rails',

  // Mobile
  'React Native',
  'Flutter',
  'iOS Development',
  'Android Development',

  // Databases
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'Redis',
  'Elasticsearch',
  'Firebase',

  // Cloud & DevOps
  'AWS',
  'Azure',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Terraform',

  // Data & AI
  'Machine Learning',
  'Deep Learning',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'NumPy',
  'scikit-learn',

  // Other
  'Git',
  'GraphQL',
  'REST API',
  'Microservices',
  'Blockchain',
  'Web3',
  'Solidity',
];

interface SkillMultiSelectProps {
  value: string[];
  onChange: (skills: string[]) => void;
  className?: string;
  maxSelections?: number;
}

export function SkillMultiSelect({
  value = [],
  onChange,
  className,
  maxSelections,
}: SkillMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSkill = (skill: string) => {
    if (value.includes(skill)) {
      onChange(value.filter(s => s !== skill));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter(s => s !== skill));
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !value.includes(trimmed)) {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, trimmed]);
      setCustomSkill('');
      setShowCustomInput(false);
    }
  };

  // Filter skills based on search
  const filteredSkills = AVAILABLE_SKILLS.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      {/* Selected Skills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map(skill => (
          <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 rounded-full hover:bg-slate-300 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <p className="text-sm text-slate-500">No skills selected</p>}
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
            ? `${value.length} ${value.length === 1 ? 'skill' : 'skills'} selected`
            : 'Select skills'}
        </span>
        {maxSelections && (
          <span className="text-xs text-slate-500">
            {value.length}/{maxSelections}
          </span>
        )}
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-96 overflow-hidden flex flex-col">
          <div className="p-2">
            {/* Search Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search skills..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />
          </div>

          {/* Available Skills */}
          <div className="flex-1 overflow-auto px-2 pb-2">
            <div className="space-y-1">
              {filteredSkills.length > 0 ? (
                filteredSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={
                      maxSelections !== undefined &&
                      value.length >= maxSelections &&
                      !value.includes(skill)
                    }
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition-colors',
                      value.includes(skill) && 'bg-slate-50',
                      maxSelections !== undefined &&
                        value.length >= maxSelections &&
                        !value.includes(skill) &&
                        'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border-2 rounded flex items-center justify-center',
                        value.includes(skill) ? 'border-primary bg-primary' : 'border-slate-300'
                      )}
                    >
                      {value.includes(skill) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="flex-1 text-left">{skill}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No skills found</p>
              )}
            </div>

            {/* Custom Skill Input */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              {!showCustomInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full"
                  disabled={maxSelections !== undefined && value.length >= maxSelections}
                >
                  + Add Custom Skill
                </Button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill();
                      } else if (e.key === 'Escape') {
                        setShowCustomInput(false);
                        setCustomSkill('');
                      }
                    }}
                    placeholder="Enter skill name"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomSkill}
                    disabled={!customSkill.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomSkill('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}
