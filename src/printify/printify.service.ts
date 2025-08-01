import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

const PRINTIFY_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImE4NzRmZWY5MTE3ODU1MzIxYWViMGYxN2ZhYWZiMDQzMjdkY2M0MmZlZTcwOTE2MTEwOWYzNzUzZTcyYWIzODc4NzU1MDY3ODc2ZDk3ZDAyIiwiaWF0IjoxNzQ4NTM1OTY3LjkwNzksIm5iZiI6MTc0ODUzNTk2Ny45MDc5MDIsImV4cCI6MTc4MDA3MTk2Ny45MDExMiwic3ViIjoiMjMyNzc4ODMiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.VXVeT2rYyEsimumMe-t4xeiwMXmoOKMiv0nYTaLQnvjTdYxZK8w460syK9S3w9kClDqtzmlR0Dw7f2OFY9mmJ_YQ_ZXMaZOFQZCGtgmmmpmPU5QUae11uIEbD-AqEv3-H9r0nQ3ccAKlCfQx8KlK-_irJsIAvuwSAQMFycr6Zp-N2nuJ0TFpHQOTxdScLNoB_lYGQb88YnAp0tbgdScn13NvB0PLeOXh9mLUqx600SUMEOSuBjQYxHK-fo4Zol36xF4lmuOEKZ6fPQZArlvK8ZXAQU8Bz9EQqyrVNI8wUMbd4K17UeWgYfKEgGcuGRjSQKz18WntXuGx6lCEGj7nMu5X0BRkO0Z-IgrHU0T7lcNfcr_WKT_4FWDpPUiUcU3IFiLOdmq9z8QNvLvNN_KjB6M-Xjow_24JNVYRod3_zpl6bVhfNZk74bf0HgT8IwhrD5jsi1Odm_z56kzimgBzZFKl3upRoI11dICEjUIMhE-TGRtHJNuEV2lTuU8S1jqxDBRGdZop85jCVXiIV9O5_5JjIOw7TDzKyDQ880lEYuO53eH93T5K7WbSi-m6gFaAmqQ2tY4Ef1LE4ea_5WD-2FoyoLmiSIJgOaQMGjAVXTE8Ezt5Cg_vNV7kb4-B1LXBk917V4QUOlKY9S3bF-40I9ke5clKCAakVBFslYSlAL8';
const HEADERS = {
    Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImE4NzRmZWY5MTE3ODU1MzIxYWViMGYxN2ZhYWZiMDQzMjdkY2M0MmZlZTcwOTE2MTEwOWYzNzUzZTcyYWIzODc4NzU1MDY3ODc2ZDk3ZDAyIiwiaWF0IjoxNzQ4NTM1OTY3LjkwNzksIm5iZiI6MTc0ODUzNTk2Ny45MDc5MDIsImV4cCI6MTc4MDA3MTk2Ny45MDExMiwic3ViIjoiMjMyNzc4ODMiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.VXVeT2rYyEsimumMe-t4xeiwMXmoOKMiv0nYTaLQnvjTdYxZK8w460syK9S3w9kClDqtzmlR0Dw7f2OFY9mmJ_YQ_ZXMaZOFQZCGtgmmmpmPU5QUae11uIEbD-AqEv3-H9r0nQ3ccAKlCfQx8KlK-_irJsIAvuwSAQMFycr6Zp-N2nuJ0TFpHQOTxdScLNoB_lYGQb88YnAp0tbgdScn13NvB0PLeOXh9mLUqx600SUMEOSuBjQYxHK-fo4Zol36xF4lmuOEKZ6fPQZArlvK8ZXAQU8Bz9EQqyrVNI8wUMbd4K17UeWgYfKEgGcuGRjSQKz18WntXuGx6lCEGj7nMu5X0BRkO0Z-IgrHU0T7lcNfcr_WKT_4FWDpPUiUcU3IFiLOdmq9z8QNvLvNN_KjB6M-Xjow_24JNVYRod3_zpl6bVhfNZk74bf0HgT8IwhrD5jsi1Odm_z56kzimgBzZFKl3upRoI11dICEjUIMhE-TGRtHJNuEV2lTuU8S1jqxDBRGdZop85jCVXiIV9O5_5JjIOw7TDzKyDQ880lEYuO53eH93T5K7WbSi-m6gFaAmqQ2tY4Ef1LE4ea_5WD-2FoyoLmiSIJgOaQMGjAVXTE8Ezt5Cg_vNV7kb4-B1LXBk917V4QUOlKY9S3bF-40I9ke5clKCAakVBFslYSlAL8`,
};

@Injectable()
export class PrintifyService {
    async fetchBlueprints() {
        const res = await axios.get('https://api.printify.com/v1/catalog/blueprints.json', {
            headers: HEADERS,
        });

        const blueprints = res.data;

        // Grouping by category title
        const categoryMap: Record<string, any[]> = {};

        for (const bp of blueprints) {
            const category = bp.category || 'Others';

            if (!categoryMap[category]) categoryMap[category] = [];

            // Only add up to 10 per category
            if (categoryMap[category].length < 50) {
                categoryMap[category].push(bp);
            }
        }

        return categoryMap; // returns { "T-Shirts": [..], "Caps": [..], ... }
    }


    async fetchProviders(blueprintId: string) {
        const res = await axios.get(
            `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
            { headers: HEADERS },
        );
        return res.data;
    }

    async fetchVariants(blueprintId: string, providerId: string) {
        const res = await axios.get(
            `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`,
            { headers: HEADERS },
        );
        return res.data;
    }

    async uploadImage(file: Express.Multer.File) {
        const form = new FormData();

        form.append('file', Readable.from(file.buffer), {
            filename: file.originalname,
            contentType: file.mimetype, // important!
        });

        try {
            const res = await axios.post(
                'https://api.printify.com/v1/uploads/images.json',
                form,
                {
                    headers: {
                        Authorization: `Bearer ${PRINTIFY_TOKEN}`,
                        ...form.getHeaders(), // properly includes boundary!
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                },
            );

            return res.data;
        } catch (error) {
            console.error('Printify Upload Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createProduct(body: any) {
        const { shopId, ...productData } = body;
        const res = await axios.post(
            `https://api.printify.com/v1/shops/${shopId}/products.json`,
            productData,
            { headers: HEADERS },
        );
        return res.data;
    }
    async uploadToCloudinary(file: Express.Multer.File) {
        const result = await new Promise<any>((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'mockup-logos' },
                (err, res) => (err ? reject(err) : resolve(res))
            );
            upload.end(file.buffer);
        });

        return {
            success: true,
            url: result.secure_url,
            name: file.originalname,
        };
    }

    async uploadImageToPrintify(fileUrl: string, fileName: string) {
        const payload = {
            url: fileUrl,
            file_name: fileName,
        };

        try {
            const res = await axios.post(
                'https://api.printify.com/v1/uploads/images.json',
                payload,
                { headers: HEADERS }
            );

            return res.data;
        } catch (error) {
            console.error('Printify Upload Error:', error.response?.data || error.message);
            throw error;
        }
    }
    async placeOrder(orderData: any) {
        const { product_id, variant_id, quantity, shipping } = orderData;

        const payload = {
            line_items: [
                {
                    product_id,
                    variant_id,
                    quantity,
                },
            ],
            shipping_method: 1, // 1 is usually "Standard"
            address_to: {
                first_name: shipping.name.split(' ')[0],
                last_name: shipping.name.split(' ')[1] || '',
                email: 'customer@example.com',
                phone: '+1234567890',
                address1: shipping.address1,
                city: shipping.city,
                state: shipping.state,
                zip: shipping.zip,
                country: shipping.country,
            },
            send_shipping_notification: true,
        };

        try {
            const res = await axios.post(
                `https://api.printify.com/v1/shops/${orderData.shopId || '22488555'}/orders.json`,
                payload,
                { headers: HEADERS }
            );

            return {
                success: true,
                message: 'Order placed successfully',
                order: res.data,
            };
        } catch (err) {
            console.error('Printify Order Error:', err.response?.data || err.message);
            throw err;
        }
    }

}
