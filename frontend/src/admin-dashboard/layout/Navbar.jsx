import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Bell,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';

import { NAV_ITEMS } from '../config/navItems';
import { fadeIn } from '../lib/animations';

const Navbar = memo(({
  tab,
  darkMode,
  setDarkMode,
  searchOpen,
  setSearchOpen,
  notifOpen,
  setNotifOpen,
  setSidebarOpen,
}) => {
  const title = NAV_ITEMS.find(n => n.id === tab)?.label || tab;

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#242424]/80 bg-[#0c0c0c]/75 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-[#b8aa7a]" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm text-[#8a8a8a]">
            <span>Aurelis</span>
            <ChevronRight size={14} />
            <span className="text-[#f0e6c8] font-medium">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  placeholder="Search anything…"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-[#242424] bg-[#121212]/90 text-[#f0e6c8] placeholder:text-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#d4af5f]/30"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a]"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a] relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d4af5f] rounded-full ring-2 ring-[#070707]" />
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-72 bg-[#121212] border border-[#242424] rounded-2xl shadow-2xl p-4 space-y-3"
                >
                  <div className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider">
                    Notifications
                  </div>

                  {['New user registered', '15 paintings added this week', 'AI usage spike detected'].map((n, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-2 rounded-xl hover:bg-[#0c0c0c] transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#d4af5f]/10 flex items-center justify-center flex-shrink-0">
                        <Activity size={14} className="text-[#d4af5f]" />
                      </div>
                      <div>
                        <div className="text-sm text-[#f0e6c8]">{n}</div>
                        <div className="text-xs text-[#8a8a8a] mt-0.5">{i + 1}h ago</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#8a8a8a]"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af5f] to-[#c39e4e] flex items-center justify-center text-[#070707] text-xs font-bold cursor-pointer ring-2 ring-[#070707] shadow-md">
            A
          </div>
        </div>
      </div>
    </motion.header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
