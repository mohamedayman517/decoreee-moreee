const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const Client = require('../models/clientSchema');
const logger = require('../utils/Logger');
const { ValidationError, AuthenticationError } = require('../utils/ErrorHandler');

class AuthController {
  /**
   * Validate user credentials
   */
  async validateCredentials(email, password, role = null) {
    try {
      const startTime = Date.now();
      
      // Input validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
      }
      
      // Password strength validation
      if (password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters long');
      }
      
      // Find user in both collections
      let user = await User.findOne({ email });
      let userType = 'engineer';
      
      if (!user) {
        user = await Client.findOne({ email });
        userType = 'client';
      }
      
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Check if role matches (if specified)
      if (role && user.role && user.role.toLowerCase() !== role.toLowerCase()) {
        throw new AuthenticationError('Invalid role for this user');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Check if engineer is verified (if applicable)
      if (userType === 'engineer' && user.role === 'Engineer') {
        if (!user.isVerified) {
          throw new AuthenticationError('Account not verified. Please check your email for verification instructions.');
        }
        
        if (!user.isApproved) {
          throw new AuthenticationError('Account not approved by admin yet.');
        }
      }
      
      const responseTime = Date.now() - startTime;
      
      logger.info('Credential validation successful', {
        userId: user._id,
        email: user.email,
        userType,
        responseTime
      });
      
      return {
        isValid: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
          role: user.role || 'Client',
          userType,
          isVerified: user.isVerified || true,
          isApproved: user.isApproved || true
        },
        responseTime
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Credential validation failed', {
        email,
        error: error.message,
        responseTime
      });
      
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error;
      }
      
      throw new AuthenticationError('Authentication failed');
    }
  }
  
  /**
   * Validate registration data
   */
  async validateRegistration(userData) {
    try {
      const { email, password, firstName, lastName, phone, role } = userData;
      
      // Required fields validation
      const requiredFields = ['email', 'password'];
      if (role === 'Engineer') {
        requiredFields.push('firstName', 'lastName', 'phone');
      } else {
        requiredFields.push('name');
      }
      
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
      }
      
      // Password strength validation
      if (password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters long');
      }
      
      // Check for existing users
      const existingUser = await User.findOne({ email });
      const existingClient = await Client.findOne({ email });
      
      if (existingUser || existingClient) {
        throw new ValidationError('Email already registered');
      }
      
      // Phone validation (if provided)
      if (phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          throw new ValidationError('Invalid phone number format');
        }
      }
      
      logger.info('Registration validation successful', { email, role });
      
      return {
        isValid: true,
        message: 'Registration data is valid'
      };
      
    } catch (error) {
      logger.error('Registration validation failed', {
        email: userData.email,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Generate verification code
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Validate verification code
   */
  async validateVerificationCode(userId, code) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new ValidationError('User not found');
      }
      
      if (!user.verificationCode) {
        throw new ValidationError('No verification code found');
      }
      
      if (user.verificationCode !== code) {
        throw new ValidationError('Invalid verification code');
      }
      
      // Check if code is expired (assuming 1 hour expiry)
      const codeAge = Date.now() - user.verificationCodeCreatedAt;
      const oneHour = 60 * 60 * 1000;
      
      if (codeAge > oneHour) {
        throw new ValidationError('Verification code has expired');
      }
      
      logger.info('Verification code validated successfully', { userId });
      
      return {
        isValid: true,
        message: 'Verification code is valid'
      };
      
    } catch (error) {
      logger.error('Verification code validation failed', {
        userId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Check if user session is valid
   */
  async validateSession(sessionData) {
    try {
      if (!sessionData || !sessionData.user) {
        throw new AuthenticationError('No valid session found');
      }
      
      const { user } = sessionData;
      
      // Find current user data
      let currentUser = await User.findById(user.id);
      if (!currentUser) {
        currentUser = await Client.findById(user.id);
      }
      
      if (!currentUser) {
        throw new AuthenticationError('User not found');
      }
      
      // Check if engineer is still verified and approved
      if (currentUser.role === 'Engineer') {
        if (!currentUser.isVerified || !currentUser.isApproved) {
          throw new AuthenticationError('Account access revoked');
        }
      }
      
      logger.info('Session validation successful', { userId: user.id });
      
      return {
        isValid: true,
        user: currentUser
      };
      
    } catch (error) {
      logger.error('Session validation failed', { error: error.message });
      throw error;
    }
  }
}

const authController = new AuthController();
module.exports = { authController };
