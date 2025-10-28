import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private client = new S3Client({});
  private bucket = process.env.S3_BUCKET || '';

  async uploadBuffer(buf: Buffer, keyPrefix = 'uploads/', contentType = 'application/octet-stream') {
    const key = `${keyPrefix}${randomUUID()}`;
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buf,
      ContentType: contentType,
      ACL: 'public-read'
    }));
    const base = process.env.S3_PUBLIC_BASE || `https://${this.bucket}.s3.amazonaws.com/`;
    return base + key;
  }
}
