export const ReadOnlyBanner = ({
  message = 'Chế độ xem: bạn có thể xem nội dung nhưng không thể chỉnh sửa.',
}: {
  message?: string;
}) => (
  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    {message}
  </div>
);
