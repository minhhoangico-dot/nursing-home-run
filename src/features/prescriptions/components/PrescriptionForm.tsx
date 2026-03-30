import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Resident, User } from '@/src/types';

interface PrescriptionFormProps {
  user: User;
  resident?: Resident;
  residents?: Resident[];
  onClose: () => void;
  onSave: () => void;
}

export const PrescriptionForm = ({
  resident,
  residents,
  onClose,
}: PrescriptionFormProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const targetResidentId = resident?.id ?? residents?.[0]?.id;

    if (!targetResidentId) {
      onClose();
      return;
    }

    navigate(`/residents/${targetResidentId}/medications/new`);
    onClose();
  }, [navigate, onClose, resident?.id, residents]);

  return null;
};
