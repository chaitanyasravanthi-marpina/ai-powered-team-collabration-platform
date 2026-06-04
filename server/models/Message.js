import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

const Message = mongoose.model('Message', messageSchema)
export default Message