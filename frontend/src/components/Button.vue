<script setup lang="ts">

  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore()

  // defineProps(['technique']);
  const props = defineProps(['technique']);

  const getHoverText = () => {
    if (!props.technique.sub_techniques) {
      return  `Technique ID: ${props.technique.external_id}\n\nNo Subtechniques`;
    } else {
      // Concatenate names and external IDs of subtechniques.
      const subtechniques_string = props.technique.sub_techniques.map(sub => `- ${sub.name} (${sub.external_id})`).join('\n');
      return `Technique ID: ${props.technique.external_id}\n\nSubtechniques:\n${subtechniques_string}`
    }
  };
  
  const toggleVisibility = () => {
    store.toggleTechniqueVisiblity(props.technique);
  }

</script>


// Info over hover https://bootstrap-vue.org/docs/directives/hover

<!-- @click=toggleVisibility() -->
<template>
  <button
    :style="{ backgroundColor: technique.visibility ? 'red' : '' }"
    :title="getHoverText()"
  >
    <!-- <span class="buttontext">{{ technique.name }} <br> {{ technique.external_id }}</span> -->
    <span class="buttontext">{{ technique.name }}</span>
  </button>
</template>


<style scoped>
button {
  margin-top: 0px;
  margin-bottom: 0px;
  background-color: rgb(215, 240, 242);
  /* border: 1px solid black; */
  /* border-radius: 5px; */
}

.buttontext {
  width: 100px;
  height: 28px;
  font-size: 12px;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
  text-align: center;
}

</style>