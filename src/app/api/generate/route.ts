import { NextResponse } from 'next/server';
import type { ResumeData } from '../../../components/ResumeForm';

// Google AI API endpoint
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_PROMPT = `You are an expert résumé writer with years of experience helping people land jobs at top companies.
Your task is to enhance the provided résumé content while maintaining accuracy and authenticity.
For each section:
1. Improve the language and impact of descriptions
2. Use strong action verbs and quantifiable achievements
3. Ensure consistent formatting and tense
4. Highlight relevant skills and accomplishments
5. Remove fluff and focus on concrete results

Keep the content truthful and professional. Do not invent or exaggerate achievements.

IMPORTANT: Your response must be valid JSON that matches the structure of the input data.`;

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

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not set');
      throw new Error('API key not configured');
    }

    console.log('Making request to Google AI API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${GOOGLE_AI_API_URL}?key=${process.env.GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: SYSTEM_PROMPT + "\n\n" + formatPrompt(data) }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4000,
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Google AI API response status:', response.status);
      
      // First try to get the response as text
      const responseText = await response.text();
      console.log('Google AI API raw response:', responseText);

      if (!response.ok) {
        console.error('Google AI API error response:', responseText);
        throw new Error(`Google AI API error: ${response.status} - ${responseText}`);
      }

      // Try to parse the response text as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse API response as JSON:', error);
        console.error('Raw response:', responseText);
        throw new Error('Invalid JSON response from Google AI API');
      }

      console.log('Google AI API parsed response:', JSON.stringify(result, null, 2));
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Invalid response format from Google AI API');
      }

      const enhancedContent = result.candidates[0].content.parts[0].text;
      
      let parsedContent;
      try {
        // Find the JSON object in the response text
        const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        parsedContent = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Error parsing AI response content:', error);
        console.log('Raw AI response content:', enhancedContent);
        // If parsing fails, return the raw enhanced content
        return NextResponse.json({ 
          success: true, 
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