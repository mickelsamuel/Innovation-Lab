import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render badge with children', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('should render default variant', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
  });

  it('should render secondary variant', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('should render destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();
  });

  it('should render outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('should render success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should render warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('should render info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should render draft variant', () => {
    render(<Badge variant="draft">Draft</Badge>);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('should render upcoming variant', () => {
    render(<Badge variant="upcoming">Upcoming</Badge>);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('should render live variant', () => {
    render(<Badge variant="live">Live</Badge>);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('should render judging variant', () => {
    render(<Badge variant="judging">Judging</Badge>);
    expect(screen.getByText('Judging')).toBeInTheDocument();
  });

  it('should render closed variant', () => {
    render(<Badge variant="closed">Closed</Badge>);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-badge" data-testid="badge">Custom</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('custom-badge');
  });

  it('should handle onClick event', () => {
    let clicked = false;
    render(<Badge onClick={() => { clicked = true; }}>Clickable</Badge>);
    screen.getByText('Clickable').click();
    expect(clicked).toBe(true);
  });
});
