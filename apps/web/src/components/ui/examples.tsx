/**
 * UI Components Usage Examples
 *
 * This file demonstrates how to use the newly created UI components:
 * - Dialog
 * - Select
 * - Toast
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from './dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './select';
import { useToast } from './toast';
import { Button } from './button';

// =====================================
// DIALOG EXAMPLE
// =====================================

export function DialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Open Dialog</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <p className="text-sm text-gray-600">
            Additional content can go here. Forms, text, images, etc.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================
// SELECT EXAMPLE
// =====================================

export function SelectExample() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      {/* Basic Select */}
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectContent>
      </Select>

      {/* Grouped Select */}
      <Select>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a track" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Frontend</SelectLabel>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="vue">Vue</SelectItem>
            <SelectItem value="angular">Angular</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Backend</SelectLabel>
            <SelectItem value="node">Node.js</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="go">Go</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <p className="text-sm text-gray-600">Selected: {value}</p>
    </div>
  );
}

// =====================================
// TOAST EXAMPLE
// =====================================

export function ToastExample() {
  const { addToast } = useToast();

  const showSuccessToast = () => {
    addToast({
      type: 'success',
      title: 'Success!',
      description: 'Your changes have been saved.',
      duration: 5000,
    });
  };

  const showErrorToast = () => {
    addToast({
      type: 'error',
      title: 'Error',
      description: 'Something went wrong. Please try again.',
      duration: 5000,
    });
  };

  const showWarningToast = () => {
    addToast({
      type: 'warning',
      title: 'Warning',
      description: 'This action requires confirmation.',
      duration: 5000,
    });
  };

  const showInfoToast = () => {
    addToast({
      type: 'info',
      title: 'Info',
      description: 'Here is some useful information.',
      duration: 5000,
    });
  };

  const showXpToast = () => {
    addToast({
      type: 'success',
      title: '+50 XP Earned!',
      description: 'You submitted your first hackathon project.',
      duration: 5000,
    });
  };

  return (
    <div className="space-x-2">
      <Button onClick={showSuccessToast} variant="default">
        Success Toast
      </Button>
      <Button onClick={showErrorToast} variant="destructive">
        Error Toast
      </Button>
      <Button onClick={showWarningToast} variant="outline">
        Warning Toast
      </Button>
      <Button onClick={showInfoToast} variant="outline">
        Info Toast
      </Button>
      <Button onClick={showXpToast} variant="default">
        XP Toast
      </Button>
    </div>
  );
}

// =====================================
// COMBINED EXAMPLE: XP Award Dialog
// =====================================

export function XpAwardExample() {
  const [open, setOpen] = useState(false);
  const { addToast } = useToast();
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState('');

  const handleAwardXp = () => {
    // Simulate XP award
    addToast({
      type: 'success',
      title: `Awarded ${points} XP!`,
      description: `Successfully awarded ${points} XP to user.`,
      duration: 5000,
    });
    setOpen(false);
    setUserId('');
    setPoints('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Award XP</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Award Experience Points</DialogTitle>
          <DialogDescription>
            Manually award XP to a user for exceptional contributions.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">User ID</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 border rounded-md"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Select>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus XP</SelectItem>
                  <SelectItem value="special">Special Achievement</SelectItem>
                  <SelectItem value="correction">XP Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Points</label>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border rounded-md"
                value={points}
                onChange={e => setPoints(e.target.value)}
                placeholder="Enter XP amount"
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAwardXp} disabled={!userId || !points}>
            Award XP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================
// USAGE IN APP
// =====================================

/**
 * To use Toast in your app:
 *
 * 1. Wrap your app with ToastProvider in the root layout:
 *
 * import { ToastProvider } from '@/components/ui/toast';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ToastProvider>
 *           {children}
 *         </ToastProvider>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * 2. Use in any component:
 *
 * import { useToast } from '@/components/ui/toast';
 *
 * function MyComponent() {
 *   const { addToast } = useToast();
 *
 *   const handleSuccess = () => {
 *     addToast({
 *       type: 'success',
 *       title: 'Success!',
 *       description: 'Operation completed.',
 *     });
 *   };
 * }
 */
