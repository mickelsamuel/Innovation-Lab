import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './footer';

describe('Footer', () => {
  it('should render footer component', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render brand section', () => {
    render(<Footer />);
    expect(screen.getByText('Innovation Lab')).toBeInTheDocument();
    expect(screen.getByText('NBC + Vaultix')).toBeInTheDocument();
  });

  it('should render platform links', () => {
    render(<Footer />);
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hackathons' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Challenges' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leaderboard' })).toBeInTheDocument();
  });

  it('should render resources links', () => {
    render(<Footer />);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Support Center' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('should render company links', () => {
    render(<Footer />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'National Bank of Canada' })).toBeInTheDocument();
  });

  it('should render legal links', () => {
    render(<Footer />);
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
  });

  it('should render footer links', () => {
    render(<Footer />);
    // Just verify that some footer links are rendered
    expect(screen.getByRole('link', { name: 'Hackathons' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear}.*National Bank of Canada`))
    ).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    render(<Footer />);
    const hackathonsLink = screen.getByRole('link', { name: 'Hackathons' });
    expect(hackathonsLink).toHaveAttribute('href', '/hackathons');
  });
});
