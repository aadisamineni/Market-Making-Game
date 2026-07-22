import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('round form validation and submission', () => {
  it('does not change bankroll for invalid wagers', () => {
    render(<App />);
    fireEvent.change(screen.getAllByPlaceholderText('0.00')[0], { target: { value: '-1' } });
    expect(screen.getByText('Use a nonnegative dollar amount with up to two decimals.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Round' })).toBeDisabled();
    expect(screen.getByText('$2,298.00')).toBeInTheDocument();
  });

  it('settles once and prevents a double submission of the active round', () => {
    render(<App />);
    const input = screen.getAllByPlaceholderText('0.00')[0];
    const question = input.closest('tr')?.querySelector('th')?.textContent;
    fireEvent.change(input, { target: { value: '10' } });
    expect(input.closest('tr')?.querySelector('th')?.textContent).toBe(question);
    const submit = screen.getByRole('button', { name: 'Submit Round' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    // The current result and its history entry both show the same settled round.
    expect(screen.getAllByText(/Round 1 Breakdown/)).toHaveLength(2);
    expect(screen.getByText('Round').parentElement).toHaveTextContent('Round2');
    expect(screen.getByRole('button', { name: 'Submit Round' })).toBeDisabled();
  });
});
