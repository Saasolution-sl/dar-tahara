import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;
let bucket: string | null = null;

function config() {
  const endpoint = process.env.CUBBIT_S3_ENDPOINT;
  const region = process.env.CUBBIT_S3_REGION;
  const bucketName = process.env.CUBBIT_S3_BUCKET;
  const accessKeyId = process.env.CUBBIT_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CUBBIT_S3_SECRET_ACCESS_KEY;
  if (!endpoint || !region || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new Error("cubbit_storage_not_configured");
  }
  return { endpoint, region, bucketName, accessKeyId, secretAccessKey };
}

function getClient(): { s3: S3Client; bucket: string } {
  if (client && bucket) return { s3: client, bucket };
  const cfg = config();
  client = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    // Cubbit DS3 uses virtual-host-style-incompatible bucket naming; path-style
    // addressing (endpoint/bucket/key) is what its S3 gateway expects.
    forcePathStyle: true,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
  bucket = cfg.bucketName;
  return { s3: client, bucket };
}

export function isCubbitConfigured(): boolean {
  try {
    config();
    return true;
  } catch {
    return false;
  }
}

export async function putObject(key: string, body: Uint8Array | Buffer, contentType: string, extra?: Partial<PutObjectCommandInput>): Promise<void> {
  const { s3, bucket: bucketName } = getClient();
  await s3.send(new PutObjectCommand({ Bucket: bucketName, Key: key, Body: body, ContentType: contentType, ...extra }));
}

export async function objectExists(key: string): Promise<boolean> {
  const { s3, bucket: bucketName } = getClient();
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function getObjectBytes(key: string): Promise<Buffer | null> {
  const { s3, bucket: bucketName } = getClient();
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
    if (!result.Body) return null;
    const bytes = await result.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch {
    return null;
  }
}

export async function presignGetUrl(key: string, expiresInSeconds: number, downloadFilename?: string): Promise<string> {
  const { s3, bucket: bucketName } = getClient();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ...(downloadFilename ? { ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadFilename)}` } : {}),
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function presignPutUrl(key: string, contentType: string, expiresInSeconds: number): Promise<string> {
  const { s3, bucket: bucketName } = getClient();
  const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
