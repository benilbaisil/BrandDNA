import { BrandIdentity } from '../models/BrandIdentity.js';
import { Project } from '../models/Project.js';
import { Report } from '../models/Report.js';
import { StartupProfile } from '../models/StartupProfile.js';
import { Activity } from '../models/Activity.js';
import { generateBrandAssets } from './geminiService.js';

export const getUserBrandIdentityService = async (userId) => {
  let brand = await BrandIdentity.findOne({ user: userId });
  const profile = await StartupProfile.findOne({ owner: userId });

  if (!brand) {
    brand = await BrandIdentity.create({
      user: userId,
      brandName: profile?.companyName || '',
    });
  }

  return { brand, profile };
};

export const generateAIInsightsService = async (userId) => {
  const profile = await StartupProfile.findOne({ owner: userId });
  if (!profile) {
    throw new Error('Please submit your basic business details first to generate AI Insights.');
  }

  const { companyName, industry, companyDescription, targetAudience, businessGoals, productsServices } = profile;

  const cleanName = companyName ? companyName.replace(/[^a-zA-Z0-9]/g, '') : 'Nova';

  const nameSuggestions = [
    {
      name: `${cleanName} AI`,
      rationale: `Modern tech variant highlighting ${industry} automation & AI capability.`,
    },
    {
      name: `Vectra ${cleanName}`,
      rationale: `Enterprise-grade positioning emphasizing high velocity in ${industry}.`,
    },
    {
      name: `${cleanName}Sphere`,
      rationale: `Ecosystem brand name representing end-to-end ${productsServices}.`,
    },
    {
      name: `Aura${cleanName}`,
      rationale: `Premium, customer-centric naming tailored for ${targetAudience}.`,
    },
    {
      name: `${cleanName} Flow`,
      rationale: `Streamlined branding signifying efficiency and seamless goal achievement (${businessGoals}).`,
    },
  ];

  const targetAudienceAnalysis = {
    demographics: `Decision-makers, founders, and leaders in ${industry} looking for ${productsServices}.`,
    psychographics: `Value speed, reliability, and modern technological innovation. Highly motivated to achieve: "${businessGoals}".`,
    primaryPainPoints: `Outdated manual processes, lack of scalability, high vendor costs, and fragmented ${industry} solutions.`,
    channels: `LinkedIn, Industry Podcasts, Twitter/X, Targeted Google Search & Specialized Conferences.`,
  };

  const strategicGoals = [
    {
      title: 'Short-Term Launch & Validation',
      timeframe: 'Months 1 - 3',
      description: `Establish core digital brand identity, validate ${productsServices} with initial target audience (${targetAudience}), and capture feedback.`,
    },
    {
      title: 'Market Penetration & Scaling',
      timeframe: 'Months 4 - 8',
      description: `Accelerate adoption in the ${industry} domain, optimize acquisition channels, and work toward key milestone: "${businessGoals}".`,
    },
    {
      title: 'Enterprise Expansion & Leadership',
      timeframe: 'Months 9 - 12',
      description: `Expand customer lifetime value, establish strategic partnerships, and cement category leadership for ${companyName}.`,
    },
  ];

  const swotAnalysis = {
    strengths: [
      `Targeted product focus on ${productsServices}.`,
      `Clear value proposition designed for ${targetAudience}.`,
      `Agile positioning in the growing ${industry} sector.`,
      `Defined leadership focus on: ${businessGoals}.`,
    ],
    weaknesses: [
      `Brand awareness building required in early market entry.`,
      `Resource allocation needed for rapid scaling.`,
      `Initial customer acquisition velocity requires channel optimization.`,
    ],
    opportunities: [
      `High demand for automated ${industry} solutions.`,
      `Expansion into adjacent market segments within ${targetAudience}.`,
      `Strategic technology integrations to enhance ${productsServices}.`,
      `Direct organic search leadership via targeted thought leadership.`,
    ],
    threats: [
      `Emerging legacy competitors in the ${industry} space.`,
      `Shifting customer preferences and rapid technological changes.`,
      `Customer acquisition cost fluctuations on paid advertising channels.`,
    ],
  };

  let brand = await BrandIdentity.findOne({ user: userId });
  if (!brand) {
    brand = new BrandIdentity({ user: userId });
  }

  brand.brandName = companyName;
  brand.nameSuggestions = nameSuggestions;
  brand.targetAudienceAnalysis = targetAudienceAnalysis;
  brand.strategicGoals = strategicGoals;
  brand.swotAnalysis = swotAnalysis;

  await brand.save();

  await Activity.create({
    user: userId,
    title: `Generated AI Insights & SWOT Analysis for ${companyName}`,
    type: 'BRAND_GENERATE',
  });

  return brand;
};

