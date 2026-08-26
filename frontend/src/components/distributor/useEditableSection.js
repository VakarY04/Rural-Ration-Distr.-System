// Shared edit-state logic for the admin-configurable panels (delivery
// details, ration items). Keeps the "view → edit → save/cancel" loop in
// one place so both editors stay identical in behaviour.
//
// Drafts are seeded once on mount; parents remount editors (via `key`) when
// fresh server data arrives, which resets the view cleanly after a save.
import { useState } from 'react';
import { api } from '../../services/api';

export function useEditableSection({ endpoint, buildPayload, initial, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEditing = () => {
    setDraft(initial);
    setError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setError('');
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api(endpoint, 'PUT', buildPayload(draft));
      setEditing(false);
      onSaved?.();
      return true;
    } catch (e) {
      setError(e.message || 'Could not save changes.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { editing, draft, setDraft, saving, error, startEditing, cancelEditing, save };
}
