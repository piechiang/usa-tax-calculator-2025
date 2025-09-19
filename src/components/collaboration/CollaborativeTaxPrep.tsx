import React, { useState, useEffect, useRef } from 'react';
import { Users, Share2, MessageCircle, Eye, Edit3, Lock, Unlock, Video, Phone, CheckCircle, AlertCircle, Clock, UserPlus, Settings } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'preparer' | 'reviewer' | 'client';
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
  permissions: {
    canEdit: boolean;
    canView: boolean;
    canComment: boolean;
    canInvite: boolean;
  };
  lastActive: Date;
}

interface Comment {
  id: string;
  field: string;
  message: string;
  author: Collaborator;
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
}

interface ActivityLog {
  id: string;
  type: 'edit' | 'comment' | 'join' | 'leave' | 'review' | 'approve';
  user: Collaborator;
  field?: string;
  description: string;
  timestamp: Date;
}

interface CollaborativeTaxPrepProps {
  formData: any;
  onDataChange: (field: string, value: any) => void;
  t: (key: string) => string;
}

export const CollaborativeTaxPrep: React.FC<CollaborativeTaxPrepProps> = ({
  formData,
  onDataChange,
  t
}) => {
  const [isCollaborationActive, setIsCollaborationActive] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [currentUser] = useState<Collaborator>({
    id: 'current-user',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
    status: 'online',
    permissions: {
      canEdit: true,
      canView: true,
      canComment: true,
      canInvite: true
    },
    lastActive: new Date()
  });

  const [selectedView, setSelectedView] = useState<'workspace' | 'comments' | 'activity' | 'settings'>('workspace');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'client', message: '' });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [cursors, setCursors] = useState<Record<string, { field: string; user: Collaborator }>>({});

  // Real-time cursor tracking
  const cursorUpdateRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate initial collaborators
    setCollaborators([
      currentUser,
      {
        id: 'preparer-1',
        name: 'Sarah Johnson',
        email: 'sarah@taxprep.com',
        role: 'preparer',
        status: 'online',
        permissions: {
          canEdit: true,
          canView: true,
          canComment: true,
          canInvite: false
        },
        lastActive: new Date()
      },
      {
        id: 'reviewer-1',
        name: 'Michael Chen',
        email: 'michael@cpagroup.com',
        role: 'reviewer',
        status: 'offline',
        permissions: {
          canEdit: false,
          canView: true,
          canComment: true,
          canInvite: false
        },
        lastActive: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ]);

    // Simulate some comments
    setComments([
      {
        id: 'comment-1',
        field: 'personalInfo.wages',
        message: 'Please verify this amount with your W-2 form. The amount seems unusually high.',
        author: collaborators[1] || currentUser,
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        resolved: false,
        replies: []
      }
    ]);

    // Simulate activity log
    setActivityLog([
      {
        id: 'activity-1',
        type: 'join',
        user: collaborators[1] || currentUser,
        description: 'Sarah Johnson joined the collaboration session',
        timestamp: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        id: 'activity-2',
        type: 'edit',
        user: currentUser,
        field: 'personalInfo.wages',
        description: 'Updated wages amount',
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ]);
  }, []);

  const startCollaboration = () => {
    setIsCollaborationActive(true);
    addActivity('join', currentUser, 'Started collaboration session');
  };

  const stopCollaboration = () => {
    setIsCollaborationActive(false);
    setCursors({});
    addActivity('leave', currentUser, 'Ended collaboration session');
  };

  const addActivity = (type: ActivityLog['type'], user: Collaborator, description: string, field?: string) => {
    const activity: ActivityLog = {
      id: `activity_${Date.now()}`,
      type,
      user,
      field,
      description,
      timestamp: new Date()
    };
    setActivityLog(prev => [activity, ...prev]);
  };

  const addComment = (field: string, message: string) => {
    const comment: Comment = {
      id: `comment_${Date.now()}`,
      field,
      message,
      author: currentUser,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };
    setComments(prev => [...prev, comment]);
    addActivity('comment', currentUser, `Added comment on ${field}`, field);
  };

  const resolveComment = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )
    );
  };

  const inviteCollaborator = () => {
    if (!newInvite.email || !newInvite.role) return;

    // Simulate sending invitation
    const newCollaborator: Collaborator = {
      id: `collab_${Date.now()}`,
      name: newInvite.email.split('@')[0],
      email: newInvite.email,
      role: newInvite.role as any,
      status: 'offline',
      permissions: {
        canEdit: newInvite.role === 'preparer',
        canView: true,
        canComment: true,
        canInvite: newInvite.role === 'owner' || newInvite.role === 'preparer'
      },
      lastActive: new Date()
    };

    setCollaborators(prev => [...prev, newCollaborator]);
    addActivity('join', newCollaborator, `Invited ${newInvite.email} as ${newInvite.role}`);

    setNewInvite({ email: '', role: 'client', message: '' });
    setShowInviteModal(false);
  };

  const updateCursor = (field: string) => {
    if (!isCollaborationActive) return;

    setActiveField(field);

    // Clear existing timeout
    if (cursorUpdateRef.current) {
      clearTimeout(cursorUpdateRef.current);
    }

    // Update cursor position
    setCursors(prev => ({
      ...prev,
      [currentUser.id]: { field, user: currentUser }
    }));

    // Clear cursor after inactivity
    cursorUpdateRef.current = setTimeout(() => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[currentUser.id];
        return newCursors;
      });
      setActiveField(null);
    }, 3000);
  };

  const getFieldComments = (field: string) => {
    return comments.filter(comment => comment.field === field && !comment.resolved);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100';
      case 'preparer': return 'text-blue-600 bg-blue-100';
      case 'reviewer': return 'text-green-600 bg-green-100';
      case 'client': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'busy': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Collaborative Tax Preparation</h3>
          {isCollaborationActive && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full animate-pulse">
              Live Session
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isCollaborationActive ? (
            <button
              onClick={startCollaboration}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Share2 className="h-4 w-4" />
              Start Collaboration
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </button>
              <button
                onClick={stopCollaboration}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <Lock className="h-4 w-4" />
                End Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collaboration Controls */}
      {isCollaborationActive && (
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'workspace', label: 'Workspace', icon: Edit3 },
              { id: 'comments', label: 'Comments', icon: MessageCircle, count: comments.filter(c => !c.resolved).length },
              { id: 'activity', label: 'Activity', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Collaborators */}
      {isCollaborationActive && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Active Collaborators ({collaborators.filter(c => c.status === 'online').length})</h4>
          <div className="flex flex-wrap gap-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                    {collaborator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{collaborator.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role}
                    </span>
                  </div>
                  {cursors[collaborator.id] && (
                    <div className="text-xs text-blue-600">
                      Editing: {cursors[collaborator.id].field}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace View */}
      {selectedView === 'workspace' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Real-Time Collaboration Features</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Multiple users can edit simultaneously</li>
              <li>• Real-time cursor tracking and field highlighting</li>
              <li>• Instant comments and feedback system</li>
              <li>• Role-based permissions and access control</li>
              <li>• Complete activity log and audit trail</li>
            </ul>
          </div>

          {/* Simulated Form Fields with Collaboration Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Wages
                  {getFieldComments('personalInfo.wages').length > 0 && (
                    <span className="ml-2 text-orange-600">
                      <MessageCircle className="h-3 w-3 inline" />
                      {getFieldComments('personalInfo.wages').length}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.wages || ''}
                  onChange={(e) => {
                    onDataChange('wages', e.target.value);
                    updateCursor('personalInfo.wages');
                    addActivity('edit', currentUser, 'Updated wages amount', 'personalInfo.wages');
                  }}
                  onFocus={() => updateCursor('personalInfo.wages')}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeField === 'personalInfo.wages' ? 'ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter annual wages"
                />
                {getFieldComments('personalInfo.wages').map(comment => (
                  <div key={comment.id} className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-orange-900">{comment.author.name}:</span>
                        <p className="text-orange-800">{comment.message}</p>
                      </div>
                      <button
                        onClick={() => resolveComment(comment.id)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filing Status</label>
                <select
                  value={formData.filingStatus || ''}
                  onChange={(e) => {
                    onDataChange('filingStatus', e.target.value);
                    updateCursor('personalInfo.filingStatus');
                    addActivity('edit', currentUser, 'Changed filing status', 'personalInfo.filingStatus');
                  }}
                  onFocus={() => updateCursor('personalInfo.filingStatus')}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeField === 'personalInfo.filingStatus' ? 'ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select filing status</option>
                  <option value="single">Single</option>
                  <option value="marriedJointly">Married Filing Jointly</option>
                  <option value="marriedSeparately">Married Filing Separately</option>
                  <option value="headOfHousehold">Head of Household</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Income</label>
                <input
                  type="number"
                  value={formData.interestIncome || ''}
                  onChange={(e) => {
                    onDataChange('interestIncome', e.target.value);
                    updateCursor('incomeData.interestIncome');
                    addActivity('edit', currentUser, 'Updated interest income', 'incomeData.interestIncome');
                  }}
                  onFocus={() => updateCursor('incomeData.interestIncome')}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeField === 'incomeData.interestIncome' ? 'ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter interest income"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Federal Withholding</label>
                <input
                  type="number"
                  value={formData.federalWithholding || ''}
                  onChange={(e) => {
                    onDataChange('federalWithholding', e.target.value);
                    updateCursor('paymentsData.federalWithholding');
                    addActivity('edit', currentUser, 'Updated federal withholding', 'paymentsData.federalWithholding');
                  }}
                  onFocus={() => updateCursor('paymentsData.federalWithholding')}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeField === 'paymentsData.federalWithholding' ? 'ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter federal withholding"
                />
              </div>
            </div>
          </div>

          {/* Quick Comment Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Add Comment</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your comment..."
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addComment(activeField || 'general', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Type your comment..."]') as HTMLInputElement;
                  if (input?.value.trim()) {
                    addComment(activeField || 'general', input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments View */}
      {selectedView === 'comments' && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No comments yet</p>
              <p className="text-sm">Add comments to collaborate with your team</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`border rounded-lg p-4 ${comment.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{comment.author.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleColor(comment.author.role)}`}>
                      {comment.author.role}
                    </span>
                    <span className="text-xs text-gray-500">{comment.timestamp.toLocaleString()}</span>
                  </div>
                  {!comment.resolved && (
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Mark as resolved"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{comment.message}</p>
                <div className="text-xs text-gray-500">
                  Field: {comment.field}
                  {comment.resolved && <span className="ml-2 text-green-600">✓ Resolved</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Activity View */}
      {selectedView === 'activity' && (
        <div className="space-y-3">
          {activityLog.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'edit' ? 'bg-blue-500' :
                activity.type === 'comment' ? 'bg-orange-500' :
                activity.type === 'join' ? 'bg-green-500' :
                activity.type === 'leave' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{activity.user.name}</span>
                  <span className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{activity.description}</p>
                {activity.field && (
                  <p className="text-xs text-gray-500 mt-1">Field: {activity.field}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings View */}
      {selectedView === 'settings' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Collaboration Permissions</h4>
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{collaborator.name}</div>
                      <div className="text-sm text-gray-600">{collaborator.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role}
                    </span>
                    <div className="flex gap-1">
                      {collaborator.permissions.canEdit ? <Edit3 className="h-3 w-3 text-green-600" /> : <Lock className="h-3 w-3 text-gray-400" />}
                      {collaborator.permissions.canComment ? <MessageCircle className="h-3 w-3 text-blue-600" /> : <Lock className="h-3 w-3 text-gray-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Session Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto-save changes</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="w-11 h-6 bg-blue-600 rounded-full">
                    <div className="dot absolute w-4 h-4 rounded-full bg-white transition transform translate-x-6" style={{ top: '4px' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show real-time cursors</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="w-11 h-6 bg-blue-600 rounded-full">
                    <div className="dot absolute w-4 h-4 rounded-full bg-white transition transform translate-x-6" style={{ top: '4px' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notify on comments</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="w-11 h-6 bg-blue-600 rounded-full">
                    <div className="dot absolute w-4 h-4 rounded-full bg-white transition transform translate-x-6" style={{ top: '4px' }}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Invite Collaborator</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={newInvite.role}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="client">Client (View Only)</option>
                    <option value="reviewer">Reviewer (View + Comment)</option>
                    <option value="preparer">Preparer (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea
                    value={newInvite.message}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Add a personal message..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={inviteCollaborator}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};