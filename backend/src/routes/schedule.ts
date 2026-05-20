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

route.post('/:id/retry', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);
  const id = c.req.param('id');
  if (!Types.ObjectId.isValid(id)) return c.text('invalid id', 400);

  const job = await Job.findOne({ _id: id, userId: user._id });
  if (!job) return c.text('not found', 404);
  if (!job.bundleBase64) return c.text('bundle missing', 400);

  job.status = 'scheduled';
  job.scheduledAt = new Date();
  job.lastError = undefined;
  await job.save();
  return c.json({ id: job._id, status: job.status, scheduledAt: job.scheduledAt });
});

route.patch('/:id', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);
  const id = c.req.param('id');
  if (!Types.ObjectId.isValid(id)) return c.text('invalid id', 400);

  const body = await c.req.json();
  const { scheduledAt } = body;
  if (!scheduledAt) return c.text('missing scheduledAt', 400);

  const job = await Job.findOne({ _id: id, userId: user._id });
  if (!job) return c.text('not found', 404);

  job.scheduledAt = new Date(scheduledAt);
  job.status = 'scheduled';
  job.lastError = undefined;
  await job.save();
  return c.json({ id: job._id, status: job.status, scheduledAt: job.scheduledAt });
});

route.get('/stats/users', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);

  const stats = await Job.aggregate([
    {
      $group: {
        _id: { userId: '$userId', status: '$status' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.userId',
        counts: { $push: { status: '$_id.status', count: '$count' } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$user.username',
        counts: 1
      }
    }
  ]);

  return c.json(stats);
});

route.get('/list', async (c) => {
  const user = await authUser(c);
  if (!user) return c.text('unauthorized', 401);

  const jobs = await Job.aggregate([
    { $match: { status: { $in: ['scheduled', 'done'] } } },
    { $sort: { scheduledAt: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        userId: 1,
        username: '$user.username',
        repoUrl: 1,
        branch: 1,
        scheduledAt: 1,
        status: 1,
        createdAt: 1
      }
    }
  ]);

  return c.json(jobs);
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
