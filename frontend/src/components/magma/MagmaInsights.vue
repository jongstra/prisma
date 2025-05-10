<script setup lang="ts">
import InsightNumberUseCasesPerLayer from './InsightNumberUseCasesPerLayer.vue';
import InsightImprovementPontentialForL3UseCases from './InsightImprovementPontentialForL3UseCases.vue';
import InsightImprovementPontentialL3UseCasesForL1UseCase from './InsightImprovementPontentialL3UseCasesForL1UseCase.vue';
import InsightMostFrequentlyLinkedAttackTechniques from './InsightMostFrequentlyLinkedAttackTechniques.vue';
import InsightNumberOfUseCasesPerDataSource from './InsightNumberOfUseCasesPerDataSource.vue';
import InsightNumberOfUniqueAttackTechniquesPerDataSource from './InsightNumberOfUniqueAttackTechniquesPerDataSource.vue';
import { tacticsStore } from '@/stores/tactics';
import { magmaStore } from '@/stores/magma';
const store = tacticsStore();
const magma = magmaStore();
</script>


<template>

<div class="magma-insights">
  <InsightNumberUseCasesPerLayer/>
  <InsightImprovementPontentialForL3UseCases/>
  <InsightMostFrequentlyLinkedAttackTechniques/>
  <InsightNumberOfUseCasesPerDataSource/>
  <InsightNumberOfUniqueAttackTechniquesPerDataSource/>
  <div v-for="L1UseCase in magma.L1UseCases(store.domain)"> 
    <InsightImprovementPontentialL3UseCasesForL1UseCase :L1UseCase=L1UseCase :relatedL3UseCases=magma.getGrandChildUseCases(L1UseCase) />
  </div>
</div>

</template>
L1UseCase

<style scoped>
.magma-insights {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}
</style>