<script setup lang="ts">
import { magmaStore } from '@/stores/magma';

const props = defineProps(['technique']);
const magma = magmaStore();


function getBackgroundColor() {
  const relatedUseCases = magma.getUseCasesByAttackTechniqueId(props.technique.external_id);

  console.log(relatedUseCases);
  // Heatmap style: weight
  if (magma.heatmapVisibility && magma.heatmapImplementation && magma.heatmapEffectiveness) {
    const averageWeight = relatedUseCases.reduce((sum, usecase) => sum + usecase.weight/100, 0) / relatedUseCases.length;
      return `rgba(0, 255, 0, ${averageWeight})`;
  }

  // Heatmap style: visibility * implementation
  if (magma.heatmapVisibility && magma.heatmapImplementation) {
    const averageVisImp = relatedUseCases.reduce((sum, usecase) => sum + (usecase.visibility/100 * usecase.implementation/100), 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageVisImp})`;
  }

  // Heatmap style: implementation * effectiveness
  if (magma.heatmapImplementation && magma.heatmapEffectiveness) {
    const averageImpEff = relatedUseCases.reduce((sum, usecase) => sum + (usecase.implementation/100 * usecase.effectiveness/100), 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageImpEff})`;
  }

  // Heatmap style: visibility
  if (magma.heatmapVisibility) {
    const averageVisibility = relatedUseCases.reduce((sum, usecase) => sum + usecase.visibility/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageVisibility})`;
  }

  // Heatmap style: implementation
  if (magma.heatmapImplementation) {
    const averageImplementation = relatedUseCases.reduce((sum, usecase) => sum + usecase.implementation/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageImplementation})`;
  }

  // Heatmap style: effectiveness
  if (magma.heatmapEffectiveness) {
    const averageEffectiveness = relatedUseCases.reduce((sum, usecase) => sum + usecase.effectiveness/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageEffectiveness})`;
  }



  // switch (heatmapStyle) {
  //   case 'weight':
  //     const averageWeight = relatedTechniques.reduce((sum, item) => sum + item.weight, 0) / relatedTechniques.length;
  //     console.log(averageWeight);
  //     return `rgba(0, 255, 0, ${averageWeight/100})`;
  //   case 'potential':
  //     if (relatedTechniques.length == 0) {
  //       const potential = 1 - props.technique.visibility_ratio;
  //       return `rgba(255, 0, 0, ${potential})`;
  //     } else {
  //       const averagePotential = relatedTechniques.reduce((sum, item) => sum + item.potential, 0) / relatedTechniques.length;
  //       return `rgba(255, 0, 0, ${averagePotential})`;
  //     }
  // }
}

</script>

<template>
  <button
    :style="{'background-color': getBackgroundColor()}"
  >
    <span class="buttontext">{{ technique.name }}</span>
  </button>
</template>

<style scoped>

button {
  margin-top: 0px;
  margin-bottom: 3px;
  /* background-color: rgb(246, 246, 246); */
  background-color: rgb(255, 255, 255);
  border: 2px solid rgb(42, 42, 42);
  border-radius: 4px; /* Slightly rounded corners */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* Smooth transition for hover effects */
  position: relative; /* Ensure the button's stacking context is isolated */
}

.buttontext {
  width: 125px;
  height: 24px;
  font-size: 10.5px;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
  text-align: center;
}

</style>