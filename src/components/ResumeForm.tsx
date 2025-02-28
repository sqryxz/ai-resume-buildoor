'use client';

import React, { useState } from 'react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa: string;
}

interface ExtraCurricular {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ResumeData {
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, name: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.personalInfo.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, email: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              className="input-field"
              value={formData.personalInfo.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, phone: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="input-field"
              value={formData.personalInfo.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, location: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              className="input-field h-32"
              value={formData.personalInfo.summary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, summary: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Resume Preview</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold">{formData.personalInfo.name}</h3>
            <p className="text-gray-600">{formData.personalInfo.email}</p>
            <p className="text-gray-600">{formData.personalInfo.phone}</p>
            <p className="text-gray-600">{formData.personalInfo.location}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="text-gray-700">{formData.personalInfo.summary}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Experience</h3>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-medium">{exp.position}</h4>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-gray-500 text-sm">
                  {exp.startDate} - {exp.endDate}
                </p>
                <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 