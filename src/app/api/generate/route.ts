import { NextResponse } from 'next/server';
import type { ResumeData } from '../../../components/ResumeForm';

// Updated DeepSeek API endpoint
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert résumé writer with years of experience helping people land jobs at top companies.
Your task is to enhance the provided résumé content while maintaining accuracy and authenticity.
For each section:
1. Improve the language and impact of descriptions
2. Use strong action verbs and quantifiable achievements
3. Ensure consistent formatting and tense
4. Highlight relevant skills and accomplishments
5. Remove fluff and focus on concrete results

Keep the content truthful and professional. Do not invent or exaggerate achievements.`;

const formatPrompt = (data: ResumeData) => {
  return `Please enhance the following résumé sections maintaining the same structure but improving the content:

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

Please provide the enhanced content in a JSON format matching the original structure, with each section improved for maximum impact.`;
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
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
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
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }),
    });

    console.log('DeepSeek API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('DeepSeek API response:', JSON.stringify(result, null, 2));
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const enhancedContent = result.choices[0].message.content;
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(enhancedContent);
    } catch (error) {
      console.error('Error parsing AI response:', error);
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
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 