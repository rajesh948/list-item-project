<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Sidebar -->
    <LayoutSidebar
      :is-mobile-open="isMobileMenuOpen"
      @close-mobile="isMobileMenuOpen = false"
    />

    <!-- Main Content Area -->
    <div class="main-area">
      <!-- Top Header -->
      <LayoutTopHeader
        :is-mobile="isMobile"
        @toggle-menu="isMobileMenuOpen = !isMobileMenuOpen"
      />

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);
const isSidebarCollapsed = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

const checkSidebarState = () => {
  const saved = localStorage.getItem('sidebar-collapsed');
  isSidebarCollapsed.value = saved === 'true' && !isMobile.value;
};

// Watch for sidebar collapse changes
const updateSidebarState = () => {
  const saved = localStorage.getItem('sidebar-collapsed');
  isSidebarCollapsed.value = saved === 'true' && !isMobile.value;
};

onMounted(() => {
  checkMobile();
  checkSidebarState();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('storage', updateSidebarState);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('storage', updateSidebarState);
});

// Close mobile menu on route change
const route = useRoute();
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.main-area {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.app-layout.sidebar-collapsed .main-area {
  margin-left: 72px;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 767px) {
  .main-area {
    margin-left: 0;
  }

  .app-layout.sidebar-collapsed .main-area {
    margin-left: 0;
  }

  .page-content {
    padding: 16px;
  }
}
</style>
