<template>
  <div class="analytics-page">
    <div class="page-header">
      <div class="header-left">
        <h1>Analytics Dashboard</h1>
        <p>Track your platform's performance</p>
      </div>
      <button class="refresh-btn" @click="handleRefresh" :disabled="isLoading">
        <ion-icon :icon="refreshOutline" :class="{ spinning: isLoading }"></ion-icon>
        {{ isLoading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="isLoading && !analytics" class="loading-container">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Loading analytics...</p>
    </div>

    <div v-else-if="analytics" class="analytics-content">
      <!-- Overview Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card users">
          <div class="stat-icon">
            <ion-icon :icon="peopleOutline"></ion-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics.totalUsers }}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">
            <ion-icon :icon="walletOutline"></ion-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">₹{{ formatNumber(totalRevenue) }}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
        </div>

        <div class="stat-card reports">
          <div class="stat-icon">
            <ion-icon :icon="documentTextOutline"></ion-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics.pdfsGenerated.total }}</span>
            <span class="stat-label">Total Reports</span>
          </div>
        </div>

        <div class="stat-card requests">
          <div class="stat-icon">
            <ion-icon :icon="cardOutline"></ion-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics.premiumRequests.pending }}</span>
            <span class="stat-label">Pending Requests</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <!-- Active Users Chart -->
        <div class="chart-card">
          <h3 class="chart-title">
            <ion-icon :icon="trendingUpOutline"></ion-icon>
            Active Users
          </h3>
          <div class="active-users-stats">
            <div class="active-stat">
              <span class="active-value">{{ analytics.activeUsers.daily }}</span>
              <span class="active-label">Today</span>
            </div>
            <div class="active-stat">
              <span class="active-value">{{ analytics.activeUsers.weekly }}</span>
              <span class="active-label">This Week</span>
            </div>
            <div class="active-stat">
              <span class="active-value">{{ analytics.activeUsers.monthly }}</span>
              <span class="active-label">This Month</span>
            </div>
          </div>
        </div>

        <!-- Subscription Breakdown -->
        <div class="chart-card">
          <h3 class="chart-title">
            <ion-icon :icon="pieChartOutline"></ion-icon>
            Subscription Breakdown
          </h3>
          <div class="subscription-breakdown">
            <div class="sub-item free">
              <div class="sub-bar" :style="{ width: getSubPercentage('free') + '%' }"></div>
              <div class="sub-info">
                <span class="sub-label">Free</span>
                <span class="sub-count">{{ analytics.subscriptions.free }}</span>
              </div>
            </div>
            <div class="sub-item monthly">
              <div class="sub-bar" :style="{ width: getSubPercentage('monthly') + '%' }"></div>
              <div class="sub-info">
                <span class="sub-label">Monthly</span>
                <span class="sub-count">{{ analytics.subscriptions.monthly }}</span>
              </div>
            </div>
            <div class="sub-item yearly">
              <div class="sub-bar" :style="{ width: getSubPercentage('yearly') + '%' }"></div>
              <div class="sub-info">
                <span class="sub-label">Yearly</span>
                <span class="sub-count">{{ analytics.subscriptions.yearly }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Generation Stats -->
      <div class="chart-card full-width">
        <h3 class="chart-title">
          <ion-icon :icon="documentTextOutline"></ion-icon>
          Report Generation Stats
        </h3>
        <div class="pdf-stats-grid">
          <div class="pdf-stat">
            <div class="pdf-stat-icon today">
              <ion-icon :icon="todayOutline"></ion-icon>
            </div>
            <div class="pdf-stat-info">
              <span class="pdf-stat-value">{{ analytics.pdfsGenerated.today }}</span>
              <span class="pdf-stat-label">Today</span>
            </div>
          </div>
          <div class="pdf-stat">
            <div class="pdf-stat-icon week">
              <ion-icon :icon="calendarOutline"></ion-icon>
            </div>
            <div class="pdf-stat-info">
              <span class="pdf-stat-value">{{ analytics.pdfsGenerated.thisWeek }}</span>
              <span class="pdf-stat-label">This Week</span>
            </div>
          </div>
          <div class="pdf-stat">
            <div class="pdf-stat-icon month">
              <ion-icon :icon="calendarNumberOutline"></ion-icon>
            </div>
            <div class="pdf-stat-info">
              <span class="pdf-stat-value">{{ analytics.pdfsGenerated.thisMonth }}</span>
              <span class="pdf-stat-label">This Month</span>
            </div>
          </div>
          <div class="pdf-stat">
            <div class="pdf-stat-icon total">
              <ion-icon :icon="layersOutline"></ion-icon>
            </div>
            <div class="pdf-stat-info">
              <span class="pdf-stat-value">{{ analytics.pdfsGenerated.total }}</span>
              <span class="pdf-stat-label">All Time</span>
            </div>
          </div>
        </div>
      </div>

      <!-- User Growth Chart -->
      <div class="chart-card full-width">
        <h3 class="chart-title">
          <ion-icon :icon="statsChartOutline"></ion-icon>
          User Growth (Last 7 Days)
        </h3>
        <div class="growth-chart">
          <div
            v-for="(day, index) in analytics.userGrowth"
            :key="index"
            class="growth-bar-container"
          >
            <div class="growth-bar" :style="{ height: getGrowthHeight(day.count) + '%' }">
              <span class="growth-count">{{ day.count }}</span>
            </div>
            <span class="growth-label">{{ formatDate(day.date) }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Premium Requests & Recent Activity -->
      <div class="charts-grid">
        <!-- Premium Requests Summary -->
        <div class="chart-card">
          <h3 class="chart-title">
            <ion-icon :icon="cardOutline"></ion-icon>
            Premium Requests
          </h3>
          <div class="requests-summary">
            <div class="request-stat pending">
              <span class="request-count">{{ analytics.premiumRequests.pending }}</span>
              <span class="request-label">Pending</span>
            </div>
            <div class="request-stat approved">
              <span class="request-count">{{ analytics.premiumRequests.approved }}</span>
              <span class="request-label">Approved</span>
            </div>
            <div class="request-stat rejected">
              <span class="request-count">{{ analytics.premiumRequests.rejected }}</span>
              <span class="request-label">Rejected</span>
            </div>
          </div>
          <button class="view-all-btn" @click="goToRequests">
            View All Requests
            <ion-icon :icon="arrowForwardOutline"></ion-icon>
          </button>
        </div>

        <!-- Recent Activity -->
        <div class="chart-card">
          <h3 class="chart-title">
            <ion-icon :icon="timeOutline"></ion-icon>
            Recent Activity
          </h3>
          <div class="activity-list">
            <div v-if="analytics.recentActivity.length === 0" class="no-activity">
              No recent activity
            </div>
            <div
              v-for="(activity, index) in analytics.recentActivity"
              :key="index"
              class="activity-item"
            >
              <div class="activity-icon" :class="activity.type">
                <ion-icon :icon="getActivityIcon(activity.type)"></ion-icon>
              </div>
              <div class="activity-info">
                <span class="activity-desc">{{ activity.description }}</span>
                <span class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from '@ionic/vue';
import {
  refreshOutline,
  peopleOutline,
  walletOutline,
  documentTextOutline,
  cardOutline,
  trendingUpOutline,
  pieChartOutline,
  todayOutline,
  calendarOutline,
  calendarNumberOutline,
  layersOutline,
  statsChartOutline,
  timeOutline,
  arrowForwardOutline,
  personAddOutline,
  starOutline,
  documentOutline,
  sendOutline,
} from 'ionicons/icons';

definePageMeta({
  layout: 'default',
  middleware: ['admin'],
});

const router = useRouter();
const analyticsStore = useAnalyticsStore();
const { showToast } = useToast();

const isLoading = computed(() => analyticsStore.isLoading);
const analytics = computed(() => analyticsStore.data);
const totalRevenue = computed(() => analyticsStore.totalRevenue);

// Fetch analytics on mount
onMounted(async () => {
  try {
    await analyticsStore.fetchAnalytics();
  } catch (error) {
    showToast('Failed to load analytics', 'error');
  }
});

const handleRefresh = async () => {
  try {
    await analyticsStore.refreshAnalytics();
    showToast('Analytics refreshed', 'success');
  } catch (error) {
    showToast('Failed to refresh analytics', 'error');
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getSubPercentage = (type: 'free' | 'monthly' | 'yearly') => {
  if (!analytics.value) return 0;
  const total = analytics.value.subscriptions.free +
    analytics.value.subscriptions.monthly +
    analytics.value.subscriptions.yearly;
  if (total === 0) return 0;
  return (analytics.value.subscriptions[type] / total) * 100;
};

const getGrowthHeight = (count: number) => {
  if (!analytics.value) return 0;
  const maxCount = Math.max(...analytics.value.userGrowth.map(d => d.count), 1);
  return (count / maxCount) * 100;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_registered':
      return personAddOutline;
    case 'subscription_upgraded':
      return starOutline;
    case 'report_created':
      return documentOutline;
    case 'request_submitted':
      return sendOutline;
    default:
      return timeOutline;
  }
};

const goToRequests = () => {
  router.push('/admin/requests');
};
</script>

<style scoped>
.analytics-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.header-left p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn ion-icon {
  font-size: 18px;
}

.refresh-btn ion-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.loading-container ion-spinner {
  width: 40px;
  height: 40px;
  color: #667eea;
}

.loading-container p {
  margin-top: 12px;
  color: #666;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.users .stat-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
}

.stat-card.revenue .stat-icon {
  background: linear-gradient(135deg, rgba(45, 211, 111, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
  color: #2dd36f;
}

.stat-card.reports .stat-icon {
  background: linear-gradient(135deg, rgba(255, 196, 9, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%);
  color: #ffc409;
}

.stat-card.requests .stat-icon {
  background: linear-gradient(135deg, rgba(235, 68, 90, 0.15) 0%, rgba(220, 53, 69, 0.15) 100%);
  color: #eb445a;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.chart-card.full-width {
  grid-column: 1 / -1;
  margin-bottom: 20px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.chart-title ion-icon {
  font-size: 20px;
  color: #667eea;
}

/* Active Users Stats */
.active-users-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.active-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.active-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.active-label {
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
}

/* Subscription Breakdown */
.subscription-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-item {
  position: relative;
}

.sub-bar {
  height: 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  transition: width 0.5s ease;
}

.sub-item.free .sub-bar {
  background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
}

.sub-item.monthly .sub-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.sub-item.yearly .sub-bar {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
}

.sub-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.sub-label {
  color: #666;
}

.sub-count {
  font-weight: 600;
  color: #333;
}

/* PDF Stats Grid */
.pdf-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.pdf-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.pdf-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.pdf-stat-icon.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pdf-stat-icon.week {
  background: linear-gradient(135deg, #2dd36f 0%, #10b981 100%);
  color: white;
}

.pdf-stat-icon.month {
  background: linear-gradient(135deg, #ffc409 0%, #ff9500 100%);
  color: white;
}

.pdf-stat-icon.total {
  background: linear-gradient(135deg, #3dc2ff 0%, #0ea5e9 100%);
  color: white;
}

.pdf-stat-info {
  display: flex;
  flex-direction: column;
}

.pdf-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.pdf-stat-label {
  font-size: 0.8rem;
  color: #888;
}

/* User Growth Chart */
.growth-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding-top: 20px;
}

.growth-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.growth-bar {
  width: 80%;
  max-width: 60px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  margin-top: auto;
  position: relative;
  min-height: 4px;
  transition: height 0.5s ease;
}

.growth-count {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
}

.growth-label {
  font-size: 0.75rem;
  color: #888;
  margin-top: 8px;
}

/* Premium Requests Summary */
.requests-summary {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.request-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.request-count {
  font-size: 1.5rem;
  font-weight: 700;
}

.request-stat.pending .request-count {
  color: #ffc409;
}

.request-stat.approved .request-count {
  color: #2dd36f;
}

.request-stat.rejected .request-count {
  color: #eb445a;
}

.request-label {
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}

.view-all-btn {
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
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Recent Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-activity {
  text-align: center;
  padding: 24px;
  color: #888;
  font-size: 0.9rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.activity-icon.user_registered {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
}

.activity-icon.subscription_upgraded {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 149, 0, 0.15) 100%);
  color: #ffc409;
}

.activity-icon.report_created {
  background: linear-gradient(135deg, rgba(45, 211, 111, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
  color: #2dd36f;
}

.activity-icon.request_submitted {
  background: linear-gradient(135deg, rgba(61, 194, 255, 0.15) 0%, rgba(14, 165, 233, 0.15) 100%);
  color: #3dc2ff;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.activity-desc {
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pdf-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .pdf-stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .growth-chart {
    height: 150px;
  }

  .active-users-stats {
    flex-direction: column;
    gap: 16px;
  }

  .requests-summary {
    flex-wrap: wrap;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .pdf-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
