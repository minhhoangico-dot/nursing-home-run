import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Modal, Select } from '../../../components/ui';
import type { Role, User } from '../../../types';
import {
  FLOOR_OPTIONS,
  ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  requiresFloor,
} from '../lib/userManagement';

const ROLE_VALUES = ROLE_OPTIONS.map((option) => option.value) as [Role, ...Role[]];

const baseSchema = z.object({
  name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  username: z.string().trim().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  role: z.enum(ROLE_VALUES),
  floor: z.string().optional(),
  password: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const createSchema = baseSchema.superRefine((values, context) => {
  if (requiresFloor(values.role) && !values.floor?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['floor'],
      message: 'Trưởng tầng phải có tầng phụ trách.',
    });
  }

  if (!values.password || values.password.trim().length < 6) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Mật khẩu phải có ít nhất 6 ký tự.',
    });
  }
});

const editSchema = baseSchema.superRefine((values, context) => {
  if (requiresFloor(values.role) && !values.floor?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['floor'],
      message: 'Trưởng tầng phải có tầng phụ trách.',
    });
  }

  if (!values.status) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['status'],
      message: 'Vui lòng chọn trạng thái hoạt động.',
    });
  }
});

export type UserFormMode = 'create' | 'edit';

export type UserFormValues = {
  name: string;
  username: string;
  role: Role;
  floor?: string;
  password?: string;
  status?: 'active' | 'inactive';
};

interface UserFormModalProps {
  mode: UserFormMode;
  user?: User;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  disableRole?: boolean;
  disableActiveStatus?: boolean;
}

export const UserFormModal = ({
  mode,
  user,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError,
  disableRole = false,
  disableActiveStatus = false,
}: UserFormModalProps) => {
  const schema = useMemo(() => (mode === 'create' ? createSchema : editSchema), [mode]);
  const formId = `${mode}-user-form`;

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      role: user?.role ?? 'DOCTOR',
      floor: user?.floor ?? '',
      password: '',
      status: user?.isActive === false ? 'inactive' : 'active',
    },
  });

  const selectedRole = watch('role');
  const shouldShowFloor = requiresFloor(selectedRole);

  useEffect(() => {
    if (!shouldShowFloor) {
      setValue('floor', '');
    }
  }, [setValue, shouldShowFloor]);

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button type="submit" form={formId} disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
      </Button>
    </>
  );

  return (
    <Modal
      onClose={onClose}
      title={mode === 'create' ? 'Thêm người dùng mới' : 'Cập nhật người dùng'}
      footer={footer}
      maxWidth="max-w-2xl"
      fullScreenMobile
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          onSubmit({
            ...values,
            role: values.role ?? user?.role ?? 'DOCTOR',
            status: values.status ?? (user?.isActive === false ? 'inactive' : 'active'),
          })
        )}
      >
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Họ và tên"
            placeholder="Ví dụ: Nguyễn Văn A"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Tên đăng nhập"
            placeholder="Ví dụ: nguyenvana"
            error={errors.username?.message}
            {...register('username')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Vai trò"
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            disabled={disableRole || isSubmitting}
            {...register('role')}
          />

          {mode === 'edit' ? (
            <Select
              label="Trạng thái"
              options={[...USER_STATUS_OPTIONS]}
              error={errors.status?.message}
              disabled={disableActiveStatus || isSubmitting}
              {...register('status')}
            />
          ) : (
            <Input
              label="Mật khẩu ban đầu"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              error={errors.password?.message}
              {...register('password')}
            />
          )}
        </div>

        {shouldShowFloor && (
          <Select
            label="Tầng phụ trách"
            options={[{ value: '', label: 'Chọn tầng' }, ...FLOOR_OPTIONS]}
            error={errors.floor?.message}
            disabled={isSubmitting}
            {...register('floor')}
          />
        )}
      </form>
    </Modal>
  );
};
