import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// ─── Helper: Generate JWT and set cookie ─────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  // Generate token with only userId in payload
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Cookie options
  const cookieOptions = {
    httpOnly: true,    // JavaScript cannot read this cookie
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
  }

  // Send cookie + response
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    })
}

// ─── Register ─────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Step 1: Validate fields exist
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      })
    }

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Step 3: Create user
    // Password hashing happens automatically in pre-save hook
    const user = await User.create({ name, email, password })

    // Step 4: Send token response
    sendTokenResponse(user, 201, res)

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Login ────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Step 1: Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Step 2: Find user and explicitly include password
    // Remember: select: false hides password by default
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Step 3: Compare password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'    // same message intentionally
      })
    }

    // Step 4: Send token response
    sendTokenResponse(user, 200, res)

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Logout ───────────────────────────────────────────────────
export const logout = async (req, res) => {
  res
    .status(200)
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)    // expire cookie immediately
    })
    .json({
      success: true,
      message: 'Logged out successfully'
    })
}

// ─── Get Current User ─────────────────────────────────────────
export const getMe = async (req, res) => {
  // req.user is attached by protect middleware
  res.status(200).json({
    success: true,
    user: req.user
  })
}