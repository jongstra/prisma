<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { tacticsStore } from '@/stores/tactics';

// Define props
const props = defineProps({
  attribute_type: {
    type: String,
    required: true,
  },
});

// Local state
const store = tacticsStore();
const isCollapsed = ref(true);
const containerRef = ref<HTMLElement | null>(null);

// Toggle collapse functionality
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Toggle selection functionality
function toggleAttribute(attribute: any) {
  attribute.active_in_filter = !attribute.active_in_filter;
}

// Compute attributes based on the current domain and attribute type
const attributes = computed(() => {
  switch (store.domain) {
    case 'enterprise-attack':
      return store.enterprise[props.attribute_type];
    case 'mobile-attack':
      return store.mobile[props.attribute_type];
    case 'ics-attack':
      return store.ics[props.attribute_type];
    default:
      return [];
  }
});

// Click outside to collapse
function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isCollapsed.value = true;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>


<template>
  <div class="collapsible-container" ref="containerRef">
    <!-- Collapsible search bar -->
    <div class="collapsible-header" @click="toggleCollapse">
      <span class="collapsible-title">{{ capitalizeFirstLetter(props.attribute_type) }}</span>
    </div>
    <div v-if="!isCollapsed" class="collapsible-content">
      <ul>
        <li v-for="attribute in attributes" :key="attribute.name">
          <label>
            <input 
              type="checkbox" 
              :checked="attribute.active_in_filter"
              @change="toggleAttribute(attribute)"
            />
            {{ attribute.name }}
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>



<style scoped>
.collapsible-container {
  position: relative;
  margin: 18px;
}

.collapsible-header {
  cursor: pointer;
}

.collapsible-title {
  padding: 8.5px;
  font-size: 16px;
  border: 2px solid #333;
  border-radius: 5px;
  width: 300px;
  background-color: rgba(10, 10, 10, 0.35);
  color: white;
  transition: 0.1s;
}

.collapsible-title:hover {
  background-color: rgba(10, 10, 10, 0.25);
  color: white;
}

.collapsible-content {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.collapsible-content ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.collapsible-content li {
  padding: 5px;
}

.collapsible-content label {
  display: block;
}
</style>