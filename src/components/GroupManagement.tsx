import React, { useState, useEffect } from 'react';
import { Users, Plus, Copy, Check, LogOut, X } from 'lucide-react';
import { Card, Button, Input, Alert, LoadingSpinner } from './UI';
import { groupsApi } from '../services/api';
import type { Group, GroupWithMembers } from '../types';

interface GroupManagementProps {
  onGroupSelect?: (group: Group) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const data = await groupsApi.getMyGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupClick = async (group: Group) => {
    try {
      const fullGroup = await groupsApi.getGroup(group.id);
      setSelectedGroup(fullGroup);
      if (onGroupSelect) {
        onGroupSelect(group);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load group details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-black">Your Groups</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowJoinModal(true)}
          >
            Join Group
          </Button>
          <Button
            variant="accent"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Group
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Groups List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">No Groups Yet</h3>
            <p className="text-neutral-600 mb-4">Create or join a group to compare progress with friends!</p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Group
              </Button>
              <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
                Join Group
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => handleGroupClick(group)}
              onLeave={loadGroups}
            />
          ))}
        </div>
      )}

      {/* Selected Group Details */}
      {selectedGroup && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-black">{selectedGroup.name}</h3>
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setSelectedGroup(null)}
            >
              Close
            </Button>
          </div>
          {selectedGroup.description && (
            <p className="text-neutral-600 mb-4">{selectedGroup.description}</p>
          )}
          <div className="mb-4">
            <p className="text-sm font-bold text-black mb-2">Group Code:</p>
            <CodeDisplay code={selectedGroup.code} />
          </div>
          <div>
            <p className="text-sm font-bold text-black mb-2">
              Members ({selectedGroup.members.length})
            </p>
            <div className="space-y-2">
              {selectedGroup.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center p-3 bg-neutral-50 border border-black"
                >
                  <div className="w-8 h-8 bg-primary-500 border border-black mr-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {member.first_name[0]}{member.last_name[0]}
                    </span>
                  </div>
                  <span className="font-medium text-black">
                    {member.first_name} {member.last_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadGroups();
          }}
        />
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false);
            loadGroups();
          }}
        />
      )}
    </div>
  );
};

// Group Card Component
const GroupCard: React.FC<{
  group: Group;
  onClick: () => void;
  onLeave: () => void;
}> = ({ group, onClick, onLeave }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to leave "${group.name}"?`)) return;

    try {
      setIsLeaving(true);
      await groupsApi.leave(group.id);
      onLeave();
    } catch (error) {
      console.error('Failed to leave group:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-neo-lg transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-black mb-1">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-neutral-600 line-clamp-2">{group.description}</p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
          onClick={handleLeave}
          loading={isLeaving}
        />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neutral-600" />
          <span className="font-semibold text-black">{group.member_count || 0} members</span>
        </div>
        <CodeDisplay code={group.code} compact />
      </div>
    </Card>
  );
};

// Code Display Component
const CodeDisplay: React.FC<{ code: string; compact?: boolean }> = ({ code, compact }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'p-3'} bg-accent-500 border-2 border-black ${compact ? '' : 'shadow-neo-sm'}`}>
      <code className="font-black text-black text-lg flex-1">{code}</code>
      <button
        onClick={handleCopy}
        className="p-2 bg-white border-2 border-black hover:shadow-neo-sm transition-shadow"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-black" />
        )}
      </button>
    </div>
  );
};

// Create Group Modal
const CreateGroupModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await groupsApi.create({ name: name.trim(), description: description.trim() || undefined });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-black mb-6">Create Group</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Input
            label="Group Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Fitness Squad"
            required
          />

          <div>
            <label className="block text-sm font-bold text-black mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="accent" loading={isLoading} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Join Group Modal
const JoinGroupModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await groupsApi.join(code.trim().toUpperCase());
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to join group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-black mb-6">Join Group</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Input
            label="Group Code *"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            required
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
              Join
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
