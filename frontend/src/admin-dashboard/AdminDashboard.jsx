import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';

import { cn } from './lib/cn';
import { fadeIn } from './lib/animations';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import DashboardHeader from './layout/DashboardHeader';
import Overview from './pages/Overview';
import PaintingsTable from './pages/PaintingsTable';
import ArtistsTable from './pages/ArtistsTable';
import UsersTable from './pages/UsersTable';
import AiLogs from './pages/AiLogs';
import SettingsPlaceholder from './pages/SettingsPlaceholder';

const PAGE_COMPONENTS = {
  Overview,
  Paintings: PaintingsTable,
  Artists: ArtistsTable,
  Users: UsersTable,
  'AI Logs': AiLogs,
  Settings: SettingsPlaceholder,
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const ActivePage = PAGE_COMPONENTS[tab] || Overview;

  return (
    <div
      className={cn(
        'min-h-screen font-sans transition-colors duration-300',
        darkMode ? 'dark bg-[#050505]' : 'bg-[#070707] text-[#f0e6c8]',
      )}
    >
      <AmbientBackground />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#f0e6c8',
            border: '1px solid rgba(212,175,95,0.25)',
            borderRadius: 12,
            fontSize: 14,
          },
        }}
      />

      <Sidebar
        tab={tab}
        setTab={setTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        darkMode={darkMode}
      />

      <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}>
        <Navbar
          tab={tab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
          <DashboardHeader />

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <ActivePage />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#d4af5f]/10 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-[#c39e4e]/10 blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full bg-[#e4c879]/8 blur-[100px]" />
    </div>
  );
}
