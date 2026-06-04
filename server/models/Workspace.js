import mongoose from 'mongoose'
import crypto from 'crypto'

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                    // references User collection
      required: true
    },
    inviteCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(6).toString('hex')
    }
  },
  {
    timestamps: true
  }
)

const Workspace = mongoose.model('Workspace', workspaceSchema)
export default Workspace