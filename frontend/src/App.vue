<script setup lang="ts">
  import { onMounted } from 'vue';
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore();
  onMounted(() => {store.fetchTactics();}); // Fetch tactics json from Python backend for Pinia store.
</script>

<!-- App.vue gebruikt router routes zoals gedefinieerd in ./router/index.ts -->
<template>
  <div id='app'>

    <div class='navigation'>
      <RouterLink class='nav' to='/'>ATT&CK</RouterLink>
      <RouterLink class='nav' to='/insights'>Insights</RouterLink>
      <RouterLink class='nav' to='/unified-kill-chain'>Unified Kill Chain</RouterLink>
      <RouterLink class='nav' to='/magma'>MaGMa</RouterLink>
    </div>

    <div class='domain-switcher'>
      <button :class="{'dom': true, 'selected': store.domain === 'enterprise-attack'}" @click="store.setDomain('enterprise-attack')">Enterprise</button>
      <button :class="{'dom': true, 'selected': store.domain === 'mobile-attack'}" @click="store.setDomain('mobile-attack')">Mobile</button>
      <button :class="{'dom': true, 'selected': store.domain === 'ics-attack'}" @click="store.setDomain('ics-attack')">ICS</button>
    </div>
    <br>

    <main>
      <div class="content">
        <RouterView />
      </div>
    </main>

  </div>
</template>


<style>

#app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 2% 2rem;
}

.navigation, .domain-switcher {
  display: flex;
  justify-content: space-around;
  background-color: #eeeeee;
  margin-bottom: 10px;
  border: 3px solid black;
  border-radius: 5px;
  max-width: 800px;
}

.nav, .dom {
  flex-grow: 1;
  text-align: center;
  background-color: #cccccc;
  color: #000000;
  font-size: 18px;
  font-weight: bold;
  border: 3px solid black;
  margin: 2px;
  border-radius: 5px;
}

.selected {
  background-color: blue;
  color: white;
}

</style>