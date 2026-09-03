/**
 * channelAccessController.js – Controller hook for Course Channel Access Management.
 *
 * MVC Role: Controller
 *
 * Manages channel member state, user directory queries, grant/revoke operations,
 * and real-time cross-tab synchronization. No JSX.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { normalizeChannelMember, filterMembers, CHANNEL_ROLES } from '../models/channelAccessModel.js';
import apiClient from '../services/apiClient.js';
import { channelService } from '../services/channelService.js';

export function useChannelAccessController(channel, currentUser) {
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [members,       setMembers]       = useState([]);
  const [allUsers,      setAllUsers]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error,         setError]         = useState(null);
  const [successMsg,    setSuccessMsg]    = useState(null);

  const [searchQuery,    setSearchQuery]    = useState('');
  const [roleFilter,     setRoleFilter]     = useState(CHANNEL_ROLES.ALL);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [addRoleFilter,  setAddRoleFilter]  = useState(CHANNEL_ROLES.ALL);

  const channelId = channel?.id;
  const courseCode = channel?.courseCode || (channelId?.startsWith('ch_') ? channelId.substring(3).toUpperCase() : '');

  // Fetch current members of this channel
  const loadMembers = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/channels/${encodeURIComponent(channelId)}/members?courseCode=${encodeURIComponent(courseCode)}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data.map(normalizeChannelMember) : [];
        setMembers(list);
        channelService.setMembers(channelId, list);
      } else {
        // Fallback to local channelService members
        const local = channelService.getMembers(channelId);
        setMembers(local.map(normalizeChannelMember));
      }
    } catch (err) {
      console.warn('[channelAccessController] Failed to fetch members, using cache:', err);
      const local = channelService.getMembers(channelId);
      setMembers(local.map(normalizeChannelMember));
    } finally {
      setLoading(false);
    }
  }, [channelId, courseCode]);

  // Fetch all system users for the "Add Member" picker
  const loadAllUsers = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/users');
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users)) {
          setAllUsers(users.map(normalizeChannelMember));
        }
      }
    } catch (err) {
      console.warn('[channelAccessController] Failed to load directory users:', err);
    }
  }, []);

  useEffect(() => {
    if (channelId) {
      loadMembers();
    }
  }, [channelId, loadMembers]);

  useEffect(() => {
    if (isModalOpen) {
      loadMembers();
      loadAllUsers();
    }
  }, [isModalOpen, loadMembers, loadAllUsers]);

  // Listen to real-time channel access updates
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('campusconnect_channel_access');
      bc.onmessage = (event) => {
        if (event.data?.channelId === channelId) {
          loadMembers();
        }
      };
    } catch (ignored) {}

    return () => {
      try {
        bc?.close();
      } catch (ignored) {}
    };
  }, [channelId, loadMembers]);

  // Grant access (Add Member)
  const handleAddMember = useCallback(async (userToGrant) => {
    if (!channelId || !userToGrant?.id) return;
    const uid = userToGrant.id;
    setActionLoading(`add_${uid}`);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post(`/api/channels/${encodeURIComponent(channelId)}/members`, {
        userId: uid,
        courseCode,
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Granted access to ${userToGrant.displayName || uid}`);
        channelService.addMemberToChannel(channelId, userToGrant);

        // Broadcast across open tabs
        try {
          const bc = new BroadcastChannel('campusconnect_channel_access');
          bc.postMessage({ event: 'CHANNEL_ACCESS_CHANGED', action: 'ADD', channelId, userId: uid, member: userToGrant });
          bc.close();
        } catch (ignored) {}

        await loadMembers();
      } else {
        setError(data.message || 'Failed to grant access');
      }
    } catch (err) {
      setError(err.message || 'Network error while adding member');
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  }, [channelId, courseCode, loadMembers]);

  // Revoke access (Remove Member)
  const handleRemoveMember = useCallback(async (userIdToRemove, memberName) => {
    if (!channelId || !userIdToRemove) return;
    setActionLoading(`remove_${userIdToRemove}`);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.delete(`/api/channels/${encodeURIComponent(channelId)}/members/${encodeURIComponent(userIdToRemove)}`);
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Removed ${memberName || userIdToRemove} from channel`);
        channelService.removeMemberFromChannel(channelId, userIdToRemove);

        // Broadcast across open tabs
        try {
          const bc = new BroadcastChannel('campusconnect_channel_access');
          bc.postMessage({ event: 'CHANNEL_ACCESS_CHANGED', action: 'REMOVE', channelId, userId: userIdToRemove });
          bc.close();
        } catch (ignored) {}

        await loadMembers();
      } else {
        setError(data.message || 'Failed to remove member');
      }
    } catch (err) {
      setError(err.message || 'Network error while removing member');
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  }, [channelId, loadMembers]);

  // Filtered members currently in the channel
  const filteredMembers = useMemo(() => {
    return filterMembers(members, searchQuery, roleFilter);
  }, [members, searchQuery, roleFilter]);

  // Available users to add (directory users who are not yet active members)
  const candidateUsersToAdd = useMemo(() => {
    const existingIds = new Set(members.map((m) => m.id));
    const nonMembers = allUsers.filter((u) => !existingIds.has(u.id));
    return filterMembers(nonMembers, addSearchQuery, addRoleFilter);
  }, [allUsers, members, addSearchQuery, addRoleFilter]);

  const facultyCount = useMemo(() => members.filter((m) => m.role === 'FACULTY').length, [members]);
  const studentCount = useMemo(() => members.filter((m) => m.role === 'STUDENT').length, [members]);

  return {
    isModalOpen,
    openModal:  () => setIsModalOpen(true),
    closeModal: () => {
      setIsModalOpen(false);
      setError(null);
      setSuccessMsg(null);
    },
    members,
    filteredMembers,
    candidateUsersToAdd,
    totalCount: members.length,
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
    refreshMembers: loadMembers,
  };
}
