import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, Edit2, Save, X } from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { ModernButton } from '../utils/uiComponents';
 

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSignOut: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSignOut 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || user.email || '');
  const [isLoading, setIsLoading] = useState(false);
  

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await authService.updateUserProfile(displayName);
      setIsEditing(false);
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      onSignOut();
      onClose();
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Profile</h2>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your display name"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName || user.email || '');
                    }}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                  {user.displayName || user.email || 'Not set'}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {user.email}
              </div>
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Account Role
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 capitalize">
                {user.role || 'user'}
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <ModernButton
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </ModernButton>
          <ModernButton
            variant="danger"
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex-1"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </ModernButton>
        </div>
      </div>
    </div>
  );
};