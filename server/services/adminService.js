import { User } from '../models/User.js';
import { StartupProfile } from '../models/StartupProfile.js';
import { Project } from '../models/Project.js';
import { Report } from '../models/Report.js';
import { Activity } from '../models/Activity.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { BrandIdentity } from '../models/BrandIdentity.js';
import { ProductStrategy } from '../models/ProductStrategy.js';
import { CustomerPersona } from '../models/CustomerPersona.js';
import { Order } from '../models/Order.js';

export const getAdminStatsService = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalUsers, totalStartups, totalProjects, totalReports, activeUsersToday, newUsersThisMonth] = await Promise.all([
    User.countDocuments(),
    StartupProfile.countDocuments(),
    Project.countDocuments(),
    Report.countDocuments(),
    User.countDocuments({
      status: 'Active',
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
    User.countDocuments({
      createdAt: { $gte: startOfMonth },
    }),
  ]);

  return {
    totalUsers,
    totalStartups,
    totalProjects,
    totalReports,
    activeUsersToday,
    newUsersThisMonth,
  };
};

export const getAdminUsersService = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map((u) => ({
    id: u._id,
    name: u.fullName,
    email: u.email,
    role: u.role,
    status: u.status || 'Active',
    date: u.createdAt ? u.createdAt.toISOString().split('T')[0] : '',
    lastActive: u.updatedAt ? u.updatedAt.toISOString().split('T')[0] : '',
  }));
};

export const createAdminUserService = async (userData) => {
  const { fullName, email, password, role } = userData;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('User with this email already exists');
  }
  const newUser = await User.create({
    fullName,
    email,
    password,
    role: role || 'customer',
  });
  return newUser;
};

export const toggleUserStatusService = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  user.status = user.status === 'Active' ? 'Disabled' : 'Active';
  await user.save();
  return user;
};

export const deleteUserService = async (id) => {
  await User.findByIdAndDelete(id);
  return { message: 'User deleted' };
};

export const getAdminStartupsService = async () => {
  const startups = await StartupProfile.find().populate('owner', 'fullName email').sort({ createdAt: -1 });
  const userIds = startups.map((s) => s.owner?._id).filter(Boolean);
  const [brandIdentities, productStrategies] = await Promise.all([
    BrandIdentity.find({ user: { $in: userIds } }),
    ProductStrategy.find({ user: { $in: userIds } }),
  ]);
  const brandMap = {};
  brandIdentities.forEach((b) => {
    if (b.user) brandMap[b.user.toString()] = b;
  });
  const stratMap = {};
  productStrategies.forEach((ps) => {
    if (ps.user) stratMap[ps.user.toString()] = ps;
  });

  return startups.map((s) => {
    const userId = s.owner?._id?.toString();
    const b = brandMap[userId] || {};
    const ps = stratMap[userId] || {};
    const updatedBrandName = b.brandName || s.companyName;

    return {
      id: s._id,
      companyName: updatedBrandName,
      originalCompanyName: s.companyName,
      industry: s.industry,
      companyDescription: s.companyDescription,
      targetAudience: s.targetAudience,
      businessGoals: s.businessGoals,
      productsServices: s.productsServices,
      website: s.website || '',
      socialMediaLinks: s.socialMediaLinks || {},
      ownerName: s.owner?.fullName || 'N/A',
      ownerEmail: s.owner?.email || 'N/A',
      date: s.createdAt ? s.createdAt.toISOString().split('T')[0] : '',
      brandIdentity: {
        brandName: b.brandName || s.companyName || '',
        tagline: b.tagline || '',
        missionStatement: b.missionStatement || '',
        visionStatement: b.visionStatement || '',
        brandStory: b.brandStory || '',
        brandPersonality: b.brandPersonality || '',
        brandNameSource: b.brandNameSource || '',
        taglineSource: b.taglineSource || '',
        missionSource: b.missionSource || '',
        visionSource: b.visionSource || '',
        brandStorySource: b.brandStorySource || '',
        brandPersonalitySource: b.brandPersonalitySource || '',
      },
      productStrategy: {
        productName: ps.productName || '',
        productTagline: ps.productTagline || '',
        shortDescription: ps.shortDescription || '',
        detailedDescription: ps.detailedDescription || '',
        usps: ps.usps || [],
        positioningStatement: ps.positioningStatement || '',
        targetSegment: ps.targetSegment || '',
        keyBenefit: ps.keyBenefit || '',
        competitiveMoat: ps.competitiveMoat || '',
      },
    };
  });
};

