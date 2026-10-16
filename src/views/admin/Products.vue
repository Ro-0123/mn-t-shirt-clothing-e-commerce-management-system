<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Products</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Add, edit, inventory-tag, and categorize MN t-shirts & apparel</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openModal(null)"
          class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Add New T-Shirt</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
      <div class="flex items-center gap-3 flex-1 min-w-[240px]">
        <div class="relative w-full max-w-sm">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by name, SKU, fabric..."
            class="w-full pl-9 pr-4 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] text-[var(--text)] placeholder-[var(--text-faint)]"
          />
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[var(--text-faint)] text-xs"></i>
        </div>

        <select
          v-model="selectedCategory"
          class="px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text)] font-medium"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
        </select>
      </div>

      <div class="text-[var(--text-muted)] font-medium">
        Total: <strong class="text-[var(--text)]">{{ filteredProducts.length }}</strong> products
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
      <div class="overflow-auto max-h-[65vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--surface)]">
              <th class="py-3 px-4 font-bold">Product</th>
              <th class="py-3 px-4 font-bold">Category</th>
              <th class="py-3 px-4 font-bold">Price</th>
              <th class="py-3 px-4 font-bold">Stock</th>
              <th class="py-3 px-4 font-bold">Sizes</th>
              <th class="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-[var(--bg-alt)] transition-colors">
              <!-- Product info -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.images?.[0]"
                    :src="product.images[0]"
                    :alt="product.name"
                    class="w-12 h-12 rounded-sm object-cover bg-[var(--bg-alt)] border border-[var(--border)] flex-shrink-0"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-faint)] flex-shrink-0"
                    aria-hidden="true"
                  >
                    <i class="fa-solid fa-shirt"></i>
                  </div>
                  <div>
                    <p class="font-bold text-[var(--text)] line-clamp-1">{{ product.name }}</p>
                    <div class="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                      <span class="font-mono text-[var(--text-muted)]">SKU: {{ product.sku }}</span>
                      <span>•</span>
                      <span>{{ product.fabric }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Category -->
              <td class="py-3.5 px-4 font-semibold text-[var(--text)]">
                {{ product.categoryName }}
              </td>

              <!-- Price -->
              <td class="py-3.5 px-4">
                <span class="font-black text-[var(--text)]">${{ Number(product.price || 0).toFixed(2) }}</span>
                <span v-if="Number(product.originalPrice || 0) > Number(product.price || 0)" class="text-[10px] text-[var(--text-faint)] line-through ml-1">
                  ${{ Number(product.originalPrice || 0).toFixed(2) }}
                </span>
              </td>

              <!-- Stock -->
              <td class="py-3.5 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[11px] font-bold"
                  :class="product.stock <= product.minStockLevel ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'"
                >
                  {{ product.stock }} units
                </span>
              </td>

              <!-- Sizes -->
              <td class="py-3.5 px-4">
                <div class="flex gap-1">
                  <span v-for="s in product.sizes" :key="s" class="px-1.5 py-0.5 rounded bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] text-[10px] font-bold">
                    {{ s }}
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openModal(product)"
                    class="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    @click="handleDelete(product)"
                    class="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Product"
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

    <!-- Add / Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <h3 class="font-display text-lg text-[var(--text)]">
            {{ isEditing ? 'Edit T-Shirt Product' : 'Add New T-Shirt' }}
          </h3>
          <button @click="closeModal" class="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-[var(--text)]">Product Name *</label>
              <input type="text" v-model="form.name" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]" />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Category *</label>
              <select v-model="form.categorySlug" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]">
                <option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.name }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">SKU Code</label>
              <input type="text" v-model="form.sku" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-mono text-[var(--text)]" placeholder="MNT-..." />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Sale Price ($) *</label>
              <input type="number" step="0.01" v-model.number="form.price" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-bold text-[var(--text)]" />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Original / Strike Price ($)</label>
              <input type="number" step="0.01" v-model.number="form.originalPrice" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)]" />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Initial Stock Units *</label>
              <input type="number" v-model.number="form.stock" required class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-bold text-[var(--text)]" />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Low Stock Threshold</label>
              <input type="number" v-model.number="form.minStockLevel" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)]" />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Fabric Composition</label>
              <input type="text" v-model="form.fabric" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)]" placeholder="e.g. 100% Heavy Combed Cotton (280 GSM)" />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Fit Silhouette</label>
              <input type="text" v-model="form.fit" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)]" placeholder="e.g. Boxy Drop-Shoulder Relaxed" />
            </div>

            <div class="sm:col-span-2 space-y-2">
              <label class="font-bold text-[var(--text)]">Available Sizes *</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in ['XS', 'S', 'M', 'L', 'XL', '2XL']"
                  :key="s"
                  type="button"
                  @click="toggleFormSize(s)"
                  :class="form.sizes.includes(s) ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-bold' : 'bg-[var(--bg-alt)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-strong)]'"
                  class="w-11 h-11 rounded-sm text-xs border flex items-center justify-center transition-colors cursor-pointer"
                >
                  {{ s }}
                </button>
              </div>
              <p v-if="form.sizes.length === 0" class="text-[11px] text-rose-600 font-semibold">Select at least one size.</p>
            </div>

            <div class="sm:col-span-2 space-y-2">
              <span class="font-bold text-xs text-[var(--text)] block">
                Select colors: <strong class="text-[var(--accent)]">{{ form.colors.length ? form.colors.join(', ') : 'None selected' }}</strong>
              </span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="c in colorPalette"
                  :key="c"
                  type="button"
                  @click="toggleFormColor(c)"
                  :class="form.colors.includes(c) ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'"
                  class="px-3 py-1.5 rounded-sm border text-xs transition-colors cursor-pointer"
                >
                  {{ c }}
                </button>
              </div>
              <p v-if="form.colors.length === 0" class="text-[11px] text-rose-600 font-semibold">Select at least one color.</p>

              <!-- Add a custom color -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  v-model="newColorInput"
                  @keydown.enter.prevent="addCustomColor"
                  placeholder="Add another color..."
                  class="flex-1 px-3 py-1.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  @click="addCustomColor"
                  class="px-3 py-1.5 rounded-sm border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text)] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <i class="fa-solid fa-plus text-[10px]"></i> Add
                </button>
              </div>
            </div>

            <div class="sm:col-span-2 space-y-2">
              <label class="font-bold text-[var(--text)]">Product Images *</label>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageFile"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-[var(--accent-hover)]"
              />
              <p class="text-[11px] text-[var(--text-muted)]">Select multiple files at once, or add more later &mdash; the first image is used as the cover photo. Uploaded as files, not stored as raw data, so any number of full-size photos is fine.</p>

              <div v-if="allImagePreviews.length" class="flex flex-wrap gap-3">
                <div v-for="(item, idx) in allImagePreviews" :key="item.url" class="relative">
                  <img :src="item.url" alt="Product image preview" class="w-16 h-16 rounded-sm object-cover border border-[var(--border)]" />
                  <span v-if="idx === 0" class="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-sm bg-[var(--text)] text-white text-[9px] font-bold">Cover</span>
                  <span v-if="item.type === 'pending'" class="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/60 text-white text-[8px] font-bold text-center">New</span>
                  <button
                    type="button"
                    @click="removePreviewImage(item)"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] cursor-pointer"
                    title="Remove image"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
              <p v-else class="text-[11px] text-rose-600 font-semibold">Add at least one product image.</p>
            </div>

            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-[var(--text)]">Description</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)]"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded-sm border border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--text)] font-semibold cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-6 py-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white font-bold cursor-pointer flex items-center gap-2"
            >
              <span v-if="isSaving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isSaving ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product') }}</span>
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
import { ConfirmDelete, ErrorToast } from '@/functions/sweetalert';
import { uploadProductImagesApi } from '@/api';

