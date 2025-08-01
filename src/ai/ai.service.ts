// ai.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { Project } from '../project/schemas/project.schema';
import * as cloudinary from 'cloudinary';
import axios from 'axios';
interface CloudinaryUploadResult {
  secure_url: string;
  // you can add other properties you might need from Cloudinary
  [key: string]: any;
}
@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateText(prompt: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates professional content for websites.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 250,
    });
    return { success: true, text: completion.choices[0]?.message?.content };
  }

  async generateLogo(body: any) {
    let {
      projectId,
      brandName = '',
      industry = '',
      style = [],
      includeText = true,
      symbol = '',
      primaryColor = '',
      tagline = ''
    } = body;

    if (projectId) {
      const project = await this.projectModel.findOne({ projectId }).lean();
      if (project) {
        brandName = project.businessDetails?.businessName || brandName;
        industry = project.businessDetails?.industry || industry;
        tagline = project.businessDetails?.tagline || tagline;
        style = project.businessDetails?.brandStyle || style;
        primaryColor = project.businessDetails?.brandColors || primaryColor;
      }
    }

    if (!brandName || typeof brandName !== 'string') {
      throw new BadRequestException('Valid brandName is required');
    }

    const firstColor = primaryColor.split(',')[0] || primaryColor;
    let prompt = `A ${style.length > 0 ? style.join(' and ') : 'professional'} logo design for "${brandName}"`;
    if (industry) prompt += ` in the ${industry} industry`;
    if (symbol) prompt += ` featuring a ${symbol}`;
    if (firstColor) prompt += `, with ${firstColor} as the main color`;
    if (tagline) prompt += `. Tagline: "${tagline}"`;
    prompt += `, vector art`;
    if (!includeText) prompt += `, text not included`;

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const logoUrl = response.data[0]?.url;
    if (!logoUrl) throw new Error('Image generation failed');

    const imageResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    const cloudinaryResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: 'generated-logos' },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(imageBuffer);
    });

    if (projectId) {
      await this.projectModel.findOneAndUpdate(
        { projectId },
        {
          $set: {
            'businessDetails.companyLogo': cloudinaryResult.secure_url,
            'businessDetails.completed': true,
            currentStep: 3,
          },
        }
      );
    }

    return { success: true, logoUrl: cloudinaryResult.secure_url };
  }

  async saveLogo(file: Express.Multer.File, body: any) {
    const { projectId, logoUrl } = body;
    if (!projectId) throw new BadRequestException('Missing projectId');

    let finalLogoUrl = '';
    if (file) {
      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { resource_type: 'auto', folder: 'project-logos' },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(file.buffer);
      });
      finalLogoUrl = uploadResult.secure_url;
    } else if (logoUrl) {
      finalLogoUrl = logoUrl;
    } else {
      throw new BadRequestException('No logo provided');
    }

    await this.projectModel.findOneAndUpdate(
      { projectId },
      { $set: { 'businessDetails.companyLogo': finalLogoUrl } }
    );

    return {
      success: true,
      message: 'Logo saved successfully',
      logoUrl: finalLogoUrl,
    };
  }

  async generateTemplate(prompt: string, projectId: string) {
    const user = await this.projectModel.findById(projectId).lean();
    if (!user) throw new NotFoundException('User not found');

    const companyName = user.businessDetails?.businessName || 'My Business';
    const industry = user.businessDetails?.industry || 'business';

    const enhancedPrompt = `Create a fully responsive single-page website template for ${companyName}, a ${industry} industry. The design must use a professional color scheme and include free high-quality media links and background images throughout.
Start with <!DOCTYPE html>. All CSS in the same file. No explanations.` +
      ` User's input: ${prompt}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional web designer. Return complete HTML + CSS only.' },
        { role: 'user', content: enhancedPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const template = completion.choices[0]?.message?.content.replace(/```html|```/g, '').trim();

    return {
      success: true,
      template: {
        pages: [{ name: 'AI Generated Template', component: template }],
      },
    };
  }

  async generateWebsiteContent(projectId: string) {
    const project = await this.projectModel.findOne({ projectId }).lean();
    if (!project) throw new NotFoundException('Project not found');

    const prompt = `Create unique professional website content for ${project.businessDetails?.businessName || 'Your Business'} in ${project.businessDetails?.industry || 'industry'}.
Brand mission: ${project.businessDetails?.brandMission || ''}
Include: Hero, 3 Features, 2 Testimonials, Contact section`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate website content as JSON: { "hero": "Headline\\nSubhead", "features": [...], "testimonials": [...], "contact": "..." }`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = JSON.parse(completion.choices[0]?.message?.content);

    return {
      success: true,
      content,
      logoUrl: project.businessDetails?.companyLogo || 'https://placehold.co/40x30',
    };
  }

  async updateComponentContent(prompt: string, componentType: string, currentContent: string) {
    let instruction = '';
    switch (componentType) {
      case 'heading component':
        instruction = `Rewrite this heading text to be more compelling: ${prompt}. Current: "${currentContent}".`;
        break;
      case 'text component':
        instruction = `Improve this paragraph: ${prompt}. Current: "${currentContent}".`;
        break;
      case 'button component':
        instruction = `Create a CTA button based on: ${prompt}. Current: "${currentContent}".`;
        break;
      default:
        instruction = `Update content based on: ${prompt}. Current: "${currentContent}".`;
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You improve website components.' },
        { role: 'user', content: instruction },
      ],
      max_tokens: 300,
    });

    return {
      success: true,
      text: completion.choices[0]?.message?.content.replace(/"/g, ''),
    };
  }
}