export const deleteStartupService = async (id) => {
  await StartupProfile.findByIdAndDelete(id);
  return { message: 'Startup profile deleted' };
};

export const getAdminProjectsService = async () => {
  // Fetch explicitly created projects, brand identities, startup profiles, and product strategies
  const [projects, brandIdentities, profiles, productStrategies] = await Promise.all([
    Project.find().populate('user', 'fullName email').sort({ createdAt: -1 }),
    BrandIdentity.find().populate('user', 'fullName email').sort({ updatedAt: -1 }),
    StartupProfile.find().populate('owner', 'fullName email'),
    ProductStrategy.find().populate('user', 'fullName email'),
  ]);

  const profileMap = {};
  profiles.forEach((p) => {
    if (p.owner?._id) profileMap[p.owner._id.toString()] = p;
  });

  const projectMap = {};
  projects.forEach((p) => {
    if (p.user?._id) projectMap[p.user._id.toString()] = p;
  });

  const stratMap = {};
  productStrategies.forEach((ps) => {
    if (ps.user?._id) stratMap[ps.user._id.toString()] = ps;
    else if (ps.user) stratMap[ps.user.toString()] = ps;
  });

  const projectEntries = brandIdentities.map((b) => {
    const userId = b.user?._id?.toString() || b.user?.toString();
    const userObj = b.user || {};
    const profile = profileMap[userId] || {};
    const existingProject = projectMap[userId];
    const ps = stratMap[userId] || {};

    const companyName = b.brandName || profile.companyName || existingProject?.companyName || 'Untitled Brand';
    const projectName = existingProject?.name || `${companyName} Brand DNA`;

    return {
      id: existingProject?._id || b._id,
      brandIdentityId: b._id,
      name: projectName,
      companyName: companyName,
      generatedModules: existingProject?.generatedModules || 'Brand Identity & Product Strategy',
      status: existingProject?.status || 'Completed',
      ownerName: userObj.fullName || profile.owner?.fullName || 'Startup Owner',
      ownerEmail: userObj.email || profile.owner?.email || 'N/A',
      date: b.createdAt ? b.createdAt.toISOString().split('T')[0] : (profile.createdAt ? profile.createdAt.toISOString().split('T')[0] : ''),
      lastUpdated: b.updatedAt ? b.updatedAt.toISOString().split('T')[0] : '',
      brandIdentity: {
        brandName: b.brandName || companyName || '',
        tagline: b.tagline || '',
        missionStatement: b.missionStatement || '',
        visionStatement: b.visionStatement || '',
        brandStory: b.brandStory || '',
        brandPersonality: b.brandPersonality || '',
        brandNameSource: b.brandNameSource || '',
        taglineSource: b.taglineSource || '',
        missionSource: b.missionSource || '',
        visionSource: b.visionSource || '',
        brandStorySource: b.brandStorySource || '',
        brandPersonalitySource: b.brandPersonalitySource || '',
      },
      productStrategy: {
        productName: ps.productName || '',
        productTagline: ps.productTagline || '',
        shortDescription: ps.shortDescription || '',
        detailedDescription: ps.detailedDescription || '',
        usps: ps.usps || [],
        positioningStatement: ps.positioningStatement || '',
        targetSegment: ps.targetSegment || '',
        keyBenefit: ps.keyBenefit || '',
        competitiveMoat: ps.competitiveMoat || '',
      },
    };
  });

  // Also include any standalone project records that don't have a BrandIdentity yet
  projects.forEach((p) => {
    const userId = p.user?._id?.toString();
    const exists = projectEntries.some((pe) => pe.id.toString() === p._id.toString());
    if (!exists) {
      projectEntries.push({
        id: p._id,
        name: p.name,
        companyName: p.companyName,
        generatedModules: p.generatedModules,
        status: p.status || 'Completed',
        ownerName: p.user?.fullName || 'N/A',
        ownerEmail: p.user?.email || 'N/A',
        date: p.createdAt ? p.createdAt.toISOString().split('T')[0] : '',
        lastUpdated: p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : '',
        brandIdentity: {},
      });
    }
  });

  return projectEntries;
};