const COLOR_PALETTE = ['Black', 'White', 'Heather Grey', 'Navy Blue', 'Red', 'Beige', 'Olive Green'];

export default {
  name: 'AdminProducts',
  setup() {
    const store = useStore();

    const searchQuery = ref('');
    const selectedCategory = ref('');
    const showModal = ref(false);
    const isEditing = ref(false);
    const editId = ref(null);
    const colorPalette = ref([...COLOR_PALETTE]);
    const newColorInput = ref('');
    const pendingFiles = ref([]); // raw File objects selected but not yet uploaded
    const isSaving = ref(false);

    const allImagePreviews = computed(() => [
      ...form.value.images.map((url) => ({ type: 'existing', url })),
      ...pendingFiles.value.map((entry) => ({ type: 'pending', url: entry.previewUrl })),
    ]);

    const form = ref({
      name: '',
      categorySlug: 'heavyweight-cotton',
      sku: '',
      price: 24.99,
      originalPrice: 32.00,
      stock: 40,
      minStockLevel: 10,
      fabric: '100% Combed Heavy Cotton (260 GSM)',
      fit: 'Relaxed Streetwear Fit',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: ['Black', 'White', 'Heather Grey', 'Navy Blue'],
      images: [],
      description: 'Engineered for all-day comfort, minimal shrinkage, and drop-shoulder styling.'
    });

    const products = computed(() => store.getters['products/allProducts']);
    const categories = computed(() => store.getters['products/allCategories']);

    const filteredProducts = computed(() => {
      return products.value.filter(p => {
        const matchesSearch = !searchQuery.value || 
          p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          p.fabric.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCat = !selectedCategory.value || p.categorySlug === selectedCategory.value;
        return matchesSearch && matchesCat;
      });
    });

    onMounted(() => {
      store.dispatch('products/fetchProducts');
      store.dispatch('products/fetchCategories');
    });

    const clearPendingFiles = () => {
      pendingFiles.value.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
      pendingFiles.value = [];
    };

    const closeModal = () => {
      clearPendingFiles();
      showModal.value = false;
    };

    const openModal = (product) => {
      clearPendingFiles();
      if (product) {
        isEditing.value = true;
        editId.value = product.id;
        form.value = {
          name: product.name,
          categorySlug: product.categorySlug,
          sku: product.sku,
          price: product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          minStockLevel: product.minStockLevel || 10,
          fabric: product.fabric,
          fit: product.fit,
          sizes: product.sizes?.length ? [...product.sizes] : ['S', 'M', 'L', 'XL', '2XL'],
          colors: product.colors?.length ? [...product.colors] : ['Black', 'White', 'Heather Grey', 'Navy Blue'],
          images: product.images?.length ? [...product.images] : [],
          description: product.description
        };
      } else {
        isEditing.value = false;
        editId.value = null;
        form.value = {
          name: '',
          categorySlug: categories.value[0]?.slug || 'heavyweight-cotton',
          sku: `MNT-${Math.floor(1000 + Math.random() * 9000)}`,
          price: 24.99,
          originalPrice: 32.00,
          stock: 45,
          minStockLevel: 10,
          fabric: '100% Ring-Spun Cotton (240 GSM)',
          fit: 'Standard Casual Fit',
          sizes: ['S', 'M', 'L', 'XL', '2XL'],
          colors: ['Black', 'White', 'Heather Grey', 'Navy Blue'],
          images: [],
          description: 'Premium everyday basic t-shirt featuring reinforced neck tape and double-needle hems.'
        };
      }
      showModal.value = true;
    };

    const toggleFormSize = (size) => {
      const idx = form.value.sizes.indexOf(size);
      if (idx === -1) {
        form.value.sizes.push(size);
      } else {
        form.value.sizes.splice(idx, 1);
      }
    };

    const toggleFormColor = (color) => {
      const idx = form.value.colors.indexOf(color);
      if (idx === -1) {
        form.value.colors.push(color);
      } else {
        form.value.colors.splice(idx, 1);
      }
    };

    const addCustomColor = () => {
      const name = newColorInput.value.trim();
      if (!name) return;

      const alreadyExists = colorPalette.value.some((c) => c.toLowerCase() === name.toLowerCase());
      if (!alreadyExists) {
        colorPalette.value.push(name);
      }
      if (!form.value.colors.includes(name)) {
        form.value.colors.push(name);
      }
      newColorInput.value = '';
    };

    const saveProduct = async () => {
      if (form.value.sizes.length === 0) {
        ErrorToast('Select at least one size before saving.');
        return;
      }
      if (form.value.colors.length === 0) {
        ErrorToast('Select at least one color before saving.');
        return;
      }
      if (allImagePreviews.value.length === 0) {
        ErrorToast('Add at least one product image before saving.');
        return;
      }

      isSaving.value = true;
      try {
        let finalImages = [...form.value.images];

        if (pendingFiles.value.length > 0) {
          const uploadForm = new FormData();
          pendingFiles.value.forEach((entry) => uploadForm.append('images', entry.file));
          try {
            const uploadRes = await uploadProductImagesApi(uploadForm);
            finalImages = [...finalImages, ...uploadRes.data.images];
          } catch (uploadError) {
            ErrorToast('Failed to Upload Images', uploadError.parsedMessage || 'Could not upload the selected photos.');
            return;
          }
        }

        const selectedCategoryData = categories.value.find(category => category.slug === form.value.categorySlug);
        const payload = {
          ...form.value,
          categoryId: selectedCategoryData?.id,
          quantity: form.value.stock,
          material: form.value.fabric,
          images: finalImages,
          sizes: form.value.sizes,
          colors: form.value.colors
        };

        if (isEditing.value) {
          await store.dispatch('admin/updateProduct', { id: editId.value, productData: payload });
        } else {
          await store.dispatch('admin/createProduct', payload);
        }

        pendingFiles.value.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
        pendingFiles.value = [];
        showModal.value = false;
      } catch (error) {
        // error toast already shown by the store action
      } finally {
        isSaving.value = false;
      }
    };

    const handleImageFile = (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      files.forEach((file) => {
        pendingFiles.value.push({ file, previewUrl: URL.createObjectURL(file) });
      });

      event.target.value = '';
    };

    const removePreviewImage = (item) => {
      if (item.type === 'pending') {
        const idx = pendingFiles.value.findIndex((entry) => entry.previewUrl === item.url);
        if (idx !== -1) {
          URL.revokeObjectURL(pendingFiles.value[idx].previewUrl);
          pendingFiles.value.splice(idx, 1);
        }
      } else {
        const idx = form.value.images.indexOf(item.url);
        if (idx !== -1) form.value.images.splice(idx, 1);
      }
    };

    const handleDelete = async (product) => {
      const confirmed = await ConfirmDelete(product.name);
      if (confirmed) {
        await store.dispatch('admin/deleteProduct', product.id);
      }
    };

    return {
      searchQuery,
      selectedCategory,
      showModal,
      isEditing,
      isSaving,
      form,
      products,
      categories,
      filteredProducts,
      allImagePreviews,
      openModal,
      closeModal,
      toggleFormSize,
      toggleFormColor,
      colorPalette,
      newColorInput,
      addCustomColor,
      handleImageFile,
      removePreviewImage,
      saveProduct,
      handleDelete
    };
  }
};
</script>
