import React from 'react';
import { Badge } from '../ui/Badge';

interface RoomStatusBadgeProps {
  status: 'Available' | 'Occupied' | 'Maintenance';
}

export const RoomStatusBadge = ({ status }: RoomStatusBadgeProps) => {
  if (status === 'Occupied') return <Badge variant="neutral">Đang ở</Badge>;
  if (status === 'Available') return <Badge variant="success">Trống</Badge>;
  return <Badge variant="warning">Bảo trì</Badge>;
};