export const deleteProjectService = async (id) => {
  await Project.findByIdAndDelete(id);
  return { message: 'Project deleted' };
};

export const generateAdminReportsService = async () => {
  const [startups, brandIdentities, productStrategies, personas] = await Promise.all([
    StartupProfile.find().populate('owner', 'fullName email'),
    BrandIdentity.find().populate('user', 'fullName email'),
    ProductStrategy.find().populate('user', 'fullName email'),
    CustomerPersona.find().populate('user', 'fullName email'),
  ]);

  const brandMap = {};
  brandIdentities.forEach((b) => {
    const uid = b.user?._id?.toString() || b.user?.toString();
    if (uid) brandMap[uid] = b;
  });

  const stratMap = {};
  productStrategies.forEach((ps) => {
    const uid = ps.user?._id?.toString() || ps.user?.toString();
    if (uid) stratMap[uid] = ps;
  });

  const personaMap = {};
  personas.forEach((p) => {
    const uid = p.user?._id?.toString() || p.user?.toString();
    if (uid) {
      if (!personaMap[uid]) personaMap[uid] = [];
      personaMap[uid].push(p);
    }
  });

  for (const s of startups) {
    const uid = s.owner?._id?.toString();
    const b = brandMap[uid] || {};
    const ps = stratMap[uid] || {};
    const pList = personaMap[uid] || [];

    const companyName = b.brandName || s.companyName || 'BrandDNA Startup';
    const cleanCompName = companyName.replace(/[^a-zA-Z0-9_\- ]/g, '');

    let existingReport = await Report.findOne({ companyName });

    const reportPayload = {
      name: `${cleanCompName.replace(/\s+/g, '_')}_BrandDNA_Executive_Report.pdf`,
      title: `${companyName} Executive Strategy Blueprint`,
      companyName: companyName,
      industry: s.industry || 'Business Services',
      ownerName: s.owner?.fullName || 'Startup Owner',
      ownerEmail: s.owner?.email || 'owner@branddna.ai',
      user: s.owner?._id || null,
      fileUrl: `/uploads/reports/${cleanCompName.replace(/\s+/g, '_')}_Report.pdf`,
      summary: `Complete Brand Identity, Product Strategy, and Customer Demographics Report for ${companyName}.`,
      brandIdentity: {
        brandName: b.brandName || (Object.keys(b).length > 0 ? companyName : 'Not Configured'),
        tagline: b.tagline || (Object.keys(b).length > 0 ? 'Artisanal & High Performance' : 'Not Configured'),
        missionStatement: b.missionStatement || '',
        visionStatement: b.visionStatement || '',
        brandStory: b.brandStory || '',
        brandPersonality: b.brandPersonality || '',
      },
      productStrategy: {
        productName: ps.productName || (Object.keys(ps).length > 0 ? companyName : 'Not Configured'),
        shortDescription: ps.shortDescription || s.companyDescription || (Object.keys(ps).length > 0 ? '' : 'No product details found.'),
        usps: ps.usps || [],
        positioningStatement: ps.positioningStatement || '',
        targetSegment: ps.targetSegment || s.targetAudience || '',
      },
      personas: pList.map((p) => ({
        personaName: p.personaName,
        demographics: p.demographics,
        painPoints: p.painPoints,
        interests: p.interests,
        buyingBehaviour: p.buyingBehaviour,
      })),
    };

    if (existingReport) {
      Object.assign(existingReport, reportPayload);
      await existingReport.save();
    } else {
      await Report.create(reportPayload);
    }
  }

  let reports = await Report.find().populate('user', 'fullName email').sort({ createdAt: -1 });

  return reports.map((r) => ({
    id: r._id,
    name: r.name,
    title: r.title || r.name,
    companyName: r.companyName,
    industry: r.industry || 'Business Services',
    fileUrl: r.fileUrl,
    summary: r.summary || `Executive Brand DNA Strategy Report for ${r.companyName}`,
    brandIdentity: r.brandIdentity || {},
    productStrategy: r.productStrategy || {},
    personas: r.personas || [],
    ownerName: r.ownerName || r.user?.fullName || 'Startup Owner',
    ownerEmail: r.ownerEmail || r.user?.email || 'N/A',
    date: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
  }));
};

