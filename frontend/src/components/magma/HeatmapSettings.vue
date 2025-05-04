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
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  border: 1.5px solid black;
  border-radius: 4px;
  width: 450px;
  height: 40px;
  margin-top: 5px;
  margin-bottom: 3px;
  background-color: lightgray;
}

input[type="checkbox"] {
  margin-right: 4px;
}

label {
  display: flex;
  text-align: left;
  padding: 3px;
  margin: 2px;
  background-color: #ddd;
  border: 1.5px solid black;
  border-radius: 4px;
  width: 140px;
  height: 28px;
}

</style>
