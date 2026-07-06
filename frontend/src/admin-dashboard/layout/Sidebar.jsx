import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut, Palette } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { NAV_ITEMS } from '../config/navItems';
import { cn } from '../lib/cn';
import { slideLeft } from '../lib/animations';
import { authApi } from '../../api/endpoints';
import { logout } from '../../features/auth/authSlice';

const Sidebar = memo(({ tab, setTab, open, setOpen, darkMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/', { replace: true });
    try { await authApi.logout(); } catch { /* ignore */ }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

    <motion.aside
      className={cn(
        'fixed top-0 left-0 h-full z-50 flex flex-col',
        'backdrop-blur-xl border-r border-[#242424]/80 shadow-2xl',
        darkMode ? 'bg-[#050505]/95' : 'bg-[#121212]/90',
        open ? 'w-64' : 'w-20',
        'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        !open ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
      )}
      initial={slideLeft.hidden}
      animate={slideLeft.visible}
    >
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[#242424]/80">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af5f] to-[#c39e4e] flex items-center justify-center shadow-lg shadow-[#d4af5f]/30">
          <Palette size={18} className="text-[#070707]" />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-bold tracking-wide text-[#f0e6c8]">
                AURELIS
              </div>
              <div className="text-[10px] text-[#8a8a8a] tracking-widest uppercase">
                Admin Console
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#121212] border border-[#242424] items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
      >
        {open ? (
          <ChevronLeft size={12} className="text-[#8a8a8a]" />
        ) : (
          <ChevronRight size={12} className="text-[#8a8a8a]" />
        )}
      </button>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = tab === id;

          return (
            <motion.button
              key={id}
              onClick={() => {
                setTab(id);
                if (window.innerWidth < 1024) setOpen(false);
              }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-[#d4af5f] to-[#c39e4e] text-[#070707] shadow-lg shadow-[#d4af5f]/25'
                  : 'text-[#8a8a8a] hover:text-[#f0e6c8] hover:bg-[#1a1a1a]/80',
              )}
            >
              <Icon
                size={18}
                className={cn('flex-shrink-0', active ? 'text-[#070707]' : '')}
              />

              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#d4af5f] to-[#c39e4e] -z-10"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#242424]/80 space-y-1">
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#e28b8b] hover:bg-[#8b2e2e]/15 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {open && <span>Logout</span>}
        </motion.button>

        {open && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af5f] to-[#c39e4e] flex items-center justify-center text-[#070707] text-xs font-bold">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-[#f0e6c8]">Admin</div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
