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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
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