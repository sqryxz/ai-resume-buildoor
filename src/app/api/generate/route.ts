import { NextResponse } from 'next/server';
import type { ResumeData } from '../../../components/ResumeForm';

// DeepSeek API endpoint
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM_PROMPT = `You are an expert résumé writer with years of experience helping people land jobs at top companies.
Your task is to enhance the provided résumé content while maintaining accuracy and authenticity.
For each section:
1. Improve the language and impact of descriptions
2. Use strong action verbs and quantifiable achievements
3. Ensure consistent formatting and tense
4. Highlight relevant skills and accomplishments
5. Remove fluff and focus on concrete results

Keep the content truthful and professional. Do not invent or exaggerate achievements.

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks. The response should be a single JSON object that can be parsed directly.`;

const formatPrompt = (data: ResumeData) => {
  return `Please enhance the following résumé sections. Return your response as a JSON object that matches the exact structure of the input data:

PERSONAL SUMMARY:
${data.personalInfo.summary}

PROFESSIONAL EXPERIENCE:
${data.experience.map((exp) => `
Role: ${exp.position}
Company: ${exp.company}
Duration: ${exp.startDate} - ${exp.endDate}
Description:
${exp.description}
`).join('\n')}

EDUCATION:
${data.education.map((edu) => `
School: ${edu.school}
Degree: ${edu.degree}
Field: ${edu.field}
Graduation: ${edu.graduationDate}
${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\n')}

EXTRA-CURRICULAR ACTIVITIES:
${data.extraCurriculars.map((activity) => `
Role: ${activity.role}
Organization: ${activity.organization}
Duration: ${activity.startDate} - ${activity.endDate}
Description:
${activity.description}
`).join('\n')}

SKILLS:
${data.skills.filter(Boolean).join(', ')}

Your response must be a valid JSON object with the following structure:
{
  "personalInfo": { "summary": "enhanced summary" },
  "experience": [{ "position": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "..." }],
  "education": [{ "school": "...", "degree": "...", "field": "...", "graduationDate": "...", "gpa": "..." }],
  "extraCurriculars": [{ "role": "...", "organization": "...", "startDate": "...", "endDate": "...", "description": "..." }],
  "skills": ["skill1", "skill2", ...]
}`;
};

export async function POST(request: Request) {
  try {
    const data: ResumeData = await request.json();
    console.log('Received request with data:', JSON.stringify(data, null, 2));

    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY is not set');
      throw new Error('API key not configured');
    }

    console.log('Making request to DeepSeek API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT
            },
            {
              role: "user",
              content: formatPrompt(data)
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: ["```"]
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error response:', errorText);
        
        // Try to parse the error as JSON
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error?.message || `DeepSeek API error: ${response.status}`);
        } catch (e) {
          // If we can't parse the error as JSON, just return the raw error
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }
      }

      // First try to get the response as text
      const responseText = await response.text();
      console.log('DeepSeek API raw response:', responseText);

      // Try to parse the response text as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse API response as JSON:', error);
        console.error('Raw response:', responseText);
        
        // If the response isn't JSON, try to extract JSON from the text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (e) {
            throw new Error('Could not extract valid JSON from response');
          }
        } else {
          throw new Error('Invalid JSON response from DeepSeek API');
        }
      }

      console.log('DeepSeek API parsed response:', JSON.stringify(result, null, 2));
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      const enhancedContent = result.choices[0].message.content;
      
      let parsedContent;
      try {
        // Try to parse the content directly first
        try {
          parsedContent = JSON.parse(enhancedContent);
        } catch (e) {
          // If direct parsing fails, try to find and extract a JSON object
          const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON object found in response');
          }
          parsedContent = JSON.parse(jsonMatch[0]);
        }

        // Validate the parsed content has the required structure
        if (!parsedContent.personalInfo || !parsedContent.experience || !parsedContent.education) {
          throw new Error('Response missing required fields');
        }
      } catch (error) {
        console.error('Error parsing AI response content:', error);
        console.log('Raw AI response content:', enhancedContent);
        // If parsing fails, return the raw enhanced content
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to parse AI response',
          content: enhancedContent,
          format: 'text'
        });
      }

      return NextResponse.json({ 
        success: true, 
        content: parsedContent,
        format: 'json'
      });
    } catch (error) {
      console.error('Error in resume generation:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to generate resume',
          details: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in resume generation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate resume',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 