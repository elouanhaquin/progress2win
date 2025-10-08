import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Users,
  Target,
  Settings,
  Trophy,
  Plus,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: Home },
  { name: 'Progrès', href: '/progress', icon: BarChart3 },
  { name: 'Objectifs', href: '/goals', icon: Target },
  { name: 'Comparer', href: '/compare', icon: Users },
  { name: 'Classement', href: '/leaderboard', icon: Trophy },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-black',
        'transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:inset-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black bg-[#FFF5E1]">
            <h1 className="text-2xl font-display text-black">Progress2Win</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 bg-[#FFF5E1]">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-xl',
                    'border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]',
                    isActive
                      ? 'bg-[#9D4EDD] text-white'
                      : 'bg-white text-black'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick add button */}
          <div className="p-4 border-t-2 border-black bg-[#FFF5E1]">
            <Link
              to="/progress/add"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-black bg-[#FFD93D] border-2 border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter Progrès
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useAppStore();

  const handleLogout = async () => {
    try {
      // TODO: Call logout API
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-[#FFF5E1] border-b-2 border-black">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-white rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1"></div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#9D4EDD] border-2 border-black rounded-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#FFF5E1]">
      <Sidebar />
      <div className="w-full">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};
