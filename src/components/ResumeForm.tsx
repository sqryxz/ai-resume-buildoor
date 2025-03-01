'use client';

import React, { useState } from 'react';
import ResumePreview from './ResumePreview';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa: string;
}

export interface ExtraCurricular {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  extraCurriculars: ExtraCurricular[];
  skills: string[];
}

interface ResumeFormProps {
  sampleData: ResumeData;
}

export default function ResumeForm({ sampleData }: ResumeFormProps) {
  const [formData, setFormData] = useState<ResumeData>(sampleData);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [field]: value,
      },
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...formData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      experience: newExperience,
    });
  };

  const enhanceWithAI = async () => {
    setIsEnhancing(true);
    setError(null);
    console.log('DEEPSEEK_API_KEY', process.env.DEEPSEEK_API_KEY)
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('response.ok', response.ok)
      console.log('response.body', response.body)
      if (response.ok) {
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to enhance resume');
          }
    
          console.log(result);
          if (result.format === 'json') {
            setFormData(result.content);
          } else {
            setError('Received unstructured content. Please try again.');
          }

        return;
      }

      console.log('response not ok');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
          <button
            onClick={enhanceWithAI}
            disabled={isEnhancing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
          >
            {isEnhancing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enhancing...
              </>
            ) : (
              'Enhance with AI'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="input-field"
              value={formData.personalInfo.name}
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              className="input-field"
              value={formData.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="input-field"
              value={formData.personalInfo.location}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              className="input-field h-32"
              value={formData.personalInfo.summary}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
            />
          </div>
        </div>

        {/* Experience Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Experience</h2>
          {formData.experience.map((exp, index) => (
            <div key={index} className="space-y-4 mb-6 pb-6 border-b border-gray-200 last:border-0">
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  className="input-field"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  className="input-field"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="text"
                    className="input-field"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="text"
                    className="input-field"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="input-field h-32"
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="sticky top-8">
        <ResumePreview data={formData} />
      </div>
    </div>
  );
} 