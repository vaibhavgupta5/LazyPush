"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { HeatmapBackground } from "../../components/HeatmapBackground";
import { Header, Footer } from "../../components/SiteShell";

interface Job {
  _id: string;
  repoUrl: string;
  branch: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'retry', id: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/");
    }
  }, [mounted, token, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schedule`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        } else if (res.status === 401) {
          logout();
          router.push("/");
        }
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      } finally {
        setLoading(false);
      }
    };
    if (mounted && token) {
      fetchJobs();
    }
  }, [mounted, token, logout, router]);

  const handleCancel = (id: string) => {
    setConfirmAction({ type: 'cancel', id });
  };

  const executeCancel = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schedule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setJobs(jobs.filter(j => j._id !== id));
      } else {
        alert("Failed to cancel job");
      }
    } catch (e) {
      console.error(e);
      alert("Error cancelling job");
    }
  };

  const handleRetry = (id: string) => {
    setConfirmAction({ type: 'retry', id });
  };

  const executeRetry = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schedule/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(jobs.map(j => j._id === id ? { ...j, status: data.status, scheduledAt: data.scheduledAt } : j));
      } else {
        const text = await res.text();
        alert(`Failed to retry job: ${text}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error retrying job");
    }
  };

  if (!mounted || !token) return null;

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    const dateStr = new Date(job.scheduledAt).toLocaleString().toLowerCase();
    return (
      dateStr.includes(query) ||
      job.repoUrl.toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query) ||
      job.branch.toLowerCase().includes(query)
    );
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <HeatmapBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeHref="/dashboard" />

        <main className="flex-1 mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-14">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-heading">
                Dashboard
              </h1>
              <p className="mt-4 text-lg text-muted">
                Welcome back, {user?.username || "User"}! Here are your scheduled and completed jobs.
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground hover:border-muted hover:text-heading cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-heading">Your Jobs</h2>
              <input
                type="text"
                placeholder="Search by date, repo, or status..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-muted focus:outline-none focus:ring-1 focus:ring-muted transition-colors"
              />
            </div>
            
            {loading ? (
              <div className="text-muted">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-md border border-border bg-surface p-8 text-center text-muted">
                No jobs found. Schedule a push using the LazyPush CLI!
              </div>
            ) : (
              <div className="rounded-md border border-border bg-surface sm:overflow-hidden">
                <table className="w-full text-left text-sm block sm:table">
                  <thead className="border-b border-border bg-background/50 hidden sm:table-header-group">
                    <tr>
                      <th className="px-4 py-3 font-medium text-heading">Repository</th>
                      <th className="px-4 py-3 font-medium text-heading">Branch</th>
                      <th className="px-4 py-3 font-medium text-heading">Status</th>
                      <th className="px-4 py-3 font-medium text-heading">Scheduled At</th>
                      <th className="px-4 py-3 font-medium text-heading text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border block sm:table-row-group">
                    {paginatedJobs.length === 0 ? (
                      <tr className="block sm:table-row">
                        <td colSpan={5} className="px-4 py-8 text-center text-muted block sm:table-cell">
                          No matching jobs found.
                        </td>
                      </tr>
                    ) : (
                      paginatedJobs.map((job) => (
                      <tr key={job._id} className="hover:bg-background/50 transition-colors block sm:table-row p-4 sm:p-0">
                        <td className="py-2 sm:px-4 sm:py-3 text-muted flex justify-between items-center sm:table-cell">
                          <span className="sm:hidden font-medium text-heading">Repository</span>
                          <span className="truncate max-w-[200px] sm:max-w-none text-right sm:text-left" title={job.repoUrl}>
                            {job.repoUrl.replace('https://github.com/', '')}
                          </span>
                        </td>
                        <td className="py-2 sm:px-4 sm:py-3 text-muted flex justify-between items-center sm:table-cell">
                          <span className="sm:hidden font-medium text-heading">Branch</span>
                          <span>{job.branch}</span>
                        </td>
                        <td className="py-2 sm:px-4 sm:py-3 flex justify-between items-center sm:table-cell">
                          <span className="sm:hidden font-medium text-heading">Status</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            job.status === 'scheduled' ? 'bg-yellow-500/10 text-yellow-500' :
                            job.status === 'done' ? 'bg-green-500/10 text-green-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-2 sm:px-4 sm:py-3 text-muted flex justify-between items-center sm:table-cell">
                          <span className="sm:hidden font-medium text-heading">Scheduled At</span>
                          <span className="text-right">{new Date(job.scheduledAt).toLocaleString()}</span>
                        </td>
                        <td className="py-2 sm:px-4 sm:py-3 flex justify-between items-center sm:table-cell sm:text-right mt-2 sm:mt-0 border-t border-border/10 sm:border-0 pt-3 sm:pt-3">
                          <span className="sm:hidden font-medium text-heading">Actions</span>
                          <div className="flex gap-2 justify-end">
                            {job.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancel(job._id)}
                                className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1.5 sm:px-2 sm:py-1 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {(job.status === 'done' || job.status === 'failed') && (
                              <button
                                onClick={() => handleRetry(job._id)}
                                className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1.5 sm:px-2 sm:py-1 text-xs font-medium text-green-500 hover:bg-green-500/20 transition-colors cursor-pointer"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border bg-background/30 px-4 py-3 sm:px-6 gap-4 sm:gap-0">
                    <p className="text-sm text-muted">
                      Showing <span className="font-medium text-heading">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-heading">{Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span className="font-medium text-heading">{filteredJobs.length}</span> jobs
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-heading">
              {confirmAction.type === 'cancel' ? 'Cancel Job' : 'Retry Job'}
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {confirmAction.type === 'cancel' 
                ? 'Are you sure you want to cancel this job? This action cannot be undone.' 
                : 'Are you sure you want to retry this job? It will be scheduled immediately.'}
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'cancel') executeCancel(confirmAction.id);
                  else executeRetry(confirmAction.id);
                  setConfirmAction(null);
                }}
                className={`rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer ${
                  confirmAction.type === 'cancel' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmAction.type === 'cancel' ? 'Cancel Job' : 'Retry Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
