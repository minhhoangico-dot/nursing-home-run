import React from 'react';
import type { User } from '../../../types';
import { UserFormModal } from './UserFormModal';

interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: User) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const AddUserModal = ({
  onClose,
  onSave,
  isSubmitting = false,
  submitError,
}: AddUserModalProps) => (
  <UserFormModal
    mode="create"
    onClose={onClose}
    isSubmitting={isSubmitting}
    submitError={submitError}
    onSubmit={async (values) => {
      await onSave({
        id: crypto.randomUUID(),
        name: values.name,
        username: values.username,
        password: values.password,
        role: values.role,
        floor: values.floor?.trim() || undefined,
        isActive: true,
      });
    }}
  />
);
