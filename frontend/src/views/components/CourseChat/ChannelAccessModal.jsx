/**
 * ChannelAccessModal.jsx – View component for Admin Course Channel Access Management.
 *
 * MVC Role: View
 *
 * Exclusively presented to Administrators to view, search, grant, and revoke access
 * for students and faculty members in course channels.
 */

import React, { useState } from 'react';
import { CHANNEL_ROLES } from '../../../models/channelAccessModel.js';

function getAvatarColor(id = '') {
  const palette = ['#1A9882', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#10B981'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % palette.length;
  return palette[Math.abs(h)];
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
}

export default function ChannelAccessModal({
  isOpen,
  onClose,
  channel,
  controller,
}) {
  const [activeTab, setActiveTab] = useState('CURRENT'); // 'CURRENT' | 'ADD'

  if (!isOpen || !channel) return null;

  const {
    filteredMembers,
    candidateUsersToAdd,
    totalCount,
    facultyCount,
    studentCount,
    loading,
    actionLoading,
    error,
    successMsg,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    addSearchQuery,
    setAddSearchQuery,
    addRoleFilter,
    setAddRoleFilter,
    handleAddMember,
    handleRemoveMember,
  } = controller;

  return (
    <div
      className="cc-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="cc-modal-container"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '85vh',
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 12,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e6edf3',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0d1117',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚙️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f0f6fc' }}>
                  Manage Channel Access
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(26, 152, 130, 0.2)',
                    color: '#1A9882',
                    border: '1px solid rgba(26, 152, 130, 0.4)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {channel.courseCode || channel.name}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8b949e' }}>
                Add or revoke student and faculty access for this channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b949e',
              fontSize: 18,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              lineHeight: 1,
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(26, 152, 130, 0.15)',
              border: '1px solid rgba(26, 152, 130, 0.3)',
              color: '#34d399',
              fontSize: 13,
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            padding: '12px 20px 0',
            borderBottom: '1px solid #30363d',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('CURRENT')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'CURRENT' ? '#1A9882' : '#8b949e',
              borderBottom: activeTab === 'CURRENT' ? '2px solid #1A9882' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>👥 Current Members</span>
            <span
              style={{
                backgroundColor: activeTab === 'CURRENT' ? 'rgba(26, 152, 130, 0.25)' : 'rgba(139, 148, 158, 0.2)',
                padding: '1px 6px',
                borderRadius: 10,
                fontSize: 11,
              }}
            >
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ADD')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'ADD' ? '#1A9882' : '#8b949e',
              borderBottom: activeTab === 'ADD' ? '2px solid #1A9882' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>➕ Grant New Access</span>
            <span
              style={{
                backgroundColor: activeTab === 'ADD' ? 'rgba(26, 152, 130, 0.25)' : 'rgba(139, 148, 158, 0.2)',
                padding: '1px 6px',
                borderRadius: 10,
                fontSize: 11,
              }}
            >
              {candidateUsersToAdd.length}
            </span>
          </button>
        </div>

        {/* Tab 1 Content: Current Members */}
        {activeTab === 'CURRENT' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ID…"
                style={{
                  flex: 1,
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  padding: '7px 12px',
                  color: '#e6edf3',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { label: 'All', val: CHANNEL_ROLES.ALL, count: totalCount },
                  { label: 'Faculty', val: CHANNEL_ROLES.FACULTY, count: facultyCount },
                  { label: 'Students', val: CHANNEL_ROLES.STUDENT, count: studentCount },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setRoleFilter(t.val)}
                    style={{
                      background: roleFilter === t.val ? 'rgba(26, 152, 130, 0.25)' : '#0d1117',
                      color: roleFilter === t.val ? '#1A9882' : '#8b949e',
                      border: `1px solid ${roleFilter === t.val ? '#1A9882' : '#30363d'}`,
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Members List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxHeight: '44vh',
                paddingRight: 4,
              }}
            >
              {loading && filteredMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#8b949e', fontSize: 13 }}>
                  Loading channel members…
                </div>
              ) : filteredMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#8b949e', fontSize: 13 }}>
                  No members found matching your search.
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isBusy = actionLoading === `remove_${member.id}`;
                  const isFaculty = member.role === 'FACULTY';

                  return (
                    <div
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#0d1117',
                        border: '1px solid #21262d',
                        borderRadius: 8,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: getAvatarColor(member.id),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {initials(member.displayName)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#f0f6fc',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {member.displayName}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: 4,
                                backgroundColor: isFaculty ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: isFaculty ? '#60a5fa' : '#34d399',
                                border: `1px solid ${isFaculty ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                flexShrink: 0,
                              }}
                            >
                              {member.role}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#8b949e',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {member.email || member.username || member.id}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id, member.displayName)}
                        disabled={isBusy}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 6,
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: isBusy ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                        title="Revoke channel access"
                      >
                        {isBusy ? 'Removing…' : '✕ Remove'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2 Content: Add Member */}
        {activeTab === 'ADD' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                type="text"
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                placeholder="Search students or faculty to add…"
                style={{
                  flex: 1,
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  padding: '7px 12px',
                  color: '#e6edf3',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { label: 'All', val: CHANNEL_ROLES.ALL },
                  { label: 'Faculty', val: CHANNEL_ROLES.FACULTY },
                  { label: 'Students', val: CHANNEL_ROLES.STUDENT },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setAddRoleFilter(t.val)}
                    style={{
                      background: addRoleFilter === t.val ? 'rgba(26, 152, 130, 0.25)' : '#0d1117',
                      color: addRoleFilter === t.val ? '#1A9882' : '#8b949e',
                      border: `1px solid ${addRoleFilter === t.val ? '#1A9882' : '#30363d'}`,
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxHeight: '44vh',
                paddingRight: 4,
              }}
            >
              {candidateUsersToAdd.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#8b949e', fontSize: 13 }}>
                  No available users found matching criteria.
                </div>
              ) : (
                candidateUsersToAdd.map((candidate) => {
                  const isBusy = actionLoading === `add_${candidate.id}`;
                  const isFaculty = candidate.role === 'FACULTY';

                  return (
                    <div
                      key={candidate.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#0d1117',
                        border: '1px solid #21262d',
                        borderRadius: 8,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: getAvatarColor(candidate.id),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {initials(candidate.displayName)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#f0f6fc',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {candidate.displayName}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: 4,
                                backgroundColor: isFaculty ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: isFaculty ? '#60a5fa' : '#34d399',
                                border: `1px solid ${isFaculty ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                flexShrink: 0,
                              }}
                            >
                              {candidate.role}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#8b949e',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {candidate.email || candidate.username || candidate.id}
                          </div>
                        </div>
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddMember(candidate)}
                        disabled={isBusy}
                        style={{
                          backgroundColor: '#1A9882',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: isBusy ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                        title="Grant channel access"
                      >
                        {isBusy ? 'Adding…' : '+ Grant Access'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0d1117',
          }}
        >
          <span style={{ fontSize: 11, color: '#8b949e' }}>
            🔒 Access changes are saved to the database and synced immediately.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#21262d',
              color: '#e6edf3',
              border: '1px solid #30363d',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
