import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUser = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parseResult.error.errors,
      });
    }

    const { fullName, email } = parseResult.data;

    // Simulated user creation (Connect to MongoDB Mongoose Model when DB is configured)
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: {
        id: 'usr_' + Date.now(),
        fullName,
        email,
        createdAt: new Date().toISOString(),
      },
      token: 'mock_jwt_token_' + Date.now(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parseResult.error.errors,
      });
    }

    const { email } = parseResult.data;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: 'usr_1029384',
        fullName: 'Sarah Founder',
        email,
      },
      token: 'mock_jwt_token_' + Date.now(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
