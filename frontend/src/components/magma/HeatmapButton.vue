<script setup lang="ts">
import { magmaStore } from '@/stores/magma';
import { ref, onMounted, computed } from 'vue';

const props = defineProps(['technique']);
const magma = magmaStore();

// Tooltip variables.
let showTooltipBool = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
let tooltipPosition = ref({ top: 0, left: 0 });

// Function to calculate the cumulative scroll positions of all ancestors.
function calculateScroll(e) {
  if (e && e.parentNode) {
    const [scrollTop, scrollLeft] = calculateScroll(e.parentNode);
    return [(e.scrollTop || 0) + scrollTop, (e.scrollLeft || 0) + scrollLeft];
  } else {
    return [0, 0];
  }
};

// Update the tooltip position relative to the document.
function updateTooltipPosition() {
  const buttonRect = buttonRef.value.getBoundingClientRect();
  const [scrollTop, scrollLeft] = calculateScroll(buttonRef.value);

  // Adjust tooltip position to be relative to the document
  tooltipPosition.value.top = buttonRect.bottom + scrollTop - 222; // Position below the button
  tooltipPosition.value.left = buttonRect.left + scrollLeft + 5; // Position the tooltip horizontally
};


function showTooltip() {
  updateTooltipPosition();
  showTooltipBool.value = true;
}

function hideTooltip() {
  showTooltipBool.value = false;
}


