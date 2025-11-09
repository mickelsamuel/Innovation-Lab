import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { DialogExample, SelectExample, ToastExample, XpAwardExample } from './examples';
import { ToastProvider } from './toast';

describe('Examples', () => {
  it('should render dialog example', () => {
    render(<DialogExample />);
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should render select example', () => {
    render(<SelectExample />);
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('should render toast example', () => {
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>
    );
    expect(screen.getByText('Success Toast')).toBeInTheDocument();
    expect(screen.getByText('Error Toast')).toBeInTheDocument();
    expect(screen.getByText('Warning Toast')).toBeInTheDocument();
    expect(screen.getByText('Info Toast')).toBeInTheDocument();
    expect(screen.getByText('XP Toast')).toBeInTheDocument();
  });

  it('should show success toast when button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success Toast');
    await user.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  it('should show error toast when button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>
    );

    const errorButton = screen.getByText('Error Toast');
    await user.click(errorButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('should show warning toast when button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>
    );

    const warningButton = screen.getByText('Warning Toast');
    await user.click(warningButton);

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  it('should show info toast when button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>
    );

    const infoButton = screen.getByText('Info Toast');
    await user.click(infoButton);

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument();
    });
  });

  it('should show xp toast when button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>
    );

    const xpButton = screen.getByText('XP Toast');
    await user.click(xpButton);

    await waitFor(() => {
      expect(screen.getByText('+50 XP Earned!')).toBeInTheDocument();
    });
  });

  it('should render xp award example', () => {
    render(
      <ToastProvider>
        <XpAwardExample />
      </ToastProvider>
    );
    expect(screen.getByText('Award XP')).toBeInTheDocument();
  });

  it('should open xp award dialog', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <XpAwardExample />
      </ToastProvider>
    );

    const button = screen.getByText('Award XP');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Award Experience Points')).toBeInTheDocument();
    });
  });

  it('should award xp and show toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <XpAwardExample />
      </ToastProvider>
    );

    // Open dialog
    const openButton = screen.getByText('Award XP');
    await user.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('Award Experience Points')).toBeInTheDocument();
    });

    // Fill in form
    const userIdInput = screen.getByPlaceholderText('Enter user ID');
    await user.type(userIdInput, 'user123');

    const pointsInput = screen.getByPlaceholderText('Enter XP amount');
    await user.type(pointsInput, '100');

    // Submit
    const awardButton = screen.getAllByText('Award XP')[1]; // Second one is in dialog
    await user.click(awardButton);

    // Check toast appeared
    await waitFor(() => {
      expect(screen.getByText('Awarded 100 XP!')).toBeInTheDocument();
    });
  });

  it('should disable award button when fields are empty', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <XpAwardExample />
      </ToastProvider>
    );

    const openButton = screen.getByText('Award XP');
    await user.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('Award Experience Points')).toBeInTheDocument();
    });

    const awardButton = screen.getAllByText('Award XP')[1];
    expect(awardButton).toBeDisabled();
  });

  it('should enable award button when fields are filled', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <XpAwardExample />
      </ToastProvider>
    );

    const openButton = screen.getByText('Award XP');
    await user.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('Award Experience Points')).toBeInTheDocument();
    });

    const userIdInput = screen.getByPlaceholderText('Enter user ID');
    await user.type(userIdInput, 'user123');

    const pointsInput = screen.getByPlaceholderText('Enter XP amount');
    await user.type(pointsInput, '100');

    const awardButton = screen.getAllByText('Award XP')[1];
    expect(awardButton).not.toBeDisabled();
  });
});
