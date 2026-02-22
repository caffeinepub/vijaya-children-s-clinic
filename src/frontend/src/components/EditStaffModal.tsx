import { useState, useEffect } from 'react';
import { useUpdateStaff } from '../hooks/useStaffManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { StaffUser, ActivationStatus } from '../backend';

interface EditStaffModalProps {
  open: boolean;
  onClose: () => void;
  staff: StaffUser;
}

export default function EditStaffModal({ open, onClose, staff }: EditStaffModalProps) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(staff.email || '');
  const [status, setStatus] = useState<ActivationStatus>(staff.status);
  const updateStaff = useUpdateStaff();

  // Reset form when staff changes
  useEffect(() => {
    setPassword('');
    setEmail(staff.email || '');
    setStatus(staff.status);
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStaff.mutateAsync({
        userId: staff.userId,
        updatedStaff: {
          userId: staff.userId,
          password: password.trim() || staff.password, // Keep existing password if not changed
          email: email.trim() || undefined,
          status,
        },
      });

      // Reset form and close modal
      setPassword('');
      onClose();
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error updating staff:', error);
    }
  };

  const handleClose = () => {
    if (!updateStaff.isPending) {
      setPassword('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Staff Account
          </DialogTitle>
          <DialogDescription>
            Update account details for <strong>{staff.userId}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-userId">User ID</Label>
              <Input
                id="edit-userId"
                type="text"
                value={staff.userId}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">User ID cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (Optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={updateStaff.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@example.com"
                disabled={updateStaff.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ActivationStatus)}
                disabled={updateStaff.isPending}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ActivationStatus.activated}>Activated</SelectItem>
                  <SelectItem value={ActivationStatus.deactivated}>Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateStaff.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStaff.isPending}
              className="bg-gradient-to-r from-vijaya-cyan-500 to-vijaya-blue-500 hover:from-vijaya-cyan-600 hover:to-vijaya-blue-600"
            >
              {updateStaff.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
