const viteStorageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL?.trim();
const viteStorageBucket = import.meta.env.VITE_STORAGE_BUCKET?.trim();

export const STORAGE_BASE_URL = (viteStorageBaseUrl || 'https://storage.itts.fun').replace(/\/+$/, '');
export const STORAGE_BUCKET = (viteStorageBucket || 'itts').replace(/^\/+|\/+$/g, '');
export const STORAGE_ROOT = `${STORAGE_BASE_URL}/${STORAGE_BUCKET}`;

export function resolveAssetUrl(value?: string | null) {
  const asset = value?.trim();
  if (!asset) {
    return '';
  }

  if (/^https?:\/\//i.test(asset) || asset.startsWith('data:') || asset.startsWith('blob:')) {
    return asset;
  }

  if (asset.startsWith('/')) {
    return `${STORAGE_ROOT}${asset}`;
  }

  return `${STORAGE_ROOT}/${asset}`;
}
