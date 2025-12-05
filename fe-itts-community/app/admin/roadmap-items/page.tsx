'use client';

import { useState } from 'react';
import {
  useListRoadmapItems,
  useCreateRoadmapItem,
  useUpdateRoadmapItem,
  useDeleteRoadmapItem,
  RoadmapItem,
  CreateRoadmapItemRequest,
  UpdateRoadmapItemRequest,
} from '@/feature/roadmap-items';
import { useListRoadmaps } from '@/feature/roadmaps';
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
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';

export default function RoadmapItemsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roadmapFilter, setRoadmapFilter] = useState<string>('all');

  const { data, isLoading, error } = useListRoadmapItems({
    page,
    page_size: 10,
    search: search || undefined,
    roadmap_id: roadmapFilter !== 'all' ? roadmapFilter : undefined,
  });

  const { data: roadmapsData } = useListRoadmaps({ page: 1, page_size: 100 });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);

  const createMutation = useCreateRoadmapItem();
  const updateMutation = useUpdateRoadmapItem();
  const deleteMutation = useDeleteRoadmapItem();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload: CreateRoadmapItemRequest = {
      roadmap_id: formData.get('roadmap_id') as string,
      item_text: formData.get('item_text') as string,
      sort_order: formData.get('sort_order')
        ? parseInt(formData.get('sort_order') as string)
        : undefined,
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Roadmap item created successfully');
      setCreateOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create roadmap item');
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(e.currentTarget);

    const payload: UpdateRoadmapItemRequest = {
      roadmap_id: formData.get('roadmap_id') as string || undefined,
      item_text: formData.get('item_text') as string || undefined,
      sort_order: formData.get('sort_order')
        ? parseInt(formData.get('sort_order') as string)
        : undefined,
    };

    try {
      await updateMutation.mutateAsync({ id: selectedItem.id, data: payload });
      toast.success('Roadmap item updated successfully');
      setEditOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update roadmap item');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Roadmap item deleted successfully');
      setDeleteOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete roadmap item');
    }
  };

  const getRoadmapTitle = (roadmapId: string) => {
    const roadmap = roadmapsData?.data.find((r) => r.id === roadmapId);
    return roadmap ? `${roadmap.title} (Month ${roadmap.month_number})` : roadmapId;
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading roadmap items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Roadmap Items Management</h1>
          <p className="text-gray-500 mt-1">Manage items within roadmaps</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Item
        </Button>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={roadmapFilter} onValueChange={setRoadmapFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roadmaps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roadmaps</SelectItem>
              {roadmapsData?.data.map((roadmap) => (
                <SelectItem key={roadmap.id} value={roadmap.id}>
                  {roadmap.title} (Month {roadmap.month_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setRoadmapFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Text</TableHead>
                  <TableHead>Roadmap</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-md">
                      {item.item_text}
                    </TableCell>
                    <TableCell>{getRoadmapTitle(item.roadmap_id)}</TableCell>
                    <TableCell>{item.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No roadmap items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Showing {data.data.length} of {data.total} items
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
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Roadmap Item</DialogTitle>
              <DialogDescription>Add a new item to a roadmap</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="roadmap_id">Roadmap *</Label>
                <Select name="roadmap_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roadmap" />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmapsData?.data.map((roadmap) => (
                      <SelectItem key={roadmap.id} value={roadmap.id}>
                        {roadmap.title} (Month {roadmap.month_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item_text">Item Text *</Label>
                <Textarea id="item_text" name="item_text" rows={3} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Roadmap Item</DialogTitle>
              <DialogDescription>Update item details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_roadmap_id">Roadmap</Label>
                <Select name="roadmap_id" defaultValue={selectedItem?.roadmap_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roadmap" />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmapsData?.data.map((roadmap) => (
                      <SelectItem key={roadmap.id} value={roadmap.id}>
                        {roadmap.title} (Month {roadmap.month_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_item_text">Item Text</Label>
                <Textarea
                  id="edit_item_text"
                  name="item_text"
                  rows={3}
                  defaultValue={selectedItem?.item_text}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_sort_order">Sort Order</Label>
                <Input
                  id="edit_sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={selectedItem?.sort_order}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
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
        title="Delete Roadmap Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
