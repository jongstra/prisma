<script setup lang="ts">
import InsightNUmberUseCasesPerLayer from './InsightNUmberUseCasesPerLayer.vue';
import InsightHighestPontentialL3UseCases from './InsightHighestPontentialL3UseCases.vue';
</script>


<template>

<div class="magma-insights">
  <InsightNUmberUseCasesPerLayer/>
  <InsightHighestPontentialL3UseCases/>
</div>

</template>


<style scoped>
.magma-insights {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}
</style>