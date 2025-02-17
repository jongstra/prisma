<script setup lang="ts">
import { ref, computed , watch} from 'vue'
import '@vueform/slider/themes/default.css'
import Slider from '@vueform/slider'
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const value = ref(0) // Default knob position: 0

// Watch the 'value' ref and update the store when it changes
watch(value, (newValue) => {
  store.minTotalOccurrencesBinned = newValue;
});

const formatTooltip = computed(() => (value: number) => {
  if (value <= 0) return 'Low';
  if (value === 1) return 'Medium';
  if (value === 2) return 'High';
  if (value >= 3) return 'Very High';
});

</script>

<template>
  <div class="slider-container">
    <Slider
      v-model="value"
      :min="0"
      :max="3"
      :interval="1"
      :showTooltip="'always'"
      :format="formatTooltip"
    />
    <p class="slider-title">Minimum Total Occurrence</p>
  </div>
</template>

<style scoped>
.slider-container {
  margin-top: 0px;
  margin-bottom: 0px;
  padding-top: 36px;
  padding-left: 20px;
  padding-right: 33px;
  padding-bottom: 3px;
  border: 2px solid #555;
  border-radius: 5px;
  background-color: #ddd;
  width: 250px;
  height: 70px;

  /* Customizing the tooltips */
  --slider-tooltip-line-height: 0.6rem;
  --slider-tooltip-font-size: 0.6rem;

  /* Customizing tooltip colors */
  --slider-tooltip-bg: #333; /* Background color */
  --slider-tooltip-color: #fff; /* Text color */
  --slider-tooltip-border-radius: 4px; /* Optional: Border radius */
}

.slider-title {
  margin-top: 3px;
  font-size: 12px;
  text-align: center;
}

/* Customizing the background color of the connected part */
.slider-container :deep(.slider-connect) {
  background-color: firebrick;
}

/* Customizing the unselected parts */
.slider-container :deep(.slider-base) {
  background-color: seashell; /* Background color for the unselected track */
}
</style>
