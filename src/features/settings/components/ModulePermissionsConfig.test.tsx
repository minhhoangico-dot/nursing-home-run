import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ROLE_MODULE_PERMISSIONS } from '@/src/utils/modulePermissions';
import { ModulePermissionsConfig } from './ModulePermissionsConfig';

describe('ModulePermissionsConfig', () => {
  it('forces finance view on when finance edit is enabled', () => {
    const onSave = vi.fn();

    render(
      <ModulePermissionsConfig
        value={DEFAULT_ROLE_MODULE_PERMISSIONS}
        isSaving={false}
        onSave={onSave}
        onReset={() => {}}
      />,
    );

    fireEvent.click(screen.getByLabelText('DOCTOR-finance-edit'));
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        DOCTOR: expect.objectContaining({
          finance: { view: true, edit: true },
        }),
      }),
    );
  });

  it('keeps ADMIN settings locked on', () => {
    render(
      <ModulePermissionsConfig
        value={DEFAULT_ROLE_MODULE_PERMISSIONS}
        isSaving={false}
        onSave={() => {}}
        onReset={() => {}}
      />,
    );

    expect(screen.getByLabelText('ADMIN-settings-visible')).toBeDisabled();
  });
});
