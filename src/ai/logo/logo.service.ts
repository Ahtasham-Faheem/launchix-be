import { Injectable } from '@nestjs/common';
import { GenerateLogoDto } from './dto/generate-logo.dto';
import { buildLogoPrompt } from './prompts/logo.prompts';
import { callOpenAI, callReplicate, callDeepSeek } from './utils/model-clients';

@Injectable()
export class LogoService {
  async generateLogo(data: GenerateLogoDto) {
    const prompt = buildLogoPrompt(data);

    const [openaiResult, replicateResult, deepseekResult] = await Promise.allSettled([
      callOpenAI(prompt),
      callReplicate(prompt),
      callDeepSeek(prompt),
    ]);

    const successful = [openaiResult, replicateResult, deepseekResult]
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);

    return {
      brand: data.brandName,
      promptUsed: prompt,
      modelsUsed: ['OpenAI', 'Replicate', 'DeepSeek'],
      results: successful,
    };
  }
}
