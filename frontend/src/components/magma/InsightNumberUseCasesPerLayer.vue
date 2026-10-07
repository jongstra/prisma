<script setup lang="ts">
import { computed } from 'vue';
import { barWidth } from '@/components/common/barWidth';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, magma.L1UseCases(store.domain).length, magma.L2UseCases(store.domain).length, magma.L3UseCases(store.domain).length));
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
              width: barWidth(magma.L1UseCases(store.domain).length, maxCount), 
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
              width: barWidth(magma.L2UseCases(store.domain).length, maxCount), 
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
              width: barWidth(magma.L3UseCases(store.domain).length, maxCount), 
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
