import mongoose from 'mongoose'

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Channel name is required'],
      trim: true,
      lowercase: true,        // always store as lowercase
      maxlength: [30, 'Channel name cannot exceed 30 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Prevent duplicate channel names in same workspace
channelSchema.index(
  { workspaceId: 1, name: 1 },
  { unique: true }
)

const Channel = mongoose.model('Channel', channelSchema)
export default Channel