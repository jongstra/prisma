<script setup lang="ts">
import { computed } from 'vue';
import { magmaStore } from '@/stores/magma';
const magma = magmaStore();

// Create a computed property that syncs with magma.searchQuery
const searchQuery = computed({
  get: () => magma.heatmapSearchQuery,
  set: (newValue) => {
    magma.heatmapSearchQuery = newValue;
  }
});

</script>

<template>
  <div class="search-bar">
    <input v-model="searchQuery" type="text" placeholder="Search Techniques..." />
  </div>
</template>

<style scoped>

input[type="text"] {
  margin: 15px 0px;
  padding: 9px;
  font-size: 13.3px;
  border: 2px solid #555;
  border-radius: 5px;
  width: 150;
  height: 38px;
}
</style>
