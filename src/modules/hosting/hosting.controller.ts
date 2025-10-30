import {
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { HostingService } from './hosting.service';
import { AuthGuard } from '../auth/auth.guard';
import { PublishWebsiteResponse } from './dto/hosting.dto';
import { BrandService } from '../brand/brand.service';


@ApiTags('hosting')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('hosting')
export class HostingController {
    constructor(
        private readonly hostingService: HostingService,
        private readonly brandService: BrandService,
    ) { }

    /**
     * Publishes a generated website from an existing Brand & BrandAssets.
     * This route requires authentication.
     */
    @Post('publish/:brandId')
    @ApiOperation({
        summary: 'Publish Website by Brand ID',
        description:
            'Fetches brand and associated assets, compiles HTML + CSS, and publishes to Cloudflare KV. \
This endpoint is protected — only authenticated users can publish websites.',
    })
    @ApiParam({
        name: 'brandId',
        required: true,
        description: 'The unique identifier of the brand to publish.',
        example: '68f2a90b1d6a9f4312abc902',
    })
    @ApiResponse({
        status: 201,
        description: 'Website successfully published to Cloudflare KV.',
        type: PublishWebsiteResponse,
    })
    @ApiResponse({ status: 400, description: 'Missing or invalid brand data.' })
    @ApiResponse({ status: 404, description: 'Brand or assets not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized or invalid token.' })
    @ApiResponse({
        status: 500,
        description: 'Internal error — Cloudflare API or server issue.',
    })
    async publishFromBrand(@Param('brandId') brandId: string): Promise<PublishWebsiteResponse> {
        console.log('⚡ Starting publish for brand:', brandId);

        try {
            // 1️⃣ Fetch Brand Information
            const { brand, assets } = await this.brandService.getBrand(brandId);
            if (!brand) {
                throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
            }

            if (!assets || !assets.website || !assets.website.grapesjs) {
                throw new HttpException(
                    'Brand assets missing (HTML/CSS not found)',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const { html, css } = assets.website.grapesjs || {};

            // 3️⃣ Publish via Hosting Service
            const result = await this.hostingService.publishWebsite(
                brand.businessName,
                html,
                css,
                brand.subdomain
            );

            // 4️⃣ Update Brand with new subdomain and publishedUrl
            await this.brandService.updateBrand(brandId, {
                subdomain: result.subdomain,
                publishedUrl: result.url,
            });


            console.log('✅ Publish successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Publish Error:', error);
            throw new HttpException(
                error.message || 'Failed to publish website',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
