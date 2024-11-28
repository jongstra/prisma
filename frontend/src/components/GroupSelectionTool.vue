<script setup lang="ts">
import { computed } from 'vue';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();

// Determine the domain based on the store state
let domain;
if (store.domain === 'enterprise-attack') {
  domain = store.enterprise;
} else if (store.domain === 'mobile-attack') {
  domain = store.mobile;
} else if (store.domain === 'ics-attack') {
  domain = store.ics;
}

// Computed property to get only the selected groups
const selectedGroups = computed(() => {
  return domain.groups.filter(group => group.selected === true);
});

// Function to remove the 'selected' property from a group
const removeSelection = (group: { id: string, selected: boolean }) => {
  delete group.selected;
};
</script>


<template>
  <div class="group-container">
    <p>Selected Groups</p>
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


TODO:
- [ ] Put 'Selected Groups' text in a box
- [ ] Add button to clear all groups
- [ ] Add search field to add new groups


<style scoped>

.group-container {
  margin-top: 5px;
  padding: 2px;
  font-size: 14px;
  border: 2px solid #555;
  border-radius: 5px;
  background-color: #ddd;
  width: 500px;
  height: 63px;
  overflow-y: auto; /* Make the container scrollable vertically */
}

.buttons-wrapper {
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap onto the next line */
}

button {
  display: inline-block;
  padding: 5px 10px;
  margin-left: 2px;
  margin-top: 2px;
  background-color: red;
  border-width: 1.5px;
  border-style: solid;
  border-color: #000;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  font-size: 11px;
}

button:hover {
  background-color: #0056b3;
}
</style>
