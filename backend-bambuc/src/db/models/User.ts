import mongoose, { Schema, model, type Model } from 'mongoose'

export interface UserDocument {
  email: string
  passwordHash: string
  name?: string
  role: string
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    role: { type: String, default: 'user' }
  },
  { timestamps: true }
)

const ExistingModel = mongoose.models.User as Model<UserDocument> | undefined
export const User: Model<UserDocument> = ExistingModel || model<UserDocument>('User', UserSchema)
