<template>
  <div class="legend-box">
    <h3>Legend (Visibility)</h3>
    <div class="legend-items">
      <div v-for="item in legendItems" :key="item.range" class="legend-item">
        <button
          :style="{ backgroundColor: item.color, color: item.textColor }"
          class="legend-button"
        >
          {{ item.range }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const legendItems = ref([
  {
    range: '<= 1%',
    color: '',
    textColor: 'black',
  },
  {
    range: '<= 25%',
    color: '#E1BEE7',
    textColor: 'black',
  },
  {
    range: '<= 50%',
    color: '#CE93D8',
    textColor: 'black',
  },
  {
    range: '<= 75%',
    color: '#AB47BC',
    textColor: 'black',
  },
  {
    range: '<= 99%',
    color: '#7B1FA2',
    textColor: 'white',
  },
  {
    range: '> 99%',
    color: '#4A148C',
    textColor: 'white',
  },
]);
</script>

<style scoped>
.legend-box {
  border: 2px solid black;
  padding: 2px;
  margin-bottom: 5px;
  border-radius: 5px;
  background-color: #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
}

.legend-box h3 {
  margin: 0;
  margin-bottom: 3px;
  font-size: 14px;
}

.legend-items {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  overflow-x: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.legend-item:last-child {
  margin-right: 0;
}

.legend-button {
  width: 35px;
  height: 35px;
  border: 2px solid rgb(50, 50, 50);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
}
</style>
