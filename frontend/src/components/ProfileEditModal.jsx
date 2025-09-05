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
          // Auto-close modal after 3 seconds
          setTimeout(() => onClose?.(), 3000);
        } else if (res?.error) setError(res.error);
      } else if (saveProfile) {
        const res = await saveProfile(values);
        if (res?.success) {
          setMessage("Profile updated successfully");
          // Auto-close modal after 3 seconds
          setTimeout(() => onClose?.(), 3000);
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
          <div className="mb-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2">
            {message}
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


