import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { Card, Button, Input, Alert } from '../components/UI';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../services/api';
import { AvatarPicker } from '../components/AvatarPicker';
import { Avatar } from '../components/Avatar';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (!firstName?.trim()) {
      setError('Le prénom est requis');
      return;
    }

    if (!lastName?.trim()) {
      setError('Le nom est requis');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const updatedUser = await userApi.updateProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarUrl,
      });

      updateUser(updatedUser);
      setSuccess('Profil mis à jour avec succès!');

      // Force update of avatar URL in local state
      setAvatarUrl(updatedUser.avatarUrl || '');
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ];

  return (
    <div className="w-full bg-[#FFF5E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-black">Paramètres</h1>
            <p className="text-base sm:text-lg text-black/70 mt-1">
              Personnalise ton expérience Progress2Win
            </p>
          </div>
          {activeTab === 'profile' && (
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-semibold transition-all duration-150 border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] ${
                        activeTab === tab.id
                          ? 'bg-[#9D4EDD] text-white'
                          : 'bg-white text-black hover:bg-[#FFF5E1]'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-xl sm:text-2xl font-display text-black mb-5">Paramètres du profil</h2>
                <div className="space-y-5">
                  {/* Current Avatar Display */}
                  <div className="flex items-center gap-4 p-4 bg-[#FFF5E1] border-2 border-black rounded-xl">
                    <div className="w-16 h-16 border-2 border-black rounded-xl overflow-hidden bg-white flex items-center justify-center">
                      <Avatar
                        avatarUrl={avatarUrl}
                        fallback={`${firstName?.[0] || ''}${lastName?.[0] || ''}`}
                        size={64}
                        className="w-full h-full object-cover"
                        alt="Avatar actuel"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Avatar actuel</h3>
                      <p className="text-sm text-black/60">
                        {firstName} {lastName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-black mb-2">Prénom</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-2">Nom</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-black mb-2">Adresse email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      disabled
                      className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-black/5 text-black/60 cursor-not-allowed"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div className="border-2 border-black rounded-xl p-5 bg-[#FFF5E1]">
                    <AvatarPicker
                      seed={user?.email || 'default'}
                      currentAvatarUrl={avatarUrl}
                      onAvatarSelect={setAvatarUrl}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-xl sm:text-2xl font-display text-black mb-5">Préférences de notification</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#FFF5E1] border-2 border-black rounded-xl">
                    <div>
                      <h3 className="font-semibold text-black">Notifications email</h3>
                      <p className="text-sm text-black/60">Reçois des mises à jour par email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white peer-focus:outline-none border-2 border-black rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D4EDD] peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#FFF5E1] border-2 border-black rounded-xl">
                    <div>
                      <h3 className="font-semibold text-black">Rappels d'objectifs</h3>
                      <p className="text-sm text-black/60">Reçois des rappels pour tes objectifs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white peer-focus:outline-none border-2 border-black rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D4EDD] peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#FFF5E1] border-2 border-black rounded-xl">
                    <div>
                      <h3 className="font-semibold text-black">Mises à jour des amis</h3>
                      <p className="text-sm text-black/60">Notifications sur les activités des amis</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-white peer-focus:outline-none border-2 border-black rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D4EDD] peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-xl sm:text-2xl font-display text-black mb-5">Paramètres de confidentialité</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#FFF5E1] border-2 border-black rounded-xl">
                    <div>
                      <h3 className="font-semibold text-black">Profil public</h3>
                      <p className="text-sm text-black/60">Permet aux autres de voir tes progrès</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white peer-focus:outline-none border-2 border-black rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D4EDD] peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#FFF5E1] border-2 border-black rounded-xl">
                    <div>
                      <h3 className="font-semibold text-black">Participation au classement</h3>
                      <p className="text-sm text-black/60">Inclure tes données dans les classements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white peer-focus:outline-none border-2 border-black rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D4EDD] peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-xl sm:text-2xl font-display text-black mb-5">Apparence</h2>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Thème</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-[#FFD93D] border-2 border-black rounded-lg mx-auto mb-2"></div>
                        <p className="font-semibold text-black">Clair</p>
                      </div>
                    </button>
                    <button className="p-4 bg-[#FFF5E1] border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-[#9D4EDD] border-2 border-black rounded-lg mx-auto mb-2"></div>
                        <p className="font-semibold text-black">Sombre</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
