<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Categories</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Organize t-shirt lines, oversized fits, graphic lines, and accessories</p>
      </div>

      <button
        @click="openModal(null)"
        class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Add New Category</span>
      </button>
    </div>

    <!-- Category Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-6 flex flex-col justify-between space-y-4 hover:border-[var(--border-strong)] transition-colors"
      >
        <div>
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-sm bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-xl">
              <i :class="`fa-solid ${cat.icon}`"></i>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] text-xs font-bold">
              {{ cat.itemCount || 0 }} Items
            </span>
          </div>

          <h3 class="font-bold text-base text-[var(--text)] mt-4">{{ cat.name }}</h3>
          <p class="text-xs font-mono text-[var(--text-muted)] mt-0.5">slug: /{{ cat.slug }}</p>
          <p class="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{{ cat.description }}</p>
        </div>

        <div class="pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <button
            @click="openModal(cat)"
            class="text-xs text-[var(--accent)] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button
            @click="handleDelete(cat)"
            class="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <i class="fa-regular fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <h3 class="font-display text-lg text-[var(--text)]">
            {{ isEditing ? 'Edit Category' : 'Create New Category' }}
          </h3>
          <button @click="showModal = false" class="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Category Name *</label>
            <input type="text" v-model="form.name" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Slug *</label>
            <input type="text" v-model="form.slug" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-mono text-[var(--text)]" placeholder="e.g. vintage-acid-wash" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Font Awesome Icon Class</label>
            <input type="text" v-model="form.icon" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-mono text-[var(--text)]" placeholder="fa-shirt" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)]"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-sm border border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--text)] font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="px-6 py-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold cursor-pointer">
              {{ isEditing ? 'Save Changes' : 'Create Category' }}
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
  name: 'AdminCategories',
  setup() {
    const store = useStore();

    const showModal = ref(false);
    const isEditing = ref(false);
    const editId = ref(null);

    const form = ref({
      name: '',
      slug: '',
      icon: 'fa-shirt',
      description: ''
    });

    const categories = computed(() => store.getters['products/allCategories']);

    onMounted(() => {
      store.dispatch('products/fetchCategories');
    });

    const openModal = (cat) => {
      if (cat) {
        isEditing.value = true;
        editId.value = cat.id;
        form.value = {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description
        };
      } else {
        isEditing.value = false;
        editId.value = null;
        form.value = {
          name: '',
          slug: '',
          icon: 'fa-shirt',
          description: ''
        };
      }
      showModal.value = true;
    };

    const saveCategory = async () => {
      if (isEditing.value) {
        await store.dispatch('admin/updateCategory', { id: editId.value, categoryData: form.value });
      } else {
        await store.dispatch('admin/createCategory', form.value);
      }
      store.dispatch('products/fetchCategories');
      showModal.value = false;
    };

    const handleDelete = async (cat) => {
      const confirmed = await ConfirmDelete(cat.name);
      if (confirmed) {
        await store.dispatch('admin/deleteCategory', cat.id);
        store.dispatch('products/fetchCategories');
      }
    };

    return {
      showModal,
      isEditing,
      form,
      categories,
      openModal,
      saveCategory,
      handleDelete
    };
  }
};
</script>
