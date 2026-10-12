import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Building,
  MapPin,
  CheckCircle,
  ExternalLink,
  X,
  Check,
  Save,
  LogOut,
  Calendar
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

const AVAILABLE_AVATARS = [
  { id: '/avatars/avatar-1.svg', label: 'Cyberpunk Purple' },
  { id: '/avatars/avatar-2.svg', label: 'Neon Emerald' },
  { id: '/avatars/avatar-3.svg', label: 'Quantum Indigo' },
  { id: '/avatars/avatar-4.svg', label: 'Solar Amber' },
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, credits, logout, updateProfile } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar-1.svg');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setSelectedAvatar(user.avatar || '/avatars/avatar-1.svg');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      setIsSaving(true);
      await updateProfile({
        name: displayName.trim(),
        avatar: selectedAvatar,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Developer Account Settings"
      subtitle="Identity, curated avatar selection & security details"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Curated Avatar Selection Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider dark:text-neutral-400 text-neutral-600">
            Select Platform Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVAILABLE_AVATARS.map((av) => {
              const isSelected = selectedAvatar === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30 dark:bg-blue-500/10 bg-blue-50'
                      : 'dark:border-[#262626] border-neutral-200 dark:hover:border-neutral-700 hover:border-neutral-300 dark:bg-[#111111] bg-neutral-50'
                  }`}
                >
                  <img
                    src={av.id}
                    alt={av.label}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 p-0.5 rounded-full bg-blue-500 text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <span className="mt-1 text-[10px] text-center font-medium dark:text-neutral-400 text-neutral-600 line-clamp-1">
                    {av.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-500">
            Curated, full-colour static platform assets. No file storage or uploads required.
          </p>
        </div>

        {/* Display Name Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider dark:text-neutral-400 text-neutral-600">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border text-xs dark:bg-[#0c0c0c] bg-white dark:border-[#262626] border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>

        {/* Account Details List */}
        <div className="divide-y dark:divide-[#1f1f1f] divide-neutral-200 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Account Email</span>
            <span className="font-semibold dark:text-neutral-200 text-neutral-800 font-mono">
              {user.email}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Account Role</span>
            <span className="font-semibold dark:text-white text-black">
              {user.role || 'Developer'}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Member Since</span>
            <span className="dark:text-neutral-300 text-neutral-700 font-mono">
              {user.memberSince || new Date(user.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-400">Security Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-500 font-mono text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>TLS 1.3 & Argon2 Encrypted</span>
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t dark:border-[#222222] border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileModal;
