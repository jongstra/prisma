<template>
  <div class="legend-container">
    <div class="title-box">
      <p>Legend: Visibility</p>
    </div>
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
.legend-container {
  border: 2px solid black;
  padding: 5px;
  border-radius: 5px;
  background-color: #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 70px;
  width: 250px;
}

.title-box {
  background-color: #999;
  color: white;
  border: 2px dotted #777;
  padding: 2px 6px;
  margin-top: -1px;
  margin-bottom: 4px;
  border-radius: 4px;
  height: 18px;
  display: flex;
  align-items: center;
  font-size: 12px;
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
  width: 31px;
  height: 35px;
  border: 2px solid rgb(50, 50, 50);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 11px;
  font-weight: bold;
}
</style>
