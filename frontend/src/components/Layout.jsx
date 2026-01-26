import React from 'react';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    Bell
} from 'lucide-react';

const Layout = ({ children, currentView, setCurrentView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Predictions', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'customers', label: 'Customer Base', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex shadow-xl z-20">
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight">FreshMart AI</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800">
                            JD
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">John Doe</p>
                            <p className="text-xs text-slate-500">Analyst</p>
                        </div>
                        <button className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
                    <div className="flex items-center">
                        <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="ml-4 md:ml-0 text-xl font-semibold text-gray-800 tracking-tight">
                            {navItems.find(i => i.id === currentView)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="hidden sm:flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Model v2.1 Online
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
};

export default Layout;
