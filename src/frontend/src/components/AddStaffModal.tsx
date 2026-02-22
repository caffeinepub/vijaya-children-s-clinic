import { useState } from 'react';
import { useCreateStaff } from '../hooks/useStaffManagement';
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
import { Loader2, UserPlus } from 'lucide-react';
import { ActivationStatus } from '../backend';

interface AddStaffModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddStaffModal({ open, onClose }: AddStaffModalProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const createStaff = useCreateStaff();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      return;
    }

    try {
      await createStaff.mutateAsync({
        userId: userId.trim(),
        password: password.trim(),
        email: email.trim() || undefined,
        status: ActivationStatus.activated,
      });

      // Reset form and close modal
      setUserId('');
      setPassword('');
      setEmail('');
      onClose();
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error creating staff:', error);
    }
  };

  const handleClose = () => {
    if (!createStaff.isPending) {
      setUserId('');
      setPassword('');
      setEmail('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Staff Account
          </DialogTitle>
          <DialogDescription>
            Create a new staff account with username and password credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">
                User ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter unique user ID"
                disabled={createStaff.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={createStaff.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@example.com"
                disabled={createStaff.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createStaff.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStaff.isPending || !userId.trim() || !password.trim()}
              className="bg-gradient-to-r from-vijaya-cyan-500 to-vijaya-blue-500 hover:from-vijaya-cyan-600 hover:to-vijaya-blue-600"
            >
              {createStaff.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
