import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  MapPin,
  CheckCircle,
  Copy,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';

export const UserProfileHeader = ({ onEditProfile }) => {
  const { user, addToast } = useApp();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    addToast('Developer email copied to clipboard', 'info');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="rounded-xl border p-6 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar & Identity details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl border-2 dark:border-[#333333] border-neutral-200 object-cover shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full dark:bg-black bg-white border dark:border-[#333333] border-neutral-200 shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight dark:text-white text-black">
                {user.name}
              </h1>
              <Badge variant="accent" size="sm">
                {user.plan}
              </Badge>
              <Badge variant="code" size="xs">
                @{user.username}
              </Badge>
            </div>

            <p className="text-xs md:text-sm dark:text-neutral-400 text-neutral-600 font-medium">
              {user.role} <span className="dark:text-neutral-600 text-neutral-300">•</span> {user.organization}
            </p>

            {/* Meta attributes */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 pt-1 text-xs dark:text-neutral-400 text-neutral-500">
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-1.5 font-mono hover:text-blue-500 transition-colors"
                title="Click to copy email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
                <Copy className="w-3 h-3 text-neutral-500" />
              </button>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-mono text-[11px]">{user.region}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Member since {user.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              if (onEditProfile) {
                onEditProfile();
              } else {
                addToast('Profile settings modal opened', 'info');
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:bg-black bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          
          <button
            onClick={() => addToast('Account audit log downloaded', 'info')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:bg-black bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-all shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
