import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditPreferencesModal from '../EditPreferencesModal';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Mock client
vi.mock('../../api/client', () => ({
  default: {
    put: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('EditPreferencesModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockUpdateUser = vi.fn();

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    preferences: {
      favoriteCoins: ['BTC', 'ETH'],
      investorType: 'HODLer' as const,
      contentPreferences: ['Market News', 'Charts'] as const,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
    });
  });

  it('should not render when isOpen is false', () => {
    render(
      <EditPreferencesModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Edit Preferences')).not.toBeInTheDocument();
  });

  it('should render with initial preferences pre-selected', () => {
    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    
    // Check Coins
    expect(screen.getByRole('button', { name: 'BTC' })).toHaveClass('bg-blue-100');
    expect(screen.getByRole('button', { name: 'SOL' })).not.toHaveClass('bg-blue-100');

    // Check Investor Type
    expect(screen.getByRole('button', { name: 'HODLer' })).toHaveClass('bg-blue-100');
    expect(screen.getByRole('button', { name: 'Day Trader' })).not.toHaveClass('bg-blue-100');

    // Check Content Preferences
    expect(screen.getByText('Market News').closest('button')).toHaveClass('bg-blue-100');
    expect(screen.getByText('Charts').closest('button')).toHaveClass('bg-blue-100');
    expect(screen.getByText('Fun').closest('button')).not.toHaveClass('bg-blue-100');
  });

  it('should handle interactions correctly', async () => {
    const user = userEvent.setup();
    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Toggle Coin
    const solButton = screen.getByRole('button', { name: 'SOL' });
    await user.click(solButton);
    expect(solButton).toHaveClass('bg-blue-100');

    // Change Investor Type
    const dayTraderButton = screen.getByRole('button', { name: 'Day Trader' });
    await user.click(dayTraderButton);
    expect(dayTraderButton).toHaveClass('bg-blue-100');
    expect(screen.getByRole('button', { name: 'HODLer' })).not.toHaveClass('bg-blue-100');

    // Toggle Content Preferences
    const funButton = screen.getByText('Fun').closest('button')!;
    await user.click(funButton);
    expect(funButton).toHaveClass('bg-blue-100');
  });

  it('should disable save button if validation fails', async () => {
    const user = userEvent.setup();
    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Deselect all coins
    await user.click(screen.getByRole('button', { name: 'BTC' }));
    await user.click(screen.getByRole('button', { name: 'ETH' }));
    
    expect(screen.getByText('Select at least one coin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Preferences' })).toBeDisabled();

    // Re-select a coin to fix it
    await user.click(screen.getByRole('button', { name: 'BTC' }));
    expect(screen.queryByText('Select at least one coin.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Preferences' })).not.toBeDisabled();
  });

  it('should handle successful submission', async () => {
    const user = userEvent.setup();
    (client.put as any).mockResolvedValue({ data: { message: 'Success' } });

    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Change some preferences
    await user.click(screen.getByRole('button', { name: 'SOL' })); // Add SOL
    await user.click(screen.getByRole('button', { name: 'Day Trader' })); // Change investor type

    // Click Save
    await user.click(screen.getByRole('button', { name: 'Save Preferences' }));

    // Verify loading state (might happen too fast to see, but logic ensures it)
    
    // Check API call
    expect(client.put).toHaveBeenCalledWith('/user/preferences', {
      preferences: {
        favoriteCoins: ['BTC', 'ETH', 'SOL'],
        investorType: 'Day Trader',
        contentPreferences: ['Market News', 'Charts'],
      },
    });

    // Check Context Update
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        ...mockUser,
        preferences: {
          favoriteCoins: ['BTC', 'ETH', 'SOL'],
          investorType: 'Day Trader',
          contentPreferences: ['Market News', 'Charts'],
        },
      });
    });

    // Check callbacks
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (client.put as any).mockRejectedValue(new Error('API Error'));

    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save Preferences' }));

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
    
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
