<script setup lang="ts">
  import { onMounted, onBeforeUnmount } from 'vue';
  import { tacticsStore } from '@/stores/tactics';
  const store = tacticsStore();
  onMounted(() => {store.fetchTactics();}); // Fetch tactics json from Python backend for Pinia store.

  // Ask user for confirmation when leaving/refreshing the page.
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = ''; // Chrome requires returnValue to be set
  };
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

</script>

<!-- App.vue gebruikt router routes zoals gedefinieerd in ./router/index.ts -->
<template>
  <div id='app'>

    <div class='navigation'>
      <RouterLink class='nav' to='/' exact-active-class='selected'>ATT&CK</RouterLink>
      <RouterLink class='nav' to='/insights' exact-active-class='selected'>Insights</RouterLink>
      <RouterLink class='nav' to='/unified-kill-chain' exact-active-class='selected'>Unified Kill Chain</RouterLink>
      <RouterLink class='nav' to='/magma' exact-active-class='selected'>MaGMa</RouterLink>
    </div>

    <div class='domain-switcher'>
      <button :class="{'dom': true, 'selected': store.domain === 'enterprise-attack'}" @click="store.setDomain('enterprise-attack')">Enterprise</button>
      <button :class="{'dom': true, 'selected': store.domain === 'mobile-attack'}" @click="store.setDomain('mobile-attack')">Mobile</button>
      <button :class="{'dom': true, 'selected': store.domain === 'ics-attack'}" @click="store.setDomain('ics-attack')">ICS</button>
    </div>

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
  padding: 0.5% 0.5rem;
}

.navigation, .domain-switcher {
  display: flex;
  justify-content: space-around;
  background-color: #eeeeee;
  margin-bottom: 5px;
  border: 3px solid black;
  border-radius: 5px;
  max-width: 900px;
}

.nav, .dom {
  cursor: pointer;
  flex-grow: 1;
  text-align: center;
  background-color: #cccccc;
  color: #000000;
  font-size: 18px;
  font-weight: bold;
  border: 2px solid black;
  margin: 2px;
  border-radius: 5px;
  transition: 0.1s;
}

.selected {
  background-color: blue;
  color: white;
}

</style>