import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { TestProviders } from './test-providers';

/**
 * Custom render function that includes all necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
