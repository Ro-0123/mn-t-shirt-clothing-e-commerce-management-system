<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Fabric Suppliers</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Maintain partnerships with textile mills, screen printers, and garment suppliers</p>
      </div>

      <button
        @click="openModal(null)"
        class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Add New Supplier</span>
      </button>
    </div>

    <!-- Suppliers Table -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--bg-alt)]">
              <th class="py-3 px-4 font-bold">Supplier Name</th>
              <th class="py-3 px-4 font-bold">Contact Person</th>
              <th class="py-3 px-4 font-bold">Phone & Email</th>
              <th class="py-3 px-4 font-bold">City / Hub</th>
              <th class="py-3 px-4 font-bold">Products Supplied</th>
              <th class="py-3 px-4 font-bold">Lead Time</th>
              <th class="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="s in suppliers" :key="s.id" class="hover:bg-[var(--bg-alt)] transition-colors">
              <td class="py-3.5 px-4 font-bold text-[var(--text)]">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-sm bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-black">
                    {{ s.name.charAt(0) }}
                  </div>
                  <span>{{ s.name }}</span>
                </div>
              </td>

              <td class="py-3.5 px-4 text-[var(--text)] font-semibold">{{ s.contactPerson }}</td>

              <td class="py-3.5 px-4">
                <p class="font-mono text-[var(--text)] font-semibold">{{ s.phone }}</p>
                <p class="text-[10px] text-[var(--text-muted)]">{{ s.email }}</p>
              </td>

              <td class="py-3.5 px-4 text-[var(--text-muted)]">{{ s.city }}</td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] text-[10px] font-semibold">
                  {{ s.productsSupplied }}
                </span>
              </td>

              <td class="py-3.5 px-4 font-bold text-[var(--accent)]">{{ s.leadTime }}</td>

              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openModal(s)"
                    class="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    @click="handleDelete(s)"
                    class="p-1 text-[var(--text-muted)] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete"
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

    <!-- Supplier Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <h3 class="font-display text-lg text-[var(--text)]">
            {{ isEditing ? 'Edit Supplier Details' : 'Register New Supplier' }}
          </h3>
          <button @click="showModal = false" class="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="saveSupplier" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Company Name *</label>
            <input type="text" v-model="form.name" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Contact Person *</label>
              <input type="text" v-model="form.contactPerson" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Phone *</label>
              <input type="text" v-model="form.phone" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Email Address</label>
              <input type="email" v-model="form.email" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">City / Province</label>
              <input type="text" v-model="form.city" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Products / Fabric Supplied</label>
              <input type="text" v-model="form.productsSupplied" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" placeholder="Heavy Cotton Fabrics" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Production Lead Time</label>
              <input type="text" v-model="form.leadTime" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)]" placeholder="3-5 Business Days" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-sm border border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--text)] font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="px-6 py-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold cursor-pointer">
              {{ isEditing ? 'Save Supplier' : 'Register Supplier' }}
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
import { ConfirmDelete } from '@/functions/sweetalert';

export default {
  name: 'AdminSuppliers',
  setup() {
    const store = useStore();

    const showModal = ref(false);
    const isEditing = ref(false);
    const editId = ref(null);

    const form = ref({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      city: 'Phnom Penh',
      productsSupplied: 'Organic Combed Cotton (280 GSM)',
      leadTime: '3-5 Business Days'
    });

    const suppliers = computed(() => store.getters['admin/allSuppliers']);

    onMounted(() => {
      store.dispatch('admin/fetchSuppliers');
    });

    const openModal = (s) => {
      if (s) {
        isEditing.value = true;
        editId.value = s.id;
        form.value = { ...s };
      } else {
        isEditing.value = false;
        editId.value = null;
        form.value = {
          name: '',
          contactPerson: '',
          phone: '',
          email: '',
          city: 'Phnom Penh',
          productsSupplied: 'Organic Combed Cotton (280 GSM)',
          leadTime: '3-5 Business Days'
        };
      }
      showModal.value = true;
    };

    const saveSupplier = async () => {
      if (isEditing.value) {
        await store.dispatch('admin/updateSupplier', { id: editId.value, supplierData: form.value });
      } else {
        await store.dispatch('admin/createSupplier', form.value);
      }
      showModal.value = false;
    };

    const handleDelete = async (s) => {
      const confirmed = await ConfirmDelete(s.name);
      if (confirmed) {
        await store.dispatch('admin/deleteSupplier', s.id);
      }
    };

    return {
      showModal,
      isEditing,
      form,
      suppliers,
      openModal,
      saveSupplier,
      handleDelete
    };
  }
};
</script>
