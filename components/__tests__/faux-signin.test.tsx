import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FauxSignin } from '../auth/faux-signin';

const mockAccounts = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    displayName: 'Admin User',
    description: 'Full admin access',
  },
  {
    email: 'test@example.com',
    password: 'test123',
    displayName: 'Test User',
    description: 'Standard test account',
  },
];

vi.mock('@/lib/faux-signin', () => ({
  getFauxAccounts: vi.fn(() => mockAccounts),
}));

describe('FauxSignin Component', () => {
  const mockOnSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSignIn.mockResolvedValue(undefined);
  });

  it('should render after mount when accounts are available', async () => {
    render(<FauxSignin onSignIn={mockOnSignIn} />);

    await waitFor(() => {
      expect(screen.getByText('Quick Sign In (Dev Only)')).toBeInTheDocument();
    });
  });

  it('should display all test accounts', async () => {
    render(<FauxSignin onSignIn={mockOnSignIn} />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should call onSignIn when account button is clicked', async () => {
    const user = userEvent.setup();
    render(<FauxSignin onSignIn={mockOnSignIn} />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const adminButton = screen.getByText('Admin User').closest('button');
    await user.click(adminButton!);

    expect(mockOnSignIn).toHaveBeenCalledWith('admin@example.com', 'admin123');
  });
});
