import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiUser, FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { formatDateTimeToIST, updateUserProfile } from "../utils/api";
import { useNotification } from "../context/NotificationContext";
import CountryCodeSelector from "./CountryCodeSelector";

export default function ProfileSidebar({ isOpen, onClose, onOpenProfile, onLogout }) {
  const { profile, isProfileLoading, saveProfile } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+91',
    bio: ''
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleAction = (action) => {
    handleClose();
    setTimeout(() => {
      action();
    }, 100);
  };

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        countryCode: profile.countryCode || '+91',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        countryCode: profile.countryCode || '+91',
        bio: profile.bio || ''
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        countryCode: profile.countryCode || '+91',
        bio: profile.bio || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await saveProfile(formData);
      if (result && result.success) {
        showSuccess('Profile updated successfully');
        setIsEditing(false);
      } else {
        showError(result?.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-0 top-0 h-[90vh] w-80 max-[370px]:w-full bg-white shadow-2xl z-50 transform transition-transform duration-200 ${
      isClosing ? 'translate-x-full' : 'translate-x-0'
    } flex flex-col max-h-screen overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[14px] border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-600">Manage your account</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Profile Info */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            {isProfileLoading ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-3">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold">
                    {(profile.firstName?.[0] || profile.username?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="First Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Last Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {profile.firstName || profile.lastName
                            ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
                            : profile.username}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">@{profile.username}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 truncate">{profile.email}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 flex gap-2">
                          <div className="w-24">
                            <CountryCodeSelector
                              value={formData.countryCode}
                              onChange={(value) => handleInputChange('countryCode', value)}
                            />
                          </div>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Phone Number"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    profile.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {profile.countryCode ? `${profile.countryCode} ${profile.phone}` : profile.phone}
                        </span>
                      </div>
                    )
                  )}
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      Joined {formatDateTimeToIST(profile.createdAt).split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="pt-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => {
                          const text = e.target.value;
                          if (text.length <= 100) {
                            handleInputChange('bio', text);
                          }
                        }}
                        placeholder="Tell us about yourself..."
                        rows={2}
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none break-words overflow-hidden"
                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.bio.length}/100 characters
                      </div>
                    </div>
                  ) : (
                    profile.bio && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg break-words overflow-hidden" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {profile.bio}
                      </p>
                    )
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing ? (
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleEdit}
                      className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <FaRegEdit className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No profile data available</p>
              </div>
            )}
          </div>

        </div>

        {/* Fixed Logout Button at Bottom */}
        <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex-shrink-0 sticky bottom-0">
          <div className="flex justify-end">
            <button
              onClick={() => handleAction(onLogout)}
              className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group font-medium text-sm sm:text-base"
            >
              <span>Logout</span>
              <TbLogout className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
  );
}
