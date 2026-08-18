import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret_key_branddna_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );
};
