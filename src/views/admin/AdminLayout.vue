<template>
  <div class="min-h-screen flex flex-col antialiased">
    <div class="flex flex-1 relative">
      <!-- AdminLTE Main Sidebar -->
      <MainSidebar :isCollapsed="isSidebarCollapsed" />

      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Navbar -->
        <AdminNavbar
          @toggle-sidebar="toggleSidebar"
          @toggle-control-sidebar="toggleControlSidebar"
        />

        <!-- Page Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 surface-alt">
          <router-view />
        </main>

        <!-- Admin Footer -->
        <AdminFooter />
      </div>

      <!-- Control Sidebar (Settings drawer) -->
      <ControlSidebar
        :isOpen="isControlSidebarOpen"
        @close="isControlSidebarOpen = false"
      />
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';
import AdminNavbar from '@/components/includes/Navbar.vue';
import MainSidebar from '@/components/includes/MainSidebar.vue';
import ControlSidebar from '@/components/includes/ControlSidebar.vue';
import AdminFooter from '@/components/includes/Footer.vue';

export default {
  name: 'AdminLayout',
  components: {
    AdminNavbar,
    MainSidebar,
    ControlSidebar,
    AdminFooter
  },
  setup() {
    const isSidebarCollapsed = ref(false);
    const isControlSidebarOpen = ref(false);

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    };

    const toggleControlSidebar = () => {
      isControlSidebarOpen.value = !isControlSidebarOpen.value;
    };

    return {
      isSidebarCollapsed,
      isControlSidebarOpen,
      toggleSidebar,
      toggleControlSidebar
    };
  }
};
</script>
