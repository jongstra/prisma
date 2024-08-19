<script setup lang="ts">

  import { computed } from 'vue';
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

  // Computed property to determine if the button should be shown.
  const showButton = computed(() => {
    const platforms = props.technique?.platforms || [];
    // Use the generalized activeAttributes getter with 'platforms' as the attribute type
    return platforms.some(platform => store.activeAttributes('platforms').includes(platform));
  });

  // // Computed property to determine if the button should be shown.
  // const showButton = computed(() => {
  //   const data_sources = props.technique?.data_sources || [];
  //   // Use the generalized activeAttributes getter with 'data_sources' as the attribute type
  //   return data_sources.some(data_sources => store.activeAttributes('data_sources').includes(data_sources));
  // });

    // // Computed property to determine if the button should be shown.
  // const showButton = computed(() => {
  //   const data_components = props.technique?.data_components || [];
  //   // Use the generalized activeAttributes getter with 'data_components' as the attribute type
  //   return data_components.some(data_components => store.activeAttributes('data_components').includes(data_components));
  // });



  // // Computed property to determine if the button should be shown.
  // const showButton = computed(() => {
  //   const platforms = props.technique?.platforms || [];
  //   const dataSources = props.technique?.data_sources || [];
  //   const dataComponents = props.technique?.data_components || [];

  //   const activePlatforms = store.activeAttributes('platforms') || [];
  //   const activeDataSources = store.activeAttributes('data_sources') || [];
  //   const activeDataComponents = store.activeAttributes('data_components') || [];

  //   // Check if any platform is active
  //   const isPlatformActive = platforms.some(platform => activePlatforms.includes(platform));

  //   // Check if any data source is active
  //   const isDataSourceActive = dataSources.some(dataSource => activeDataSources.includes(dataSource));

  //   // Check if any data component is active
  //   const isDataComponentActive = dataComponents.some(dataComponent => activeDataComponents.includes(dataComponent));

  //   // Return true if any of the above conditions are met
  //   return isPlatformActive || isDataSourceActive || isDataComponentActive;
  // });
  
  
  // TODO: create checkboxes to activate/deactivate the platform/data_sources/data_components filters.


</script>



<template>
  <button v-if="showButton"
    :style="{ backgroundColor: technique.visibility ? `rgba(255, 0, 0, ${technique.alpha})` : '' }"
    :title="getHoverText()"
  >
    <span class="buttontext">{{ technique.name }}</span>
  </button>
</template>


<style scoped>
button {
  margin-top: 0px;
  margin-bottom: 0px;
  background-color: rgb(215, 240, 242);
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