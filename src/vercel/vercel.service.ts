// src/publish/publish.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { deployToVercel } from './deploy-vercel';

@Injectable()
export class VercelService {
  async publishToVercel(userId: string, html: string, css: string) {
    const basePath = path.join(__dirname, '..', '..', 'static-websites', userId);
    await fs.ensureDir(basePath);

    await fs.writeFile(path.join(basePath, 'index.html'), `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="./style.css" />
      </head>
      <body>${html}</body>
      </html>
    `);
    await fs.remove(path.join(basePath, '.vercel')); // ❌ Prevent auto-linked settings

    await fs.writeFile(path.join(basePath, 'vercel.json'), JSON.stringify({
      cleanUrls: true,
      trailingSlash: false,
      routes: []  // Fix added here
    }, null, 2));

    const deployedUrl = await deployToVercel(userId);
    return deployedUrl;
  }
}
