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
  ): Promise<{ url: string; subdomain: string }> {
    const subdomain = this.generateSubdomain(websiteName);
    const fullHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${websiteName}</title>
        <style>${css}</style>
        </head>
        <body>
        ${html}
        </body>
        </html>`;
 
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/storage/kv/namespaces/${this.cfNamespaceId}/values/${subdomain}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.cfApiToken}`,
          'Content-Type': 'text/html',
        },
        body: fullHTML,
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