import { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import * as Icons from 'lucide-react';
import { Button } from '@components/ui/button';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import { useUploadEventImage } from '@feature/event/hooks';
import { resolveAssetUrl } from '@utility/asset';

type AvatarSourceMode = 'camera' | 'file' | 'url';

interface SpeakerAvatarFieldProps {
  id?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

interface PendingAssetState {
  imageUrl: string;
  fileName: string;
}

const AVATAR_SIZE = 768;

export function SpeakerAvatarField({
  id = 'avatar_url',
  value = '',
  error,
  disabled = false,
  onChange,
}: SpeakerAvatarFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadEventImage();

  const [isOpen, setIsOpen] = useState(false);
  const [isSourcePickerOpen, setIsSourcePickerOpen] = useState(false);
  const [mode, setMode] = useState<AvatarSourceMode>('file');
  const [pendingAsset, setPendingAsset] = useState<PendingAssetState | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [sourceError, setSourceError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const previewSrc = resolveAssetUrl(value);
  const hasPreview = Boolean(previewSrc);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode('file');
      setSourceError('');
      setUrlInput('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setPendingAsset((current) => {
        if (current?.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(current.imageUrl);
        }
        return null;
      });
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (pendingAsset?.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pendingAsset.imageUrl);
      }
    };
  }, [pendingAsset]);

  useEffect(() => {
    if (!isOpen || mode !== 'camera' || pendingAsset) {
      return;
    }

    let isCancelled = false;

    const startCamera = async () => {
      try {
        setSourceError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setIsCameraReady(true);
      } catch (cameraError) {
        setSourceError(cameraError instanceof Error ? cameraError.message : 'Camera access was denied.');
        setIsCameraReady(false);
      }
    };

    void startCamera();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, mode, pendingAsset]);

  const canCrop = Boolean(pendingAsset?.imageUrl);
  const sourceSummary = useMemo(() => {
    if (pendingAsset) {
      return 'Crop avatar before saving it to the speaker profile.';
    }
    if (mode === 'camera') {
      return 'Capture from your camera, then crop it into a circular avatar.';
    }
    if (mode === 'url') {
      return 'Paste an image URL. We will fetch it first, then let you crop it.';
    }
    return 'Pick an image from your device, then crop it into a circular avatar.';
  }, [mode, pendingAsset]);

  const setPendingImage = (file: File) => {
    setPendingAsset((current) => {
      if (current?.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(current.imageUrl);
      }
      return {
        imageUrl: URL.createObjectURL(file),
        fileName: file.name,
      };
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setSourceError('');
    setCroppedAreaPixels(null);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };

  const handleFileSelection = (file?: File | null) => {
    if (!file) {
      return;
    }
    setPendingImage(file);
  };

  const handleCaptureCamera = async () => {
    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      setSourceError('Failed to capture image from camera.');
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
    if (!blob) {
      setSourceError('Failed to prepare captured image.');
      return;
    }

    stopCamera();
    setPendingImage(new File([blob], 'speaker-camera-avatar.png', { type: 'image/png' }));
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      setSourceError('Image URL is required.');
      return;
    }

    setIsFetchingUrl(true);
    setSourceError('');
    try {
      const response = await fetch(urlInput.trim());
      if (!response.ok) {
        throw new Error('Unable to fetch image from the provided URL.');
      }

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('The provided URL does not point to a valid image.');
      }

      const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      setPendingImage(new File([blob], `speaker-url-avatar.${extension}`, { type: blob.type || 'image/jpeg' }));
    } catch (fetchError) {
      setSourceError(fetchError instanceof Error ? fetchError.message : 'Unable to fetch image from URL.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const createCircularAvatarFile = async () => {
    if (!pendingAsset || !croppedAreaPixels) {
      return null;
    }

    const image = await createImage(pendingAsset.imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    context.clearRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
    context.save();
    context.beginPath();
    context.arc(AVATAR_SIZE / 2, AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip();
    context.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );
    context.restore();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.96));
    if (!blob) {
      return null;
    }

    const outputName = pendingAsset.fileName.replace(/\.[^.]+$/, '') || 'speaker-avatar';
    return new File([blob], `${outputName}-avatar.png`, { type: 'image/png' });
  };

  const handleSaveAvatar = async () => {
    setSourceError('');
    try {
      const croppedFile = await createCircularAvatarFile();
      if (!croppedFile) {
        setSourceError('Failed to prepare cropped avatar.');
        return;
      }

      const response = await uploadImage(croppedFile);
      onChange(response.data.file_path);
      setIsOpen(false);
    } catch (uploadError) {
      setSourceError(uploadError instanceof Error ? uploadError.message : 'Failed to upload avatar.');
    }
  };

  const handleRecapture = () => {
    setPendingAsset((current) => {
      if (current?.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(current.imageUrl);
      }
      return null;
    });
    setMode('camera');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSourceError('');
  };

  const openFlow = (nextMode: AvatarSourceMode) => {
    setMode(nextMode);
    setSourceError('');
    setIsSourcePickerOpen(false);
    setIsOpen(true);
    if (nextMode !== 'url') {
      setUrlInput('');
    }
  };

  return (
    <FormUI.FormField id={id} label="Speaker avatar" error={error} tone="inverse">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-black/10 bg-[#F7F4EC] p-5 sm:flex-row sm:items-center">
          <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/[0.04]">
            {hasPreview ? (
              <img src={previewSrc} alt="Speaker avatar preview" className="h-full w-full object-cover" />
            ) : (
              <Icons.UserRound className="size-10 text-black/25" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <p className="font-['Sora'] text-base font-semibold text-[#04090C]">Avatar speaker</p>
            <p className="text-sm leading-6 text-black/60">
              Use camera, file manager, or image URL. Every source is cropped into a circular avatar before upload.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="accent" size="form" onClick={() => setIsSourcePickerOpen(true)} disabled={disabled}>
                <Icons.ImagePlus className="size-4" />
                {hasPreview ? 'Replace Avatar' : 'Choose Avatar'}
              </Button>
              {hasPreview ? (
                <Button type="button" variant="ghost-inverse" size="form" onClick={() => onChange('')} disabled={disabled}>
                  <Icons.Trash2 className="size-4" />
                  Remove
                </Button>
              ) : null}
            </div>
            {value ? (
              <p className="break-all text-xs text-black/45">{value}</p>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            handleFileSelection(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <DialogUI.Dialog open={isSourcePickerOpen} onOpenChange={setIsSourcePickerOpen}>
          <DialogUI.DialogContent className="max-w-xl overflow-hidden border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
            <div className="border-b border-black/10 px-6 py-5">
              <DialogUI.DialogTitle className="font-['Sora'] text-2xl font-bold text-[#04090C]">
                Choose Avatar Source
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="mt-2 text-sm leading-6 text-black/60">
                Pick how you want to prepare the speaker avatar. The next modal will handle capture or crop before upload.
              </DialogUI.DialogDescription>
            </div>

            <div className="space-y-3 p-6">
              <SourceOptionButton
                icon={Icons.Camera}
                title="Camera"
                description="Open camera first, then capture and crop."
                isActive={false}
                onClick={() => openFlow('camera')}
              />
              <SourceOptionButton
                icon={Icons.FolderOpen}
                title="File Manager"
                description="Choose an image from your device, then crop it."
                isActive={false}
                onClick={() => {
                  openFlow('file');
                  requestAnimationFrame(() => fileInputRef.current?.click());
                }}
              />
              <SourceOptionButton
                icon={Icons.Link2}
                title="URL"
                description="Paste an image URL, fetch it, then crop it."
                isActive={false}
                onClick={() => openFlow('url')}
              />
            </div>
          </DialogUI.DialogContent>
        </DialogUI.Dialog>

        <DialogUI.Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogUI.DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
            <div className="border-b border-black/10 px-6 py-5">
              <DialogUI.DialogTitle className="font-['Sora'] text-2xl font-bold text-[#04090C]">
                {mode === 'camera' ? 'Capture Speaker Avatar' : mode === 'url' ? 'Crop Avatar From URL' : 'Crop Speaker Avatar'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="mt-2 text-sm leading-6 text-black/60">
                {sourceSummary}
              </DialogUI.DialogDescription>
            </div>

            <div className="flex max-h-[calc(90vh-96px)] flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs font-medium text-black/60">
                  {mode === 'camera' ? <Icons.Camera className="size-3.5" /> : mode === 'url' ? <Icons.Link2 className="size-3.5" /> : <Icons.FolderOpen className="size-3.5" />}
                  {mode === 'camera' ? 'Camera Flow' : mode === 'url' ? 'URL Flow' : 'File Manager Flow'}
                </div>
                <Button
                  type="button"
                  variant="ghost-inverse"
                  size="form"
                  onClick={() => {
                    setIsOpen(false);
                    setIsSourcePickerOpen(true);
                  }}
                >
                  <Icons.ArrowLeft className="size-4" />
                  Back
                </Button>
              </div>

              {mode === 'url' && !pendingAsset ? (
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  <label htmlFor="speaker-avatar-url" className="mb-2 block text-sm font-medium text-[#04090C]">
                    Image URL
                  </label>
                  <Input
                    id="speaker-avatar-url"
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="https://example.com/avatar.png"
                    tone="inverse"
                  />
                  <Button
                    type="button"
                    variant="accent"
                    size="form"
                    className="mt-3 w-full"
                    onClick={() => void handleFetchUrl()}
                    disabled={isFetchingUrl}
                  >
                    {isFetchingUrl ? <Icons.LoaderCircle className="size-4 animate-spin" /> : <Icons.Download className="size-4" />}
                    {isFetchingUrl ? 'Fetching image...' : 'Fetch and Continue'}
                  </Button>
                </div>
              ) : null}

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                {pendingAsset ? (
                  <>
                    <div className="relative mx-auto aspect-square max-h-[46vh] min-h-[280px] overflow-hidden rounded-[1.75rem] border border-black/10 bg-black/5">
                      <Cropper
                        image={pendingAsset.imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3">
                      <Icons.ZoomIn className="size-4 text-black/40" />
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(event) => setZoom(Number(event.target.value))}
                        className="w-full accent-[#29E68C]"
                      />
                    </div>
                  </>
                ) : mode === 'camera' ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto aspect-square max-h-[46vh] min-h-[280px] overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#04090C]">
                      <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                      {!isCameraReady ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white/80">
                          <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm">
                            <Icons.LoaderCircle className="size-4 animate-spin" />
                            Opening camera...
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="accent" size="form" onClick={() => void handleCaptureCamera()} disabled={!isCameraReady}>
                        <Icons.Camera className="size-4" />
                        Capture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-black/10 bg-black/[0.02] p-8 text-center">
                    <div className="space-y-3">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-black/[0.05]">
                        {mode === 'url' ? <Icons.Link2 className="size-6 text-black/35" /> : <Icons.ImagePlus className="size-6 text-black/35" />}
                      </div>
                      <p className="font-medium text-[#04090C]">
                        {mode === 'url' ? 'Paste an image URL to continue.' : 'Choose an image source to start cropping.'}
                      </p>
                      <p className="text-sm leading-6 text-black/55">
                        Final avatar will be exported as a circular PNG and uploaded to storage before saving the speaker.
                      </p>
                    </div>
                  </div>
                )}

                {sourceError ? (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {sourceError}
                  </div>
                ) : null}
              </div>

              {pendingAsset ? (
                <div className="mt-4 flex shrink-0 flex-wrap justify-end gap-3 border-t border-black/10 pt-4">
                  {mode === 'camera' ? (
                    <Button type="button" variant="ghost-inverse" size="form" onClick={handleRecapture} disabled={isUploading}>
                      <Icons.RotateCcw className="size-4" />
                      Retake
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="accent"
                    size="form"
                    onClick={() => void handleSaveAvatar()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Icons.LoaderCircle className="size-4 animate-spin" /> : <Icons.Check className="size-4" />}
                    {isUploading ? 'Uploading avatar...' : 'Save Avatar'}
                  </Button>
                </div>
              ) : null}
            </div>
          </DialogUI.DialogContent>
        </DialogUI.Dialog>
      </div>
    </FormUI.FormField>
  );
}

function SourceOptionButton({
  icon: Icon,
  title,
  description,
  isActive,
  onClick,
}: {
  icon: typeof Icons.Camera;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isActive ? 'border-[#29E68C] bg-[#29E68C]/10 shadow-[0_0_0_1px_rgba(41,230,140,0.15)]' : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.04]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-black/[0.06]">
          <Icon className="size-5 text-[#04090C]" />
        </div>
        <div>
          <div className="font-['Sora'] text-sm font-semibold text-[#04090C]">{title}</div>
          <p className="mt-1 text-xs leading-5 text-black/55">{description}</p>
        </div>
      </div>
    </button>
  );
}

function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });
}



