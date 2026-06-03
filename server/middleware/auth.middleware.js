import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  try {
    // Step 1: Get token from cookie
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      })
    }

    // Step 2: Verify token
    // This throws an error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Step 3: Find user from token's userId
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      })
    }

    // Step 4: Attach user to request object
    req.user = user

    // Step 5: Move to next middleware or controller
    next()

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    })
  }
}

export default protect