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
      </div>
    );
  }

  return (
    <div className="bg-white p-2 sm:p-4 rounded-lg shadow border max-w-56 sm:max-w-sm mx-auto">
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600 text-sm sm:text-xl flex-shrink-0">
          {(profile.firstName?.[0] || profile.username?.[0] || "U").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-lg truncate" title={profile.firstName || profile.lastName
              ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
              : profile.username}>
            {profile.firstName || profile.lastName
              ? (() => {
                  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
                  return fullName.length > 15 ? fullName.substring(0, 15) + "..." : fullName;
                })()
              : (profile.username?.length > 15 ? profile.username.substring(0, 15) + "..." : profile.username)}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{profile.email}</p>
          {profile.phone ? (
            <p className="text-xs sm:text-sm text-gray-600">
              {profile.countryCode ? `${profile.countryCode} ${profile.phone}` : profile.phone}
            </p>
          ) : null}
          {profile.bio ? (
            <p className="text-xs sm:text-sm text-gray-700 mt-1 sm:mt-2 break-words line-clamp-2 hidden sm:block" title={profile.bio}>
              {profile.bio.length > 40 ? profile.bio.substring(0, 40) + "..." : profile.bio}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}


