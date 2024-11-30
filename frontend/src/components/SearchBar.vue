<script setup lang="ts">
import { computed } from 'vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

// Create a computed property that syncs with store.searchQuery
const searchQuery = computed({
  get: () => store.searchQuery,
  set: (newValue) => {
    store.searchQuery = newValue;
  }
});
</script>

<template>
  <div class="search-bar">
    <input v-model="searchQuery" type="text" placeholder="Filter Techniques..." />
  </div>
</template>

<style scoped>

input[type="text"] {
  padding: 9px;
  font-size: 13.3px;
  border: 2px solid #555;
  border-radius: 5px;
  width: 150;
  height: 30px;
}
</style>
