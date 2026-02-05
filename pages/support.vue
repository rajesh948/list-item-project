<template>
  <div class="support-page">
    <div class="page-header">
      <h1>Help & Support</h1>
      <p>Get help with your account or report issues</p>
    </div>

    <div class="support-content">
      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-btn primary" @click="openNewTicket">
          <ion-icon :icon="addCircleOutline"></ion-icon>
          New Ticket
        </button>
        <button class="action-btn" @click="goToFAQ">
          <ion-icon :icon="helpCircleOutline"></ion-icon>
          FAQ
        </button>
        <a href="mailto:support@caterhub.app" class="action-btn">
          <ion-icon :icon="mailOutline"></ion-icon>
          Email Us
        </a>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section" id="faq">
        <h2 class="section-title">
          <ion-icon :icon="helpCircleOutline"></ion-icon>
          Frequently Asked Questions
        </h2>

        <div class="faq-list">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-item"
            :class="{ expanded: expandedFaq === index }"
          >
            <button class="faq-question" @click="toggleFaq(index)">
              <span>{{ faq.question }}</span>
              <ion-icon :icon="expandedFaq === index ? chevronUpOutline : chevronDownOutline"></ion-icon>
            </button>
            <div v-if="expandedFaq === index" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Tickets Section -->
      <div class="tickets-section">
        <div class="section-header">
          <h2 class="section-title">
            <ion-icon :icon="chatbubblesOutline"></ion-icon>
            My Tickets
          </h2>
          <button class="refresh-btn" @click="refreshTickets" :disabled="isLoading">
            <ion-icon :icon="refreshOutline" :class="{ spinning: isLoading }"></ion-icon>
          </button>
        </div>

        <div v-if="isLoading && userTickets.length === 0" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading tickets...</p>
        </div>

        <div v-else-if="userTickets.length === 0" class="empty-state">
          <ion-icon :icon="chatbubbleEllipsesOutline"></ion-icon>
          <p>No tickets yet</p>
          <span>Create a ticket if you need help</span>
        </div>

        <div v-else class="tickets-list">
          <div
            v-for="ticket in userTickets"
            :key="ticket.id"
            class="ticket-card-new"
            :class="ticket.status"
          >
            <div class="ticket-card-content" @click="viewTicket(ticket)">
              <div class="ticket-card-top">
                <div class="ticket-info-left">
                  <span class="ticket-status-badge" :class="ticket.status">{{ formatStatus(ticket.status) }}</span>
                  <span class="ticket-category-tag">{{ ticket.category }}</span>
                  <span class="ticket-priority-dot" :class="ticket.priority"></span>
                </div>
                <span class="ticket-time">{{ formatRelativeTime(ticket.createdAt) }}</span>
              </div>

              <h3 class="ticket-title">{{ ticket.subject }}</h3>
            </div>

            <div class="ticket-card-actions">
              <button class="chat-btn" @click.stop="openChatModal(ticket)" :class="{ 'has-messages': getUnreadCount(ticket) > 0 }">
                <ion-icon :icon="chatbubblesOutline"></ion-icon>
                <span v-if="getUnreadCount(ticket) > 0" class="message-count">{{ getUnreadCount(ticket) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Ticket Modal -->
    <ion-modal :is-open="showTicketModal" @didDismiss="closeTicketModal" class="ticket-modal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ viewingTicket ? 'Ticket Details' : 'Create New Ticket' }}</h2>
          <button class="close-btn" @click="closeTicketModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <!-- View Ticket -->
        <div v-if="viewingTicket" class="modal-body view-ticket">
          <div class="ticket-info">
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="status-badge" :class="viewingTicket.status">{{ formatStatus(viewingTicket.status) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category</span>
              <span>{{ viewingTicket.category }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created</span>
              <span>{{ formatDate(viewingTicket.createdAt) }}</span>
            </div>
          </div>

          <div class="ticket-subject-section">
            <h3>{{ viewingTicket.subject }}</h3>
            <p>{{ viewingTicket.description }}</p>
          </div>

          <!-- Messages -->
          <div v-if="viewingTicket.messages.length > 0" class="messages-section">
            <h4>Conversation</h4>
            <div class="messages-list">
              <div
                v-for="(msg, index) in viewingTicket.messages"
                :key="index"
                class="message"
                :class="{ admin: msg.isAdmin }"
              >
                <div class="message-header">
                  <span class="sender-name">{{ msg.isAdmin ? 'Support Team' : msg.senderName }}</span>
                  <span class="message-time">{{ formatMessageTime(msg.timestamp) }}</span>
                </div>
                <p class="message-text">{{ msg.message }}</p>
              </div>
            </div>
          </div>

          <!-- Reply Form -->
          <div v-if="viewingTicket.status !== 'closed'" class="reply-form">
            <textarea
              v-model="replyMessage"
              placeholder="Type your reply..."
              rows="3"
            ></textarea>
            <button class="send-btn" @click="sendReply" :disabled="!replyMessage.trim() || isSending">
              <ion-icon :icon="sendOutline"></ion-icon>
              {{ isSending ? 'Sending...' : 'Send Reply' }}
            </button>
          </div>
        </div>

        <!-- Create Ticket Form -->
        <div v-else class="modal-body create-ticket">
          <div class="form-group">
            <label>Category</label>
            <div class="category-options">
              <button
                v-for="cat in categories"
                :key="cat.value"
                class="category-btn"
                :class="{ active: newTicket.category === cat.value }"
                @click="newTicket.category = cat.value"
              >
                <ion-icon :icon="cat.icon"></ion-icon>
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Priority</label>
            <div class="priority-options">
              <button
                v-for="pri in priorities"
                :key="pri.value"
                class="priority-btn"
                :class="[pri.value, { active: newTicket.priority === pri.value }]"
                @click="newTicket.priority = pri.value"
              >
                {{ pri.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Subject</label>
            <input
              v-model="newTicket.subject"
              type="text"
              placeholder="Brief summary of your issue"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="newTicket.description"
              placeholder="Please describe your issue in detail..."
              rows="5"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer" v-if="!viewingTicket">
          <button class="cancel-btn" @click="closeTicketModal">Cancel</button>
          <button class="submit-btn" @click="submitTicket" :disabled="!isFormValid || isSubmitting">
            <ion-icon :icon="sendOutline"></ion-icon>
            {{ isSubmitting ? 'Submitting...' : 'Submit Ticket' }}
          </button>
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
              <ion-icon :icon="headsetOutline"></ion-icon>
            </div>
            <div class="chat-header-text">
              <h3>Support Team</h3>
              <span class="chat-status" :class="chatTicket.status">{{ formatStatus(chatTicket.status) }}</span>
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
            <span class="subject-label">Subject</span>
            <span class="subject-value">{{ chatTicket.subject }}</span>
          </div>
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
                <span v-if="msg.isAdmin" class="admin-label">Support Team</span>
                <p>{{ msg.message }}</p>
                <span class="bubble-time">
                  {{ formatTime(msg.timestamp) }}
                  <ion-icon v-if="!msg.isAdmin" :icon="checkmarkDoneOutline" class="read-icon"></ion-icon>
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
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonModal, IonSpinner } from '@ionic/vue';
import {
  addCircleOutline,
  helpCircleOutline,
  mailOutline,
  chevronUpOutline,
  chevronDownOutline,
  chatbubblesOutline,
  chatbubbleOutline,
  chatbubbleEllipsesOutline,
  refreshOutline,
  closeOutline,
  sendOutline,
  bugOutline,
  bulbOutline,
  cardOutline,
  ellipsisHorizontalOutline,
  arrowBackOutline,
  headsetOutline,
  documentTextOutline,
  checkmarkDoneOutline,
  lockClosedOutline,
} from 'ionicons/icons';

definePageMeta({
  layout: 'default',
});

const userStore = useUserStore();
const supportStore = useSupportStore();
const { showToast } = useToast();

const isLoading = computed(() => supportStore.isLoading);
const userTickets = computed(() => supportStore.userTickets);

const showTicketModal = ref(false);
const viewingTicket = ref<any>(null);
const replyMessage = ref('');
const isSending = ref(false);
const isSubmitting = ref(false);
const expandedFaq = ref<number | null>(null);

// Chat modal state
const showChatModal = ref(false);
const chatTicket = ref<any>(null);
const chatMessagesRef = ref<HTMLElement | null>(null);
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

const newTicket = reactive({
  category: 'other' as 'bug' | 'feature' | 'billing' | 'other',
  priority: 'medium' as 'low' | 'medium' | 'high',
  subject: '',
  description: '',
});

const categories = [
  { value: 'bug', label: 'Bug Report', icon: bugOutline },
  { value: 'feature', label: 'Feature Request', icon: bulbOutline },
  { value: 'billing', label: 'Billing', icon: cardOutline },
  { value: 'other', label: 'Other', icon: ellipsisHorizontalOutline },
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const faqs = [
  {
    question: 'How do I upgrade to Premium?',
    answer: 'Go to the Subscription page from the sidebar, choose your preferred plan (Monthly or Yearly), make the payment, upload the screenshot, and submit your request. Our team will verify and activate your subscription within 24 hours.',
  },
  {
    question: 'How many PDFs can I generate on the Free plan?',
    answer: 'Free plan users can generate a limited number of PDFs per month. The exact limit is set by the admin and can be viewed on the Subscription page. Upgrade to Premium for unlimited PDF generation.',
  },
  {
    question: 'Can I customize my PDF reports?',
    answer: 'Yes! Premium users can customize their PDFs with business logo, custom colors, tagline, and address. Go to Settings > PDF Branding to set up your branding.',
  },
  {
    question: 'How do I share reports with customers?',
    answer: 'After generating a report, you can share it via WhatsApp using the share button, or download it and send it manually via email or other messaging apps.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept UPI, bank transfer, and other digital payment methods. After making the payment, upload a screenshot of your transaction as proof.',
  },
];

const isFormValid = computed(() => {
  return newTicket.subject.trim().length >= 3 && newTicket.description.trim().length >= 10;
});

// Fetch tickets on mount
onMounted(async () => {
  if (userStore.user?.uid) {
    await supportStore.fetchUserTickets(userStore.user.uid);
  }
});

const toggleFaq = (index: number) => {
  expandedFaq.value = expandedFaq.value === index ? null : index;
};

const goToFAQ = () => {
  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
};

const openNewTicket = () => {
  viewingTicket.value = null;
  resetForm();
  showTicketModal.value = true;
};

const viewTicket = (ticket: any) => {
  viewingTicket.value = ticket;
  replyMessage.value = '';
  showTicketModal.value = true;
};

const closeTicketModal = () => {
  showTicketModal.value = false;
  viewingTicket.value = null;
  resetForm();
};

const resetForm = () => {
  newTicket.category = 'other';
  newTicket.priority = 'medium';
  newTicket.subject = '';
  newTicket.description = '';
};

const refreshTickets = async () => {
  if (userStore.user?.uid) {
    await supportStore.fetchUserTickets(userStore.user.uid, true);
  }
};

const submitTicket = async () => {
  if (!userStore.user) return;

  isSubmitting.value = true;
  try {
    const result = await supportStore.createTicket({
      userId: userStore.user.uid,
      userName: userStore.user.username || userStore.user.email || 'User',
      userEmail: userStore.user.email || '',
      subject: newTicket.subject,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open',
    });

    if (result.success) {
      showToast('Ticket submitted successfully!', 'success');
      closeTicketModal();
    } else {
      showToast(result.error || 'Failed to submit ticket', 'error');
    }
  } catch (error) {
    showToast('Failed to submit ticket', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const sendReply = async () => {
  if (!viewingTicket.value || !replyMessage.value.trim() || !userStore.user) return;

  isSending.value = true;
  try {
    const result = await supportStore.addMessage(viewingTicket.value.id, {
      senderId: userStore.user.uid,
      senderName: userStore.user.username || userStore.user.email || 'User',
      message: replyMessage.value.trim(),
      isAdmin: false,
    });

    if (result.success) {
      replyMessage.value = '';
      showToast('Reply sent', 'success');
    } else {
      showToast('Failed to send reply', 'error');
    }
  } catch (error) {
    showToast('Failed to send reply', 'error');
  } finally {
    isSending.value = false;
  }
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return statusMap[status] || status;
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatMessageTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// New functions for redesigned UI
const formatRelativeTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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

const formatTime = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatMessageDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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

const getUnreadCount = (ticket: any) => {
  return supportStore.getUnreadCount(ticket, false); // false = isUser
};

const openChatModal = async (ticket: any) => {
  chatTicket.value = ticket;
  replyMessage.value = '';
  showChatModal.value = true;

  // Mark as read when user opens the chat
  await supportStore.markAsRead(ticket.id!, false);

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
  if (!chatTicket.value || !replyMessage.value.trim() || !userStore.user) return;

  isSending.value = true;
  try {
    const result = await supportStore.addMessage(chatTicket.value.id, {
      senderId: userStore.user.uid,
      senderName: userStore.user.username || userStore.user.email || 'User',
      message: replyMessage.value.trim(),
      isAdmin: false,
    });

    if (result.success) {
      replyMessage.value = '';
      // Reset textarea height
      if (chatInputRef.value) {
        chatInputRef.value.style.height = 'auto';
      }
      // Refresh to get updated messages
      await supportStore.fetchUserTickets(userStore.user.uid, true);
      chatTicket.value = supportStore.userTickets.find(t => t.id === chatTicket.value.id);
      nextTick(() => {
        scrollToBottom();
      });
    } else {
      showToast('Failed to send message', 'error');
    }
  } catch (error) {
    showToast('Failed to send message', 'error');
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
.support-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.page-header p {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 24px 0;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.action-btn ion-icon {
  font-size: 20px;
}

/* Section Title */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.section-title ion-icon {
  font-size: 22px;
  color: #667eea;
}

/* FAQ Section */
.faq-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.faq-section .section-title {
  margin-bottom: 16px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item.expanded {
  border-color: #667eea;
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.faq-question ion-icon {
  font-size: 20px;
  color: #667eea;
}

.faq-answer {
  padding: 0 16px 16px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.faq-answer p {
  margin: 0;
}

/* Tickets Section */
.tickets-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #e8e8e8;
  color: #667eea;
}

.refresh-btn ion-icon {
  font-size: 20px;
}

.refresh-btn ion-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state ion-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-weight: 600;
  color: #666;
}

.empty-state span {
  font-size: 0.85rem;
  color: #999;
  margin-top: 4px;
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
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-border, #ddd);
}

.ticket-card-new:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.ticket-card-new.open {
  border-left-color: #667eea;
}

.ticket-card-new.in_progress {
  border-left-color: #ffc409;
}

.ticket-card-new.resolved,
.ticket-card-new.closed {
  border-left-color: #2dd36f;
}

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

.ticket-status-badge.open {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

.ticket-status-badge.in_progress {
  background: rgba(255, 196, 9, 0.2);
  color: #d4a000;
}

.ticket-status-badge.resolved,
.ticket-status-badge.closed {
  background: rgba(45, 211, 111, 0.15);
  color: #2dd36f;
}

.ticket-category-tag {
  font-size: 0.75rem;
  color: var(--color-text-muted, #888);
  text-transform: capitalize;
}

.ticket-priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.ticket-priority-dot.low {
  background: #2dd36f;
}

.ticket-priority-dot.medium {
  background: #ffc409;
}

.ticket-priority-dot.high {
  background: #eb445a;
}

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
  background: var(--color-surface, white);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #999);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chat-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
}

.chat-btn.has-messages {
  color: #667eea;
}

.chat-btn ion-icon {
  font-size: 22px;
}

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

/* Responsive */
@media (max-width: 640px) {
  .quick-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}
</style>

<style>
/* Non-scoped for Ionic modal */
.ticket-modal {
  --width: 90%;
  --max-width: 600px;
  --height: auto;
  --max-height: 90vh;
  --border-radius: 20px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.ticket-modal::part(content) {
  margin: auto;
}

.ticket-modal .modal-container {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.ticket-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ticket-modal .modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.ticket-modal .close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.ticket-modal .modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.ticket-modal .form-group {
  margin-bottom: 20px;
}

.ticket-modal .form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.ticket-modal .form-group input,
.ticket-modal .form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  resize: none;
}

.ticket-modal .form-group input:focus,
.ticket-modal .form-group textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.ticket-modal .category-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.ticket-modal .category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ticket-modal .category-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.ticket-modal .category-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.ticket-modal .priority-options {
  display: flex;
  gap: 10px;
}

.ticket-modal .priority-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ticket-modal .priority-btn.low { color: #2dd36f; }
.ticket-modal .priority-btn.medium { color: #ffc409; }
.ticket-modal .priority-btn.high { color: #eb445a; }

.ticket-modal .priority-btn.active {
  color: white;
}

.ticket-modal .priority-btn.low.active { background: #2dd36f; border-color: #2dd36f; }
.ticket-modal .priority-btn.medium.active { background: #ffc409; border-color: #ffc409; }
.ticket-modal .priority-btn.high.active { background: #eb445a; border-color: #eb445a; }

.ticket-modal .modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.ticket-modal .cancel-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
}

.ticket-modal .submit-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
}

.ticket-modal .submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* View Ticket Styles */
.ticket-modal .ticket-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.ticket-modal .info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e8e8e8;
}

.ticket-modal .info-row:last-child {
  border-bottom: none;
}

.ticket-modal .info-label {
  color: #888;
  font-size: 0.85rem;
}

.ticket-modal .status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.ticket-modal .status-badge.open { background: rgba(102, 126, 234, 0.15); color: #667eea; }
.ticket-modal .status-badge.in_progress { background: rgba(255, 196, 9, 0.15); color: #e6a800; }
.ticket-modal .status-badge.resolved,
.ticket-modal .status-badge.closed { background: rgba(45, 211, 111, 0.15); color: #2dd36f; }

.ticket-modal .ticket-subject-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #333;
}

.ticket-modal .ticket-subject-section p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

.ticket-modal .messages-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: #333;
}

.ticket-modal .messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.ticket-modal .message {
  padding: 12px;
  background: #f0f0f0;
  border-radius: 12px;
}

.ticket-modal .message.admin {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.ticket-modal .message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.ticket-modal .sender-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
}

.ticket-modal .message-time {
  font-size: 0.75rem;
  color: #999;
}

.ticket-modal .message-text {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}

.ticket-modal .reply-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.ticket-modal .reply-form textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.9rem;
  resize: none;
  margin-bottom: 12px;
}

.ticket-modal .send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.ticket-modal .send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

.back-btn ion-icon {
  font-size: 22px;
}

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

.chat-avatar ion-icon {
  font-size: 22px;
}

.chat-header-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chat-status {
  font-size: 0.75rem;
  opacity: 0.9;
}

.chat-status.open { color: #90EE90; }
.chat-status.in_progress { color: #FFE082; }
.chat-status.resolved, .chat-status.closed { color: #90EE90; }

.ticket-id-badge {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
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

.subject-icon ion-icon {
  font-size: 18px;
  color: #667eea;
}

.subject-text {
  flex: 1;
  min-width: 0;
}

.subject-label {
  display: block;
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chat-bubble.admin {
  align-self: flex-start;
}

.bubble-content {
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chat-bubble.user .bubble-content {
  background: #dcf8c6;
  border-top-right-radius: 4px;
}

.chat-bubble.admin .bubble-content {
  background: white;
  border-top-left-radius: 4px;
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

.read-icon {
  font-size: 14px;
  color: #34B7F1;
}

.bubble-tail {
  width: 12px;
  height: 12px;
  position: absolute;
  top: 0;
}

.chat-bubble.user .bubble-tail {
  right: -6px;
  background: #dcf8c6;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.chat-bubble.admin .bubble-tail {
  left: -6px;
  background: white;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

/* Typing Indicator */
.chat-bubble.typing .bubble-content {
  padding: 12px 18px;
}

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

.chat-input-wrapper textarea::placeholder {
  color: #999;
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

.send-message-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-message-btn ion-icon {
  font-size: 22px;
}

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

.chat-closed-banner ion-icon {
  font-size: 18px;
}
</style>
