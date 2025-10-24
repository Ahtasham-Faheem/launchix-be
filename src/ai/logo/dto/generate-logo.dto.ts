import { IsString, IsOptional, IsArray } from 'class-validator';

export class GenerateLogoDto {
  @IsString()
  brandName: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  colorScheme?: string; // e.g., "blue and white", "warm tones", "black and gold"

  @IsString()
  @IsOptional()
  fontFamily?: string; // e.g., "Poppins", "Montserrat", "Serif", etc.

  @IsArray()
  @IsOptional()
  styles?: string[]; // e.g., ["modern", "minimal", "geometric"]
}