export const generateUserBrandService = async (userId, data) => {
  let brand = await BrandIdentity.findOne({ user: userId });
  if (!brand) {
    brand = new BrandIdentity({ user: userId });
  }

  if (data?.useAI) {
    const profile = await StartupProfile.findOne({ owner: userId });
    if (!profile) {
      throw new Error('Startup profile required to generate AI brand identity.');
    }
    
    const aiData = await generateBrandAssets(profile);
    
    if (aiData.brandName) {
      brand.brandName = aiData.brandName;
      brand.brandNameSource = 'ai';
    }
    if (aiData.tagline) {
      brand.tagline = aiData.tagline;
      brand.taglineSource = 'ai';
    }
    if (aiData.missionStatement) {
      brand.missionStatement = aiData.missionStatement;
      brand.missionSource = 'ai';
    }
    if (aiData.visionStatement) {
      brand.visionStatement = aiData.visionStatement;
      brand.visionSource = 'ai';
    }
    if (aiData.brandStory) {
      brand.brandStory = aiData.brandStory;
      brand.brandStorySource = 'ai';
    }
    if (aiData.brandPersonality) {
      brand.brandPersonality = aiData.brandPersonality;
      brand.brandPersonalitySource = 'ai';
    }
    
    await Activity.create({
      user: userId,
      title: 'Generated Brand Identity using Gemini AI',
      type: 'BRAND_GENERATE',
    });
  } else {
    // Update fields explicitly passed
    if (data?.brandName !== undefined) {
      brand.brandName = data.brandName;
      if (data?.brandNameSource) brand.brandNameSource = data.brandNameSource;
    }
    if (data?.tagline !== undefined) {
      brand.tagline = data.tagline;
      if (data?.taglineSource) brand.taglineSource = data.taglineSource;
    }
    if (data?.missionStatement !== undefined) {
      brand.missionStatement = data.missionStatement;
      if (data?.missionSource) brand.missionSource = data.missionSource;
    }
    if (data?.visionStatement !== undefined) {
      brand.visionStatement = data.visionStatement;
      if (data?.visionSource) brand.visionSource = data.visionSource;
    }
    if (data?.brandStory !== undefined) {
      brand.brandStory = data.brandStory;
      if (data?.brandStorySource) brand.brandStorySource = data.brandStorySource;
    }
    if (data?.brandPersonality !== undefined) {
      brand.brandPersonality = data.brandPersonality;
      if (data?.brandPersonalitySource) brand.brandPersonalitySource = data.brandPersonalitySource;
    }
  }

  await brand.save();
  return brand;
};

export const getUserProjectsService = async (userId) => {
  const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
  return projects;
};

export const createUserProjectService = async (userId, projectData) => {
  const newProject = await Project.create({
    user: userId,
    name: projectData.name || 'New Brand Project',
    companyName: projectData.companyName || 'Startup Inc.',
    generatedModules: projectData.generatedModules || 'Brand Identity',
    status: 'Completed',
  });

  return newProject;
};

export const deleteUserProjectService = async (userId, projectId) => {
  await Project.findOneAndDelete({ _id: projectId, user: userId });
  return { message: 'Project deleted' };
};

export const getUserReportsService = async (userId) => {
  const reports = await Report.find({ user: userId }).sort({ createdAt: -1 });
  return reports;
};
