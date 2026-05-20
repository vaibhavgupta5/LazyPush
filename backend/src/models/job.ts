import mongoose, { Schema, Document } from 'mongoose';

export type JobStatus = 'scheduled' | 'processing' | 'failed' | 'done';

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  repoUrl: string;
  branch: string;
  scheduledAt: Date;
  status: JobStatus;
  bundleBase64?: string; // Cleared after successful push
  commitMessage?: string;
  attempts: number;
  lastError?: string;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  repoUrl: { type: String, required: true },
  branch: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, default: 'scheduled' },
  bundleBase64: { type: String }, // Cleared after successful push to save space
  commitMessage: { type: String },
  attempts: { type: Number, default: 0 },
  lastError: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Job = mongoose.model<IJob>('Job', JobSchema);
