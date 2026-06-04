import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,              // removes extra spaces
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,         // always store as lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false            // never return password in queries
    },
    avatar: {
      type: String,
      default: ''
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true           // auto adds createdAt and updatedAt
  }
)

// ─── Pre-save Hook ───────────────────────────────────────────
// Runs automatically before every user.save()
userSchema.pre('save', async function (next) {
  // Only hash if password was actually changed
  // Prevents re-hashing an already hashed password
  if (!this.isModified('password')) return 

  this.password = await bcrypt.hash(this.password, 10)
  
})

// ─── Instance Method ─────────────────────────────────────────
// Attach a custom method to every User document
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User