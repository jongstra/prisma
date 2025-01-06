<script setup lang="ts">
import { computed, ref } from 'vue';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();

// Computed property to determine the domain based on the store state
const domain = computed(() => {
  if (store.domain === 'enterprise-attack') {
    return store.enterprise;
  } else if (store.domain === 'mobile-attack') {
    return store.mobile;
  } else if (store.domain === 'ics-attack') {
    return store.ics;
  }
  return { groups: [] }; // Default value if no domain matches
});

// Computed property to get only the selected groups
const selectedGroups = computed(() => {
  if (!domain.value.groups) return [];
  return domain.value.groups.filter(group => group.selected === true);
});

// Function to remove the 'selected' property from a group
const removeSelection = (group: { id: string, selected: boolean }) => {
  delete group.selected;
};

// Function to clear all selections
const clearAllSelections = () => {
  domain.value.groups.forEach(group => delete group.selected);
};

// Function to clear selections with confirmation.
const confirmClearAllSelections = () => {
  if (selectedGroups.value.length === 0) {
    // No selected groups, do nothing
    return;
  }

  if (confirm('Are you sure you want to clear all selections?')) {
    clearAllSelections();
  }
};

// Search field functionality
const searchQuery = ref('');
const filteredGroups = computed(() => {
  if (!searchQuery.value) return [];
  return domain.value.groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Function to add a new selected group
const selectGroup = (group: { id: string, name: string }) => {
  group.selected = true;
  searchQuery.value = ''; // Clear the search query after selection
};

// Function to add a group from search (only if it exists)
const addGroupFromSearch = () => {
  const existingGroup = domain.value.groups.find(group =>
    group.name.toLowerCase() === searchQuery.value.toLowerCase()
  );
  if (existingGroup) {
    selectGroup(existingGroup);
  }
};

// Computed property to get and set the only_show_selected_groups value
const onlyShowSelectedGroups = computed({
  get: () => domain.value.only_show_selected_groups,
  set: (value) => {
    if (store.domain === 'enterprise-attack') {
      store.enterprise.only_show_selected_groups = value;
    } else if (store.domain === 'mobile-attack') {
      store.mobile.only_show_selected_groups = value;
    } else if (store.domain === 'ics-attack') {
      store.ics.only_show_selected_groups = value;
    }
  },
});
</script>

<template>
  <div class="group-container">
    <div class="header">
      <input class='group-search-box' v-model="searchQuery" placeholder="Search groups..." @keydown.enter="addGroupFromSearch" />
      <button class='clear-all-button' @click="confirmClearAllSelections">Clear</button>
      <label class="toggle-label">
        <input type="checkbox" v-model="onlyShowSelectedGroups" />
        <span class="toggle-switch" title="Only show techniques used by selected groups."></span>
      </label>
    </div>
    <div v-if="filteredGroups.length && searchQuery" class="suggestions">
      <div 
        v-for="group in filteredGroups" 
        :key="group.id" 
        class="suggestion-item"
        @click="selectGroup(group)"
      >
        {{ group.name }}
      </div>
    </div>
    <div class="buttons-wrapper">
      <button
        v-for="group in selectedGroups" 
        :key="group.id" 
        @click="removeSelection(group)"
      >
        {{ group.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.group-container {
  padding: 2px;
  font-size: 14px;
  border: 2px solid #555;
  border-radius: 5px;
  background-color: #ddd;
  width: 265px;
  height: 70px;
  position: relative; /* Ensure absolute positioning is relative to this container */
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
  background-color: rgb(255, 104, 104);
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
  background-color: rgb(225, 52, 52);
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
  position: absolute; /* Position absolutely within the group-container */
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
