import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import * as Icons from 'lucide-react';
import { Button } from '@components/ui/button';

interface EventImageCropDialogProps {
  open: boolean;
  imageUrl: string;
  fileName: string;
  aspect: number;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => Promise<void> | void;
}

const OUTPUT_WIDTH = 1600;

export function EventImageCropDialog({
  open,
  imageUrl,
  fileName,
  aspect,
  title,
  description,
  onOpenChange,
  onConfirm,
}: EventImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageUrl]);

  const frameClassName = useMemo(() => {
    if (aspect >= 1.6) {
      return 'aspect-[16/9]';
    }
    return 'aspect-square';
  }, [aspect]);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = src;
    });

  const createCroppedFile = async () => {
    if (!croppedAreaPixels) {
      return null;
    }

    const image = await createImage(imageUrl);
    const canvas = document.createElement('canvas');
    const outputHeight = Math.round(OUTPUT_WIDTH / aspect);

    canvas.width = OUTPUT_WIDTH;
    canvas.height = outputHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      OUTPUT_WIDTH,
      outputHeight,
    );

    const extension = fileName.split('.').pop()?.toLowerCase();
    const type = extension === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
    if (!blob) {
      return null;
    }

    const outputName = fileName.replace(/\.[^.]+$/, '') || 'event-image';
    const suffix = aspect >= 1.6 ? '-landscape' : '-square';
    return new File([blob], `${outputName}${suffix}.${type === 'image/png' ? 'png' : 'jpg'}`, { type });
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const croppedFile = await createCroppedFile();
      if (!croppedFile) {
        return;
      }
      await onConfirm(croppedFile);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[min(92vh,980px)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#F7F4EC] text-[#04090C] shadow-2xl">
        <div className="flex items-start justify-between gap-6 border-b border-black/10 px-6 py-5 sm:px-8">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-[#04090C]">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-[#04090C]/65 transition hover:bg-black/[0.06] hover:text-[#04090C]"
          >
            <Icons.X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 p-6 sm:p-8">
          <div className={`relative min-h-[420px] flex-1 overflow-hidden rounded-[1.5rem] border border-black/10 bg-black/5 ${frameClassName}`}>
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              showGrid={false}
              classes={{
                containerClassName: 'bg-black/5',
                mediaClassName: 'select-none',
              }}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-black/10 pt-5">
            <Button type="button" variant="ghost-inverse" size="form" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="accent" size="form" onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? <Icons.LoaderCircle className="size-4 animate-spin" /> : <Icons.Crop className="size-4" />}
              {isSaving ? 'Saving crop...' : 'Use cropped image'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
