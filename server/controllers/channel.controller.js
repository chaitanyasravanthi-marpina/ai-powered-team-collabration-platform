import Channel from '../models/Channel.js'

// ─── Create Channel ───────────────────────────────────────────
export const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body
    const { workspaceId } = req.params

    // Check duplicate channel name in this workspace
    const existing = await Channel.findOne({ 
      workspaceId, 
      name: name.toLowerCase() 
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Channel with this name already exists'
      })
    }

    const channel = await Channel.create({
      name,
      description,
      workspaceId,
      createdBy: req.user._id
    })

    res.status(201).json({
      success: true,
      channel
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get All Channels in Workspace ───────────────────────────
export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ 
      workspaceId: req.params.workspaceId 
    }).populate('createdBy', 'name avatar')

    res.status(200).json({
      success: true,
      channels
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get Single Channel ───────────────────────────────────────
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate('createdBy', 'name avatar')

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      })
    }

    res.status(200).json({
      success: true,
      channel
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Delete Channel ───────────────────────────────────────────
export const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      })
    }

    await channel.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Channel deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}