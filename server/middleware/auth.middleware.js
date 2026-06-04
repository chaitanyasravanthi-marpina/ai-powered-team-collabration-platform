import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import WorkspaceMember from '../models/WorkspaceMember.js'

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

// Check if user is member of workspace
export const isMember = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user._id
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this workspace.'
      })
    }

    // Attach membership to request for use in controllers
    req.membership = membership
    next()

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Check if user is admin of workspace
export const isAdmin = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user._id
    })

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      })
    }

    req.membership = membership
    next()

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export default protect