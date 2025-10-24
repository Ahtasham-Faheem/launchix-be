import axios from 'axios';
import { CONFIG } from 'src/config/constants';

export async function callOpenAI(prompt: string) {
    const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'You are a professional logo generator AI.' }, { role: 'user', content: prompt }],
        },
        { headers: { Authorization: `Bearer ${CONFIG.AI_KEYS.OPENAI_API_KEY}` } },
    );
    return res.data.choices[0].message.content;
}

export async function callReplicate(prompt: string) {
    const res = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
            version: 'stability-ai/sdxl:latest',
            input: { prompt },
        },
        { headers: { Authorization: `Token ${CONFIG.AI_KEYS.REPLICATE_API_KEY}` } },
    );
    return res.data;
}

export async function callDeepSeek(prompt: string) {
    const res = await axios.post(
        'https://api.deepseek.com/v1/completions',
        {
            model: 'deepseek-chat',
            prompt,
        },
        { headers: { Authorization: `Bearer ${CONFIG.AI_KEYS.DEEPSEEK_API_KEY}` } },
    );
    return res.data.output_text;
}
