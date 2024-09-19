<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  import NumberTechniquesPerTactic from '@/components/insights/NumberTechniquesPerTactic.vue';
  import NumberTechniquesPerPlaftorm from '@/components/insights/NumberTechniquesPerPlaftorm.vue';
  import NumberTechniquesPerGroup from '@/components/insights/NumberTechniquesPerGroup.vue';
  import NumberTechniquesPerSoftware from '@/components/insights/NumberTechniquesPerSoftware.vue';
  import MostUsedTechniquesBySoftwares from '@/components/insights/MostUsedTechniquesBySoftwares.vue';
  import MostUsedTechniquesByGroups from '@/components/insights/MostUsedTechniquesByGroups.vue';
  import MostUsedTechniquesTotal from '@/components/insights/MostUsedTechniquesTotal.vue';
</script>

<template>
  <div class="horizontal-container">
    <NumberTechniquesPerTactic/>
    <NumberTechniquesPerPlaftorm/>
    <NumberTechniquesPerGroup/>
    <NumberTechniquesPerSoftware/>
    <MostUsedTechniquesByGroups/>
    <MostUsedTechniquesBySoftwares/>
    <MostUsedTechniquesTotal/>
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