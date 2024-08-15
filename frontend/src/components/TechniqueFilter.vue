<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore()

  // Define props
  const props = defineProps({
    attribute_type: {
      type: String,
      required: true,
    },
  });

  // Local state
  const isCollapsed = ref(true);

  // Toggle collapse functionality
  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value;
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Toggle selection functionality
  function toggleAttribute(attribute) {
    attribute.active = !attribute.active;
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

</script>


<template>
  <div class="collapsible-container">
    <!-- Collapsible search bar -->
    <div class="collapsible-header" @click="toggleCollapse">
      <span class="collapsible-title">{{ capitalizeFirstLetter(props.attribute_type) }} Filter</span>
    </div>
    <div v-if="!isCollapsed" class="collapsible-content">
      <ul>
        <li v-for="attribute in attributes" :key="attribute.name">
          <label>
            <input 
              type="checkbox" 
              :checked="attribute.active"
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
    position: relative; /* Allows the child element to be positioned absolutely within it */
  }

  .collapsible-header {
    cursor: pointer;
    padding: 10px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: inline-block; /* Keeps the header size to content */
  }

  .collapsible-content {
    position: absolute; /* Positions the content relative to the container */
    top: 100%; /* Position the content directly below the header */
    left: 0;
    width: 100%; /* Ensures the content is the same width as the container */
    background-color: #fff;
    border: 1px solid #ddd;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensures the content is above other elements */
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