import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class HostingService {
  private readonly cfAccountId = process.env.CF_ACCOUNT_ID;
  private readonly cfNamespaceId = process.env.CF_KV_NAMESPACE_ID;
  private readonly cfApiToken = process.env.CF_API_TOKEN;

  async publishWebsite(
    websiteName: string,
    html: string,
    css: string,
    existingSubdomain?: string,
  ): Promise<{ url: string; subdomain: string }> {

    const subdomain = existingSubdomain || this.generateSubdomain(websiteName);
    
    const formattedCss = `<style>\n${css}\n</style>`;
    const processedHtml = html.replace(
      /<link[^>]*href=["']?style\.css["']?[^>]*>/i,
      formattedCss
    );

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${subdomain}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.cfApiToken}`,
          'Content-Type': 'text/html',
        },
        body: processedHtml,
      },
    );

    if (!response.ok) {
      throw new Error('Failed to publish website');
    }

    return {
      url: `https://${subdomain}.launchix.ai`,
      subdomain,
    };
  }

  private generateSubdomain(websiteName: string): string {
    const slug = websiteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);
    const timestamp = Date.now().toString().slice(-6);
    return `${slug}-${timestamp}`;
  }
}


/*


import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import * as path from 'path';

@Injectable()
export class HostingService {
  private readonly logger = new Logger(HostingService.name);

  private readonly cfAccountId = process.env.CF_ACCOUNT_ID;
  private readonly cfNamespaceId = process.env.CF_KV_NAMESPACE_ID;
  private readonly cfApiToken = process.env.CF_API_TOKEN;

  async publishWebsite(
    websiteName: string,
    html: string,
    css: string,
  ): Promise<{ url: string; subdomain: string }> {
    const subdomain = this.generateSubdomain(websiteName);

    // ✅ 1️⃣ Upload CSS file first
    await this.uploadToCloudflareKV(`${subdomain}/style.css`, css, 'text/css');

    // ✅ 2️⃣ Upload HTML file
    await this.uploadToCloudflareKV(`${subdomain}/index.html`, html, 'text/html');

    this.logger.log(`✅ Published website: ${subdomain}`);

    return {
      url: `https://${subdomain}.launchix.ai`,
      subdomain,
    };
  }

  private async uploadToCloudflareKV(
    key: string,
    content: string,
    contentType: string,
  ) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${encodeURIComponent(
        key,
      )}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.cfApiToken}`,
          'Content-Type': contentType,
        },
        body: content,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to upload ${key}: ${text}`);
    }
  }

  private generateSubdomain(websiteName: string): string {
    const slug = websiteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);
    const timestamp = Date.now().toString().slice(-6);
    return `${slug}-${timestamp}`;
  }
}

*/