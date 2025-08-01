import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrintifyService } from './printify.service';

@Controller('printify')
export class PrintifyController {
    constructor(private readonly printifyService: PrintifyService) { }

    @Get('blueprints')
    getBlueprints() {
        return this.printifyService.fetchBlueprints();
    }
    @Get('providers/:blueprintId')
    getProviders(@Param('blueprintId') blueprintId: string) {
        return this.printifyService.fetchProviders(blueprintId);
    }
    @Get('variants/:blueprintId/:providerId')
    getVariants(
        @Param('blueprintId') blueprintId: string,
        @Param('providerId') providerId: string,
    ) {
        return this.printifyService.fetchVariants(blueprintId, providerId);
    }
    @Post('upload-mockup-logo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadMockupLogo(@UploadedFile() file: Express.Multer.File) {
        return this.printifyService.uploadToCloudinary(file);
    }
    @Post('upload-logo')
    async uploadLogo(@Body() body: { url: string; file_name: string }) {
        if (!body || !body.url || !body.file_name) {
            throw new Error('Missing file or name in request body');
        }
        return this.printifyService.uploadImageToPrintify(body.url, body.file_name);
    }
    @Post('create-product')
    createProduct(@Body() body: any) {
        return this.printifyService.createProduct(body);
    }
    @Post('order-product')
    async placeOrder(@Body() body: any) {
        return this.printifyService.placeOrder(body);
    }
}
