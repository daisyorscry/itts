import { useRef, type ChangeEvent } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '@components/ui/button';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';

interface AdminLearningAssetUploadFieldProps {
  id: string;
  label: string;
  description: string;
  value?: string;
  previewUrl?: string;
  accept?: string;
  isUploading?: boolean;
  onSelect: (file: File) => Promise<void> | void;
  onClear?: () => void;
}

export function AdminLearningAssetUploadField({
  id,
  label,
  description,
  value,
  previewUrl,
  accept,
  isUploading = false,
  onSelect,
  onClear,
}: AdminLearningAssetUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onSelect(file);
    event.target.value = '';
  };

  return (
    <LayoutUI.Column
      gap="gap-4"
      className="rounded-3xl border border-dashed border-black/15 bg-black/[0.03] p-5"
    >
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-3">
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="font-medium">
            {label}
          </Text>
          <Text variant="muted-inverse" size="xs">
            {description}
          </Text>
        </LayoutUI.Column>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            void handleFileChange(event);
          }}
        />
        <Button
          type="button"
          variant="soft-action"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <Icons.Upload size={16} />
          {isUploading ? 'Uploading...' : 'Choose file'}
        </Button>
      </LayoutUI.Row>

      {value ? (
        <LayoutUI.Column gap="gap-3">
          <LayoutUI.Row gap="gap-2" align="items-center" className="rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3">
            <Icons.File size={18} className="text-[#04090C]/70" />
            <LayoutUI.Column className="min-w-0 flex-1" gap="gap-1">
              <Text className="truncate text-sm font-medium text-[#04090C]">{value.split('/').pop() || value}</Text>
              <Text size="xs" className="truncate text-[#04090C]/60">
                {value}
              </Text>
            </LayoutUI.Column>
            {previewUrl ? (
              <Button type="button" variant="ghost-inverse" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
            ) : null}
            {onClear ? (
              <Button type="button" variant="ghost-inverse" size="sm" onClick={onClear}>
                Remove
              </Button>
            ) : null}
          </LayoutUI.Row>
        </LayoutUI.Column>
      ) : (
        <LayoutUI.Row gap="gap-2" align="items-center" className="rounded-2xl border border-black/10 bg-black/[0.04] px-4 py-3">
          <Icons.FolderOpen size={16} className="text-[#04090C]/50" />
          <Text size="xs" className="text-[#04090C]/60">
            No file uploaded yet.
          </Text>
        </LayoutUI.Row>
      )}
    </LayoutUI.Column>
  );
}
