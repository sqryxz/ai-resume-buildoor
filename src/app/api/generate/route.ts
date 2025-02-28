import { NextResponse } from 'next/server';
import type { ResumeData } from '../../../components/ResumeForm';

// API Configuration
const API_CONFIG = {
  url: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  timeout: 60000,
  maxTokens: 4000
};

const SYSTEM_PROMPT = `You are an expert résumé writer. Enhance the provided résumé while maintaining accuracy.
Focus on:
1. Strong action verbs and quantifiable achievements
2. Consistent formatting and tense
3. Concrete results over fluff

IMPORTANT: Respond with ONLY a valid JSON object. No explanatory text or formatting.`;

const formatPrompt = (data: ResumeData): string => {
  return `Enhance these résumé sections and return ONLY a JSON object with this structure:
{
  "personalInfo": { "summary": "enhanced summary" },
  "experience": [{ "position": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "..." }],
  "education": [{ "school": "...", "degree": "...", "field": "...", "graduationDate": "...", "gpa": "..." }],
  "extraCurriculars": [{ "role": "...", "organization": "...", "startDate": "...", "endDate": "...", "description": "..." }],
  "skills": ["skill1", "skill2", ...]
}

Current résumé content:
${JSON.stringify(data, null, 2)}`;
};

const validateApiResponse = (content: any): boolean => {
  if (!content || typeof content !== 'object') return false;
  if (!content.personalInfo?.summary) return false;
  if (!Array.isArray(content.experience)) return false;
  if (!Array.isArray(content.education)) return false;
  if (!Array.isArray(content.extraCurriculars)) return false;
  if (!Array.isArray(content.skills)) return false;
  return true;
};

export async function POST(request: Request) {
  try {
    // 1. Parse request data
    const data: ResumeData = await request.json();
    console.log('📝 Processing resume data:', {
      summaryLength: data.personalInfo.summary.length,
      experienceCount: data.experience.length,
      educationCount: data.education.length,
      skillsCount: data.skills.length
    });

    // 2. Validate API key
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    // 3. Setup request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      // 4. Make API request
      console.log('🚀 Sending request to DeepSeek API...');
      const response = await fetch(API_CONFIG.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: formatPrompt(data) }
          ],
          temperature: 0.3,
          max_tokens: API_CONFIG.maxTokens,
          top_p: 0.95
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 5. Handle API response
      const responseText = await response.text();
      console.log('📥 API Status:', response.status, 'Headers:', Object.fromEntries(response.headers));
      console.log('📥 Response preview:', responseText.substring(0, 200));

      if (!response.ok) {
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.error?.message || `API error: ${response.status}`);
        } catch {
          throw new Error(`API error: ${response.status} - ${responseText}`);
        }
      }

      // 6. Parse and validate response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error('❌ Parse error:', error, 'Raw:', responseText);
        throw new Error('Invalid JSON response from API');
      }

      if (!result.choices?.[0]?.message?.content) {
        console.error('❌ Invalid format:', result);
        throw new Error('Invalid response format from API');
      }

      // 7. Parse enhanced content
      const enhancedContent = result.choices[0].message.content;
      let parsedContent;

      try {
        parsedContent = JSON.parse(enhancedContent);
      } catch (e) {
        console.error('❌ Content parse error:', e, 'Content:', enhancedContent);
        const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        parsedContent = JSON.parse(jsonMatch[0]);
      }

      // 8. Validate content structure
      if (!validateApiResponse(parsedContent)) {
        console.error('❌ Invalid structure:', parsedContent);
        throw new Error('Response missing required fields');
      }

      // 9. Return successful response
      console.log('✅ Success:', {
        summaryLength: parsedContent.personalInfo.summary.length,
        experienceCount: parsedContent.experience.length,
        educationCount: parsedContent.education.length,
        skillsCount: parsedContent.skills.length
      });

      return NextResponse.json({ 
        success: true, 
        content: parsedContent,
        format: 'json'
      });

    } catch (error) {
      // 10. Handle API errors
      console.error('❌ API Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process resume',
          details: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // 11. Handle request parsing errors
    console.error('❌ Request Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid request format',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }
} 