<script setup lang="ts">
import { ref, watch } from 'vue';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();
const searchQuery = ref('');

watch(searchQuery, (newValue) => {
  store.setSearchQuery(newValue);
});
</script>

<template>
  <div class="search-bar">
    <input v-model="searchQuery" type="text" placeholder="Search Techniques..." />
  </div>
</template>


<style scoped>
.search-bar {
  margin: 8px;
}
input[type="text"] {
  padding: 9px;
  font-size: 16px;
  border: 2px solid #555;
  border-radius: 5px;
  width: 200px;
}
</style>