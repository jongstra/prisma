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

// Compute the state of the main checkbox
const allSelected = computed(() => {
  return attributes.value.every((attribute) => attribute.active_in_filter);
});

const anySelected = computed(() => {
  return attributes.value.some((attribute) => attribute.active_in_filter);
});

const isIndeterminate = computed(() => {
  return anySelected.value && !allSelected.value;
});

// Handle the click event on the main checkbox
function toggleAllAttributes(checked: boolean) {
  attributes.value.forEach((attribute) => {
    attribute.active_in_filter = checked;
  });
}

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
    <div class="collapsible-header" @click="toggleCollapse" :class="{ active: !isCollapsed }">
      <span class="collapsible-title">{{ capitalizeFirstLetter(props.attribute_type) }}</span>
      <span class="collapsible-icon"></span>
    </div>
    <div v-if="!isCollapsed" class="collapsible-content">
      <ul>
        <li>
          <label>
            <input
              type="checkbox"
              :indeterminate="isIndeterminate"
              :checked="allSelected"
              @change="toggleAllAttributes($event.target.checked)"
            />
            All
          </label>
        ------------
        </li>
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
  width: 150px;
}

.collapsible-header {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8.5px;
  font-size: 16px;
  border: 2px solid #333;
  border-radius: 5px;
  /* width: 120%; */
  background-color: rgba(10, 10, 10, 0.35);
  color: white;
  transition: 0.1s;
  width: 150px;
  height: 30px;
}

.collapsible-title {
  flex-grow: 1;
}

.collapsible-icon::after {
  content: '\02795'; /* Unicode character for "plus" sign (+) */
  font-size: 13px;
  color: white;
  margin-left: 5px;
}

.active .collapsible-icon::after {
  content: "\2796"; /* Unicode character for "minus" sign (-) */
}

.collapsible-header:hover {
  background-color: rgba(10, 10, 10, 0.25);
  color: white;
}

.collapsible-content {
  position: absolute;
  top: 100%;
  left: 0;
  width: 120%;
  background-color: #f0f0f0;
  border: 1px solid #aaa;
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
