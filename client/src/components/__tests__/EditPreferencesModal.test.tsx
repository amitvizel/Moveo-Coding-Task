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
      riskTolerance: 'moderate',
      contentFocus: ['news', 'technical'],
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

    // Check Risk Tolerance
    expect(screen.getByRole('button', { name: 'moderate' })).toHaveClass('bg-blue-100');
    expect(screen.getByRole('button', { name: 'aggressive' })).not.toHaveClass('bg-blue-100');

    // Check Content Focus
    expect(screen.getByText('Market News').closest('button')).toHaveClass('bg-blue-100');
    expect(screen.getByText('Memes & Fun').closest('button')).not.toHaveClass('bg-blue-100');
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

    // Change Risk Tolerance
    const aggressiveButton = screen.getByRole('button', { name: 'aggressive' });
    await user.click(aggressiveButton);
    expect(aggressiveButton).toHaveClass('bg-blue-100');
    expect(screen.getByRole('button', { name: 'moderate' })).not.toHaveClass('bg-blue-100');

    // Toggle Content Focus
    const memesButton = screen.getByText('Memes & Fun').closest('button')!;
    await user.click(memesButton);
    expect(memesButton).toHaveClass('bg-blue-100');
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
    await user.click(screen.getByRole('button', { name: 'aggressive' })); // Change risk

    // Click Save
    await user.click(screen.getByRole('button', { name: 'Save Preferences' }));

    // Verify loading state (might happen too fast to see, but logic ensures it)
    
    // Check API call
    expect(client.put).toHaveBeenCalledWith('/user/preferences', {
      preferences: {
        favoriteCoins: ['BTC', 'ETH', 'SOL'],
        riskTolerance: 'aggressive',
        contentFocus: ['news', 'technical'],
      },
    });

    // Check Context Update
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        ...mockUser,
        preferences: {
          favoriteCoins: ['BTC', 'ETH', 'SOL'],
          riskTolerance: 'aggressive',
          contentFocus: ['news', 'technical'],
        },
      });
    });

    // Check callbacks
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
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
        expect(alertMock).toHaveBeenCalledWith('Failed to save preferences. Please try again.');
    });
    
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    alertMock.mockRestore();
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
