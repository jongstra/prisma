<script setup lang="ts">
import { magmaStore } from '@/stores/magma';

const magma = magmaStore();
</script>


<template>

  <div class="heatmap-settings-checkboxes">

    <label>
      <input
        type="checkbox"
        v-model="magma.heatmapVisibility"
      />
      Visibility
    </label>

    <label>
      <input
        type="checkbox"
        v-model="magma.heatmapImplementation"
      />
      Implementation
    </label>

    <label>
      <input
        type="checkbox"
        v-model="magma.heatmapEffectiveness"
      />
      Effectiveness
    </label>

  </div>

</template>


<style scoped>

div.heatmap-settings-checkboxes {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  border: 1.5px solid black;
  border-radius: 4px;
  width: 150px;
  height: 70px;
  background-color: lightgray;
  margin-right: 5px;
}

input[type="checkbox"] {
  margin-right: 4px;
}

label {
  display: flex;
  text-align: left;
  align-items: center;
  font-size: 14px;
  padding-left: 5px;
  background-color: #ddd;
  border: 1px solid black;
  border-radius: 4px;
  width: 140px;
  height: 20px;
}

</style>
