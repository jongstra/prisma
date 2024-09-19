<script setup lang="ts">
  import ButtonColumn from '../components/ButtonColumn.vue';
  import { tacticsStore } from '@/stores/tactics';
  import FileUploadButtonJson from '@/components/FileUploadButtonJson.vue';
  import FileUploadButtonYaml from '@/components/FileUploadButtonYaml.vue';
  import TechniqueAttributeFilter from '@/components/TechniqueAttributeFilter.vue';
  import TechniquePercentageFilter from '@/components/TechniquePercentageFilter.vue';
  import ColorLegend from '@/components/ColorLegend.vue';
  import SearchBar from '@/components/SearchBar.vue';
  const store = tacticsStore();
</script>


<template>
  <div class='controls'>

    <div class='upload-button'>
      <!-- <FileUploadButtonJson/> -->
      <FileUploadButtonYaml/>
    </div>

    <div class='filter'>
      <TechniqueAttributeFilter attribute_type="platforms"/>
    </div>
    <!-- <div class='filter'>
      <TechniqueAttributeFilter attribute_type="data_sources"/>
    </div> -->
    <!-- <div class='filter'>
      <TechniqueAttributeFilter attribute_type="data_components"/>
    </div> -->

    <div class='filter'>
      <TechniquePercentageFilter/>
    </div>

    <div class='search'>
      <SearchBar/>
    </div>

  </div>

  <div class='legend'>
      <ColorLegend/>
  </div>

  <div class='attack-matrix'>

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
  margin-top: 0px;
  margin-bottom: 3px;
  border: 2px solid black;
  border-radius: 5px;
  max-width: 900px;
}

.upload-button  {
  margin-top: 7px;
}

.legend {
  margin-top: 5px;
}

.attack-matrix {
  display: flex;
  overflow-x: auto; /* Enable horizontal scrollbar */
  width: fit-content;
}

.button-columns {
  flex: 1; /* Allow components to grow and take up available space */
  width: auto; /* Allow components to take their natural width */
  margin-right: 4px; /* Adjust spacing between components */
  margin-bottom: 800px; /* Forces a bottom margin to create space for the Tooltip when hovering Technique Buttons. */
}
</style>