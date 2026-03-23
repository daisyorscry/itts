import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { useAdminHeader } from '@components/header/context';

export function AdminHeaderLogoutDialog({
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  open?: boolean;
  isPending?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
}) {
  const context = useAdminHeader();
  const resolvedOpen = open ?? context.showLogoutConfirm;
  const resolvedPending = isPending ?? context.isPending;
  const resolvedOnOpenChange = onOpenChange ?? context.setShowLogoutConfirm;
  const resolvedOnConfirm = onConfirm ?? context.handleLogoutConfirm;

  return (
    <AlertDialog open={resolvedOpen} onOpenChange={resolvedOnOpenChange}>
      <AlertDialogContent className="font-['Outfit'] rounded-2xl border-black/10 bg-[#F7F4EC]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-['Sora'] text-xl text-[#04090C]">
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-black/60">
            Are you sure you want to logout? You will be redirected to the homepage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-xl border-black/10 bg-transparent text-[#04090C] hover:bg-black/5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={resolvedOnConfirm}
            disabled={resolvedPending}
            className="rounded-xl font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#29E68C', color: '#04090C' }}
          >
            {resolvedPending ? 'Logging out...' : 'Yes, Logout'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
