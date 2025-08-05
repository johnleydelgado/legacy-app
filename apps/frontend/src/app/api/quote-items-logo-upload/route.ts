import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AMPLIFY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AMPLIFY_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AMPLIFY_AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Extract S3 key from a full S3 URL
 */
function getKeyFromUrl(url: string): string | null {
  try {
    const { pathname, host } = new URL(url);
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET!;
    return host.startsWith(bucket) ? pathname.slice(1) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("filename");
  const filetype = req.nextUrl.searchParams.get("filetype");
  const existingImageUrl = req.nextUrl.searchParams.get("existingImageUrl");

  if (!filename || !filetype) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  // If there's an existing image, try to delete it first
  if (existingImageUrl) {
    const existingKey = getKeyFromUrl(existingImageUrl);
    if (existingKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
            Key: existingKey,
          })
        );
      } catch (err) {
        console.warn(`Failed to delete existing logo ${existingKey}:`, err);
        // Continue with upload even if deletion fails
      }
    }
  }

  const key = `quote-items-logo/${Date.now()}-${filename}`;
  const cmd = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
    Key: key,
    ContentType: filetype,
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });

  return NextResponse.json({
    url,
    key,
    publicUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AMPLIFY_AWS_REGION}.amazonaws.com/${key}`,
  });
}
