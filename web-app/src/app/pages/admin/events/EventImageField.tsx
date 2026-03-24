import { type DragEvent, useId, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import * as FormUI from '@components/ui/form';

interface EventImageFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  description?: string;
  aspect?: 'square' | 'landscape';
  value?: string;
  previewUrl?: string;
  error?: string;
  disabled?: boolean;
  tone?: 'default' | 'inverse';
  isUploading?: boolean;
  onFileSelect: (file: File) => void | Promise<void>;
}

export function EventImageField({
  id,
  label = 'Event image',
  required = false,
  description,
  aspect = 'square',
  value = '',
  previewUrl,
  error,
  disabled = false,
  tone = 'inverse',
  isUploading = false,
  onFileSelect,
}: EventImageFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isLandscape = aspect === 'landscape';

  const remotePreviewSrc = previewUrl || (value.startsWith('/uploads/')
    ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || ''}${value}`
    : value);

  const handleSelectedFile = (file?: File | null) => {
    if (!file) {
      return;
    }

    void onFileSelect(file);
  };

  const handlePickImage = () => {
    if (disabled || isUploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectedFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled || isUploading) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) {
      return;
    }
    handleSelectedFile(event.dataTransfer.files?.[0]);
  };

  return (
    <FormUI.FormField id={inputId} label={label} error={error} required={required} tone={tone}>
      <div className="flex h-full flex-col gap-4">
        {description ? <p className="min-h-[3rem] text-xs leading-5 text-[#04090C]/50">{description}</p> : null}
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={disabled}
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handlePickImage}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (disabled || isUploading) {
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handlePickImage();
            }
          }}
          className={`mt-0 overflow-hidden rounded-2xl border bg-[#F7F4EC] transition ${
            isDragging ? 'border-[#29E68C] ring-2 ring-[#29E68C]/30' : 'border-black/10'
          } ${disabled || isUploading ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
        >
          {value ? (
            <div className="relative h-72">
              {isLandscape ? (
                <div className="absolute inset-0 overflow-hidden">
                  <img src={remotePreviewSrc} alt="Event preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="absolute inset-y-0 left-1/2 flex aspect-square h-full -translate-x-1/2 overflow-hidden">
                  <img src={remotePreviewSrc} alt="Event preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-4 py-3 text-xs font-medium text-white">
                <span>{isUploading ? 'Uploading image...' : 'Click or drag another image to replace'}</span>
                {isUploading ? <Icons.LoaderCircle className="size-4 animate-spin" /> : <Icons.Upload className="size-4" />}
              </div>
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#04090C]">
                    <Icons.LoaderCircle className="size-4 animate-spin" />
                    Uploading image...
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative h-72">
              {isLandscape ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-[#04090C]/45">
                  {isUploading ? <Icons.LoaderCircle className="size-8 animate-spin" /> : <Icons.ImagePlus className="size-8" />}
                  <p className="text-sm font-medium text-[#04090C]/70">{isUploading ? 'Uploading image...' : 'Drop image here or click to browse.'}</p>
                  <p className="text-xs leading-5 text-[#04090C]/45">PNG, JPG, WEBP, or any browser-supported image file.</p>
                </div>
              ) : (
                <div className="absolute inset-y-0 left-1/2 flex aspect-square h-full -translate-x-1/2 flex-col items-center justify-center gap-3 px-6 text-center text-[#04090C]/45">
                  {isUploading ? <Icons.LoaderCircle className="size-8 animate-spin" /> : <Icons.ImagePlus className="size-8" />}
                  <p className="text-sm font-medium text-[#04090C]/70">{isUploading ? 'Uploading image...' : 'Drop image here or click to browse.'}</p>
                  <p className="text-xs leading-5 text-[#04090C]/45">PNG, JPG, WEBP, or any browser-supported image file.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FormUI.FormField>
  );
}
