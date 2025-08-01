import { exec } from 'child_process';
import * as path from 'path';

export async function deployToVercel(userId: string): Promise<string> {
  const sitePath = path.join(__dirname, '..', '..', 'static-websites', userId);

  return new Promise((resolve, reject) => {
    exec(
      `vercel deploy --cwd "${sitePath}" --prod --yes --token 5HoeVe1MnlQcFo1tPP8MVsWm`,
      (error, stdout, stderr) => {
        if (error) {
          console.error('Deploy error:', stderr || error.message);
          return reject(stderr || error.message);
        }

        const match = stdout.match(/https:\/\/[^\s]+/);
        const url = match ? match[0] : null;
        resolve(url);
      }
    );
  });
}
