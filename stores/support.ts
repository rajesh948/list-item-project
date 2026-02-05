import { defineStore } from 'pinia';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';

export interface TicketMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Timestamp;
  isAdmin: boolean;
}

export interface SupportTicket {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  userLastReadAt?: Timestamp;
  adminLastReadAt?: Timestamp;
}

export const useSupportStore = defineStore('support', {
  state: () => ({
    tickets: [] as SupportTicket[],
    userTickets: [] as SupportTicket[],
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    allTickets: (state) => state.tickets,
    openTickets: (state) => state.tickets.filter(t => t.status === 'open'),
    inProgressTickets: (state) => state.tickets.filter(t => t.status === 'in_progress'),
    resolvedTickets: (state) => state.tickets.filter(t => t.status === 'resolved' || t.status === 'closed'),
    ticketsByStatus: (state) => (status: string) => state.tickets.filter(t => t.status === status),
    getTicketById: (state) => (id: string) => state.tickets.find(t => t.id === id) || state.userTickets.find(t => t.id === id),
  },

  actions: {
    async fetchAllTickets(force = false) {
      // Cache for 2 minutes
      if (!force && this.lastFetched) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (this.lastFetched > twoMinutesAgo && this.tickets.length > 0) {
          return this.tickets;
        }
      }

      this.isLoading = true;
      try {
        const { $db } = useNuxtApp();
        const q = query(collection($db, 'tickets'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        this.tickets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SupportTicket[];

        this.lastFetched = new Date();
        return this.tickets;
      } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserTickets(userId: string, force = false) {
      if (!force && this.userTickets.length > 0) {
        return this.userTickets;
      }

      this.isLoading = true;
      try {
        const { $db } = useNuxtApp();
        const q = query(
          collection($db, 'tickets'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        this.userTickets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SupportTicket[];

        return this.userTickets;
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createTicket(ticketData: Omit<SupportTicket, 'id' | 'messages' | 'createdAt' | 'updatedAt'>) {
      try {
        const { $db } = useNuxtApp();
        const newTicket = {
          ...ticketData,
          status: 'open',
          messages: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection($db, 'tickets'), newTicket);

        const ticket = { id: docRef.id, ...newTicket } as SupportTicket;
        this.userTickets.unshift(ticket);

        return { success: true, ticketId: docRef.id };
      } catch (error) {
        console.error('Error creating ticket:', error);
        return { success: false, error: 'Failed to create ticket' };
      }
    },

    async addMessage(ticketId: string, message: Omit<TicketMessage, 'timestamp'>) {
      try {
        const { $db } = useNuxtApp();
        const ticketRef = doc($db, 'tickets', ticketId);

        const newMessage: TicketMessage = {
          ...message,
          timestamp: Timestamp.now(),
        };

        await updateDoc(ticketRef, {
          messages: arrayUnion(newMessage),
          updatedAt: Timestamp.now(),
        });

        // Update local state
        const ticket = this.tickets.find(t => t.id === ticketId) ||
                       this.userTickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.messages.push(newMessage);
        }

        return { success: true };
      } catch (error) {
        console.error('Error adding message:', error);
        return { success: false, error: 'Failed to send message' };
      }
    },

    async updateTicketStatus(ticketId: string, status: SupportTicket['status']) {
      try {
        const { $db } = useNuxtApp();
        const ticketRef = doc($db, 'tickets', ticketId);

        const updates: any = {
          status,
          updatedAt: Timestamp.now(),
        };

        if (status === 'resolved' || status === 'closed') {
          updates.resolvedAt = Timestamp.now();
        }

        await updateDoc(ticketRef, updates);

        // Update local state
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.status = status;
        }

        return { success: true };
      } catch (error) {
        console.error('Error updating ticket status:', error);
        return { success: false, error: 'Failed to update status' };
      }
    },

    async markAsRead(ticketId: string, isAdmin: boolean) {
      try {
        const { $db } = useNuxtApp();
        const ticketRef = doc($db, 'tickets', ticketId);

        const field = isAdmin ? 'adminLastReadAt' : 'userLastReadAt';
        await updateDoc(ticketRef, {
          [field]: Timestamp.now(),
        });

        // Update local state
        const ticket = this.tickets.find(t => t.id === ticketId) ||
                       this.userTickets.find(t => t.id === ticketId);
        if (ticket) {
          if (isAdmin) {
            ticket.adminLastReadAt = Timestamp.now();
          } else {
            ticket.userLastReadAt = Timestamp.now();
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Error marking as read:', error);
        return { success: false };
      }
    },

    getUnreadCount(ticket: SupportTicket, isAdmin: boolean): number {
      if (!ticket.messages || ticket.messages.length === 0) return 0;

      const lastReadAt = isAdmin ? ticket.adminLastReadAt : ticket.userLastReadAt;

      // Count messages from the OTHER party that came after lastReadAt
      return ticket.messages.filter(msg => {
        // For admin: count user messages (isAdmin = false)
        // For user: count admin messages (isAdmin = true)
        const isFromOtherParty = isAdmin ? !msg.isAdmin : msg.isAdmin;
        if (!isFromOtherParty) return false;

        if (!lastReadAt) return true; // Never read = all are unread

        const msgTime = msg.timestamp?.toDate?.() || new Date(msg.timestamp as any);
        const readTime = lastReadAt?.toDate?.() || new Date(lastReadAt as any);
        return msgTime > readTime;
      }).length;
    },

    clearTickets() {
      this.tickets = [];
      this.userTickets = [];
      this.lastFetched = null;
    },
  },
});
