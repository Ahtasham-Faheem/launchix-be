// project.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { SaveProjectDto } from './dto/save-project.dto';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ProjectService {
    constructor(@InjectModel(Project.name) private projectModel: Model<Project>) { }

    async createProject(dto: CreateProjectDto) {
        const projectId = `proj_${Date.now()}`;
        const project = await this.projectModel.create({
            projectId,
            userId: dto.userId,
            projectName: dto.projectName || `Project ${new Date().toLocaleDateString()}`,
            businessDetails: {
                businessName: '', tagline: '', industry: '', businessType: '', brandStyle: [], brandColors: '', brandMission: '', completed: false
            },
            data: {},
            currentStep: 1
        });
        return { success: true, projectId: project.projectId };
    }

    async saveProject(dto: SaveProjectDto) {
        const existing = await this.projectModel.findOne({ projectId: dto.projectId });
        if (existing) {
            existing.data = dto.data || existing.data;
            existing.lastUpdated = new Date();
            if (dto.thumbnail) existing.thumbnail = dto.thumbnail;
            if (dto.projectName) existing.projectName = dto.projectName;
            if (dto.businessDetails) {
                existing.businessDetails = { ...existing.businessDetails, ...dto.businessDetails };
            }
            await existing.save();
        } else {
            await this.projectModel.create({
                ...dto,
                currentStep: 3,
            });
        }
        return { success: true };
    }

    async getProjectsByUser(userId: string) {
        const projects = await this.projectModel.find({ userId, isActive: true }).sort({ createdAt: -1 });
        return { success: true, projects };
    }

    async getProjectById(projectId: string) {
        const project = await this.projectModel.findOne({ projectId, isActive: true });
        if (!project) throw new NotFoundException('Project not found');
        return { success: true, project };
    }

    async deleteProject(projectId: string) {
        await this.projectModel.findOneAndUpdate({ projectId }, { isActive: false });
        return { success: true };
    }
    async updateProjectStep(projectId: string, currentStep: number) {
        await this.projectModel.findOneAndUpdate({ projectId }, { $set: { currentStep } });
        return { success: true };
    }

    async updateBusinessDetails(projectId: string, updates: any) {
        const project = await this.projectModel.findOneAndUpdate(
            { projectId },
            {
                $set: {
                    businessDetails: {
                        businessName: updates.businessName,
                        tagline: updates.tagline,
                        industry: updates.industry,
                        businessType: updates.businessType,
                        brandStyle: updates.brandStyle,
                        brandColors: updates.brandColors,
                        brandMission: updates.brandMission,
                        completed: updates.completed ?? true,
                    },
                    currentStep: 2,
                },
            },
            { new: true }
        );
        if (!project) throw new NotFoundException('Project not found');
        return { success: true, project };
    }

    async getProjectLogo(projectId: string) {
        const project = await this.projectModel.findOne({ projectId }).lean();
        if (!project) throw new NotFoundException('Project not found');
        return {
            success: true,
            logoUrl: project.businessDetails?.companyLogo || 'https://placehold.co/50x40',
        };
    }

    async getProjectProgress(projectId: string) {
        const project = await this.projectModel.findOne({ projectId });
        if (!project) throw new NotFoundException('Project not found');
        return {
            success: true,
            currentStep: project.currentStep,
        };
    }
    async saveProjectLogo(projectId: string, file?: Express.Multer.File, logoUrl?: string): Promise<string | null> {
        let finalLogoUrl = '';

        if (file) {
            const result = await new Promise<any>((resolve, reject) => {
                const upload = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto', folder: 'project-logos' },
                    (err, res) => (err ? reject(err) : resolve(res))
                );
                upload.end(file.buffer);
            });

            finalLogoUrl = result.secure_url;
        } else if (logoUrl) {
            finalLogoUrl = logoUrl;
        } else {
            return null;
        }

        await this.projectModel.findOneAndUpdate(
            { projectId },
            { $set: { 'businessDetails.companyLogo': finalLogoUrl } }
        );

        return finalLogoUrl;
    }
}