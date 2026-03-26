import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Modal } from '../../../components/ui';

const resetPasswordSchema = z
  .object({
    password: z.string().trim().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().trim().min(6, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Xác nhận mật khẩu chưa khớp.',
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  userName: string;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const ResetPasswordModal = ({
  userName,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError,
}: ResetPasswordModalProps) => {
  const formId = 'reset-password-form';
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button type="submit" form={formId} disabled={isSubmitting}>
        {isSubmitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
      </Button>
    </>
  );

  return (
    <Modal onClose={onClose} title={`Đặt lại mật khẩu cho ${userName}`} footer={footer} maxWidth="max-w-lg">
      <form
        id={formId}
        className="space-y-4"
        onSubmit={handleSubmit((values) => onSubmit(values.password))}
      >
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Input
          label="Mật khẩu mới"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </form>
    </Modal>
  );
};
