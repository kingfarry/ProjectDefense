import { LogOut, User, Lock, Settings, Bell, Globe, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface UserData {
  email: string;
  username: string;
}

interface AccountSettingsProps {
  currentUser: UserData | null;
  onSignOut: () => void;
  onUpdateProfile: (newUsername: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onUpdateEmail: (newEmail: string, password: string) => Promise<boolean>;
  onDeleteAccount: (password: string) => Promise<void>;
}

const AccountSettings = ({
  currentUser,
  onSignOut,
  onUpdateProfile,
  onChangePassword,
  onUpdateEmail,
  onDeleteAccount
}: AccountSettingsProps) => {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en-US');
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('notificationsEnabled') !== 'false');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const translations = {
    'en-US': {
      profile: 'Profile',
      security: 'Security',
      preferences: 'Preferences',
      username: 'Username',
      email: 'Email',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      language: 'Language',
      darkMode: 'Dark Mode',
      notifications: 'Email Notifications',
      saveChanges: 'Save Changes',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      dangerZone: 'Danger Zone',
      signOut: 'Sign Out'
    },
    'es-ES': {
      profile: 'Perfil',
      security: 'Seguridad',
      preferences: 'Preferencias',
      username: 'Nombre de usuario',
      email: 'Correo electrónico',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña',
      language: 'Idioma',
      darkMode: 'Modo oscuro',
      notifications: 'Notificaciones por correo',
      saveChanges: 'Guardar cambios',
      changePassword: 'Cambiar contraseña',
      deleteAccount: 'Eliminar cuenta',
      dangerZone: 'Zona peligrosa',
      signOut: 'Cerrar sesión'
    },
    'fr-FR': {
      profile: 'Profil',
      security: 'Sécurité',
      preferences: 'Préférences',
      username: "Nom d'utilisateur",
      email: 'Email',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      language: 'Langue',
      darkMode: 'Mode sombre',
      notifications: 'Notifications par email',
      saveChanges: 'Enregistrer les modifications',
      changePassword: 'Changer le mot de passe',
      deleteAccount: 'Supprimer le compte',
      dangerZone: 'Zone dangereuse',
      signOut: 'Se déconnecter'
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en-US'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'profile') {
        if (username !== currentUser?.username) {
          await onUpdateProfile(username);
          setSuccess('Username updated successfully!');
        }
      } else if (activeTab === 'security') {
        if (newPassword && newPassword !== confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (newPassword) {
          const success = await onChangePassword(currentPassword, newPassword);
          if (success) {
            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }
        }
      } else if (activeTab === 'preferences') {
        localStorage.setItem('darkMode', darkMode.toString());
        localStorage.setItem('language', language);
        localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
        setSuccess('Preferences saved successfully!');
        
        // Apply dark mode immediately
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={24} className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h2>
      </div>

      {/* Settings Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          {t.profile}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium ${activeTab === 'security' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          {t.security}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          {t.preferences}
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} />
                {t.profile} Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.username}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.email}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      defaultValue={currentUser?.email || ''}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                    />
                    <button 
                      type="button"
                      onClick={async () => {
                        if (newEmail && newEmail !== currentUser?.email) {
                          setIsLoading(true);
                          try {
                            const success = await onUpdateEmail(newEmail, currentPassword);
                            if (success) {
                              setSuccess('Email updated successfully!');
                              setNewEmail('');
                              setCurrentPassword('');
                            }
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to update email');
                          } finally {
                            setIsLoading(false);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
                      disabled={!newEmail || newEmail === currentUser?.email || !currentPassword}
                    >
                      {isLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                  {newEmail && newEmail !== currentUser?.email && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.currentPassword}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={username === currentUser?.username}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
            >
              {isLoading ? 'Saving...' : t.saveChanges}
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Lock size={20} />
                {t.security}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.currentPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.newPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.confirmPassword}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                disabled={!newPassword || newPassword !== confirmPassword || !currentPassword}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
              >
                {isLoading ? 'Updating...' : t.changePassword}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                    setIsLoading(true);
                    try {
                      await onDeleteAccount(currentPassword);
                      onSignOut();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to delete account');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : t.deleteAccount}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Globe size={20} />
                Language & Region
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.language}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español (Spanish)</option>
                    <option value="fr-FR">Français (French)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.darkMode}</span>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={20} />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.notifications}</span>
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {t.saveChanges}
            </button>
          </div>
        )}
      </form>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-100 dark:border-red-900/30">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">
          {t.dangerZone}
        </h3>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <LogOut size={18} />
          {t.signOut}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;