export const getAdminUserReportService = async (userId) => {
  const [user, profile, brand, strategy, personas, orders] = await Promise.all([
    User.findById(userId).select('fullName email role createdAt'),
    StartupProfile.findOne({ owner: userId }),
    BrandIdentity.findOne({ user: userId }),
    ProductStrategy.findOne({ user: userId }),
    CustomerPersona.find({ user: userId }),
    Order.find({ customer: userId }).sort({ createdAt: -1 })
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const companyName = brand?.brandName || profile?.companyName || user.fullName || 'User Startup';
  const cleanCompName = companyName.replace(/[^a-zA-Z0-9_\- ]/g, '');

  let report = await Report.findOne({ user: userId });

  const reportPayload = {
    name: `${cleanCompName.replace(/\s+/g, '_')}_BrandDNA_Report.pdf`,
    title: `${companyName} Executive Strategy Blueprint`,
    companyName: companyName,
    industry: profile?.industry || 'Business Services',
    ownerName: user.fullName || 'User',
    ownerEmail: user.email || 'N/A',
    user: user._id,
    fileUrl: `/uploads/reports/${cleanCompName.replace(/\s+/g, '_')}_Report.pdf`,
    summary: `Customer Details and Order History Report for ${user.fullName} (${companyName}).`,
    brandIdentity: {
      brandName: brand?.brandName || (brand ? companyName : 'Not Configured'),
      tagline: brand?.tagline || (brand ? 'Artisanal & High Performance' : 'Not Configured'),
      missionStatement: brand?.missionStatement || '',
      visionStatement: brand?.visionStatement || '',
      brandStory: brand?.brandStory || '',
      brandPersonality: brand?.brandPersonality || '',
    },
    productStrategy: {
      productName: strategy?.productName || (strategy ? companyName : 'Not Configured'),
      shortDescription: strategy?.shortDescription || profile?.companyDescription || (strategy ? '' : 'No product details found.'),
      usps: strategy?.usps || [],
      positioningStatement: strategy?.positioningStatement || '',
      targetSegment: strategy?.targetSegment || profile?.targetAudience || '',
    },
    personas: (personas || []).map((p) => ({
      personaName: p.personaName,
      demographics: p.demographics,
      painPoints: p.painPoints,
      interests: p.interests,
      buyingBehaviour: p.buyingBehaviour,
    })),
    orders: (orders || []).map(o => ({
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      date: o.createdAt ? o.createdAt.toISOString().split('T')[0] : '',
      items: o.items.map(i => ({ productName: i.productName, quantity: i.quantity, totalPrice: i.totalPrice }))
    })),
  };

  if (report) {
    Object.assign(report, reportPayload);
    await report.save();
  } else {
    report = await Report.create(reportPayload);
  }

  return {
    id: report._id,
    name: report.name,
    title: report.title || report.name,
    companyName: report.companyName,
    industry: report.industry || 'Business Services',
    fileUrl: report.fileUrl,
    summary: report.summary,
    brandIdentity: report.brandIdentity || {},
    productStrategy: report.productStrategy || {},
    personas: report.personas || [],
    orders: report.orders || [],
    ownerName: report.ownerName || user.fullName,
    ownerEmail: report.ownerEmail || user.email,
    date: report.createdAt ? report.createdAt.toISOString().split('T')[0] : '',
  };
};

export const getAdminReportsService = async () => {
  let reports = await Report.find().populate('user', 'fullName email').sort({ createdAt: -1 });

  if (reports.length === 0) {
    const startups = await StartupProfile.find();
    if (startups.length > 0) {
      return generateAdminReportsService();
    }
  }

  return reports.map((r) => ({
    id: r._id,
    name: r.name,
    title: r.title || r.name,
    companyName: r.companyName,
    industry: r.industry || 'Business Services',
    fileUrl: r.fileUrl,
    summary: r.summary || `Executive Brand DNA Strategy Report for ${r.companyName}`,
    brandIdentity: r.brandIdentity || {},
    productStrategy: r.productStrategy || {},
    personas: r.personas || [],
    ownerName: r.ownerName || r.user?.fullName || 'Startup Owner',
    ownerEmail: r.ownerEmail || r.user?.email || 'N/A',
    date: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
  }));
};

export const deleteReportService = async (id) => {
  await Report.findByIdAndDelete(id);
  return { message: 'Report deleted' };
};

export const getAdminActivitiesService = async () => {
  const activities = await Activity.find().populate('user', 'fullName email').sort({ createdAt: -1 }).limit(10);
  return activities.map((a) => ({
    id: a._id,
    title: a.title,
    type: a.type,
    user: a.user?.fullName || 'System',
    time: a.createdAt ? a.createdAt.toISOString() : '',
  }));
};

export const getAdminIndustryAnalyticsService = async () => {
  const result = await StartupProfile.aggregate([
    { $group: { _id: '$industry', count: { $sum: 1 } } },
  ]);

  if (!result || result.length === 0) {
    return [];
  }

  const total = result.reduce((acc, curr) => acc + curr.count, 0);
  return result.map((item, idx) => ({
    name: item._id || 'Unspecified',
    count: item.count,
    percentage: Math.round((item.count / total) * 100),
  }));
};

export const getAdminSettingsService = async () => {
  let settings = await SystemSetting.findOne({ key: 'platform_settings' });
  if (!settings) {
    settings = await SystemSetting.create({
      key: 'platform_settings',
      appName: 'BrandDNA AI',
      contactEmail: 'admin@branddna.ai',
      aiProvider: 'OpenAI GPT-4o Enterprise',
      dailyLimit: '10,000 requests',
      jwtExpiration: '7 days',
      smtpHost: 'smtp.sendgrid.net',
      maintenanceMode: false,
    });
  }
  return settings;
};

export const updateAdminSettingsService = async (updateData) => {
  let settings = await SystemSetting.findOne({ key: 'platform_settings' });
  if (!settings) {
    settings = new SystemSetting({ key: 'platform_settings' });
  }

  if (updateData.appName !== undefined) settings.appName = updateData.appName;
  if (updateData.contactEmail !== undefined) settings.contactEmail = updateData.contactEmail;
  if (updateData.aiProvider !== undefined) settings.aiProvider = updateData.aiProvider;
  if (updateData.dailyLimit !== undefined) settings.dailyLimit = updateData.dailyLimit;
  if (updateData.jwtExpiration !== undefined) settings.jwtExpiration = updateData.jwtExpiration;
  if (updateData.smtpHost !== undefined) settings.smtpHost = updateData.smtpHost;
  if (updateData.maintenanceMode !== undefined) settings.maintenanceMode = updateData.maintenanceMode;

  await settings.save();
  return settings;
};
