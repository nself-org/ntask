import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DevModeIndicator } from '../dashboard/dev-mode-indicator';

vi.mock('@/lib/env', () => ({
  env: {
    enableDevTools: true,
    isDevelopment: true,
  },
  getEnvironmentName: vi.fn(() => 'Development'),
  getEnvironmentColor: vi.fn(() => '#10b981'),
}));

describe('DevModeIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render in development mode', async () => {
    render(<DevModeIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
    });
  });

  it('should show pulsing animation indicator', async () => {
    const { container } = render(<DevModeIndicator />);

    await waitFor(() => {
      const pulsingElement = container.querySelector('.animate-ping');
      expect(pulsingElement).toBeInTheDocument();
    });
  });
});
