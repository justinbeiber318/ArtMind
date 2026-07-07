import { useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, Zap, X, Activity, Database, HardDrive, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { fadeUp } from '../lib/animations';
import GlassButton from '../components/ui/GlassButton';
import { analyticsApi } from '../../api/endpoints';

function formatUptime(seconds) {
  if (!seconds) return '—';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export default function DashboardHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [runningAction, setRunningAction] = useState(null);

  const fetchHealthData = async () => {
    setLoadingHealth(true);
    try {
      const data = await analyticsApi.healthCheck();
      setHealthData(data);
    } catch {
      toast.error('Could not fetch system health data');
    } finally {
      setLoadingHealth(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    fetchHealthData();
  };

  const closeModal = () => {
    if (runningAction) return; // Prevent closing while action is running
    setIsModalOpen(false);
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const data = await analyticsApi.exportReport();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paintings_performance_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const runQuickAction = async (actionKey, apiCall, successMsg) => {
    setRunningAction(actionKey);
    try {
      await apiCall();
      toast.success(successMsg);
      // Refresh health stats to capture upload size, etc. if relevant
      fetchHealthData();
    } catch (e) {
      toast.error(e.message || 'Action execution failed');
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-[#8a8a8a] uppercase tracking-widest mb-1">
            {today}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#f0e6c8] tracking-tight">
            {greeting}, Admin{' '}
          </h1>

          <p className="text-[#8a8a8a] text-sm mt-1">
            Manage your museum archive efficiently.
          </p>
        </div>

        <div className="flex gap-2">
          <GlassButton icon={<Zap size={14} />} onClick={openModal}>
            Quick Actions
          </GlassButton>
          <GlassButton icon={isExporting ? <Loader2 className="animate-spin" size={14} /> : <BarChart2 size={14} />} primary onClick={handleExportReport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Report'}
          </GlassButton>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="admin-modal-backdrop z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#242424] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-[#f0e6c8]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4">
                <div className="flex items-center gap-2 text-[#f0e6c8]">
                  <Zap size={18} className="text-[#d4af5f]" />
                  <h2 className="text-lg font-semibold">Quick Actions & Health Panel</h2>
                </div>
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a] hover:text-[#f0e6c8]">
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Health check grid */}
                <div>
                  <h3 className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider mb-3">System Health Parameters</h3>
                  {loadingHealth ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin text-[#d4af5f] mr-2" size={20} />
                      <span className="text-sm text-[#8a8a8a]">Checking health stats...</span>
                    </div>
                  ) : healthData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-xs text-[#8a8a8a] flex items-center gap-1.5"><Database size={13} /> DB Connection</span>
                        <strong className={`text-sm mt-1.5 ${healthData.dbStatus === 'Connected' ? 'text-[#6fbf73]' : 'text-[#e28b8b]'}`}>
                          {healthData.dbStatus}
                        </strong>
                      </div>
                      <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-xs text-[#8a8a8a] flex items-center gap-1.5"><Clock size={13} /> System Uptime</span>
                        <strong className="text-sm text-[#f0e6c8] mt-1.5">{formatUptime(healthData.uptime)}</strong>
                      </div>
                      <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-xs text-[#8a8a8a] flex items-center gap-1.5"><HardDrive size={13} /> Storage (Uploads)</span>
                        <strong className="text-sm text-[#f0e6c8] mt-1.5">
                          {healthData.uploadCount} files ({healthData.uploadSizeMb} MB)
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#e28b8b] text-center py-4 bg-[#8b2e2e]/10 border border-[#8b2e2e]/20 rounded-xl">
                      Failed to load health parameters.
                    </div>
                  )}
                </div>

                {/* Actions list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider">Execute Action</h3>

                  {/* Action 1 */}
                  <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-[#f0e6c8]">Recalculate Painting Trending Scores</div>
                      <div className="text-xs text-[#8a8a8a] mt-0.5">Updates the popularity index based on view counts and favorite counts.</div>
                    </div>
                    <GlassButton
                      primary
                      disabled={runningAction !== null}
                      onClick={() => runQuickAction('trending', analyticsApi.recalculateTrending, 'Trending scores recalculated')}
                    >
                      {runningAction === 'trending' ? <Loader2 className="animate-spin" size={14} /> : 'Run'}
                    </GlassButton>
                  </div>

                  {/* Action 2 */}
                  <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-[#f0e6c8]">Rebuild Personalized Recommendations</div>
                      <div className="text-xs text-[#8a8a8a] mt-0.5">Recalculates suggestion list matrices for all users database-wide.</div>
                    </div>
                    <GlassButton
                      primary
                      disabled={runningAction !== null}
                      onClick={() => runQuickAction('recs', analyticsApi.rebuildRecommendations, 'Recommendations rebuilt')}
                    >
                      {runningAction === 'recs' ? <Loader2 className="animate-spin" size={14} /> : 'Run'}
                    </GlassButton>
                  </div>

                  {/* Action 3 */}
                  <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-[#f0e6c8]">Prune Chat Logs (Keep top 100)</div>
                      <div className="text-xs text-[#8a8a8a] mt-0.5">Deletes older AI chatbot logs to optimize database capacity.</div>
                    </div>
                    <GlassButton
                      primary
                      disabled={runningAction !== null}
                      onClick={() => runQuickAction('logs', analyticsApi.cleanLogs, 'Chat logs cleaned')}
                    >
                      {runningAction === 'logs' ? <Loader2 className="animate-spin" size={14} /> : 'Run'}
                    </GlassButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
