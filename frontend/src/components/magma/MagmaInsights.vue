<script setup lang="ts">
import InsightNUmberUseCasesPerLayer from './InsightNUmberUseCasesPerLayer.vue';
</script>


<template>

<div class="magma-insights">
  <InsightNUmberUseCasesPerLayer/>
</div>

</template>


<style scoped>
.magma-insights {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}
</style>