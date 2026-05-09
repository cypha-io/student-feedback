'use client';

import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface DashboardLayoutProps {
  children: ReactNode;
}

type RolePermissions = Record<string, string[]>;

const defaultRolePermissions: RolePermissions = {
  superadmin: ['viewOverview', 'manageTeachers', 'manageQuestions', 'viewReports', 'viewResponses', 'manageSettings', 'manageUsers'],
  manager: ['viewOverview', 'manageTeachers', 'manageQuestions', 'viewReports', 'viewResponses'],
  viewer: ['viewOverview', 'viewReports'],
};

const navigation = [
  { 
    name: 'Evaluation Overview', 
    href: '/dashboard', 
    permission: 'viewOverview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  { 
    name: 'Teacher Management', 
    href: '/dashboard/teachers', 
    permission: 'manageTeachers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    name: 'Evaluation Questions', 
    href: '/dashboard/questions', 
    permission: 'manageQuestions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9a3.5 3.5 0 116.544 1.5c0 1.5-1.5 2-2.5 3M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    name: 'Performance Reports', 
    href: '/dashboard/teacher-evaluation-reports', 
    permission: 'viewReports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    name: 'Student Responses', 
    href: '/dashboard/responses', 
    permission: 'viewResponses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    )
  },
  { 
    name: 'System Settings', 
    href: '/dashboard/settings', 
    permission: 'manageSettings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  { 
    name: 'User Management', 
    href: '/dashboard/users', 
    permission: 'manageUsers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(defaultRolePermissions);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, loading, role, fullName } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin-login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      try {
        const res = await fetch('/api/admin/role-permissions');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.rolePermissions) {
          setRolePermissions({ ...defaultRolePermissions, ...data.rolePermissions });
        }
      } catch (error) {
        console.error('Failed to load role permissions', error);
      }
    };

    if (!loading && isAuthenticated) {
      fetchRolePermissions();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const currentRoute = navigation.find(nav => nav.href === pathname);
    if (currentRoute?.permission && (!role || !rolePermissions[role]?.includes(currentRoute.permission))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, pathname, role, rolePermissions, router]);

  // Lock background scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Filter navigation based on role
  const allowedNav = navigation.filter(item => {
    if (!item.permission) return true
    return role ? rolePermissions[role]?.includes(item.permission) : false
  })

  const displayName = fullName || 'Admin User'
  const displayRole = role ? role.replace(/^[a-z]/, letter => letter.toUpperCase()) : 'Administrator'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300 ease-in-out lg:translate-x-0`}>
        
        {/* Sidebar Header - Logo */}
        <div className="flex flex-col items-center justify-center pt-5 pb-3 px-6 border-b border-slate-50">
          <Image
            src="https://olagshs.edu.gh/wp-content/uploads/2025/11/cropped-olag_logo3-1-1.png"
            alt="OLAG SHS Logo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="mt-8 px-4 space-y-1.5 pb-24 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide">
          <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {allowedNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <div className={`mr-3.5 p-2 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  {item.icon}
                </div>
                <span className="tracking-tight">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                {displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{displayRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="flex items-center justify-between h-20 px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl lg:hidden transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span>Console</span>
                  <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-blue-600">
                    {navigation.find(nav => nav.href === pathname)?.name || 'Overview'}
                  </span>
                </div>
                <h1 className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
                  {navigation.find(nav => nav.href === pathname)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search Bar - Desktop */}
              <div className="hidden md:relative md:block group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Intelligence Search..."
                  className="block w-64 pl-11 pr-4 py-2.5 bg-slate-50 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                />
              </div>
 
              {/* Notification & Other Actions */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all relative group active:scale-90">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5-5-5h5v-7a1 1 0 011-1h3a1 1 0 011 1v7z" />
                  </svg>
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white animate-pulse"></span>
                </button>
                
                <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all group active:scale-90">
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} />
                  </svg>
                </button>
              </div>

              {/* Profile Shortcut */}
              <div className="flex items-center pl-2 sm:pl-4 border-l border-slate-200 ml-1 sm:ml-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                  {displayName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 lg:px-10 border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm font-bold text-slate-900">OLAG SHS Feedback Intelligence</p>
              <p className="text-xs text-slate-500 mt-1">Version 2.1.0 • Built with excellence by SwapGPA Technologies</p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Support Center</a>
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Documentation</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}