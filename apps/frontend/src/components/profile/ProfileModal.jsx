import React from 'react';
import { User, Mail, Shield, Building, MapPin, CheckCircle, ExternalLink, X } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, credits, logout } = useApp();

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Developer Account Settings"
      subtitle="Identity, organization credentials & security status"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#222222] border-neutral-200">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-xl border dark:border-[#333333] border-neutral-300 object-cover shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold dark:text-white text-black">{user.name}</h4>
              <Badge variant="accent" size="xs">{user.plan}</Badge>
            </div>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 font-mono">{user.email}</p>
            <p className="text-[11px] dark:text-neutral-500 text-neutral-500">{user.role} • {user.organization}</p>
          </div>
        </div>

        {/* Account Details List */}
        <div className="divide-y dark:divide-[#1f1f1f] divide-neutral-200 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Account Tier</span>
            <span className="font-semibold dark:text-white text-black font-mono">Pro Developer (50,000 CR/mo)</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Credit Balance</span>
            <span className="font-semibold text-emerald-500 font-mono">{credits.remaining.toLocaleString()} CR</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Primary Region</span>
            <span className="font-mono dark:text-neutral-300 text-neutral-700">{user.region}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Member Since</span>
            <span className="dark:text-neutral-300 text-neutral-700">{user.memberSince}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Two-Factor Authentication</span>
            <span className="inline-flex items-center gap-1 text-emerald-500 font-mono text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Enforced (WebAuthn / FIDO2)</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t dark:border-[#222222] border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Close Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
