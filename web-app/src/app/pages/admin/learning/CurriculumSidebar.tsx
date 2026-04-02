import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import { DataTable, type DataTableColumn } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateSection, useDeleteSection, useUpdateSection } from '@feature/learning/hooks';
import { type CourseSection, sectionFormSchema, type CreateSectionRequest, type UpdateSectionRequest } from '@feature/learning/types';
import { useCourseBuilderContext } from './course-builder.context';
import { useSelectedSection } from './course-builder.hooks';
import { buildDefaultSectionDraft } from './course-builder.shared';

interface CurriculumSidebarProps {
  mode?: 'manage' | 'pick';
}

function getFirstErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form fields.';
}

function createSectionColumns(options: {
  isManageMode: boolean;
  isDeletingSection: boolean;
  sections: CourseSection[];
  selectedSectionId: string;
  onSelect: (section: CourseSection) => void;
  onEdit: (section: CourseSection) => void;
  onMove: (section: CourseSection, direction: 'up' | 'down') => void;
  onDelete: (section: CourseSection) => void;
}): Array<DataTableColumn<CourseSection>> {
  const { isManageMode, isDeletingSection, sections, selectedSectionId, onSelect, onEdit, onMove, onDelete } = options;

  return [
    {
      id: 'section',
      header: 'Section',
      cell: ({ row, rowIndex }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className={`font-medium ${selectedSectionId === row.id ? 'text-[#29E68C]' : ''}`}>
            {rowIndex + 1}. {row.title}
          </Text>
          <Text variant="muted-inverse" size="xs">
            {row.description || 'No section description'}
          </Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'lessons',
      header: 'Lessons',
      align: 'right',
      cell: ({ row }) => <Text variant="muted-inverse">{row.lessons?.length ?? 0}</Text>,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: ({ row }) => {
        const sectionIndex = sections.findIndex((section) => section.id === row.id);

        return (
          <LayoutUI.Row className="justify-end gap-1">
            <Button type="button" variant="ghost-inverse" size="sm" onClick={() => onSelect(row)}>
              Select
            </Button>
            {isManageMode ? (
              <>
                <Button type="button" variant="ghost-inverse" size="sm" onClick={() => onEdit(row)}>
                  Edit
                </Button>
                <Button type="button" variant="ghost-inverse" size="icon" disabled={sectionIndex === 0} onClick={() => onMove(row, 'up')}>
                  <Icons.ChevronUp size={16} />
                </Button>
                <Button type="button" variant="ghost-inverse" size="icon" disabled={sectionIndex === sections.length - 1} onClick={() => onMove(row, 'down')}>
                  <Icons.ChevronDown size={16} />
                </Button>
                <Button type="button" variant="ghost-inverse" size="icon" disabled={isDeletingSection} onClick={() => onDelete(row)}>
                  <Icons.Trash2 size={16} />
                </Button>
              </>
            ) : null}
          </LayoutUI.Row>
        );
      },
    },
  ];
}

export function CurriculumSidebar({ mode = 'manage' }: CurriculumSidebarProps) {
  const { courseId, setSelectedSectionId } = useCourseBuilderContext();
  const { sections, selectedSection } = useSelectedSection();
  const { mutate: createSection, isPending: isCreatingSection } = useCreateSection();
  const { mutate: updateSection, mutateAsync: updateSectionAsync, isPending: isUpdatingSection } = useUpdateSection();
  const { mutate: deleteSection, isPending: isDeletingSection } = useDeleteSection();

  const [newSectionDraft, setNewSectionDraft] = useState(buildDefaultSectionDraft());
  const [sectionDraft, setSectionDraft] = useState(buildDefaultSectionDraft());
  const [editingSectionId, setEditingSectionId] = useState('');
  const [pendingSectionTitle, setPendingSectionTitle] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showEditSection, setShowEditSection] = useState(false);

  const isManageMode = mode === 'manage';

  useEffect(() => {
    if (!sections.length) {
      setSectionDraft(buildDefaultSectionDraft());
      setNewSectionDraft(buildDefaultSectionDraft());
      setEditingSectionId('');
      setShowEditSection(false);
      return;
    }

    const pendingSection = pendingSectionTitle
      ? sections.find((section) => section.title.toLowerCase() === pendingSectionTitle.toLowerCase())
      : null;
    if (pendingSection) {
      setSelectedSectionId(pendingSection.id);
      setPendingSectionTitle('');
      setEditingSectionId(pendingSection.id);
      setSectionDraft({
        title: pendingSection.title,
        description: pendingSection.description ?? '',
        sort_order: pendingSection.sort_order,
      });
      setShowAddSection(false);
      setShowEditSection(true);
    }

    setNewSectionDraft(buildDefaultSectionDraft(sections.length));
  }, [pendingSectionTitle, sections, setSelectedSectionId]);

  useEffect(() => {
    if (!selectedSection || editingSectionId) {
      return;
    }

    setSectionDraft({
      title: selectedSection.title,
      description: selectedSection.description ?? '',
      sort_order: selectedSection.sort_order,
    });
  }, [editingSectionId, selectedSection]);

  const handleCreateSection = () => {
    const parsed = sectionFormSchema.safeParse(newSectionDraft);
    if (!parsed.success) {
      toast.error(getFirstErrorMessage(parsed.error));
      return;
    }

    const payload: CreateSectionRequest = {
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      sort_order: parsed.data.sort_order,
    };

    setPendingSectionTitle(parsed.data.title);
    createSection(
      { courseId, payload },
      {
        onSuccess: () => setNewSectionDraft(buildDefaultSectionDraft(sections.length + 1)),
      },
    );
  };

  const handleSaveSection = () => {
    if (!editingSectionId) {
      return;
    }

    const parsed = sectionFormSchema.safeParse(sectionDraft);
    if (!parsed.success) {
      toast.error(getFirstErrorMessage(parsed.error));
      return;
    }

    const payload: UpdateSectionRequest = {
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      sort_order: parsed.data.sort_order,
    };

    updateSection({ id: editingSectionId, payload });
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex((item) => item.id === sectionId);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= sections.length) {
      return;
    }

    const current = sections[currentIndex];
    const target = sections[swapIndex];
    try {
      await Promise.all([
        updateSectionAsync({ id: current.id, payload: { sort_order: target.sort_order }, silent: true }),
        updateSectionAsync({ id: target.id, payload: { sort_order: current.sort_order }, silent: true }),
      ]);
      toast.success('Section order updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reorder sections');
    }
  };

  const sectionColumns = useMemo(
    () =>
      createSectionColumns({
        isManageMode,
        isDeletingSection,
        sections,
        selectedSectionId: selectedSection?.id ?? '',
        onSelect: (section) => setSelectedSectionId(section.id),
        onEdit: (section) => {
          setSelectedSectionId(section.id);
          setEditingSectionId(section.id);
          setSectionDraft({
            title: section.title,
            description: section.description ?? '',
            sort_order: section.sort_order,
          });
          setShowEditSection(true);
        },
        onMove: (section, direction) => {
          void handleMoveSection(section.id, direction);
        },
        onDelete: (section) => {
          if (!window.confirm(`Delete section "${section.title}"?`)) {
            return;
          }
          deleteSection(section.id);
        },
      }),
    [deleteSection, isDeletingSection, isManageMode, sections, selectedSection?.id, setSelectedSectionId],
  );

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Column gap="gap-2">
          <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">
            Curriculum
          </Text>
          <Text variant="muted-inverse">
            {isManageMode ? 'Manage sections from this table. Lessons are handled in the Lesson view.' : 'Choose a section first, then continue in the Lesson view.'}
          </Text>
        </LayoutUI.Column>

        {isManageMode ? (
          <Button type="button" variant={showAddSection ? 'accent' : 'ghost-inverse'} size="sm" onClick={() => setShowAddSection((current) => !current)}>
            <Icons.Plus size={16} />
            Add section
          </Button>
        ) : null}
      </LayoutUI.Row>

      <CardUI.Card tone="inverse" className="overflow-hidden">
        <DataTable
          data={sections}
          columns={sectionColumns}
          rowKey="id"
          emptyMessage="No sections yet. Start by adding the first section."
          rowClassName={(row) => (row.id === selectedSection?.id ? 'bg-[#29E68C]/5' : undefined)}
        />
      </CardUI.Card>

      {isManageMode ? (
        <DialogUI.Dialog open={showAddSection} onOpenChange={setShowAddSection}>
          <DialogUI.DialogContent className="max-w-xl border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
            <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
              <CardUI.CardHeader className="pb-6">
                <LayoutUI.Row align="items-start" gap="gap-3">
                  <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                    <Icons.Plus className="size-5 text-[#04090C]" />
                  </LayoutUI.Container>
                  <LayoutUI.Column gap="gap-1">
                    <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                      Add section
                    </DialogUI.DialogTitle>
                    <DialogUI.DialogDescription className="text-sm text-black/60">
                      Create a new curriculum section before moving on to the lesson workspace.
                    </DialogUI.DialogDescription>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              </CardUI.CardHeader>

              <CardUI.CardContent spacing="lg" className="pb-6">
                <LayoutUI.Column gap="gap-4">
                  <Input value={newSectionDraft.title} onChange={(event) => setNewSectionDraft((current) => ({ ...current, title: event.target.value }))} tone="inverse" placeholder="Module 1: Fundamentals" />
                  <Textarea value={newSectionDraft.description} onChange={(event) => setNewSectionDraft((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Optional short summary for this section" />

                  <LayoutUI.Row justify="justify-end" className="gap-2">
                    <Button type="button" variant="ghost-inverse" size="sm" onClick={() => setShowAddSection(false)}>
                      Cancel
                    </Button>
                    <Button type="button" variant="soft-action" size="sm" disabled={isCreatingSection} onClick={handleCreateSection}>
                      <Icons.Plus size={16} />
                      {isCreatingSection ? 'Adding...' : 'Add section'}
                    </Button>
                  </LayoutUI.Row>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>
          </DialogUI.DialogContent>
        </DialogUI.Dialog>
      ) : null}

      {isManageMode ? (
        <DialogUI.Dialog
          open={showEditSection && Boolean(editingSectionId)}
          onOpenChange={(open) => {
            setShowEditSection(open);
            if (!open) {
              setEditingSectionId('');
            }
          }}
        >
          <DialogUI.DialogContent className="max-w-xl border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
            <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
              <CardUI.CardHeader className="pb-6">
                <LayoutUI.Row align="items-start" gap="gap-3">
                  <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                    <Icons.PencilLine className="size-5 text-[#04090C]" />
                  </LayoutUI.Container>
                  <LayoutUI.Column gap="gap-1">
                    <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                      Edit section
                    </DialogUI.DialogTitle>
                    <DialogUI.DialogDescription className="text-sm text-black/60">
                      Update the section label and short description directly from the curriculum table.
                    </DialogUI.DialogDescription>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              </CardUI.CardHeader>

              <CardUI.CardContent spacing="lg" className="pb-6">
                <LayoutUI.Column gap="gap-4">
                  <Input value={sectionDraft.title} onChange={(event) => setSectionDraft((current) => ({ ...current, title: event.target.value }))} tone="inverse" placeholder="Section title" />
                  <Textarea value={sectionDraft.description} onChange={(event) => setSectionDraft((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Short section description" />

                  <LayoutUI.Row justify="justify-end" className="gap-2">
                    <Button
                      type="button"
                      variant="ghost-inverse"
                      size="sm"
                      onClick={() => {
                        setShowEditSection(false);
                        setEditingSectionId('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" variant="soft-action" size="sm" disabled={isUpdatingSection} onClick={handleSaveSection}>
                      <Icons.Save size={16} />
                      {isUpdatingSection ? 'Saving...' : 'Save section'}
                    </Button>
                  </LayoutUI.Row>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>
          </DialogUI.DialogContent>
        </DialogUI.Dialog>
      ) : null}
    </LayoutUI.Column>
  );
}
