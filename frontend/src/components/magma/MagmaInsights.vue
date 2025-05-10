<script setup lang="ts">
import InsightNumberUseCasesPerLayer from './InsightNumberUseCasesPerLayer.vue';
import InsightHighestPontentialL3UseCases from './InsightHighestPontentialL3UseCases.vue';
import InsightMostFrequentlyLinkedAttackTechniques from './InsightMostFrequentlyLinkedAttackTechniques.vue';
import InsightMostFrequentDataSources from './InsightMostFrequentDataSources.vue';
</script>


<template>

<div class="magma-insights">
  <InsightNumberUseCasesPerLayer/>
  <InsightHighestPontentialL3UseCases/>
  <InsightMostFrequentlyLinkedAttackTechniques/>
  <InsightMostFrequentDataSources/>
</div>

</template>


<style scoped>
.magma-insights {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}
</style>