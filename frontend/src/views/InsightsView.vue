<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  import TechniquesPerTactic from '@/components/insights/TechniquesPerTactic.vue';
  import TechniquesPerPlaftorm from '@/components/insights/TechniquesPerPlaftorm.vue';
  import TechniquesPerGroup from '@/components/insights/TechniquesPerGroup.vue';
</script>

<template>
  <div class="horizontal-container">
    <TechniquesPerTactic/>
    <TechniquesPerPlaftorm/>
    <TechniquesPerGroup/>
  </div>
</template>

<style>
.horizontal-container {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}

.insight {
  border: 2px solid black;
  padding: 2px;
  margin: 2px;
  border-radius: 5px;
  flex: 1 1 calc(33% - 40px); /* Each item takes up about a third of the row, with some space between */
}
</style>