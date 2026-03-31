import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PermissionRoute } from './PermissionRoute';

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: vi.fn(),
}));

import { useModuleAccess } from '@/src/hooks/useModuleAccess';

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
