<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue';
import { tacticsStore } from '@/stores/tactics';
import { magmaStore } from '@/stores/magma';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps(['technique']);
const tactics = tacticsStore();
const magma = magmaStore();
const id = uuidv4();

const heatmapStyle = 'weight'
// const heatmapStyle = 'potential'


function getBackgroundColor() {
  const relatedTechniques = magma.getUseCasesByAttackTechniqueId(props.technique.external_id);
  switch (heatmapStyle) {
    case 'weight':
      const averageWeight = relatedTechniques.reduce((sum, item) => sum + item.weight, 0) / relatedTechniques.length;
      console.log(averageWeight);
      return `rgba(0, 255, 0, ${averageWeight/100})`;
    case 'potential':
      if (relatedTechniques.length == 0) {
        const potential = 1 - props.technique.visibility_ratio;
        return `rgba(255, 0, 0, ${potential})`;
      } else {
        const averagePotential = relatedTechniques.reduce((sum, item) => sum + item.potential, 0) / relatedTechniques.length;
        return `rgba(255, 0, 0, ${averagePotential})`;
      }
  }
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