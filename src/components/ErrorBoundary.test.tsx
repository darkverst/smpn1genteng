import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws on demand
function ProblemChild({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test Runtime Explosion');
  }
  return <div data-testid="child-ok">Semua Berjalan Normal</div>;
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error in tests to keep test output clean
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-ok')).toBeInTheDocument();
    expect(screen.getByText('Semua Berjalan Normal')).toBeInTheDocument();
  });

  it('catches runtime error and displays Indonesian fallback UI', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('child-ok')).not.toBeInTheDocument();
    expect(screen.getByText('Terjadi Kendala pada Halaman')).toBeInTheDocument();
    expect(screen.getByText(/Aplikasi mengalami kesalahan teknis yang tidak terduga/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /muat ulang halaman/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /coba pulihkan/i })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('Test Runtime Explosion');
  });

  it('allows expanding technical details accordion', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsButton = screen.getByText(/detail teknis/i);
    expect(screen.queryByText(/Test Runtime Explosion/)).not.toBeInTheDocument();

    fireEvent.click(detailsButton);

    expect(screen.getAllByText(/Test Runtime Explosion/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/salin error/i)).toBeInTheDocument();
  });

  it('supports custom function fallback', () => {
    render(
      <ErrorBoundary
        fallback={({ error, resetErrorBoundary }) => (
          <div>
            <p>Custom Error: {error.message}</p>
            <button onClick={resetErrorBoundary}>Reset Custom</button>
          </div>
        )}
      >
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error: Test Runtime Explosion')).toBeInTheDocument();
    expect(screen.getByText('Reset Custom')).toBeInTheDocument();
  });

  it('resets error state when reset button is clicked', () => {
    function ParentContainer() {
      const [hasError, setHasError] = useState(true);
      return (
        <ErrorBoundary onReset={() => setHasError(false)}>
          <ProblemChild shouldThrow={hasError} />
        </ErrorBoundary>
      );
    }

    render(<ParentContainer />);

    expect(screen.getByText('Terjadi Kendala pada Halaman')).toBeInTheDocument();
    const recoverButton = screen.getByRole('button', { name: /coba pulihkan/i });
    fireEvent.click(recoverButton);

    expect(screen.getByTestId('child-ok')).toBeInTheDocument();
  });
});
