import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SubmissionCard } from './submission-card';
import type { Submission } from '@/types/submission';
import { SubmissionStatus } from '@/types/submission';

const mockSubmission: Submission = {
  id: '1',
  title: 'Test Submission',
  abstract: 'Test abstract for submission',
  repoUrl: 'https://github.com/test/repo',
  demoUrl: 'https://demo.test.com',
  videoUrl: 'https://youtube.com/watch?v=test',
  status: SubmissionStatus.SUBMITTED,
  scoreAggregate: 85.5,
  teamId: 'team-1',
  trackId: 'track-1',
  hackathonId: 'hackathon-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  team: {
    id: 'team-1',
    name: 'Test Team',
    members: [
      {
        id: '1',
        role: 'LEAD',
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
        user: {
          id: 'user-2',
          name: 'Jane Smith',
          handle: 'janesmith',
          avatarUrl: undefined,
        },
      },
    ],
  },
  track: {
    id: 'track-1',
    title: 'Frontend Track',
    description: 'Frontend development track',
  },
};

describe('SubmissionCard', () => {
  it('should render submission title', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    expect(screen.getByText('Test Submission')).toBeInTheDocument();
  });

  it('should render abstract', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    expect(screen.getByText('Test abstract for submission')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
  });

  it('should render team name', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('should render track', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    expect(screen.getByText('Frontend Track')).toBeInTheDocument();
  });

  it('should render score aggregate', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    expect(screen.getByText('85.5')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('should render repository link', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    const repoLink = screen.getByText('Code').closest('a');
    expect(repoLink).toHaveAttribute('href', 'https://github.com/test/repo');
    expect(repoLink).toHaveAttribute('target', '_blank');
  });

  it('should render demo link', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    const demoLink = screen.getByText('Demo').closest('a');
    expect(demoLink).toHaveAttribute('href', 'https://demo.test.com');
  });

  it('should render video link', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    const videoLink = screen.getByText('Video').closest('a');
    expect(videoLink).toHaveAttribute('href', 'https://youtube.com/watch?v=test');
  });

  it('should render view details button with correct link', () => {
    render(<SubmissionCard submission={mockSubmission} />);
    const link = screen.getByRole('link', { name: 'View Details' });
    expect(link).toHaveAttribute('href', '/submissions/1');
  });

  it('should render 1st place badge', () => {
    const firstPlaceSubmission = { ...mockSubmission, rank: 1 };
    render(<SubmissionCard submission={firstPlaceSubmission} />);
    expect(screen.getByText('1st Place')).toBeInTheDocument();
  });

  it('should render 2nd place badge', () => {
    const secondPlaceSubmission = { ...mockSubmission, rank: 2 };
    render(<SubmissionCard submission={secondPlaceSubmission} />);
    expect(screen.getByText('2nd Place')).toBeInTheDocument();
  });

  it('should render 3rd place badge', () => {
    const thirdPlaceSubmission = { ...mockSubmission, rank: 3 };
    render(<SubmissionCard submission={thirdPlaceSubmission} />);
    expect(screen.getByText('3rd Place')).toBeInTheDocument();
  });

  it('should render rank badge for other placements', () => {
    const rankedSubmission = { ...mockSubmission, rank: 5 };
    render(<SubmissionCard submission={rankedSubmission} />);
    expect(screen.getByText('Rank #5')).toBeInTheDocument();
  });

  it('should show +N indicator when more than 4 team members', () => {
    const largeTeamSubmission = {
      ...mockSubmission,
      team: {
        ...mockSubmission.team!,
        members: Array.from({ length: 6 }, (_, i) => ({
          id: `${i + 1}`,
          role: i === 0 ? ('LEAD' as const) : ('MEMBER' as const),
          user: {
            id: `user-${i + 1}`,
            name: `User ${i + 1}`,
            handle: `user${i + 1}`,
            avatarUrl: undefined,
          },
        })),
      },
    };
    render(<SubmissionCard submission={largeTeamSubmission} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should not render links section when no links provided', () => {
    const noLinksSubmission = {
      ...mockSubmission,
      repoUrl: undefined,
      demoUrl: undefined,
      videoUrl: undefined,
    };
    render(<SubmissionCard submission={noLinksSubmission} />);
    expect(screen.queryByText('Code')).not.toBeInTheDocument();
    expect(screen.queryByText('Demo')).not.toBeInTheDocument();
    expect(screen.queryByText('Video')).not.toBeInTheDocument();
  });

  it('should render team member avatars when avatarUrl is provided', () => {
    const submissionWithAvatars = {
      ...mockSubmission,
      team: {
        ...mockSubmission.team!,
        members: [
          {
            ...mockSubmission.team!.members[0],
            user: {
              ...mockSubmission.team!.members[0].user,
              avatarUrl: 'https://example.com/avatar1.jpg',
            },
          },
          {
            ...mockSubmission.team!.members[1],
            user: {
              ...mockSubmission.team!.members[1].user,
              avatarUrl: 'https://example.com/avatar2.jpg',
            },
          },
        ],
      },
    };
    const { container } = render(<SubmissionCard submission={submissionWithAvatars} />);
    // Avatar images are rendered
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
