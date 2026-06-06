import Workspace from '../models/Workspace.js'
import WorkspaceMember from '../models/WorkspaceMember.js'

// ─── Create Workspace ─────────────────────────────────────────
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body

    // Step 1: Validate
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required'
      })
    }

    // Step 2: Create workspace
    // owner is the logged in user (from protect middleware)
    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id
    })

    // Step 3: Create membership record for creator
    // Creator automatically becomes admin
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: req.user._id,
      role: 'admin'
    })

    res.status(201).json({
      success: true,
      workspace
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Join Workspace ───────────────────────────────────────────
export const joinWorkspace = async (req, res) => {
  try {
    const { inviteCode } = req.body

    // Step 1: Find workspace by invite code
    const workspace = await Workspace.findOne({ inviteCode })
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      })
    }

    // Step 2: Check if already a member
    const existingMember = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: req.user._id
    })
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this workspace'
      })
    }

    // Step 3: Create membership record
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: req.user._id,
      role: 'member'
    })

    res.status(200).json({
      success: true,
      message: 'Joined workspace successfully',
      workspace
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get My Workspaces ────────────────────────────────────────
export const getMyWorkspaces = async (req, res) => {
  try {
    // Find all membership records for logged in user
    const memberships = await WorkspaceMember.find({
      userId: req.user._id
    }).populate('workspaceId')

    // Extract workspace data from memberships
    const workspaces = memberships.map(m => ({
      ...m.workspaceId._doc,
      role: m.role
    }))

    res.status(200).json({
      success: true,
      workspaces
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get Single Workspace ─────────────────────────────────────
export const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      })
    }

    // Check if user is a member
    const membership = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: req.user._id
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member.'
      })
    }

    res.status(200).json({
      success: true,
      workspace
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get Workspace Members ────────────────────────────────────
export const getWorkspaceMembers = async (req, res) => {
  try {
    const members = await WorkspaceMember.find({
      workspaceId: req.params.id
    }).populate('userId', 'name email avatar isOnline')

    res.status(200).json({
      success: true,
      members
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      })
    }

    // Only owner can delete workspace
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the workspace owner can delete it'
      })
    }

    // Delete everything related to workspace
    // This is cascading delete
    const Channel = (await import('../models/Channel.js')).default
    const Message = (await import('../models/Message.js')).default
    const Note = (await import('../models/Note.js')).default

    // Get all channels first
    const channels = await Channel.find({ workspaceId: req.params.id })
    const channelIds = channels.map(c => c._id)

    // Delete all messages in all channels
    await Message.deleteMany({ channelId: { $in: channelIds } })

    // Delete all channels
    await Channel.deleteMany({ workspaceId: req.params.id })

    // Delete all notes
    await Note.deleteMany({ workspaceId: req.params.id })

    // Delete all memberships
    await WorkspaceMember.deleteMany({ workspaceId: req.params.id })

    // Finally delete workspace
    await workspace.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}