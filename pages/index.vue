<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <h1 class="business-name">{{ businessName }}</h1>
      <p class="welcome-subtitle">Here's your business overview</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <DashboardStatCard
        title="Total Reports"
        :value="reportsCount"
        icon="document-text-outline"
        color="primary"
        @click="navigateTo('/reports')"
      />
      <DashboardStatCard
        title="Upcoming Events"
        :value="upcomingEventsCount"
        icon="calendar-outline"
        color="success"
        @click="navigateTo('/calendar')"
      />
      <DashboardStatCard
        title="Customers"
        :value="customersCount"
        icon="people-outline"
        color="warning"
        :disabled="!isPremium"
        @click="isPremium && navigateTo('/customers')"
      />
      <DashboardStatCard
        title="This Month"
        :value="monthlyReports"
        icon="trending-up-outline"
        color="tertiary"
      />
    </div>

    <!-- Two Column Layout -->
    <div class="two-columns">
      <!-- Recent Reports -->
      <div class="column">
        <div class="section-header">
          <h2 class="section-title">Recent Reports</h2>
          <button class="view-all-btn" @click="navigateTo('/reports')">View All</button>
        </div>
        <div class="reports-list">
          <div v-if="isLoadingReports" class="loading-state">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else-if="recentReports.length === 0" class="empty-state">
            <ion-icon :icon="documentTextOutline"></ion-icon>
            <p>No reports yet</p>
            <button class="create-btn" @click="navigateTo('/create-report')">Create First Report</button>
          </div>
          <DashboardReportItem
            v-else
            v-for="report in recentReports"
            :key="report.id"
            :report="report"
            @click="viewReport(report)"
          />
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="column">
        <div class="section-header">
          <h2 class="section-title">Upcoming Events</h2>
          <button class="view-all-btn" @click="navigateTo('/calendar')">View Calendar</button>
        </div>
        <div class="events-list">
          <div v-if="isLoadingEvents" class="loading-state">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else-if="upcomingEvents.length === 0" class="empty-state">
            <ion-icon :icon="calendarOutline"></ion-icon>
            <p>No upcoming events</p>
          </div>
          <DashboardEventItem
            v-else
            v-for="event in upcomingEvents"
            :key="event.id"
            :event="event"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from '@ionic/vue';
import {
  documentTextOutline,
  calendarOutline,
} from 'ionicons/icons';

const userStore = useUserStore();
const { isPremium } = useSubscription();
const { fetchSavedReports } = useSavedReports();
const { loadEvents } = useCalendar();
const customersStore = useCustomersStore();

// Business name from user
const businessName = computed(() => {
  return userStore.user?.businessName || userStore.user?.username || 'Welcome';
});

// State
const isLoadingReports = ref(true);
const isLoadingEvents = ref(true);
const recentReports = ref<any[]>([]);
const upcomingEvents = ref<any[]>([]);

// Computed stats
const reportsCount = ref(0);
const customersCount = computed(() => customersStore.totalCustomers);
const upcomingEventsCount = computed(() => upcomingEvents.value.length);
const monthlyReports = ref(0);

// Load data
const loadDashboardData = async () => {
  if (!userStore.user?.uid) return;

  // Load reports
  isLoadingReports.value = true;
  try {
    const reports = await fetchSavedReports(userStore.user.uid);
    recentReports.value = reports.slice(0, 5);
    reportsCount.value = reports.length;

    // Calculate monthly reports
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    monthlyReports.value = reports.filter((r: any) => {
      const reportDate = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      return reportDate >= startOfMonth;
    }).length;
  } catch (error) {
    console.error('Error loading reports:', error);
  } finally {
    isLoadingReports.value = false;
  }

  // Load events
  isLoadingEvents.value = true;
  try {
    const events = await loadEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    upcomingEvents.value = events
      .filter((e: any) => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  } catch (error) {
    console.error('Error loading events:', error);
  } finally {
    isLoadingEvents.value = false;
  }

  // Load customers count if premium
  if (isPremium.value) {
    try {
      await customersStore.fetchCustomers(userStore.user.uid);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }
};

const viewReport = (report: any) => {
  navigateTo(`/preview-report?id=${report.id}`);
};

onMounted(() => {
  loadDashboardData();
});

// Refresh when user changes
watch(() => userStore.user?.uid, () => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* Welcome Header */
.welcome-header {
  margin-bottom: 24px;
}

.business-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: #888;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

/* Two Columns */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.column {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .section-title {
  margin: 0;
}

.view-all-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.view-all-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* Lists */
.reports-list,
.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar */
.reports-list::-webkit-scrollbar,
.events-list::-webkit-scrollbar {
  width: 6px;
}

.reports-list::-webkit-scrollbar-track,
.events-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.reports-list::-webkit-scrollbar-thumb,
.events-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.reports-list::-webkit-scrollbar-thumb:hover,
.events-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #888;
  text-align: center;
}

.empty-state ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .two-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
