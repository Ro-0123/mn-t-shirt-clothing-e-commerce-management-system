<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage System Users</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Control permissions, assign staff accounts, and view user profiles</p>
      </div>

      <button
        @click="openModal(null)"
        class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-user-plus"></i>
        <span>Add Staff / User</span>
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
      <div class="overflow-auto max-h-[65vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--surface)]">
              <th class="py-3 px-4 font-bold">User</th>
              <th class="py-3 px-4 font-bold">Email</th>
              <th class="py-3 px-4 font-bold">Role</th>
              <th class="py-3 px-4 font-bold">Phone</th>
              <th class="py-3 px-4 font-bold">Store Credit</th>
              <th class="py-3 px-4 font-bold">Status</th>
              <th class="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="u in users" :key="u.id" class="hover:bg-[var(--bg-alt)] transition-colors">
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img :src="u.avatar" class="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--border)]" />
                  <span class="font-bold text-[var(--text)]">{{ u.name }}</span>
                </div>
              </td>

              <td class="py-3.5 px-4 text-[var(--text-muted)] font-mono">{{ u.email }}</td>

              <td class="py-3.5 px-4">
                <!-- Inline Role Switcher -->
                <select
                  :value="u.role"
                  @change="changeUserRole(u, $event.target.value)"
                  class="px-2 py-1 rounded-sm text-[11px] font-bold border border-[var(--border)] bg-[var(--bg-alt)] focus:bg-[var(--surface)] focus:outline-none"
                  :class="getRoleClass(u.role)"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
              </td>

              <td class="py-3.5 px-4 text-[var(--text-muted)] font-mono">{{ u.phone }}</td>

              <td class="py-3.5 px-4 font-bold text-[var(--accent)]">
                ${{ Number(u.storeCredit || 0).toFixed(2) }}
              </td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  Active
                </span>
              </td>

              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="deleteUser(u)"
                    :disabled="u.email === 'admin@mntshirt.com'"
                    class="p-1 text-[var(--text-faint)] hover:text-rose-600 disabled:opacity-20 transition-colors cursor-pointer"
                    title="Delete User"
                  >
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <h3 class="font-display text-lg text-[var(--text)]">Add New System User</h3>
          <button @click="showModal = false" class="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="createUser" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Full Name *</label>
            <input type="text" v-model="form.name" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Email Address *</label>
            <input type="email" v-model="form.email" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Initial Password *</label>
            <input type="password" v-model="form.password" required minlength="8" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]" placeholder="At least 8 characters" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Role *</label>
            <select v-model="form.role" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]">
              <option value="staff">Warehouse Staff</option>
              <option value="admin">Administrator</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Phone</label>
            <input type="text" v-model="form.phone" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" placeholder="+855 12 345 678" />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-sm border border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--text)] font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="px-6 py-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold cursor-pointer">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { SuccessToast, ConfirmDelete } from '@/functions/sweetalert';

export default {
  name: 'AdminUsers',
  setup() {
    const store = useStore();
    const showModal = ref(false);

    const form = ref({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      phone: '+855 92 888 777'
    });

    const users = computed(() => store.getters['admin/allUsers']);

    onMounted(() => {
      store.dispatch('admin/fetchUsers');
    });

    const openModal = () => {
      form.value = {
        name: '',
        email: '',
        password: '',
        role: 'staff',
        phone: '+855 92 888 777'
      };
      showModal.value = true;
    };

    const createUser = async () => {
      await store.dispatch('admin/createUser', form.value);
      showModal.value = false;
    };

    const changeUserRole = async (u, newRole) => {
      await store.dispatch('admin/updateUserRole', { id: u.id, role: newRole });
      SuccessToast('Role Changed', `${u.name} is now ${newRole}`);
    };

    const deleteUser = async (u) => {
      const confirmed = await ConfirmDelete(u.name);
      if (confirmed) {
        await store.dispatch('admin/deleteUser', u.id);
      }
    };

    const getRoleClass = (role) => {
      switch (role) {
        case 'admin': return 'text-emerald-700 font-bold';
        case 'staff': return 'text-amber-700 font-bold';
        default: return 'text-[var(--accent)] font-bold';
      }
    };

    return {
      showModal,
      form,
      users,
      openModal,
      createUser,
      changeUserRole,
      deleteUser,
      getRoleClass
    };
  }
};
</script>
