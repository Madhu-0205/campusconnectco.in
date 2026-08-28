"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Star, MapPin, Briefcase, CheckCircle2, Circle } from"lucide-react";

import Image from"@/components/ui/ResilientImage";
import { safeArray, getInitials, truncate } from"@/lib/utils/safe";

import ConnectionButton from"./ConnectionButton";
 
 
 
 
 

type ConnectionStatus =
 |"none"
 |"pending_sent"
 |"pending_received"
 |"accepted"
 |"blocked";

interface UserSkill {
 skill: { name: string };
}

interface UserCardProps {
 user: {
 id: string;
 name: string | null;
 email: string;
 image: string | null;
 bio: string | null;
 skills: string | null;
 role: string;
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
 */
export default function UserCard({
 user,
 connectionStatus,
 connectionId,
 compact = false,
}: UserCardProps) {
 const name = user.name ||"Anonymous";
 const initials = getInitials(name);
 const bio = truncate(user.bio, 120);

 // Merge UserSkill relations with the legacy comma-separated skills field
 const skillNames: string[] =
 user.userSkills && user.userSkills.length > 0
 ? user.userSkills.map((us) => us.skill.name)
 : safeArray<string>(user.skills);

 if (compact) {
 return (
 <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.07] bg-surface/80 hover:border-white/15 transition-all">
 <div className="flex items-center gap-3 min-w-0">
 <Avatar url={user.image} initials={initials} size={36} />
 <div className="min-w-0">
 <p className="font-semibold text-white truncate">{name}</p>
 <p className="text-slate-400 truncate">{user.email}</p>
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
 <div className="group p-5 rounded-2xl border border-white/[0.07] bg-surface/80 backdrop-blur-md hover:border-[#1FA971]/30 hover:shadow-[0_8px_40px_rgba(31,169,113,0.12)] hover:-translate-y-0.5 transition-all duration-200">
 {/* Header */}
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <Avatar url={user.image} initials={initials} size={48} />
 <div>
 <h3 className="font-bold text-white group-hover:text-[#A78BFA] transition-colors">
 {name}
 </h3>
 <p className="text-slate-400 mt-0.5">{user.email}</p>
 </div>
 </div>
 </div>

 {/* Bio */}
 {bio && (
 <p className="text-slate-400 leading-relaxed mb-4 line-clamp-2">
 {bio}
 </p>
 )}

 {/* Skills */}
 {skillNames.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mb-4">
 {skillNames.slice(0, 4).map((skill) => (
 <span
 key={skill}
 className="px-2.5 py-1 rounded-lg bg-[#1FA971]/10 border border-[#1FA971]/20 text-[10px] font-medium"
 >
 {skill}
 </span>
 ))}
 {skillNames.length > 4 && (
 <span className="px-2 py-1 text-slate-500 font-medium">
 +{skillNames.length - 4} more
 </span>
 )}
 </div>
 )}

 {/* CTA */}
 <div className="pt-3 border-white/5">
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
 className="relative rounded-full overflow-hidden shrink-0 border border-white/10"
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
"from-primary to-blue-600",
"from-emerald-500 to-teal-500",
"from-amber-500 to-orange-500",
"from-pink-500 to-rose-500",
"from-primary to-primary-light",
"from-primary-light to-blue-500",
 ];
 const colorIdx =
 initials.charCodeAt(0) % colors.length;

 return (
 <div
 className={`shrink-0 rounded-full bg-linear-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold border border-white/10`}
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
