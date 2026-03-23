import * as AlertDialogUI from '@components/ui/alert-dialog';

interface DeletePMBEntityDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePMBEntityDialog({
  isOpen,
  title,
  description,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePMBEntityDialogProps) {
  return (
    <AlertDialogUI.AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogUI.AlertDialogContent className="rounded-2xl border-black/10 bg-[#F7F4EC] font-['Outfit']">
        <AlertDialogUI.AlertDialogHeader>
          <AlertDialogUI.AlertDialogTitle className="font-['Sora'] text-xl text-[#04090C]">
            {title}
          </AlertDialogUI.AlertDialogTitle>
          <AlertDialogUI.AlertDialogDescription className="text-black/60">
            {description}
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
