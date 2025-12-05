'use client';

import { useState } from 'react';
import {
  useListRoadmaps,
  useCreateRoadmap,
  useUpdateRoadmap,
  useDeleteRoadmap,
  Roadmap,
  CreateRoadmapRequest,
  UpdateRoadmapRequest,
  ProgramEnum,
} from '@/feature/roadmaps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table-shadcn';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';

const PROGRAMS: { value: ProgramEnum; label: string }[] = [
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
  { value: 'programming', label: 'Programming' },
];

export default function RoadmapsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const { data, isLoading, error } = useListRoadmaps({
    page,
    page_size: 10,
    search: search || undefined,
    program: programFilter !== 'all' ? programFilter : undefined,
    month_number: monthFilter !== 'all' ? parseInt(monthFilter) : undefined,
    is_active: activeFilter !== 'all' ? activeFilter === 'true' : undefined,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);

  const createMutation = useCreateRoadmap();
  const updateMutation = useUpdateRoadmap();
  const deleteMutation = useDeleteRoadmap();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload: CreateRoadmapRequest = {
      title: formData.get('title') as string,
      month_number: parseInt(formData.get('month_number') as string),
      description: formData.get('description') as string || undefined,
      program: formData.get('program') as ProgramEnum || undefined,
      sort_order: formData.get('sort_order') ? parseInt(formData.get('sort_order') as string) : undefined,
      is_active: formData.get('is_active') === 'on',
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Roadmap created successfully');
      setCreateOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create roadmap');
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoadmap) return;

    const formData = new FormData(e.currentTarget);

    const payload: UpdateRoadmapRequest = {
      title: formData.get('title') as string || undefined,
      month_number: formData.get('month_number') ? parseInt(formData.get('month_number') as string) : undefined,
      description: formData.get('description') as string || undefined,
      program: formData.get('program') as ProgramEnum || undefined,
      sort_order: formData.get('sort_order') ? parseInt(formData.get('sort_order') as string) : undefined,
      is_active: formData.get('is_active') === 'on',
    };

    try {
      await updateMutation.mutateAsync({ id: selectedRoadmap.id, data: payload });
      toast.success('Roadmap updated successfully');
      setEditOpen(false);
      setSelectedRoadmap(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update roadmap');
    }
  };

  const handleDelete = async () => {
    if (!selectedRoadmap) return;

    try {
      await deleteMutation.mutateAsync(selectedRoadmap.id);
      toast.success('Roadmap deleted successfully');
      setDeleteOpen(false);
      setSelectedRoadmap(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete roadmap');
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading roadmaps</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Roadmaps Management</h1>
          <p className="text-gray-600 mt-1">Manage learning roadmaps</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Roadmap
        </Button>
      </div>

      <div className="bg-background rounded-lg border border-border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Search roadmaps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {PROGRAMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Month {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setProgramFilter('all');
              setMonthFilter('all');
              setActiveFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      ) : (
        <>
          <div className="bg-background rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((roadmap) => (
                  <TableRow key={roadmap.id}>
                    <TableCell>Month {roadmap.month_number}</TableCell>
                    <TableCell className="font-medium">{roadmap.title}</TableCell>
                    <TableCell>
                      {roadmap.program ? (
                        <span className="capitalize">{roadmap.program}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{roadmap.sort_order}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roadmap.is_active
                            ? 'bg-badge-success-bg text-badge-success-text'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {roadmap.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {roadmap.items && roadmap.items.length > 0
                        ? `${roadmap.items.length} items`
                        : '0 items'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoadmap(roadmap);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoadmap(roadmap);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-600">
                      No roadmaps found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {data.data.length} of {data.total} roadmaps
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Roadmap</DialogTitle>
              <DialogDescription>Add a new learning roadmap</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="month_number">Month Number *</Label>
                  <Input
                    id="month_number"
                    name="month_number"
                    type="number"
                    min="1"
                    max="12"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input id="sort_order" name="sort_order" type="number" defaultValue="0" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="program">Program</Label>
                <Select name="program">
                  <SelectTrigger>
                    <SelectValue placeholder="Select program (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_active" name="is_active" defaultChecked />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Roadmap</DialogTitle>
              <DialogDescription>Update roadmap details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_title">Title</Label>
                <Input
                  id="edit_title"
                  name="title"
                  defaultValue={selectedRoadmap?.title}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_month_number">Month Number</Label>
                  <Input
                    id="edit_month_number"
                    name="month_number"
                    type="number"
                    min="1"
                    max="12"
                    defaultValue={selectedRoadmap?.month_number}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_sort_order">Sort Order</Label>
                  <Input
                    id="edit_sort_order"
                    name="sort_order"
                    type="number"
                    defaultValue={selectedRoadmap?.sort_order}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_program">Program</Label>
                <Select name="program" defaultValue={selectedRoadmap?.program}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  name="description"
                  rows={3}
                  defaultValue={selectedRoadmap?.description}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_active"
                  name="is_active"
                  defaultChecked={selectedRoadmap?.is_active}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  setSelectedRoadmap(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Roadmap"
        message={`Are you sure you want to delete "${selectedRoadmap?.title}"? This action cannot be undone.`}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
