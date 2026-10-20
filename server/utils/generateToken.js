import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'branddna_ai_super_secret_jwt_key_2024_xK9mP3qR7vL2nW8tY5uJ1cE6',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );
};
