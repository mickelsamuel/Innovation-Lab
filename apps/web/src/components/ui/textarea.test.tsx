import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('should render textarea', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;

    await user.type(textarea, 'Hello World');
    expect(textarea.value).toBe('Hello World');
  });

  it('should handle multiline text', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;

    await user.type(textarea, 'Line 1{Enter}Line 2');
    expect(textarea.value).toContain('Line 1');
    expect(textarea.value).toContain('Line 2');
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('custom-textarea');
  });

  it('should be disabled', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('should forward ref', () => {
    const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should handle value prop', () => {
    render(<Textarea value="test value" readOnly data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveValue('test value');
  });

  it('should handle onChange event', async () => {
    const user = userEvent.setup();
    let value = '';
    render(<Textarea onChange={(e) => { value = e.target.value; }} data-testid="textarea" />);

    await user.type(screen.getByTestId('textarea'), 'Test');
    expect(value).toBe('Test');
  });

  it('should render with placeholder', () => {
    render(<Textarea placeholder="Enter description" />);
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('should handle required attribute', () => {
    render(<Textarea required data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeRequired();
  });

  it('should handle rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
  });

  it('should handle maxLength attribute', () => {
    render(<Textarea maxLength={100} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('maxLength', '100');
  });
});
