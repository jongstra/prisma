<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
import { magmaStore } from '@/stores/magma';
const store = tacticsStore();
const magma = magmaStore();

function getCoveredAttackTechniques() {
  const useCases = magma.L3UseCases(store.domain);
  const attackTechniques = new Set();
  useCases.forEach(useCase => {
    attackTechniques.add(useCase.attackTechniqueId); // Add techniqueId to the set.
  });

  // Remove any 'none' entry from attackTechniques, if present.
  attackTechniques.delete('none');

  return attackTechniques
}

function getUsedDataSources() {
  const useCases = magma.L3UseCases(store.domain);
  const dataSources = new Set();
  useCases.forEach(useCase => {
    dataSources.add(useCase.dataSource); // Add dataSource to the set.
  });

  // Remove any 'none' entry from dataSources, if present.
  dataSources.delete('none');

  return dataSources
}

function calculateMean(arr) {
    return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

function getUseCaseStatistics() {
    const useCases = magma.L1UseCases(store.domain);
    const useCaseStatistics = {};
    
    // Calculate mean values for all use cases in the current domain.
    useCaseStatistics.meanVisibility = calculateMean(useCases.map((useCase) => useCase.visibility));
    useCaseStatistics.meanImplementation = calculateMean(useCases.map((useCase) => useCase.implementation));
    useCaseStatistics.meanEffectiveness = calculateMean(useCases.map((useCase) => useCase.effectiveness));
    useCaseStatistics.meanWeight = calculateMean(useCases.map((useCase) => useCase.weight));
    useCaseStatistics.meanPotential = calculateMean(useCases.map((useCase) => useCase.potential));

    return useCaseStatistics;
}

</script>


<template>

<div class="magma-summary">
  <br/>
  <hr>
  <br/>
  <p>Mean Visibility: {{ getUseCaseStatistics().meanVisibility.toFixed(2) }}%</p>
  <p>Mean Implementation: {{ getUseCaseStatistics().meanImplementation.toFixed(2) }}%</p>
  <p>Mean Effectiveness: {{ getUseCaseStatistics().meanEffectiveness.toFixed(2) }}%</p>
  <p>Mean Weight: {{ getUseCaseStatistics().meanWeight.toFixed(2) }}%</p>
  <p>Mean Potential: {{ getUseCaseStatistics().meanPotential.toFixed(2) }}%</p>
  <br/>
  <hr>
  <br/>
  <p>L1 Count: {{ magma.L1UseCases(store.domain).length }}</p>
  <p>L2 Count: {{ magma.L2UseCases(store.domain).length }}</p>
  <p>L3 Count: {{ magma.L3UseCases(store.domain).length }}</p>
  <br/>
  <hr>
  <br/>
  <p>Covered Attack Techniques: {{ getCoveredAttackTechniques().size }}</p>
  <p>Used Data Sources: {{ getUsedDataSources().size }}</p>
</div>

</template>


<style scoped>
.magma-insights {
  display: flex;

  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}
</style>