import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('should render label with children', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-label');
  });

  it('should handle htmlFor attribute', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should forward ref', () => {
    const ref = { current: null } as any;
    render(<Label ref={ref}>Label</Label>);
    expect(ref.current).toBeTruthy();
  });

  it('should render with data attributes', () => {
    render(<Label data-testid="custom-label">Label</Label>);
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });

  it('should handle onClick event', () => {
    let clicked = false;
    render(
      <Label
        onClick={() => {
          clicked = true;
        }}
      >
        Clickable Label
      </Label>
    );
    screen.getByText('Clickable Label').click();
    expect(clicked).toBe(true);
  });
});
