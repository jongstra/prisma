<script setup lang="ts">
  import Button from './Button.vue';
  defineProps(['tactic', 'techniques']);
</script>


<template>
  <div class="button-column">
    
    <!-- Tactic -->
    <div class="button-column-title-div">
      <p class="button-column-title"> {{ tactic.name }} </p>
    </div>

    <!-- Technique count statistic -->
    <div class="button-column-stats-div">
      <p class="button-column-stats"> {{ tactic.techniques.length }} techniques </p>
    </div>

    <!-- Techniques column -->
    <div v-for="(technique, index) in techniques" :key="index">
      <Button :technique="technique"/>
    </div>

  </div>
</template>


<style scoped>
  .button-column {
    display: grid;
    /* grid-template-columns: minmax(160px,1fr); */
    /* gap: 1px; */
    /* display: flex;
    flex-direction: column; */
  }

.button-column-title-div, .button-column-stats-div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-column-title {
  align-content: flex-end;
  height: 34px;
  width: 110px;
  margin-bottom: 5px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.button-column-stats {
  font-size: 12px;
  margin-bottom: 5px;
}

</style>