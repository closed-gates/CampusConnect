import { getDeterministicRoomId } from '../utils/dmUtils.js';

class DirectMessagingService {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _emit(event, payload) {
    this.listeners.forEach((listener) => listener({ event, payload }));
  }

  async sendDirectMessage({ senderId, recipientId, content, attachments = [], conversationId, recipientPresence = 'ONLINE' }) {
    const resolvedRoomId = conversationId || getDeterministicRoomId(senderId, recipientId);

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: resolvedRoomId,
      senderId,
      content,
      attachments: attachments.map(att => ({
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url || URL.createObjectURL(att.file || new Blob())
      })),
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pubSubChannel = `user_events:${recipientId}`;

    this._emit('MESSAGE_RECEIVED', {
      message: newMessage,
      conversationId: resolvedRoomId,
      channel: pubSubChannel
    });

    if (recipientPresence === 'OFFLINE') {
      this._triggerOfflineNotification({
        recipientId,
        senderId,
        content: content || `[Sent ${newMessage.attachments.length} File Attachment(s)]`,
        conversationId: resolvedRoomId
      });
    }

    return newMessage;
  }

  _triggerOfflineNotification({ recipientId, senderId, content, conversationId }) {
    this._emit('OFFLINE_NOTIFICATION_DISPATCHED', {
      recipientId,
      senderId,
      snippet: content.substring(0, 50),
      conversationId,
      timestamp: new Date().toISOString()
    });
  }

  sendTypingIndicator(senderId, recipientId, isTyping) {
    const roomId = getDeterministicRoomId(senderId, recipientId);
    this._emit('TYPING_STATUS_CHANGED', {
      senderId,
      recipientId,
      conversationId: roomId,
      isTyping
    });
  }
}

export const dmService = new DirectMessagingService();
