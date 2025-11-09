import { render, screen } from '../../../test/utils/custom-render';
import { Button } from './button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle onClick events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByText('Click me');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply default variant styles', () => {
    render(<Button>Default</Button>);
    const button = screen.getByText('Default');

    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
  });

  it('should apply destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');

    expect(button).toHaveClass('bg-red-500');
    expect(button).toHaveClass('text-white');
  });

  it('should apply outline variant styles', () => {
    render(<Button variant="outline">Outlined</Button>);
    const button = screen.getByText('Outlined');

    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('bg-white');
  });

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');

    expect(button).toHaveClass('bg-slate-100');
  });

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText('Ghost');

    expect(button).toHaveClass('hover:bg-slate-100');
  });

  it('should apply link variant styles', () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByText('Link');

    expect(button).toHaveClass('text-primary');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('should apply small size styles', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText('Small');

    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('px-3');
  });

  it('should apply large size styles', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText('Large');

    expect(button).toHaveClass('h-11');
    expect(button).toHaveClass('px-8');
  });

  it('should apply icon size styles', () => {
    render(<Button size="icon">🔥</Button>);
    const button = screen.getByText('🔥');

    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should not trigger onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    const button = screen.getByText('Disabled');
    button.click();

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom');

    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-primary'); // Should still have default classes
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should support type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText('Submit');

    expect(button).toHaveAttribute('type', 'submit');
  });
});
