<script setup lang="ts">
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();
</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Number of Use Cases per Layer
    </div>
    <hr>

      <!-- L1 Row -->
      <div class="item-row">
        <div class="item-name">L1</div>
        <div class="bar-container">
          <div 
            class="bar" 
            :style="{ 
              width: (magma.L1UseCases(store.domain).length * 0.5) + 'px', 
              backgroundColor: 'green'
            }"
          >
            <span class="item-count">{{ magma.L1UseCases(store.domain).length }}</span>
          </div>
        </div>
      </div>

      <!-- L2 Row -->
      <div class="item-row">
        <div class="item-name">L2</div>
        <div class="bar-container">
          <div 
            class="bar" 
            :style="{ 
              width: (magma.L2UseCases(store.domain).length * 0.5) + 'px', 
              backgroundColor: 'green'
            }"
          >
            <span class="item-count">{{ magma.L2UseCases(store.domain).length }}</span>
          </div>
        </div>
      </div>

      <!-- L1 Row -->
      <div class="item-row">
        <div class="item-name">L3</div>
        <div class="bar-container">
          <div 
            class="bar" 
            :style="{ 
              width: (magma.L3UseCases(store.domain).length * 0.5) + 'px', 
              backgroundColor: 'green'
            }"
          >
            <span class="item-count">{{ magma.L3UseCases(store.domain).length }}</span>
          </div>
        </div>
      </div>

  </div>
</template>


<style scoped>
.item-visualization {
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-radius: 5px;
  width: 450px;
  margin-top: 10px;
  margin-right: 10px;
}

.title {
  text-align: center;
  margin: 5px;
  font-size: 16px;
  font-weight: bold;
}

.item-row {
  display: flex;
  align-items: center;
  margin: 5px;
}

.item-name {
  min-width: 100px;
  text-align: right;
  padding-right: 10px;
  font-size: 13px;
}

.bar-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.bar {
  height: 14px;
  position: relative;
}

.item-count {
  position: absolute;
  left: 100%;
  margin-left: 4px;
  font-size: 12px;
}
</style>
