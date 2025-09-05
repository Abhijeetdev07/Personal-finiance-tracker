import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProfileCard() {
  const { profile, isProfileLoading } = useContext(AuthContext);

  if (isProfileLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Profile</h3>
          <p className="text-sm text-gray-600">No profile loaded</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-500 text-xl flex-shrink-0">
          {(profile.firstName?.[0] || profile.username?.[0] || "U").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">
            {profile.firstName || profile.lastName
              ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
              : profile.username}
          </h3>
          <p className="text-sm text-gray-600 truncate">{profile.email}</p>
          {profile.phone ? (
            <p className="text-sm text-gray-600">{profile.phone}</p>
          ) : null}
          {profile.bio ? (
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">{profile.bio}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}


