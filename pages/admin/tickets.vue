<template>
  <div class="tickets-page">
    <div class="page-header">
      <h1>Support Tickets</h1>
      <p>Manage customer support requests</p>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        <span class="stat-value">{{ allTickets.length }}</span>
        <span class="stat-label">All</span>
      </div>
      <div class="stat-item open" :class="{ active: activeTab === 'open' }" @click="activeTab = 'open'">
        <span class="stat-value">{{ openTickets.length }}</span>
        <span class="stat-label">Open</span>
      </div>
      <div class="stat-item progress" :class="{ active: activeTab === 'in_progress' }" @click="activeTab = 'in_progress'">
        <span class="stat-value">{{ inProgressTickets.length }}</span>
        <span class="stat-label">In Progress</span>
      </div>
      <div class="stat-item resolved" :class="{ active: activeTab === 'resolved' }" @click="activeTab = 'resolved'">
        <span class="stat-value">{{ resolvedTickets.length }}</span>
        <span class="stat-label">Resolved</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <ion-spinner></ion-spinner>
      <p>Loading tickets...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTickets.length === 0" class="empty-state">
      <ion-icon :icon="ticketOutline"></ion-icon>
      <h3>No Tickets Found</h3>
      <p>{{ activeTab === 'all' ? 'There are no support tickets yet' : `No ${activeTab.replace('_', ' ')} tickets` }}</p>
    </div>

    <!-- Tickets List - New Design -->
    <div v-else class="tickets-list">
      <div
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        class="ticket-card-new"
        :class="ticket.status"
      >
        <div class="ticket-card-content" @click="openTicketDetails(ticket)">
          <div class="ticket-card-top">
            <div class="ticket-info-left">
              <span class="ticket-status-badge" :class="ticket.status">{{ formatStatus(ticket.status) }}</span>
              <span class="ticket-category-tag" :class="ticket.category">{{ ticket.category }}</span>
              <span class="ticket-priority-dot" :class="ticket.priority"></span>
            </div>
            <span class="ticket-time">{{ formatRelativeTime(ticket.createdAt) }}</span>
          </div>

          <h3 class="ticket-title">{{ ticket.subject }}</h3>

          <div class="ticket-user-info">
            <ion-icon :icon="personCircleOutline"></ion-icon>
            <span>{{ ticket.userName }}</span>
            <span class="ticket-id">#{{ ticket.id?.slice(-6).toUpperCase() }}</span>
          </div>
        </div>

        <div class="ticket-card-actions">
          <button class="chat-btn" @click.stop="openChatModal(ticket)" :class="{ 'has-messages': getUnreadCount(ticket) > 0 }">
            <ion-icon :icon="chatbubblesOutline"></ion-icon>
            <span v-if="getUnreadCount(ticket) > 0" class="message-count">{{ getUnreadCount(ticket) }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Ticket Details Modal -->
    <ion-modal :is-open="showModal" @didDismiss="closeModal">
      <div class="modal-content" v-if="selectedTicket">
        <div class="modal-header">
          <div class="modal-title">
            <h2>Ticket #{{ selectedTicket.id?.slice(-6).toUpperCase() }}</h2>
            <span class="ticket-status-badge" :class="selectedTicket.status">{{ formatStatus(selectedTicket.status) }}</span>
          </div>
          <button class="close-btn" @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <div class="modal-body">
          <!-- Ticket Info -->
          <div class="ticket-info-section">
            <div class="info-row">
              <span class="info-label">Subject</span>
              <span class="info-value">{{ selectedTicket.subject }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category</span>
              <span class="ticket-category-tag" :class="selectedTicket.category">{{ selectedTicket.category }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Priority</span>
              <span class="priority-badge" :class="selectedTicket.priority">{{ selectedTicket.priority }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">User</span>
              <span class="info-value">{{ selectedTicket.userName }} ({{ selectedTicket.userEmail }})</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created</span>
              <span class="info-value">{{ formatDate(selectedTicket.createdAt) }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="description-section">
            <h4>Description</h4>
            <p>{{ selectedTicket.description }}</p>
          </div>

          <!-- Status Actions -->
          <div class="status-actions">
            <h4>Update Status</h4>
            <div class="status-buttons">
              <button
                v-if="selectedTicket.status === 'open'"
                class="status-btn progress"
                @click="updateStatus('in_progress')"
              >
                <ion-icon :icon="playOutline"></ion-icon>
                Start Working
              </button>
              <button
                v-if="selectedTicket.status === 'in_progress'"
                class="status-btn resolved"
                @click="updateStatus('resolved')"
              >
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                Mark Resolved
              </button>
              <button
                v-if="selectedTicket.status === 'resolved'"
                class="status-btn closed"
                @click="updateStatus('closed')"
              >
                <ion-icon :icon="lockClosedOutline"></ion-icon>
                Close Ticket
              </button>
              <button
                v-if="selectedTicket.status !== 'open' && selectedTicket.status !== 'closed'"
                class="status-btn reopen"
                @click="updateStatus('open')"
              >
                <ion-icon :icon="refreshOutline"></ion-icon>
                Reopen
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-modal>

    <!-- WhatsApp-style Chat Modal -->
    <ion-modal :is-open="showChatModal" @didDismiss="closeChatModal" class="chat-modal">
      <div class="chat-container" v-if="chatTicket">
        <!-- Chat Header -->
        <div class="chat-header">
          <button class="back-btn" @click="closeChatModal">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </button>
          <div class="chat-header-info">
            <div class="chat-avatar">
              <ion-icon :icon="personCircleOutline"></ion-icon>
            </div>
            <div class="chat-header-text">
              <h3>{{ chatTicket.userName }}</h3>
              <span class="chat-email">{{ chatTicket.userEmail }}</span>
            </div>
          </div>
          <div class="chat-header-actions">
            <span class="ticket-id-badge">#{{ chatTicket.id?.slice(-6).toUpperCase() }}</span>
          </div>
        </div>

        <!-- Chat Subject Banner -->
        <div class="chat-subject-banner">
          <div class="subject-icon">
            <ion-icon :icon="documentTextOutline"></ion-icon>
          </div>
          <div class="subject-text">
            <span class="subject-label">{{ chatTicket.category }} - {{ chatTicket.priority }} priority</span>
            <span class="subject-value">{{ chatTicket.subject }}</span>
          </div>
          <span class="chat-status-badge" :class="chatTicket.status">{{ formatStatus(chatTicket.status) }}</span>
        </div>

        <!-- Chat Messages Area -->
        <div class="chat-messages" ref="chatMessagesRef">
          <!-- Initial Message (Description) -->
          <div class="chat-date-divider">
            <span>{{ formatDate(chatTicket.createdAt) }}</span>
          </div>

          <div class="chat-bubble user">
            <div class="bubble-content">
              <p>{{ chatTicket.description }}</p>
              <span class="bubble-time">{{ formatTime(chatTicket.createdAt) }}</span>
            </div>
            <div class="bubble-tail"></div>
          </div>

          <!-- Conversation Messages -->
          <template v-for="(msg, index) in chatTicket.messages" :key="index">
            <div v-if="shouldShowDateDivider(chatTicket.messages, index)" class="chat-date-divider">
              <span>{{ formatMessageDate(msg.timestamp) }}</span>
            </div>

            <div class="chat-bubble" :class="msg.isAdmin ? 'admin' : 'user'">
              <div class="bubble-content">
                <span v-if="msg.isAdmin" class="admin-label">You (Admin)</span>
                <p>{{ msg.message }}</p>
                <span class="bubble-time">
                  {{ formatTime(msg.timestamp) }}
                  <ion-icon v-if="msg.isAdmin" :icon="checkmarkDoneOutline" class="read-icon"></ion-icon>
                </span>
              </div>
              <div class="bubble-tail"></div>
            </div>
          </template>

          <!-- Typing Indicator (when sending) -->
          <div v-if="isSending" class="chat-bubble admin typing">
            <div class="bubble-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input Area -->
        <div class="chat-input-area" v-if="chatTicket.status !== 'closed'">
          <div class="chat-input-wrapper">
            <textarea
              v-model="replyMessage"
              placeholder="Type a message..."
              rows="1"
              @keydown.enter.exact.prevent="sendChatReply"
              @input="autoResizeTextarea"
              ref="chatInputRef"
            ></textarea>
          </div>
          <button class="send-message-btn" @click="sendChatReply" :disabled="!replyMessage.trim() || isSending">
            <ion-icon :icon="sendOutline"></ion-icon>
          </button>
        </div>

        <!-- Closed Ticket Banner -->
        <div v-else class="chat-closed-banner">
          <ion-icon :icon="lockClosedOutline"></ion-icon>
          <span>This ticket has been closed</span>
        </div>
      </div>
    </ion-modal>

    <AppLoader :show="isSaving" message="Saving..." />
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonModal, IonSpinner } from '@ionic/vue';
import {
  ticketOutline,
  personCircleOutline,
  chatbubblesOutline,
  closeOutline,
  sendOutline,
  playOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
  refreshOutline,
  arrowBackOutline,
  documentTextOutline,
  checkmarkDoneOutline,
} from 'ionicons/icons';
import type { SupportTicket } from '~/stores/support';
import type { Timestamp } from 'firebase/firestore';

definePageMeta({
  middleware: ['admin'],
});

const supportStore = useSupportStore();
const userStore = useUserStore();
const { showToast } = useToast();

const isLoading = ref(true);
const isSaving = ref(false);
const isSending = ref(false);
const activeTab = ref('all');
const showModal = ref(false);
const selectedTicket = ref<SupportTicket | null>(null);
const replyMessage = ref('');

// Chat modal state
const showChatModal = ref(false);
const chatTicket = ref<SupportTicket | null>(null);
const chatMessagesRef = ref<HTMLElement | null>(null);
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

// Computed getters from store
const allTickets = computed(() => supportStore.allTickets);
const openTickets = computed(() => supportStore.openTickets);
const inProgressTickets = computed(() => supportStore.inProgressTickets);
const resolvedTickets = computed(() => supportStore.resolvedTickets);

const filteredTickets = computed(() => {
  switch (activeTab.value) {
    case 'open':
      return openTickets.value;
    case 'in_progress':
      return inProgressTickets.value;
    case 'resolved':
      return resolvedTickets.value;
    default:
      return allTickets.value;
  }
});

onMounted(async () => {
  try {
    await supportStore.fetchAllTickets(true);
  } catch (error) {
    console.error('Error loading tickets:', error);
    showToast('Failed to load tickets', 'error');
  } finally {
    isLoading.value = false;
  }
});

const formatStatus = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'open':
      return 'Open';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};

const formatDate = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatRelativeTime = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatMessageDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const shouldShowDateDivider = (messages: any[], index: number) => {
  if (index === 0) return true;
  const currentDate = messages[index].timestamp?.toDate?.() || new Date(messages[index].timestamp);
  const prevDate = messages[index - 1].timestamp?.toDate?.() || new Date(messages[index - 1].timestamp);
  return currentDate.toDateString() !== prevDate.toDateString();
};

const openTicketDetails = (ticket: SupportTicket) => {
  selectedTicket.value = ticket;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedTicket.value = null;
};

const getUnreadCount = (ticket: SupportTicket) => {
  return supportStore.getUnreadCount(ticket, true); // true = isAdmin
};

const openChatModal = async (ticket: SupportTicket) => {
  chatTicket.value = ticket;
  replyMessage.value = '';
  showChatModal.value = true;

  // Mark as read when admin opens the chat
  await supportStore.markAsRead(ticket.id!, true);

  nextTick(() => {
    scrollToBottom();
  });
};

const closeChatModal = () => {
  showChatModal.value = false;
  chatTicket.value = null;
  replyMessage.value = '';
};

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

const autoResizeTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
};

const sendChatReply = async () => {
  if (!chatTicket.value || !replyMessage.value.trim()) return;

  isSending.value = true;
  const result = await supportStore.addMessage(chatTicket.value.id!, {
    senderId: userStore.user?.uid || '',
    senderName: userStore.userName || 'Admin',
    message: replyMessage.value.trim(),
    isAdmin: true,
  });

  isSending.value = false;

  if (result.success) {
    replyMessage.value = '';
    if (chatInputRef.value) {
      chatInputRef.value.style.height = 'auto';
    }
    // Refresh tickets
    await supportStore.fetchAllTickets(true);
    chatTicket.value = supportStore.getTicketById(chatTicket.value.id!) || null;
    nextTick(() => {
      scrollToBottom();
    });
  } else {
    showToast(result.error || 'Failed to send reply', 'error');
  }
};

const updateStatus = async (status: SupportTicket['status']) => {
  if (!selectedTicket.value) return;

  isSaving.value = true;
  const result = await supportStore.updateTicketStatus(selectedTicket.value.id!, status);
  isSaving.value = false;

  if (result.success) {
    showToast(`Ticket ${formatStatus(status).toLowerCase()}!`, 'success');
    await supportStore.fetchAllTickets(true);
    selectedTicket.value = supportStore.getTicketById(selectedTicket.value.id!) || null;
  } else {
    showToast(result.error || 'Failed to update status', 'error');
  }
};
</script>

<style scoped>
.tickets-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0 0 4px 0;
}

.page-header p {
  color: var(--color-text-secondary, #666);
  font-size: 0.9rem;
  margin: 0;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.stat-item {
  flex: 1;
  min-width: 100px;
  background: var(--color-surface, white);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.active {
  border-color: var(--color-primary, #667eea);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.stat-item.open.active { border-color: #eb445a; }
.stat-item.progress.active { border-color: #ffc409; }
.stat-item.resolved.active { border-color: #2dd36f; }

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state ion-icon {
  font-size: 64px;
  color: var(--color-text-muted, #ccc);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary, #333);
}

.empty-state p {
  margin: 0;
  color: var(--color-text-secondary, #666);
}

/* New Ticket Card Design */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-card-new {
  display: flex;
  align-items: stretch;
  background: var(--color-surface, white);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-border, #ddd);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ticket-card-new:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.ticket-card-new.open { border-left-color: #eb445a; }
.ticket-card-new.in_progress { border-left-color: #ffc409; }
.ticket-card-new.resolved, .ticket-card-new.closed { border-left-color: #2dd36f; }

.ticket-card-content {
  flex: 1;
  padding: 16px;
  cursor: pointer;
}

.ticket-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ticket-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ticket-status-badge.open { background: rgba(235, 68, 90, 0.15); color: #eb445a; }
.ticket-status-badge.in_progress { background: rgba(255, 196, 9, 0.2); color: #d4a000; }
.ticket-status-badge.resolved, .ticket-status-badge.closed { background: rgba(45, 211, 111, 0.15); color: #2dd36f; }

.ticket-category-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
  text-transform: capitalize;
}

.ticket-category-tag.bug { background: rgba(235, 68, 90, 0.1); color: #eb445a; }
.ticket-category-tag.feature { background: rgba(45, 211, 111, 0.1); color: #2dd36f; }
.ticket-category-tag.billing { background: rgba(255, 196, 9, 0.1); color: #e6b000; }
.ticket-category-tag.other { background: rgba(102, 126, 234, 0.1); color: #667eea; }

.ticket-priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.ticket-priority-dot.low { background: #2dd36f; }
.ticket-priority-dot.medium { background: #ffc409; }
.ticket-priority-dot.high { background: #eb445a; }

.ticket-time {
  font-size: 0.75rem;
  color: var(--color-text-muted, #999);
}

.ticket-title {
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.ticket-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.ticket-user-info ion-icon {
  font-size: 16px;
  color: #667eea;
}

.ticket-id {
  margin-left: auto;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--color-text-muted, #aaa);
}

.ticket-card-actions {
  display: flex;
  align-items: center;
  padding: 12px;
  border-left: 1px solid var(--color-border-light, #eee);
}

.chat-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border: none;
  background: var(--color-surface-secondary, #f5f5f5);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #999);
  transition: all 0.3s ease;
}

.chat-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
}

.chat-btn.has-messages { color: #667eea; }
.chat-btn ion-icon { font-size: 22px; }

.message-count {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  background: #eb445a;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Modal Styles */
.modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-background, #f8f9fa);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--color-surface, white);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary, #333);
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-surface-secondary, #f0f0f0);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn ion-icon {
  font-size: 20px;
  color: var(--color-text-secondary, #666);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.ticket-info-section,
.description-section,
.status-actions {
  background: var(--color-surface, white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
}

.info-row:last-child { border-bottom: none; }

.info-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary, #333);
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.priority-badge.low { background: rgba(45, 211, 111, 0.15); color: #2dd36f; }
.priority-badge.medium { background: rgba(255, 196, 9, 0.15); color: #e6b000; }
.priority-badge.high { background: rgba(235, 68, 90, 0.15); color: #eb445a; }

.description-section h4,
.status-actions h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.description-section p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #555);
  line-height: 1.6;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.status-btn {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-btn.progress { background: rgba(255, 196, 9, 0.15); color: #e6b000; }
.status-btn.resolved { background: rgba(45, 211, 111, 0.15); color: #2dd36f; }
.status-btn.closed { background: var(--color-surface-secondary, #f0f0f0); color: var(--color-text-secondary, #666); }
.status-btn.reopen { background: rgba(102, 126, 234, 0.15); color: #667eea; }

@media (max-width: 600px) {
  .stats-bar { gap: 8px; }
  .stat-item { min-width: 80px; padding: 12px 8px; }
  .status-buttons { flex-direction: column; }
  .status-btn { min-width: 100%; }
}
</style>

<style>
/* WhatsApp-style Chat Modal */
.chat-modal {
  --width: 100%;
  --height: 100%;
  --border-radius: 0;
}

.chat-modal::part(content) {
  margin: 0;
}

@media (min-width: 768px) {
  .chat-modal {
    --width: 450px;
    --height: 90vh;
    --max-height: 700px;
    --border-radius: 20px;
  }

  .chat-modal::part(content) {
    margin: auto;
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ccc' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn ion-icon { font-size: 22px; }

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-avatar ion-icon { font-size: 22px; }

.chat-header-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chat-email {
  font-size: 0.75rem;
  opacity: 0.8;
}

.ticket-id-badge {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.chat-subject-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e0e0e0;
}

.subject-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subject-icon ion-icon { font-size: 18px; color: #667eea; }

.subject-text {
  flex: 1;
  min-width: 0;
}

.subject-label {
  display: block;
  font-size: 0.7rem;
  color: #888;
  text-transform: capitalize;
}

.subject-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.chat-status-badge.open { background: rgba(235, 68, 90, 0.15); color: #eb445a; }
.chat-status-badge.in_progress { background: rgba(255, 196, 9, 0.2); color: #d4a000; }
.chat-status-badge.resolved, .chat-status-badge.closed { background: rgba(45, 211, 111, 0.15); color: #2dd36f; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-date-divider {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.chat-date-divider span {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #666;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-bubble {
  display: flex;
  max-width: 85%;
  position: relative;
}

.chat-bubble.user {
  align-self: flex-start;
}

.chat-bubble.admin {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.bubble-content {
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chat-bubble.user .bubble-content {
  background: white;
  border-top-left-radius: 4px;
}

.chat-bubble.admin .bubble-content {
  background: #dcf8c6;
  border-top-right-radius: 4px;
}

.admin-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
}

.bubble-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
}

.bubble-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 0.65rem;
  color: #888;
  margin-top: 4px;
}

.read-icon { font-size: 14px; color: #34B7F1; }

.bubble-tail {
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0;
}

.chat-bubble.user .bubble-tail {
  left: -6px;
  background: white;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

.chat-bubble.admin .bubble-tail {
  right: -6px;
  background: #dcf8c6;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

/* Typing Indicator */
.chat-bubble.typing .bubble-content { padding: 12px 18px; }

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  background: #f0f0f0;
}

.chat-input-wrapper {
  flex: 1;
  background: white;
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-input-wrapper textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.95rem;
  resize: none;
  max-height: 120px;
  line-height: 1.4;
  background: transparent;
  color: #333;
}

.send-message-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-message-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-message-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-message-btn ion-icon { font-size: 22px; }

.chat-closed-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f5f5f5;
  color: #888;
  font-size: 0.9rem;
}

.chat-closed-banner ion-icon { font-size: 18px; }
</style>
