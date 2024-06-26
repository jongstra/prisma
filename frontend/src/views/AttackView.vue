<script setup lang="ts">
  import ButtonColumn from '../components/ButtonColumn.vue';
  import FileUploadButton from '@/components/FileUploadButton.vue';
  import { tacticsStore } from '@/stores/tactics';
  import { onMounted } from 'vue';
  const store = tacticsStore();
  onMounted(() => {store.fetchTactics();}); // Fetch tactics json from Python backend for Pinia store.

</script>


<template>

  <FileUploadButton></FileUploadButton>

  <!-- <div class="attack-statistics">
    <div class="statistic"><p>Reconaissance visibility: {{ store.tacticStats[0]["visibilityPercentage"] }}%</p></div>
    <div class="statistic"><p>Resource Development visibility: {{ store.tacticStats.find(stat => stat.name === 'Resource Development')?.visibilityPercentage.toFixed(2)|| 0 }}%</p></div>
    <div class="statistic"><p>Initial Access visibility: {{ store.tacticStats.find(stat => stat.name === 'Initial Access')?.visibilityPercentage.toFixed(2)|| 0 }}%</p></div>
    <div class="statistic"><p>Execution visibility: {{ store.tacticStats.find(stat => stat.name === 'Execution')?.visibilityPercentage.toFixed(2)|| 0 }}%</p></div>
  </div> -->

  <div class="attack-matrix">
      <div v-for="tactic in store.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
    </div>
  </div>
</template>


<style>
h2 {
  text-align: center;
  height: 100px;
}

.attack-statistics {
  display: flex;
  justify-content: space-around;
  background-color: #eeeeee;
  margin-bottom: 20px;
  border: 3px solid black;
  border-radius: 5px;
}

.statistic {
  flex-grow: 1;
  text-align: center;
  background-color: #cdebba;
  color: #000000;
  font-size: 20px;
  font-weight: bold;
  border: 3px solid black;
  margin: 4px;
  border-radius: 5px;
}


.attack-matrix {
  display: flex;
  overflow-x: auto; /* Enable horizontal scrollbar */
  width: fit-content;
}

.button-columns {
  flex: 1; /* Allow components to grow and take up available space */
  width: auto; /* Allow components to take their natural width */
  margin-right: 8px; /* Adjust spacing between components */
}
</style>