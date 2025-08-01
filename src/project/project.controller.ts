// project.controller.ts
import { CreateProjectDto } from './dto/create-project.dto';
import { SaveProjectDto } from './dto/save-project.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { ProjectService } from './project.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import {
    UploadedFile,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import ResponseHelper from 'src/utils/response-helper';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post('create')
    createProject(@Body() dto: CreateProjectDto) {
        return this.projectService.createProject(dto);
    }

    @Post('save')
    saveProject(@Body() dto: SaveProjectDto) {
        return this.projectService.saveProject(dto);
    }

    @Get('user/:userId')
    getProjectsByUser(@Param('userId') userId: string) {
        return this.projectService.getProjectsByUser(userId);
    }

    @Get(':projectId')
    getProjectById(@Param('projectId') projectId: string) {
        return this.projectService.getProjectById(projectId);
    }

    @Delete(':projectId')
    deleteProject(@Param('projectId') projectId: string) {
        return this.projectService.deleteProject(projectId);
    }
    @Put('update-step/:projectId')
    updateStep(@Param('projectId') projectId: string, @Body('currentStep') currentStep: number) {
        return this.projectService.updateProjectStep(projectId, currentStep);
    }

    @Put('update-business-details/:projectId')
    updateBusinessDetails(@Param('projectId') projectId: string, @Body() updates: any) {
        return this.projectService.updateBusinessDetails(projectId, updates);
    }

    @Get('logo/:projectId')
    getProjectLogo(@Param('projectId') projectId: string) {
        return this.projectService.getProjectLogo(projectId);
    }

    @Get('progress/:projectId')
    getProjectProgress(@Param('projectId') projectId: string) {
        return this.projectService.getProjectProgress(projectId);
    }
    @Post('logo')
    @ApiOperation({ summary: 'Upload or set a project logo' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('logo'))
    async uploadLogo(
        @UploadedFile() logo: Express.Multer.File,
        @Body('projectId') projectId: string,
        @Body('logoUrl') logoUrl?: string
    ) {
        if (!projectId) {
            throw new HttpException('Missing projectId', HttpStatus.BAD_REQUEST);
        }

        const result = await this.projectService.saveProjectLogo(projectId, logo, logoUrl);

        if (!result) {
            throw new HttpException('Failed to save logo', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseHelper.createResponse({
            message: 'Logo saved successfully',
            logoUrl: result,
        }, HttpStatus.OK);
    }
}