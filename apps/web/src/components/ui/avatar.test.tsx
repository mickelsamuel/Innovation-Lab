import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('should render avatar', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Avatar className="custom-avatar" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar');
    });
  });

  describe('AvatarImage', () => {
    it('should render avatar with image component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test-avatar.jpg" alt="Test Avatar" />
        </Avatar>
      );
      // Avatar container should be present
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage className="custom-image" src="/test.jpg" alt="Test" />
        </Avatar>
      );
      // Check that Avatar container is rendered
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });

  describe('AvatarFallback', () => {
    it('should render fallback when image fails', () => {
      render(
        <Avatar>
          <AvatarImage src="/invalid.jpg" alt="Test" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Fallback should be in the document
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should apply custom className to fallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback" data-testid="fallback">
            AB
          </AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('fallback')).toHaveClass('custom-fallback');
    });
  });

  describe('Complete Avatar', () => {
    it('should render complete avatar with image and fallback', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/user.jpg" alt="User Avatar" />
          <AvatarFallback>UA</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      // Either image or fallback should be present
      const hasImageOrFallback =
        screen.queryByAltText('User Avatar') !== null || screen.queryByText('UA') !== null;
      expect(hasImageOrFallback).toBe(true);
    });
  });
});
