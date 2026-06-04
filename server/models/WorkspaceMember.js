import mongoose from 'mongoose'

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],      // only these two values allowed
      default: 'member'
    }
  },
  {
    timestamps: true
  }
)

// Prevent duplicate memberships
// Same user cannot join same workspace twice
workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
)

const WorkspaceMember = mongoose.model('WorkspaceMember', workspaceMemberSchema)
export default WorkspaceMember