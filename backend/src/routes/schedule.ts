import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import { Job } from '../models/job';
import { User } from '../models/user';
import { JWT_SECRET } from '../config';
import { decrypt } from '../utils/crypto';
import { Types } from 'mongoose';

const route = new Hono();

async function authUser(c: any) {
  const h = c.req.header('authorization') || '';
  const token = h.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    return user;
  } catch (e) {
    return null;
  }
}

route.post('/', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);
  const body = await c.req.json();
  const { repoUrl, branch, scheduledAt, bundleBase64, commitMessage } = body;
  if (!repoUrl || !branch || !scheduledAt || !bundleBase64) return c.text('missing fields', 400);
  const job = await Job.create({
    userId: user._id,
    repoUrl,
    branch,
    scheduledAt: new Date(scheduledAt),
    bundleBase64,
    commitMessage,
    status: 'scheduled'
  });
  return c.json({ id: job._id });
});

route.get('/', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);
  const jobs = await Job.find({ userId: user._id }).sort({ scheduledAt: -1 }).lean();
  return c.json(jobs.map(j => ({ ...j, bundleBase64: undefined })));
});

route.delete('/:id', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);
  const id = c.req.param('id');
  if (!Types.ObjectId.isValid(id)) return c.text('invalid id', 400);
  await Job.deleteOne({ _id: id, userId: user._id });
  return c.text('deleted');
});

export default route;
