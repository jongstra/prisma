<script setup lang="ts">
  import ButtonColumn from '../components/ButtonColumn.vue';
  import { tacticsStore } from '@/stores/tactics';
  import FileUploadButtonJson from '@/components/FileUploadButtonJson.vue';
  import FileUploadButtonYaml from '@/components/FileUploadButtonYaml.vue';
  import TechniqueAttributeFilter from '@/components/TechniqueAttributeFilter.vue';
  import TechniqueVisibilityPercentageFilter from '@/components/TechniqueVisibilityPercentageFilter.vue';
  import TechniqueTotalOccurrenceFilter from '@/components/TechniqueTotalOccurrenceFilter.vue';
  import ColorLegend from '@/components/ColorLegend.vue';
  import SearchBar from '@/components/SearchBar.vue';
  const store = tacticsStore();
</script>

<template>
  <div class='controls'>
    <!-- <div class='upload-button'>
      <FileUploadButtonYaml/>
    </div> -->

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
      <TechniqueVisibilityPercentageFilter/>
    </div>

    <div class='filter'>
      <TechniqueTotalOccurrenceFilter/>
    </div>

    <div class='search'>
      <SearchBar/>
    </div>
  </div>

  <div class='legend'>
    <ColorLegend/>
  </div>

  <div class='upload-button'>
    <FileUploadButtonYaml/>
  </div>

  <div class="matrix-container">
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

.upload-button {
  margin-top: 5px;
}

.legend {
  margin-top: 5px;
}

.matrix-container {
  margin-top: 5px;
  overflow-x: auto; /* Enable horizontal scrollbar */
  width: 100%; /* Full width of the parent container */
  transform: rotateX(180deg);  /* Rotates container upside down so the horizontal scrollbar is at the top. */
}

.attack-matrix {
  display: flex;
  width: fit-content; /* Allow content to take up natural width */
  transform: rotateX(180deg); /* Rotates the matrix content upside down AGAIN (after doing this to the .matrix-container), so it rotated back to normal. */
}

.button-columns {
  flex: 1; /* Allow components to grow and take up available space */
  width: auto; /* Allow components to take their natural width */
  margin-right: 4px; /* Adjust spacing between components */
  margin-bottom: 3000px; /* Forces a bottom margin to create space for the Tooltip when hovering Technique Buttons. */
}
</style>
