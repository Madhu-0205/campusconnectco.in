"use client";

import Image from "@/components/ui/ResilientImage";
import { safeArray, getInitials, truncate } from "@/lib/utils/safe";

import ConnectionButton from "./ConnectionButton";

type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked";

interface UserSkill {
  skill: { name: string };
}

export interface UserCardProps {
  user: {
    id: string;
    name?: string | null;
    full_name?: string | null;
    email?: string;
    image?: string | null;
    avatar_url?: string | null;
    college?: string | null;
    branch?: string | null;
    year?: string | null;
    bio?: string | null;
    skills?: string | null;
    role?: string;
    userSkills?: UserSkill[];
  };
  connectionStatus: ConnectionStatus;
  connectionId?: string;
  /** Show in compact 1-line style */
  compact?: boolean;
}

/**
 * Student networking card.
 * Always uses safeArray for skills — never crashes on malformed data.
 * Renders in high-contrast light theme with clear visual hierarchy:
 * 1. Avatar
 * 2. Name
 * 3. College / Role
 * 4. Skills / Metadata
 * 5. Bio
 * 6. Connection action
 */
export default function UserCard({
  user,
  connectionStatus,
  connectionId,
  compact = false,
}: UserCardProps) {
  const name = user.full_name?.trim() || user.name?.trim() || "Campus Member";
  const initials = getInitials(name);
  const bio = truncate(user.bio, 120);
  const college = user.college?.trim();
  const roleOrBranch = user.branch?.trim() || user.role || "Student";

  // Merge UserSkill relations with the legacy comma-separated skills field
  const skillNames: string[] =
    user.userSkills && user.userSkills.length > 0
      ? user.userSkills.map((us) => us.skill.name)
      : safeArray<string>(user.skills);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-foreground shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar url={user.avatar_url || user.image || null} initials={initials} size={36} />
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate text-sm">{name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {college ? `${college} • ${roleOrBranch}` : roleOrBranch}
            </p>
          </div>
        </div>
        <ConnectionButton
          targetUserId={user.id}
          initialStatus={connectionStatus}
          connectionId={connectionId}
          compact
        />
      </div>
    );
  }

  return (
    <div className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 text-foreground">
      {/* Top Section */}
      <div>
        {/* Header: Avatar, Name, College/Role */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <Avatar url={user.avatar_url || user.image || null} initials={initials} size={48} />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base truncate">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
              {college ? `${college} • ${roleOrBranch}` : roleOrBranch}
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2 min-h-8">
          {bio || "No bio yet"}
        </p>

        {/* Skills */}
        {skillNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skillNames.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary-dark dark:text-primary text-[11px] font-semibold"
              >
                {skill}
              </span>
            ))}
            {skillNames.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground font-medium">
                +{skillNames.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* CTA Bottom Section */}
      <div className="pt-3 border-t border-border mt-auto">
        <ConnectionButton
          targetUserId={user.id}
          initialStatus={connectionStatus}
          connectionId={connectionId}
        />
      </div>
    </div>
  );
}

// ─── Avatar helper ─────────────────────────────────────────────────────────────

function Avatar({
  url,
  initials,
  size = 48,
}: {
  url: string | null;
  initials: string;
  size?: number;
}) {
  if (url) {
    return (
      <div
        className="relative rounded-full overflow-hidden shrink-0 border border-border shadow-xs"
        style={{ width: size, height: size }}
      >
        <Image
          src={url}
          alt="Avatar"
          fill
          className="object-cover"
          sizes={`${size}px`}
          isAvatar={true}
        />
      </div>
    );
  }

  // Deterministic color based on initials
  const colors = [
    "from-emerald-600 to-teal-700",
    "from-teal-600 to-cyan-700",
    "from-emerald-500 to-green-600",
    "from-indigo-600 to-blue-700",
    "from-blue-600 to-cyan-700",
    "from-slate-700 to-slate-900",
  ];
  const colorIdx = initials.length > 0 ? initials.charCodeAt(0) % colors.length : 0;

  return (
    <div
      className={`shrink-0 rounded-full bg-linear-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold border border-border shadow-xs`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}
