import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class MetaService {
  private readonly PAGE_ACCESS_TOKEN = 'EAAJzsrD2xGcBOzKrUUKVGNSYZAmnR3ePpPsChJrr08XuAXrin0gHTZCL7wHDyrYXgCrHlPxUABJTRFXyUMicSekTLZASCJiN2HSlJAegvZAYtVM0nZBDoZCzKbY5nAo8xorflgxjahGqXFU4NwcavVvIO9JcPxjddclrtHoQU2OkbYmJbOCOUrpSUpyIZBcKZBRsP77k6cZC95cNMv6AARaVL5COIa8ddpzXww5UZD'; // from Meta App
  private readonly PAGE_ID = '589160084292011'; // from Meta App Dashboard

  async postToMeta(data: { text: string; image?: Express.Multer.File }) {
    const { text, image } = data;

    if (image) {
      // Upload Image First
      const form = new FormData();
      form.append('image', image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
      form.append('access_token', this.PAGE_ACCESS_TOKEN);

      const imageRes = await axios.post(
        `https://graph.facebook.com/v18.0/${this.PAGE_ID}/photos`,
        form,
        { headers: form.getHeaders() }
      );

      return imageRes.data;
    }

    // Text-only post
    const res = await axios.post(
      `https://graph.facebook.com/v18.0/${this.PAGE_ID}/feed`,
      {
        message: text,
        access_token: this.PAGE_ACCESS_TOKEN,
      }
    );

    return res.data;
  }
}
