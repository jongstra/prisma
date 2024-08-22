<script setup lang="ts">
  import ButtonColumn from '../components/ButtonColumn.vue';
  import { tacticsStore } from '@/stores/tactics';
  import FileUploadButtonJson from '@/components/FileUploadButtonJson.vue';
  import FileUploadButtonYaml from '@/components/FileUploadButtonYaml.vue';
  import TechniqueFilter from '@/components/TechniqueFilter.vue';
  import SearchBar from '@/components/SearchBar.vue';
  const store = tacticsStore();
</script>


<template>

  <div class='upload-button'>
      <!-- <FileUploadButtonJson/> -->
      <FileUploadButtonYaml/>
  </div>

  <div class='controls'>

    <div class='filter'>
      <TechniqueFilter attribute_type="platforms"/>
    </div>
    <!-- <div class='filter'>
      <TechniqueFilter attribute_type="data_sources"/>
    </div> -->
    <!-- <div class='filter'>
      <TechniqueFilter attribute_type="data_components"/>
    </div> -->

    <div class='search'>
      <SearchBar/>
    </div>

  </div>
  

  <div class="attack-matrix">

      <div v-if="store.domain === 'enterprise-attack'" v-for="tactic in store.enterprise.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else-if="store.domain === 'mobile-attack'" v-for="tactic in store.mobile.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else-if="store.domain === 'ics-attack'" v-for="tactic in store.ics.tactics" class="button-columns">
        <ButtonColumn :tactic=tactic :techniques=tactic.techniques />
      </div>

      <div v-else>
        <br>
        <p>Please upload a DETT&CT File using the button above.</p>
      </div>

  </div>
</template>


<style>
h2 {
  text-align: center;
  height: 100px;
}

.controls {
  display: flex;
  justify-content: space-around;
  background-color: #cccccc;
  margin-top: 10px;
  margin-bottom: 5px;
  border: 2px solid black;
  border-radius: 5px;
  max-width: 800px;
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