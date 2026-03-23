import * as Icons from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@components/ui/button';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateRoadmapItem } from '@feature/roadmap/hooks';
import {
  roadmapItemSchema,
  type CreateRoadmapItemRequest,
  type Roadmap,
  type RoadmapItemFormData,
} from '@feature/roadmap/types';

interface RoadmapItemCreateModalProps {
  roadmap: Roadmap;
  isOpen: boolean;
  onClose: () => void;
}

type RoadmapItemFormInput = z.input<typeof roadmapItemSchema>;

export function RoadmapItemCreateModal({ roadmap, isOpen, onClose }: RoadmapItemCreateModalProps) {
  const { mutate: createItem, isPending } = useCreateRoadmapItem();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoadmapItemFormInput, unknown, RoadmapItemFormData>({
    resolver: zodResolver(roadmapItemSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      roadmap_id: roadmap.id,
      item_text: '',
      sort_order: 0,
    },
  });

  useEffect(() => {
    reset({
      roadmap_id: roadmap.id,
      item_text: '',
      sort_order: 0,
    });
  }, [roadmap.id, reset]);

  const handleClose = () => {
    reset({
      roadmap_id: roadmap.id,
      item_text: '',
      sort_order: 0,
    });
    onClose();
  };

  const onSubmit: SubmitHandler<RoadmapItemFormData> = (data) => {
    const payload: CreateRoadmapItemRequest = {
      roadmap_id: data.roadmap_id,
      item_text: data.item_text,
      sort_order: data.sort_order,
    };

    createItem(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <DialogUI.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogUI.DialogContent className="max-w-2xl gap-0 border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
        <LayoutUI.Column gap="gap-4" className="px-5 py-5 sm:px-6 sm:py-6">
          <DialogUI.DialogHeader className="space-y-1 text-left">
            <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
              Add Roadmap Item
            </DialogUI.DialogTitle>
            <DialogUI.DialogDescription className="text-sm text-black/60">
              Add a new milestone to {roadmap.title}
            </DialogUI.DialogDescription>
          </DialogUI.DialogHeader>

          <LayoutUI.Container className="rounded-xl border border-black/10 px-4 py-3">
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" className="text-xs font-medium">Roadmap</Text>
                <Text variant="inverse" className="text-sm font-medium">{roadmap.title}</Text>
              </LayoutUI.Column>
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" className="text-xs font-medium">Program</Text>
                <Text variant="inverse" className="text-sm font-medium capitalize">{roadmap.program || 'General'}</Text>
              </LayoutUI.Column>
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" className="text-xs font-medium">Month</Text>
                <Text variant="inverse" className="text-sm font-medium">Bulan {roadmap.month_number}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
          </LayoutUI.Container>

          <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)} gap="sm">
            <LayoutUI.Column gap="gap-5">
              <FormUI.FormField id="item_text" label="Item Text" error={errors.item_text?.message} tone="inverse">
                <Textarea id="item_text" {...register('item_text')} rows={5} />
              </FormUI.FormField>

              <LayoutUI.Container className="max-w-xs">
                <FormUI.FormField id="sort_order" label="Sort Order" error={errors.sort_order?.message} tone="inverse">
                  <Input id="sort_order" type="number" {...register('sort_order')} hasError={Boolean(errors.sort_order)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="ghost-inverse" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : 'Create Item'}
                </Button>
              </FormUI.FormFooter>
            </LayoutUI.Column>
          </FormUI.FormRoot>
        </LayoutUI.Column>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
