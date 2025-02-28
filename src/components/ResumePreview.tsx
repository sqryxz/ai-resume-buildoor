'use client';

import React, { FC } from 'react';
import { ResumeData } from './ResumeForm';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview: FC<ResumePreviewProps> = ({ data }) => {
  if (!data?.personalInfo) return null;

  return (
    <div className="bg-white shadow-lg p-8 w-full max-w-4xl mx-auto">
      {/* Header / Personal Info */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.personalInfo.name}</h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
        </div>
        <p className="mt-4 text-gray-700">{data.personalInfo.summary}</p>
      </div>

      {/* Experience Section */}
      {data.experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {data.education?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{edu.school}</h3>
                    <p className="text-gray-600">{edu.degree} in {edu.field}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">{edu.graduationDate}</p>
                    {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extra-Curriculars Section */}
      {data.extraCurriculars?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Extra-Curricular Activities</h2>
          <div className="space-y-4">
            {data.extraCurriculars.map((activity, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{activity.role}</h3>
                    <p className="text-gray-600">{activity.organization}</p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {activity.startDate} - {activity.endDate}
                  </p>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{activity.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {data.skills?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(Boolean).map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumePreview; 