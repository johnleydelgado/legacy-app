/** Response shape returned by /api/upload-url */
export interface PresignResponse {
  url: string; // signed PUT url
  key: string; // "uploads/....jpg"
  publicUrl: string; // https://bucket.s3.amazonaws.com/uploads/...
}

/* safely parse JSON text (mirrors your safeJson) */
function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Step 1 — Ask the backend for a one-time signed URL.
 * @param filename - The name of the file to upload
 * @param filetype - The MIME type of the file
 * @param existingImageUrl - Optional: URL of existing image to replace
 */
export async function getPresignedUploadUrl(
  filename: string,
  filetype: string,
  existingImageUrl?: string
): Promise<PresignResponse> {
  const qs = new URLSearchParams({ filename, filetype });
  if (existingImageUrl) {
    qs.append("existingImageUrl", existingImageUrl);
  }
  const res = await fetch(`/api/image-upload?${qs}`, { method: "GET" });
  console.log(`Result ${res.ok} `);

  if (!res.ok) {
    throw new Error(`Failed to get presigned url (${res.status})`);
  }

  const data = safeJson<PresignResponse>(await res.text());
  console.log(`Result public ${data?.publicUrl} `);
  console.log(`Result url ${data?.url} `);

  if (!data) throw new Error("Malformed JSON from /api/image-upload");

  return data;
}

/**
 * Step 2 — PUT the file directly to S3.
 * Returns the public URL when done.
 * @param file - The file to upload
 * @param existingImageUrl - Optional: URL of existing image to replace
 */
export async function uploadFileToS3(
  file: File,
  existingImageUrl?: string
): Promise<string> {
  console.log(`Uploading ${file.name} `);
  const { url, publicUrl } = await getPresignedUploadUrl(
    file.name,
    file.type,
    existingImageUrl
  );
  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!put.ok) {
    throw new Error(`S3 upload failed (${put.status})`);
  }

  return publicUrl; // ready to store in DB / show preview
}
