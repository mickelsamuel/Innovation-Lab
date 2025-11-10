import { render, screen } from '../../../test/utils/custom-render';
import { MentorCard } from './MentorCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('MentorCard', () => {
  const mockOnSchedule = vi.fn();

  const mockMentor = {
    id: 'mentor-1',
    userId: 'user-1',
    hackathonId: 'hack-1',
    bio: 'Experienced software engineer with 10+ years in web development',
    expertise: ['React', 'Node.js', 'TypeScript', 'Architecture'],
    calendlyUrl: 'https://calendly.com/mentor1',
    createdAt: new Date('2024-01-01').toISOString(),
    user: {
      id: 'user-1',
      name: 'John Mentor',
      email: 'mentor@example.com',
      handle: 'johnmentor',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Alternative bio',
    },
    sessions: [
      {
        id: 'session-1',
        mentorId: 'mentor-1',
        title: 'Office Hours',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 3600000).toISOString(),
        capacity: 5,
        booked: 2,
        meetingUrl: 'https://meet.example.com/1',
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'session-2',
        mentorId: 'mentor-1',
        title: 'Office Hours',
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 90000000).toISOString(),
        capacity: 5,
        booked: 3,
        meetingUrl: 'https://meet.example.com/2',
        createdAt: new Date('2024-01-01').toISOString(),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  it('should render mentor card with details', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('John Mentor')).toBeInTheDocument();
    expect(screen.getByText('@johnmentor')).toBeInTheDocument();
    expect(screen.getByText(mockMentor.bio)).toBeInTheDocument();
  });

  it('should display expertise badges', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
  });

  it('should show upcoming sessions count', () => {
    render(<MentorCard mentor={mockMentor} showSessions={true} />);

    expect(screen.getByText(/2 upcoming sessions/i)).toBeInTheDocument();
  });

  it('should hide sessions when showSessions is false', () => {
    render(<MentorCard mentor={mockMentor} showSessions={false} />);

    expect(screen.queryByText(/upcoming session/i)).not.toBeInTheDocument();
  });

  it('should show singular session text for one session', () => {
    const mentorWithOneSession = {
      ...mockMentor,
      sessions: [
        {
          id: 'session-1',
          mentorId: 'mentor-1',
          title: 'Office Hours',
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 3600000).toISOString(),
          capacity: 5,
          booked: 2,
          meetingUrl: 'https://meet.example.com/1',
          createdAt: new Date('2024-01-01').toISOString(),
        },
      ],
    };

    render(<MentorCard mentor={mentorWithOneSession} showSessions={true} />);

    expect(screen.getByText(/1 upcoming session$/i)).toBeInTheDocument();
  });

  it('should call onSchedule when schedule button is clicked', async () => {
    const user = userEvent.setup();

    render(<MentorCard mentor={mockMentor} onSchedule={mockOnSchedule} />);

    const scheduleButton = screen.getByRole('button', { name: /Schedule Session/i });
    await user.click(scheduleButton);

    expect(mockOnSchedule).toHaveBeenCalledWith(mockMentor);
  });

  it('should not show schedule button when onSchedule is not provided', () => {
    render(<MentorCard mentor={mockMentor} />);

    expect(screen.queryByRole('button', { name: /Schedule Session/i })).not.toBeInTheDocument();
  });

  it('should open Calendly URL in new tab', async () => {
    const user = userEvent.setup();

    render(<MentorCard mentor={mockMentor} />);

    const calendlyButton = screen.getByRole('button', { name: '' });
    await user.click(calendlyButton);

    expect(global.open).toHaveBeenCalledWith(mockMentor.calendlyUrl, '_blank');
  });

  it('should not show Calendly button when URL is not provided', () => {
    const mentorWithoutCalendly = {
      ...mockMentor,
      calendlyUrl: null,
    };

    render(<MentorCard mentor={mentorWithoutCalendly} onSchedule={mockOnSchedule} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Schedule Session/i })).toBeInTheDocument();
  });

  it('should show user bio when mentor bio is not available', () => {
    const mentorWithoutBio = {
      ...mockMentor,
      bio: null,
    };

    render(<MentorCard mentor={mentorWithoutBio} />);

    expect(screen.getByText('Alternative bio')).toBeInTheDocument();
  });

  it('should not show bio section when both bios are missing', () => {
    const mentorWithoutBios = {
      ...mockMentor,
      bio: null,
      user: {
        ...mockMentor.user,
        bio: null,
      },
    };

    render(<MentorCard mentor={mentorWithoutBios} />);

    expect(screen.queryByText('Alternative bio')).not.toBeInTheDocument();
    expect(screen.queryByText(mockMentor.bio)).not.toBeInTheDocument();
  });

  it('should show avatar image when available', () => {
    render(<MentorCard mentor={mockMentor} />);

    const avatar = screen.getByRole('img', { hidden: true });
    expect(avatar).toHaveAttribute('src', mockMentor.user.avatarUrl);
  });

  it('should show fallback initials when no avatar', () => {
    const mentorWithoutAvatar = {
      ...mockMentor,
      user: {
        ...mockMentor.user,
        avatarUrl: null,
      },
    };

    render(<MentorCard mentor={mentorWithoutAvatar} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should use email initial when no name', () => {
    const mentorWithoutName = {
      ...mockMentor,
      user: {
        ...mockMentor.user,
        name: null,
        avatarUrl: null,
      },
    };

    render(<MentorCard mentor={mentorWithoutName} />);

    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('Unnamed Mentor')).toBeInTheDocument();
  });

  it('should not show handle when not available', () => {
    const mentorWithoutHandle = {
      ...mockMentor,
      user: {
        ...mockMentor.user,
        handle: null,
      },
    };

    render(<MentorCard mentor={mentorWithoutHandle} />);

    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it('should not show expertise section when empty', () => {
    const mentorWithoutExpertise = {
      ...mockMentor,
      expertise: [],
    };

    render(<MentorCard mentor={mentorWithoutExpertise} />);

    expect(screen.queryByText('Expertise')).not.toBeInTheDocument();
  });

  it('should not show sessions when count is zero', () => {
    const mentorWithoutSessions = {
      ...mockMentor,
      sessions: [],
    };

    render(<MentorCard mentor={mentorWithoutSessions} showSessions={true} />);

    expect(screen.queryByText(/upcoming session/i)).not.toBeInTheDocument();
  });
});
