<script setup lang="ts">
  import Button from './Button.vue';
  defineProps(['tactic', 'techniques']);
</script>


<template>
  <div class="button-column">
    
    <!-- Tactic -->
    <div class="button-column-tactic-name-div">
      <p class="button-column-tactic-name"> {{ tactic.name }} </p>
    </div>

    <!-- Technique count statistic -->
    <div class="button-column-stats-div">
      <p class="button-column-stats1"> {{ tactic.techniques.length }} techniques </p>
      
      <!-- Compute the tactic-visiblity solely based on the amount of visible techniques. -->
      <!-- <p class="button-column-stats2"> {{ Math.round(tactic.techniques.filter(technique => technique.visibility).length / tactic.techniques.length * 100) }}% visibility </p> -->
      
      <!-- Compute the tactic-visibility based on the technique alpha value (which is a weighted value based on the visibility of the technique AND its sub techniques). -->
      <p class="button-column-stats2">{{ Math.round(tactic.techniques.reduce((sum, technique) => sum + (technique.visibility ? technique.alpha : 0), 0) / tactic.techniques.length * 100) }}% visibility</p>
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

.button-column-tactic-name-div, .button-column-stats-div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-column-tactic-name {
  align-content: flex-end;
  height: 40px;
  width: 110px;
  margin-bottom: 5px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.button-column-stats1 {
  font-size: 12px;
  margin-bottom: 3px;
}

.button-column-stats2 {
  font-size: 9px;
  margin-bottom: 3px;
}


</style>