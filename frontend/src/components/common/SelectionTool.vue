<script setup lang="ts">
// Selects groups or data components of the current domain, to highlight (or only show) the techniques they use or
// cover. Used on the DeTT&CT page (groups and data components) and on the MaGMa heatmap (groups).
import Swal from 'sweetalert2';
import { computed, ref } from 'vue';
import { tacticsStore } from '@/stores/tactics';

const props = defineProps<{
  list: 'groups' | 'data_components'; // the list of the domain to select from
  selectedField: string; // the field that marks an item as selected
  onlyShowField: string; // the domain field that says: only show the techniques of the selected items
  noun: string; // 'group' or 'component', for the texts
  toggleTitle: string;
  color: 'red' | 'green'; // colour of the selected items
}>();

const store = tacticsStore();

const items = computed<any[]>(() => (store.currentDomain as any)?.[props.list] ?? []);

const selectedItems = computed(() => items.value.filter((item) => item[props.selectedField] === true));

const removeSelection = (item: any) => {
  delete item[props.selectedField];
};

const clearAllSelections = () => {
  items.value.forEach((item) => delete item[props.selectedField]);
};

// Clear all selections, after confirmation.
const confirmClearAllSelections = () => {
  if (selectedItems.value.length === 0) {
    return;
  }

  Swal.fire({
    title: `Clear all ${props.noun} selections?`,
    text: "You won't be able to revert this.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: 'green',
    confirmButtonText: `Yes, clear all ${props.noun} selections`,
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      clearAllSelections();
    }
  });
};

// Search field: suggestions while typing; Enter selects an item with exactly that name.
const searchQuery = ref('');
const filteredItems = computed(() => {
  if (!searchQuery.value) return [];
  return items.value.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const selectItem = (item: any) => {
  item[props.selectedField] = true;
  searchQuery.value = '';
};

const addItemFromSearch = () => {
  const existingItem = items.value.find((item) => item.name.toLowerCase() === searchQuery.value.toLowerCase());
  if (existingItem) {
    selectItem(existingItem);
  }
};

const onlyShowSelected = computed({
  get: () => (store.currentDomain as any)?.[props.onlyShowField],
  set: (value) => {
    if (store.currentDomain) {
      (store.currentDomain as any)[props.onlyShowField] = value;
    }
  },
});
</script>

<template>
  <div class="selection-container" :class="`items-${color}`">
    <div class="header">
      <input class='search-box' v-model="searchQuery" :placeholder="`Search ${noun}s...`" @keydown.enter="addItemFromSearch" />
      <button class='clear-all-button' @click="confirmClearAllSelections">Clear</button>
      <label class="toggle-label">
        <input type="checkbox" v-model="onlyShowSelected" />
        <span class="toggle-switch" :title="toggleTitle"></span>
      </label>
    </div>
    <div v-if="filteredItems.length && searchQuery" class="suggestions">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="suggestion-item"
        @click="selectItem(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="buttons-wrapper">
      <button
        v-for="item in selectedItems"
        :key="item.id"
        @click="removeSelection(item)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.selection-container {
  --item-color: rgb(255, 104, 104);
  --item-hover-color: rgb(225, 52, 52);
  padding: 2px;
  font-size: 14px;
  border: 2px solid #555;
  border-radius: 5px;
  background-color: #ddd;
  width: 265px;
  height: 70px;
  position: relative; /* Ensure absolute positioning is relative to this container */
}

.selection-container.items-green {
  --item-color: rgb(110, 220, 110);
  --item-hover-color: rgb(55, 190, 55);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;
}

input {
  flex: 1;
  margin: 0px 5px;
  padding: 2px 8px;
  border: 1px solid #555;
  border-radius: 4px;
  height: 26px;
  font-size: 13.3px;
  min-width: 165px;
}

button {
  display: inline-block;
  padding: 0px 3px;
  margin-right: 2px;
  margin-bottom: 2px;
  background-color: var(--item-color);
  border-width: 1.5px;
  border-style: solid;
  border-color: #000;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  font-size: 11px;
  height: 18px;
}

button:hover {
  background-color: var(--item-hover-color);
}

button::before {
  content: '\2715'; /* Unicode for 'X' */
  margin-right: 4px;
  font-size: 12px;
  color: #ffffff;
}

.clear-all-button {
  height: 25px;
  background-color: pink;
  margin-right: 0px;
  margin-bottom: 0px;
}

.clear-all-button::before {
  content: '';
  margin-right: 0px;
}

.clear-all-button:hover {
  background-color: hotpink;
}

.suggestions {
  position: absolute; /* Position absolutely within the selection-container */
  left: 5px;
  right: 5px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 10; /* Ensure it appears above other elements */
}

.suggestion-item {
  padding: 5px 10px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}

.buttons-wrapper {
  position: absolute; /* Make the wrapper take up remaining space */
  top: 32px; /* Adjusted to account for reduced header height and padding */
  left: 5px;
  right: 5px;
  bottom: 2px;
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap onto the next line */
  overflow-y: auto; /* Add vertical scrollbar only to this div */
}

/* Toggle switch styles */
.toggle-label {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 40px;
}

.toggle-switch {
  position: absolute;
  top: -1px; /* Adjusted for vertical alignment */
  left: 3px;
  width: 36px;
  height: 20px;
  background-color: #ccc;
  border-radius: 34px;
  transition: .4s;
}

.toggle-switch:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.toggle-label input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label input:checked + .toggle-switch {
  background-color: #2196F3;
}

.toggle-label input:checked + .toggle-switch:before {
  transform: translateX(16px);
}
</style>
