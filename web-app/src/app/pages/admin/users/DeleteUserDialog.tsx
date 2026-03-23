import * as AlertDialogUI from '@components/ui/alert-dialog';
import type { User } from '@feature/user/types';

interface DeleteUserDialogProps {
  user: User | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteUserDialog({ user, isDeleting, onClose, onConfirm }: DeleteUserDialogProps) {
  return (
    <AlertDialogUI.AlertDialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogUI.AlertDialogContent className="rounded-2xl border-black/10 bg-[#F7F4EC] font-['Outfit']">
        <AlertDialogUI.AlertDialogHeader>
          <AlertDialogUI.AlertDialogTitle className="font-['Sora'] text-xl text-[#04090C]">
            Delete User
          </AlertDialogUI.AlertDialogTitle>
          <AlertDialogUI.AlertDialogDescription className="text-black/60">
            Are you sure you want to delete "{user?.full_name}"? This action cannot be undone.
          </AlertDialogUI.AlertDialogDescription>
        </AlertDialogUI.AlertDialogHeader>
        <AlertDialogUI.AlertDialogFooter>
          <AlertDialogUI.AlertDialogCancel className="rounded-xl border-black/10 bg-transparent text-[#04090C] hover:bg-black/5">
            Cancel
          </AlertDialogUI.AlertDialogCancel>
          <AlertDialogUI.AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500 font-semibold text-white transition-opacity hover:bg-red-500/90"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </AlertDialogUI.AlertDialogAction>
        </AlertDialogUI.AlertDialogFooter>
      </AlertDialogUI.AlertDialogContent>
    </AlertDialogUI.AlertDialog>
  );
}
