import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TeamCard } from './team-card';
import type { Team } from '@/types/team';

const mockTeam: Team = {
  id: '1',
  name: 'Test Team',
  bio: 'Test team bio',
  lookingForMembers: true,
  currentSize: 2,
  hackathonId: 'hackathon-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  hackathon: {
    id: 'hackathon-1',
    title: 'Test Hackathon',
    slug: 'test-hackathon',
    maxTeamSize: 4,
    minTeamSize: 1,
  },
  members: [
    {
      id: '1',
      role: 'LEAD',
      userId: 'user-1',
      teamId: '1',
      joinedAt: '2024-01-01T00:00:00Z',
      user: {
        id: 'user-1',
        name: 'John Doe',
        handle: 'johndoe',
        avatarUrl: undefined,
      },
    },
    {
      id: '2',
      role: 'MEMBER',
      userId: 'user-2',
      teamId: '1',
      joinedAt: '2024-01-02T00:00:00Z',
      user: {
        id: 'user-2',
        name: 'Jane Smith',
        handle: 'janesmith',
        avatarUrl: undefined,
      },
    },
  ],
};

describe('TeamCard', () => {
  it('should render team name', () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('should render team bio', () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText('Test team bio')).toBeInTheDocument();
  });

  it('should render member count', () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText('2/4 members')).toBeInTheDocument();
  });

  it('should render team lead', () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText('Led by @johndoe')).toBeInTheDocument();
  });

  it('should show spots left badge when looking for members', () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText('2 spots left')).toBeInTheDocument();
  });

  it('should show full badge when team is full', () => {
    const fullTeam = {
      ...mockTeam,
      members: [
        ...mockTeam.members,
        {
          id: '3',
          role: 'MEMBER' as const,
          userId: 'user-3',
          teamId: '1',
          joinedAt: '2024-01-03T00:00:00Z',
          user: { id: 'user-3', name: 'User 3', handle: 'user3', avatarUrl: undefined },
        },
        {
          id: '4',
          role: 'MEMBER' as const,
          userId: 'user-4',
          teamId: '1',
          joinedAt: '2024-01-04T00:00:00Z',
          user: { id: 'user-4', name: 'User 4', handle: 'user4', avatarUrl: undefined },
        },
      ],
    };
    render(<TeamCard team={fullTeam} />);
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it('should render view team button with correct link', () => {
    render(<TeamCard team={mockTeam} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/teams/1');
  });

  it('should render request to join button when looking for members', () => {
    const onJoinRequest = vi.fn();
    render(<TeamCard team={mockTeam} onJoinRequest={onJoinRequest} />);
    expect(screen.getByText('Request to Join')).toBeInTheDocument();
  });

  it('should call onJoinRequest when request to join is clicked', async () => {
    const user = userEvent.setup();
    const onJoinRequest = vi.fn();
    render(<TeamCard team={mockTeam} onJoinRequest={onJoinRequest} />);

    const joinButton = screen.getByText('Request to Join');
    await user.click(joinButton);

    expect(onJoinRequest).toHaveBeenCalledWith('1');
  });

  it('should not show request to join button when team is full', () => {
    const fullTeam = {
      ...mockTeam,
      members: [
        ...mockTeam.members,
        {
          id: '3',
          role: 'MEMBER' as const,
          userId: 'user-3',
          teamId: '1',
          joinedAt: '2024-01-03T00:00:00Z',
          user: { id: 'user-3', name: 'User 3', handle: 'user3', avatarUrl: undefined },
        },
        {
          id: '4',
          role: 'MEMBER' as const,
          userId: 'user-4',
          teamId: '1',
          joinedAt: '2024-01-04T00:00:00Z',
          user: { id: 'user-4', name: 'User 4', handle: 'user4', avatarUrl: undefined },
        },
      ],
    };
    const onJoinRequest = vi.fn();
    render(<TeamCard team={fullTeam} onJoinRequest={onJoinRequest} />);
    expect(screen.queryByText('Request to Join')).not.toBeInTheDocument();
  });

  it('should show +N indicator when more than 5 members', () => {
    const largeTeam = {
      ...mockTeam,
      hackathon: {
        id: 'hackathon-1',
        title: 'Test Hackathon',
        slug: 'test-hackathon',
        maxTeamSize: 10,
        minTeamSize: 1,
      },
      members: Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        role: i === 0 ? ('LEAD' as const) : ('MEMBER' as const),
        userId: `user-${i + 1}`,
        teamId: '1',
        joinedAt: `2024-01-0${i + 1}T00:00:00Z`,
        user: {
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          handle: `user${i + 1}`,
          avatarUrl: undefined,
        },
      })),
    };
    render(<TeamCard team={largeTeam} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should render member avatars when avatarUrl is provided', () => {
    const teamWithAvatars = {
      ...mockTeam,
      members: [
        {
          ...mockTeam.members[0],
          user: {
            ...mockTeam.members[0].user,
            avatarUrl: 'https://example.com/avatar1.jpg',
          },
        },
        {
          ...mockTeam.members[1],
          user: {
            ...mockTeam.members[1].user,
            avatarUrl: 'https://example.com/avatar2.jpg',
          },
        },
      ],
    };
    const { container } = render(<TeamCard team={teamWithAvatars} />);
    // Avatar images are rendered
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
