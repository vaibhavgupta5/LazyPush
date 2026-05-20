import axios, { AxiosInstance } from 'axios';
import { getAuthToken } from '../config';

const DEFAULT_API = process.env.LAZYPUSH_API || 'https://lazypush.onrender.com';

export class ApiClient {
  private client: AxiosInstance;

  constructor(apiUrl: string = DEFAULT_API) {
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 30000
    });
  }

  async login(code: string) {
    const res = await this.client.post('/auth/callback', { code });
    return res.data;
  }

  async getLoginUrl(): Promise<string> {
    const res = await this.client.get('/auth/github');
    return res.request.path || '/auth/github';
  }

  async scheduleJob(data: {
    repoUrl: string;
    branch: string;
    scheduledAt: Date;
    bundleBase64: string;
    commitMessage?: string;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error('Not logged in');

    const res = await this.client.post(
      '/schedule',
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  }

  async listJobs() {
    const token = getAuthToken();
    if (!token) throw new Error('Not logged in');

    const res = await this.client.get('/schedule', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  async cancelJob(id: string) {
    const token = getAuthToken();
    if (!token) throw new Error('Not logged in');

    await this.client.delete(`/schedule/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export function getApiClient(): ApiClient {
  return new ApiClient();
}
