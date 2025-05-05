<script setup lang="ts">
  import VisibilityPerTactic from '@/components/insights/VisibilityPerTactic.vue';
  import VisibilityPerPlatform from '@/components/insights/VisibilityPerPlatform.vue';
  import NewComponentSuggester from '@/components/insights/NewComponentSuggester.vue';
  import CoverageComponentSuggester from '@/components/insights/CoverageComponentSuggester.vue';
  import NumberTechniquesPerTactic from '@/components/insights/NumberTechniquesPerTactic.vue';
  import NumberTechniquesPerPlaftorm from '@/components/insights/NumberTechniquesPerPlaftorm.vue';
  import NumberTechniquesPerGroup from '@/components/insights/NumberTechniquesPerGroup.vue';
  import NumberTechniquesPerSoftware from '@/components/insights/NumberTechniquesPerSoftware.vue';
  import TechniquesOccurrenceBySoftware from '@/components/insights/TechniquesOccurrenceBySoftware.vue';
  import TechniquesOccurrenceByGroups from '@/components/insights/TechniquesOccurrenceByGroups.vue';
  import TechniquesOccurrenceTotal from '@/components/insights/TechniquesOccurrenceTotal.vue';
</script>

<template>
  <div class="horizontal-container">
    <VisibilityPerTactic/>
    <VisibilityPerPlatform/>
    <NewComponentSuggester/>
    <CoverageComponentSuggester/>
    <NumberTechniquesPerTactic/>
    <NumberTechniquesPerPlaftorm/>
    <NumberTechniquesPerGroup/>
    <NumberTechniquesPerSoftware/>
    <TechniquesOccurrenceByGroups/>
    <TechniquesOccurrenceBySoftware/>
    <TechniquesOccurrenceTotal/>
  </div>
</template>

<style scoped>
.horizontal-container {
  display: flex;
  flex-wrap: wrap; /* This will allow items to wrap to the next line */
  justify-content: flex-start; /* Adjust as needed to control spacing */
}
</style>