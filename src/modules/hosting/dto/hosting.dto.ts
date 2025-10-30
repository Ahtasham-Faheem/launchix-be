import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PublishWebsiteDto {
    @ApiProperty({
        description: 'The business or project name to generate subdomain.',
        example: 'Inner Peace',
    })
    @IsString()
    @IsNotEmpty()
    websiteName: string;

    @ApiProperty({
        description: 'Raw HTML content of the generated website.',
        example: '<h1>Welcome to Inner Peace</h1><p>Your calm begins here.</p>',
    })
    @IsString()
    @IsNotEmpty()
    html: string;

    @ApiProperty({
        description: 'CSS styles to be injected into the HTML.',
        example: 'body { background: #fff; color: #333; }',
    })
    @IsString()
    @IsNotEmpty()
    css: string;
}

export class PublishWebsiteResponse {
    @ApiProperty({
        description: 'Public URL of the deployed website.',
        example: 'https://inner-peace-385104.launchix.ai',
    })
    url: string;

    @ApiProperty({
        description: 'Generated subdomain identifier.',
        example: 'inner-peace-385104',
    })
    subdomain: string;
}
