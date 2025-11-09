import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HackathonCard } from './hackathon-card';
import type { Hackathon } from '@/types/hackathon';

const mockHackathon: Hackathon = {
  id: '1',
  title: 'Test Hackathon',
  subtitle: 'Test Subtitle',
  description: 'Test description for hackathon',
  slug: 'test-hackathon',
  status: 'LIVE',
  location: 'VIRTUAL',
  city: null,
  startsAt: '2024-01-01T00:00:00Z',
  endsAt: '2024-12-31T23:59:59Z',
  prizePool: 10000,
  maxTeamSize: 4,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  _count: {
    teams: 5,
    submissions: 10,
  },
  tracks: [
    { id: '1', title: 'Frontend', description: 'Frontend track', hackathonId: '1' },
    { id: '2', title: 'Backend', description: 'Backend track', hackathonId: '1' },
  ],
};

describe('HackathonCard', () => {
  it('should render hackathon card with title', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('Test Hackathon')).toBeInTheDocument();
  });

  it('should render hackathon subtitle', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render hackathon description', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('Test description for hackathon')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('should render location', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('Virtual')).toBeInTheDocument();
  });

  it('should render prize pool', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('$10,000 Prize Pool')).toBeInTheDocument();
  });

  it('should render team and submission counts', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText(/5 teams/)).toBeInTheDocument();
    expect(screen.getByText(/10 submissions/)).toBeInTheDocument();
  });

  it('should render tracks', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('should render view details button with correct link', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/hackathons/test-hackathon');
  });

  it('should render time remaining for live hackathons', () => {
    render(<HackathonCard hackathon={mockHackathon} />);
    expect(screen.getByText(/left|Ended/)).toBeInTheDocument();
  });

  it('should render in-person location with city', () => {
    const inPersonHackathon = {
      ...mockHackathon,
      location: 'IN_PERSON' as const,
      city: 'New York',
    };
    render(<HackathonCard hackathon={inPersonHackathon} />);
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('should show +N more badge when more than 3 tracks', () => {
    const manyTracksHackathon = {
      ...mockHackathon,
      tracks: [
        { id: '1', title: 'Track 1', description: '', hackathonId: '1' },
        { id: '2', title: 'Track 2', description: '', hackathonId: '1' },
        { id: '3', title: 'Track 3', description: '', hackathonId: '1' },
        { id: '4', title: 'Track 4', description: '', hackathonId: '1' },
        { id: '5', title: 'Track 5', description: '', hackathonId: '1' },
      ],
    };
    render(<HackathonCard hackathon={manyTracksHackathon} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should render hybrid location', () => {
    const hybridHackathon = {
      ...mockHackathon,
      location: 'HYBRID' as const,
      city: 'Toronto',
    };
    render(<HackathonCard hackathon={hybridHackathon} />);
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
  });

  it('should render in-person without city as "In Person"', () => {
    const inPersonHackathon = {
      ...mockHackathon,
      location: 'IN_PERSON' as const,
      city: null,
    };
    render(<HackathonCard hackathon={inPersonHackathon} />);
    expect(screen.getByText('In Person')).toBeInTheDocument();
  });

  it('should show "Ended" for past hackathons', () => {
    const pastHackathon = {
      ...mockHackathon,
      endsAt: '2020-01-01T00:00:00Z',
    };
    render(<HackathonCard hackathon={pastHackathon} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('should handle singular day remaining', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(tomorrow.getHours() + 5);

    const oneDayHackathon = {
      ...mockHackathon,
      status: 'LIVE' as const,
      endsAt: tomorrow.toISOString(),
    };
    render(<HackathonCard hackathon={oneDayHackathon} />);
    expect(screen.getByText(/1 day left/)).toBeInTheDocument();
  });

  it('should handle singular hour remaining', () => {
    const oneHour = new Date();
    // Add 1 hour and 30 minutes to ensure it stays in the "1 hour" range
    oneHour.setMinutes(oneHour.getMinutes() + 90);

    const oneHourHackathon = {
      ...mockHackathon,
      status: 'LIVE' as const,
      endsAt: oneHour.toISOString(),
    };
    render(<HackathonCard hackathon={oneHourHackathon} />);
    expect(screen.getByText(/1 hour left/)).toBeInTheDocument();
  });
});
