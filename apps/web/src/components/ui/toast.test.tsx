import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from './toast';

function ToastTester() {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast({ type: 'success', title: 'Success!' })}>Add Toast</button>
  );
}

describe('Toast', () => {
  it('should render toast provider', () => {
    render(
      <ToastProvider>
        <div>Children</div>
      </ToastProvider>
    );
    expect(screen.getByText('Children')).toBeInTheDocument();
  });

  it('should add toast', async () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    screen.getByText('Add Toast').click();
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  it('should handle different toast types', async () => {
    function TypesTester() {
      const { addToast } = useToast();
      return (
        <>
          <button onClick={() => addToast({ type: 'success', title: 'Success' })}>Success</button>
          <button onClick={() => addToast({ type: 'error', title: 'Error' })}>Error</button>
          <button onClick={() => addToast({ type: 'info', title: 'Info' })}>Info</button>
          <button onClick={() => addToast({ type: 'warning', title: 'Warning' })}>Warning</button>
        </>
      );
    }

    render(
      <ToastProvider>
        <TypesTester />
      </ToastProvider>
    );

    screen.getByText('Success').click();
    await waitFor(() => expect(screen.getByText('Success')).toBeInTheDocument());
  });

  it('should handle toast with description', async () => {
    function DescriptionTester() {
      const { addToast } = useToast();
      return (
        <button
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Title',
              description: 'Description text',
            })
          }
        >
          Add
        </button>
      );
    }

    render(
      <ToastProvider>
        <DescriptionTester />
      </ToastProvider>
    );

    screen.getByText('Add').click();
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });
  });
});
