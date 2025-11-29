import React, { useState } from 'react';
import { Home, Users, DollarSign, Settings, Menu, X, Plus, Search } from 'lucide-react';
import { cn } from './utils/cn';

interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAddClick?: () => void;
  onSearchClick?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeSection,
  onSectionChange,
  onAddClick,
  onSearchClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (section: string) => {
    onSectionChange(section);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-3">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-3 rounded-lg transition-all duration-200',
                  'min-w-[64px] touch-target',
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Safe area for bottom */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white" />
      </div>

      {/* Top Header with Actions */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 touch-target"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <h1 className="text-base font-bold text-gray-900">DuetTrack AI</h1>
          
          <div className="flex items-center space-x-2">
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="p-2 rounded-lg hover:bg-gray-100 touch-target"
              >
                <Search size={24} />
              </button>
            )}

          </div>
        </div>
        
        {/* Safe area for top */}
        <div className="h-[env(safe-area-inset-top)] bg-white" />
      </div>

      {/* Floating Action Button */}
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-30 transition-all duration-200 hover:scale-110 touch-target"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                        'touch-target',
                        isActive 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;