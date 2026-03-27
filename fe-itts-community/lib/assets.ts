const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "https://storage.itts.fun")
  .trim()
  .replace(/\/+$/, "");
const STORAGE_BUCKET = (process.env.NEXT_PUBLIC_STORAGE_BUCKET || "itts").trim().replace(/^\/+|\/+$/g, "");
const STORAGE_ROOT = `${STORAGE_BASE_URL}/${STORAGE_BUCKET}`;

export function resolveAssetUrl(value?: string | null) {
  const asset = value?.trim();
  if (!asset) {
    return "";
  }

  if (/^https?:\/\//i.test(asset) || asset.startsWith("data:") || asset.startsWith("blob:")) {
    return asset;
  }

  if (asset.startsWith("/")) {
    return `${STORAGE_ROOT}${asset}`;
  }

  return `${STORAGE_ROOT}/${asset}`;
}
