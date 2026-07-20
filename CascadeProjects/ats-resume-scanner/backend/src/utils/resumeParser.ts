import { parsePDF } from './pdfParser';
import { parseDOCX } from './docxParser';

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  certifications: string[];
  languages: string[];
}

export const parseResume = async (
  buffer: Buffer,
  fileType: string
): Promise<ParsedResume> => {
  let text: string;

  if (fileType === 'application/pdf') {
    text = await parsePDF(buffer);
  } else if (
    fileType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    text = await parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file type');
  }

  return extractResumeData(text);
};

const extractResumeData = (text: string): ParsedResume => {
  const lines = text.split('\n').filter((line) => line.trim());

  const parsed: ParsedResume = {
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    parsed.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  if (phoneMatch) {
    parsed.phone = phoneMatch[0];
  }

  // Extract skills (common patterns)
  const skillKeywords = [
    'javascript',
    'typescript',
    'python',
    'java',
    'react',
    'node',
    'angular',
    'vue',
    'sql',
    'mongodb',
    'postgresql',
    'aws',
    'docker',
    'kubernetes',
    'git',
    'agile',
    'scrum',
    'html',
    'css',
    'redux',
    'express',
    'next',
    'graphql',
    'rest',
    'api',
  ];

  const lowerText = text.toLowerCase();
  skillKeywords.forEach((skill) => {
    if (lowerText.includes(skill) && !parsed.skills.includes(skill)) {
      parsed.skills.push(skill);
    }
  });

  // Extract experience section
  const experienceSection = extractSection(text, ['experience', 'work history', 'employment']);
  if (experienceSection) {
    parsed.experience = parseExperience(experienceSection);
  }

  // Extract education section
  const educationSection = extractSection(text, ['education', 'academic', 'qualifications']);
  if (educationSection) {
    parsed.education = parseEducation(educationSection);
  }

  // Extract projects section
  const projectsSection = extractSection(text, ['projects', 'portfolio']);
  if (projectsSection) {
    parsed.projects = parseProjects(projectsSection);
  }

  // Extract certifications
  const certSection = extractSection(text, ['certifications', 'certificates', 'credentials']);
  if (certSection) {
    parsed.certifications = parseCertifications(certSection);
  }

  // Extract languages
  const languageKeywords = ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'hindi'];
  languageKeywords.forEach((lang) => {
    if (lowerText.includes(lang) && !parsed.languages.includes(lang)) {
      parsed.languages.push(lang);
    }
  });

  return parsed;
};

const extractSection = (text: string, keywords: string[]): string | null => {
  const lowerText = text.toLowerCase();
  let startIndex = -1;

  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1 && (startIndex === -1 || index < startIndex)) {
      startIndex = index;
    }
  }

  if (startIndex === -1) return null;

  // Find the end of the section (next major heading)
  const remainingText = text.substring(startIndex);
  const lines = remainingText.split('\n');

  let endIndex = lines.length;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0 && line === line.toUpperCase() && line.length < 50) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(0, endIndex).join('\n');
};

const parseExperience = (section: string): any[] => {
  const experiences: any[] = [];
  const lines = section.split('\n').filter((line) => line.trim());

  let currentExperience: any = null;

  for (const line of lines) {
    // Check if line looks like a job title/company
    if (line.includes(' at ') || line.includes(' - ') || line.includes(',')) {
      if (currentExperience) {
        experiences.push(currentExperience);
      }
      currentExperience = {
        title: line.split(' at ')[0] || line.split(' - ')[0] || line,
        company: line.includes(' at ') ? line.split(' at ')[1] : '',
        description: '',
      };
    } else if (currentExperience) {
      currentExperience.description += line + ' ';
    }
  }

  if (currentExperience) {
    experiences.push(currentExperience);
  }

  return experiences;
};

const parseEducation = (section: string): any[] => {
  const education: any[] = [];
  const lines = section.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    if (line.includes('University') || line.includes('College') || line.includes('School')) {
      education.push({
        institution: line,
        degree: '',
        year: '',
      });
    }
  }

  return education;
};

const parseProjects = (section: string): any[] => {
  const projects: any[] = [];
  const lines = section.split('\n').filter((line) => line.trim());

  let currentProject: any = null;

  for (const line of lines) {
    if (line.length < 100 && line.includes(':')) {
      if (currentProject) {
        projects.push(currentProject);
      }
      currentProject = {
        name: line,
        description: '',
      };
    } else if (currentProject) {
      currentProject.description += line + ' ';
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
};

const parseCertifications = (section: string): string[] => {
  const certifications: string[] = [];
  const lines = section.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    if (line.length < 100) {
      certifications.push(line);
    }
  }

  return certifications;
};
