import { StartupProfile } from '../models/StartupProfile.js';

export const getStartupProfileService = async (userId) => {
  const profile = await StartupProfile.findOne({ owner: userId }).populate('owner', 'fullName email role');
  return profile;
};

export const createStartupProfileService = async (userId, profileData) => {
  const existing = await StartupProfile.findOne({ owner: userId });
  if (existing) {
    throw new Error('Startup profile already exists for this user');
  }

  const profile = await StartupProfile.create({
    ...profileData,
    owner: userId,
  });

  return profile;
};

export const updateStartupProfileService = async (userId, profileData) => {
  const profile = await StartupProfile.findOneAndUpdate(
    { owner: userId },
    { $set: profileData },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new Error('Startup profile not found for this user');
  }

  return profile;
};

export const deleteStartupProfileService = async (userId) => {
  const profile = await StartupProfile.findOneAndDelete({ owner: userId });
  if (!profile) {
    throw new Error('No startup profile found to delete');
  }
  return true;
};
