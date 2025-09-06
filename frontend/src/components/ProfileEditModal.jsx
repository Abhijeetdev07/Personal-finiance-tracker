import { useContext, useState, useEffect } from "react";
import ProfileForm from "./ProfileForm";
import { AuthContext } from "../context/AuthContext";

export default function ProfileEditModal({ isOpen, onClose, profile: profileProp, onSave }) {
  const { profile: profileFromContext, saveProfile } = useContext(AuthContext) || {};
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Clear messages when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      setMessage(null);
      setError(null);
      if (onSave) {
        const res = await onSave(values);
        if (res?.success) {
          setMessage("Profile updated successfully");
          // Auto-close modal after 2 seconds
          setTimeout(() => onClose?.(), 2000);
        } else if (res?.error) setError(res.error);
      } else if (saveProfile) {
        const res = await saveProfile(values);
        if (res?.success) {
          setMessage("Profile updated successfully");
          // Auto-close modal after 2 seconds
          setTimeout(() => onClose?.(), 2000);
        } else if (res?.error) setError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-xl mx-4 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {message && (
          <div className="mb-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
              <button 
                onClick={() => setMessage(null)}
                className="text-green-600 hover:text-green-800 ml-2"
                aria-label="Close success message"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        <ProfileForm
          initialValues={{
            firstName: (profileProp?.firstName ?? profileFromContext?.firstName) || "",
            lastName: (profileProp?.lastName ?? profileFromContext?.lastName) || "",
            phone: (profileProp?.phone ?? profileFromContext?.phone) || "",
            bio: (profileProp?.bio ?? profileFromContext?.bio) || "",
          }}
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </div>
  );
}


