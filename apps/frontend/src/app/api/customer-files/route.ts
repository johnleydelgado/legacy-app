import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AMPLIFY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AMPLIFY_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AMPLIFY_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET!;
const REGION = process.env.NEXT_PUBLIC_AMPLIFY_AWS_REGION!;

/**
 * Extract S3 key from a full S3 URL
 */
function getKeyFromUrl(url: string): string | null {
  try {
    const { pathname, host } = new URL(url);
    return host.startsWith(BUCKET) ? pathname.slice(1) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("filename");
  const filetype = req.nextUrl.searchParams.get("filetype");
  const customerId = req.nextUrl.searchParams.get("customerId");
  const existingFileUrl = req.nextUrl.searchParams.get("existingFileUrl");
  const list = req.nextUrl.searchParams.get("list");

  // List files for a customer
  if (list === "true") {
    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required when listing files" },
        { status: 400 }
      );
    }

    try {
      const prefix = `customers/${customerId}/`;
      const data = await s3.send(
        new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
      );

      const items = (data.Contents || []).map((obj) => ({
        key: obj.Key!,
        url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${obj.Key}`,
        name: obj.Key!.split("/").pop()!,
        lastModified: obj.LastModified,
        size: obj.Size,
      }));

      return NextResponse.json({ items });
    } catch (err) {
      console.error("Failed to list files", err);
      return NextResponse.json(
        { message: "Failed to list files" },
        { status: 500 }
      );
    }
  }

  // Request a signed upload URL
  if (!filename || !filetype || !customerId) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  // Delete existing file first if supplied
  if (existingFileUrl) {
    const existingKey = getKeyFromUrl(existingFileUrl);
    if (existingKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({ Bucket: BUCKET, Key: existingKey })
        );
      } catch {
        /** Ignore error and continue */
      }
    }
  }

  const key = `customers/${customerId}/${Date.now()}-${filename}`;
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: filetype,
  });

  try {
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    return NextResponse.json({
      url,
      key,
      publicUrl: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
    });
  } catch (err) {
    console.error("Failed to create signed URL", err);
    return NextResponse.json(
      { message: "Failed to create signed URL" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const urls = await req.json();

  if (!Array.isArray(urls)) {
    return NextResponse.json(
      { message: "Expected array of URLs" },
      { status: 400 }
    );
  }

  const deletePromises = urls.filter(Boolean).map(async (url: string) => {
    const key = getKeyFromUrl(url);
    if (!key) return;

    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {
      /** Ignore error */
    }
  });

  await Promise.allSettled(deletePromises);

  return NextResponse.json({ message: "Deletion complete" });
}
