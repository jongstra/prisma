<script setup lang="ts">
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore()

  // store.applyTechniqueFilter();
</script>

<template>

      <div v-if="store.domain === 'enterprise-attack'">
        <p>Enterprise</p>
      </div>

      <div v-else-if="store.domain === 'mobile-attack'">
        <p>Mobile</p>
      </div>

      <div v-else-if="store.domain === 'ics-attack'">
        <p>ICS</p>
      </div>

</template>

<!-- 
TODO

- [x] Data sources list maken met Python.
- [x] Data sources list serveren via Flask.
- [x] Data sources list ingesten in Pinia.
- [ ] Data sources list in deze component tonen. Denk aan een MultiSelect-achtige component (denk aan https://primevue.org/multiselect/)
- [ ] ATT&CK matrix filteren obv 

-->
