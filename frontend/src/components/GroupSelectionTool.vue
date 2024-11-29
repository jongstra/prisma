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

// Function to add a new group (assuming you have a way to create groups)
const addGroup = (newGroupName: string) => {
  domain.value.groups.push({ id: Date.now().toString(), name: newGroupName, selected: false });
};

// Example of adding a group when search query matches an existing one
const addGroupFromSearch = () => {
  if (searchQuery.value && !domain.value.groups.some(group => group.name.toLowerCase() === searchQuery.value.toLowerCase())) {
    addGroup(searchQuery.value);
    searchQuery.value = '';
  }
};
</script>

<template>
  <div class="group-container">
    <div class="header">
      <div class="title-box">
        <p>Groups</p>
      </div>
      <input class='group-search-box' v-model="searchQuery" placeholder="Search and add groups..." @keydown.enter="addGroupFromSearch" />
      <button class='clear-all-button' @click="clearAllSelections">Clear</button>
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
  width: 460px;
  height: 70px;
  position: relative; /* Ensure absolute positioning is relative to this container */
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px;
}

.title-box {
  background-color: #bbb;
  color: white;
  border: 2px dotted #888;
  padding: 2px 8px;
  border-radius: 4px;
  height: 26px;
  display: flex;
  align-items: center;
}

input {
  flex: 1;
  margin: 0px 5px;
  padding: 2px 8px;
  border: 1px solid #555;
  border-radius: 4px;
  height: 26px;
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
  background-color: red;
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

</style>
