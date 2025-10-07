import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { Card, Button, Input, Textarea, Badge } from '../components/UI';
import { useAuthStore } from '../stores/authStore';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [goals, setGoals] = useState(user?.goals || []);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'goals', label: 'Goals', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">Settings</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            Customize your Progress2Win experience
          </p>
        </div>
        <Button variant="primary" size="lg" icon={<Save className="w-5 h-5" />}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200 border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white border-primary-700'
                        : 'bg-white text-black hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-2xl font-black text-black mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    defaultValue={user?.firstName || ''}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name"
                    defaultValue={user?.lastName || ''}
                    placeholder="Doe"
                  />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  defaultValue={user?.email || ''}
                  placeholder="john@example.com"
                />
                <Input
                  label="Avatar URL"
                  defaultValue={user?.avatarUrl || ''}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </Card>
          )}

          {activeTab === 'goals' && (
            <Card>
              <h2 className="text-2xl font-black text-black mb-6">Your Goals</h2>
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Add a new goal..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <Button variant="primary" onClick={addGoal}>
                    Add Goal
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {goals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-50 border-2 border-black shadow-neo-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-500 border border-black"></div>
                        <span className="font-medium text-black">{goal}</span>
                      </div>
                      <button
                        onClick={() => removeGoal(index)}
                        className="text-danger-500 hover:text-danger-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {goals.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 mb-4">No goals set yet</p>
                    <p className="text-sm text-neutral-500">Add your first goal above to get started!</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-2xl font-black text-black mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 border-2 border-black">
                    <div>
                      <h3 className="font-semibold text-black">Email Notifications</h3>
                      <p className="text-sm text-neutral-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 border-2 border-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 border-2 border-black">
                    <div>
                      <h3 className="font-semibold text-black">Goal Reminders</h3>
                      <p className="text-sm text-neutral-600">Get reminded about your goals</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 border-2 border-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 border-2 border-black">
                    <div>
                      <h3 className="font-semibold text-black">Friend Updates</h3>
                      <p className="text-sm text-neutral-600">Notifications about friend activities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 border-2 border-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <h2 className="text-2xl font-black text-black mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 border-2 border-black">
                    <div>
                      <h3 className="font-semibold text-black">Public Profile</h3>
                      <p className="text-sm text-neutral-600">Allow others to see your progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 border-2 border-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 border-2 border-black">
                    <div>
                      <h3 className="font-semibold text-black">Leaderboard Participation</h3>
                      <p className="text-sm text-neutral-600">Include your data in leaderboards</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 border-2 border-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <h2 className="text-2xl font-black text-black mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-neutral-900 mx-auto mb-2"></div>
                        <p className="font-semibold text-black">Light</p>
                      </div>
                    </button>
                    <button className="p-4 bg-neutral-50 border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-neutral-100 border-2 border-black mx-auto mb-2"></div>
                        <p className="font-semibold text-black">Dark</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
