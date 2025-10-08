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
  const { user } = useAuthStore();
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
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-4 border-black shadow-neo-sm',
        'transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:inset-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-4 border-black">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-black">Progress2Win</h1>
                <p className="text-xs text-neutral-600 font-medium">Suivez vos progrès</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b-2 border-black bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm rounded-full flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user.firstName}{user.lastName}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-neutral-600 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200',
                    'border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5',
                    isActive 
                      ? 'bg-primary-500 text-white border-primary-700' 
                      : 'bg-white text-black hover:bg-neutral-50'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick add button */}
          <div className="p-4 border-t-2 border-black">
            <Link
              to="/progress/add"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-accent-500 border-2 border-accent-700 shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
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
    <header className="bg-white border-b-4 border-black shadow-neo-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-neutral-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Title - hidden on mobile */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-black text-black">Progress2Win</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-black">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-neutral-600">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-danger-500 border-2 border-danger-700 shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="w-full">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
