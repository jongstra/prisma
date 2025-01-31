<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore()
  import SheetTabs from '@/components/magma/SheetTabs.vue';
</script>


<template>

  <div class="magma-container">
    <SheetTabs/>
  </div>
  
</template>


<style>
.magma-container {
  margin-top: 10px;
  text-align: center;
}
</style>