function getBackgroundColor() {

  // Gather the use cases that are related to the technique.
  const relatedUseCases = magma.getUseCasesByAttackTechniqueId(props.technique.external_id);

  // Heatmap style: weight
  if (magma.heatmapVisibility && magma.heatmapImplementation && magma.heatmapEffectiveness) {
    const averageWeight = relatedUseCases.reduce((sum, useCase) => sum + useCase.weight/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageWeight})`;
  }

  // Heatmap style: visibility * implementation
  if (magma.heatmapVisibility && magma.heatmapImplementation) {
    const averageVisImp = relatedUseCases.reduce((sum, useCase) => sum + (useCase.visibility/100 * useCase.implementation/100), 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageVisImp})`;
  }

  // Heatmap style: implementation * effectiveness
  if (magma.heatmapImplementation && magma.heatmapEffectiveness) {
    const averageImpEff = relatedUseCases.reduce((sum, useCase) => sum + (useCase.implementation/100 * useCase.effectiveness/100), 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageImpEff})`;
  }

  // Heatmap style: visibility
  if (magma.heatmapVisibility) {
    const averageVisibility = relatedUseCases.reduce((sum, useCase) => sum + useCase.visibility/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageVisibility})`;
  }

  // Heatmap style: implementation
  if (magma.heatmapImplementation) {
    const averageImplementation = relatedUseCases.reduce((sum, useCase) => sum + useCase.implementation/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageImplementation})`;
  }

  // Heatmap style: effectiveness
  if (magma.heatmapEffectiveness) {
    const averageEffectiveness = relatedUseCases.reduce((sum, useCase) => sum + useCase.effectiveness/100, 0) / relatedUseCases.length;
    return `rgba(0, 255, 0, ${averageEffectiveness})`;
  }

}


function getTooltipText() {
  const relatedUseCases = magma.getUseCasesByAttackTechniqueId(props.technique.external_id);
  const parentUseCases = relatedUseCases.map(x => magma.getParentUseCases(x));
  const grandParentUseCases = parentUseCases.map(x => magma.getParentUseCases(x));
  const averageWeight = relatedUseCases.reduce((sum, useCase) => sum + useCase.weight/100, 0) / relatedUseCases.length;
  const averageVisibility = relatedUseCases.reduce((sum, useCase) => sum + useCase.visibility/100, 0) / relatedUseCases.length;
  const averageImplementation = relatedUseCases.reduce((sum, useCase) => sum + useCase.implementation/100, 0) / relatedUseCases.length;
  const averageEffectiveness = relatedUseCases.reduce((sum, useCase) => sum + useCase.effectiveness/100, 0) / relatedUseCases.length;
  
  const tooltipText = `<a href='https://attack.mitre.org/techniques/${props.technique.external_id}/' target="_blank">${props.technique.name}</a> (${props.technique.external_id})\n\n<hr/>
  Weight: ${((averageWeight || 0) * 100).toFixed(0)}%
  Visibility: ${((averageVisibility || 0) * 100).toFixed(0)}%
  Implementation: ${((averageImplementation || 0) * 100).toFixed(0)}%
  Effectiveness: ${((averageEffectiveness || 0) * 100).toFixed(0)}%

  <hr/>
  Related L3 Use Cases: ${relatedUseCases.length}
  Related L2 Use Cases: ${parentUseCases.length}
  Related L1 Use Cases: ${grandParentUseCases.length}
  `
  return tooltipText
};


const showButton = computed(() => {

  // Gather the use cases that are related to the technique.
  const relatedUseCases = magma.getUseCasesByAttackTechniqueId(props.technique.external_id);

  let currentValue = 0;

  // Heatmap style: weight
  if (magma.heatmapVisibility && magma.heatmapImplementation && magma.heatmapEffectiveness) {
    const averageWeight = relatedUseCases.reduce((sum, useCase) => sum + useCase.weight/100, 0) / relatedUseCases.length;
    currentValue = (averageWeight||0)*100;
  } 

  // Heatmap style: visibility * implementation
   else if (magma.heatmapVisibility && magma.heatmapImplementation) {
    const averageVisImp = relatedUseCases.reduce((sum, useCase) => sum + (useCase.visibility/100 * useCase.implementation/100), 0) / relatedUseCases.length;
    currentValue = (averageVisImp||0)*100;
  }

  // Heatmap style: implementation * effectiveness
  else if (magma.heatmapImplementation && magma.heatmapEffectiveness) {
    const averageImpEff = relatedUseCases.reduce((sum, useCase) => sum + (useCase.implementation/100 * useCase.effectiveness/100), 0) / relatedUseCases.length;
    currentValue = (averageImpEff||0)*100;
  }

  // Heatmap style: visibility
  else if (magma.heatmapVisibility) {
    const averageVisibility = relatedUseCases.reduce((sum, useCase) => sum + useCase.visibility/100, 0) / relatedUseCases.length;
    currentValue = (averageVisibility||0)*100;
  }

  // Heatmap style: implementation
  else if (magma.heatmapImplementation) {
    const averageImplementation = relatedUseCases.reduce((sum, useCase) => sum + useCase.implementation/100, 0) / relatedUseCases.length;
    currentValue = (averageImplementation||0)*100;
  }

  // Heatmap style: effectiveness
  else if (magma.heatmapEffectiveness) {
    const averageEffectiveness = relatedUseCases.reduce((sum, useCase) => sum + useCase.effectiveness/100, 0) / relatedUseCases.length;
    currentValue = (averageEffectiveness||0)*100;
  }

  // Compute whether the button should be shown based on its current value (based on the heatmap style checkmarks) and the heatmapFilterValue.
  if (currentValue >= magma.heatmapFilterValue) {
    return true;
  } else {
    return false;
  }

});


</script>

<template>
  <button v-if="showButton"
    ref="buttonRef"
    :style="{'background-color': getBackgroundColor()}"
    @mouseover="showTooltip"
    @mouseleave="hideTooltip"
  >
    <span class="buttontext">{{ technique.name }}</span>

    <div v-if="showTooltipBool" class="tooltip"
       :style="{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }"
    >
      <div v-html="getTooltipText()"></div>
    </div>
    
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

button:hover {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 3px, rgb(51, 51, 51) 0px 0px 0px 2.5px; /* On hover, add a thick black 'outline' to the button. */
  z-index: 1001;
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

.tooltip {
  position: fixed; /* Use fixed positioning for better control */
  background-color: rgba(93, 125, 152, 0.9);
  color: white;
  border: 1px solid black;
  padding: 4px 4px;
  border-radius: 4px;
  font-size: 11px;
  z-index: 1002; /* Ensure tooltip is always on top */
  width: 200px;
  text-align: left;
  white-space: pre-line;
}

</style>