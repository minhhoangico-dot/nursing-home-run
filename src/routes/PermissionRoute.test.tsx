import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PermissionRoute } from './PermissionRoute';
import { useModuleReadOnly } from './ModuleAccessContext';

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: vi.fn(),
}));

import { useModuleAccess } from '@/src/hooks/useModuleAccess';

const ReadOnlyConsumer = () => {
  const readOnly = useModuleReadOnly();
  return <div>read-only: {String(readOnly)}</div>;
};

describe('PermissionRoute', () => {
  it('renders children in read-only mode for hidden residents routes', () => {
    vi.mocked(useModuleAccess).mockReturnValue({
      mode: 'readOnly',
      visible: false,
      canViewFinance: false,
      canEditFinance: false,
    });

    render(
      <PermissionRoute moduleKey="residents">
        <div>Residents Screen</div>
      </PermissionRoute>,
    );

    expect(screen.getByText('Residents Screen')).toBeInTheDocument();
    expect(screen.getByText(/Chế độ xem/i)).toBeInTheDocument();
  });

  it('provides read-only access mode to routed children', () => {
    vi.mocked(useModuleAccess).mockReturnValue({
      mode: 'readOnly',
      visible: false,
      canViewFinance: false,
      canEditFinance: false,
    });

    render(
      <PermissionRoute moduleKey="residents">
        <ReadOnlyConsumer />
      </PermissionRoute>,
    );

    expect(screen.getByText('read-only: true')).toBeInTheDocument();
  });

  it('shows the restricted panel when finance view is disabled', () => {
    vi.mocked(useModuleAccess).mockReturnValue({
      mode: 'restricted',
      visible: false,
      canViewFinance: false,
      canEditFinance: false,
    });

    render(
      <PermissionRoute moduleKey="finance">
        <div>Finance Screen</div>
      </PermissionRoute>,
    );

    expect(screen.getByText(/Không có quyền truy cập Tài chính/i)).toBeInTheDocument();
    expect(screen.getByText(/module tài chính/i)).toBeInTheDocument();
  });
});
