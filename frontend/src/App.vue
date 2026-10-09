<script setup lang="ts">
  import { onMounted, onBeforeUnmount } from 'vue';
  import Swal from 'sweetalert2';
  import { tacticsStore } from '@/stores/tactics';
  import { magmaStore } from '@/stores/magma';
  const tactics = tacticsStore();
  const magma = magmaStore();
  // Load the ATT&CK catalog (public/tactics_and_techniques_by_domain.json) into the Pinia store.
  onMounted(() => {
    tactics.fetchTactics().catch((error) => {
      console.error('Failed to fetch tactics:', error);
      Swal.fire({
        icon: 'error',
        titleText: 'The ATT&CK data was not loaded',
        text: `Could not load the ATT&CK data (tactics_and_techniques_by_domain.json): ${(error as Error).message}. Please reload the page.`,
      });
    });
  });

  // Ask for confirmation when leaving or refreshing the page would lose MaGMa work: changes since the last load or save.
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (magma.hasUnsavedChanges()) {
      event.preventDefault();
    }
  };
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

</script>

<!-- The page frame: navigation, domain buttons and the current page (the routes are in router/index.ts). -->
<template>
  <div class='app'>

    <div class='navigation'>
      <RouterLink class='nav' to='/' exact-active-class='selected'>DeTT&CT</RouterLink>
      <RouterLink class='nav' to='/insights' exact-active-class='selected'>Insights</RouterLink>
      <RouterLink class='nav' to='/magma' exact-active-class='selected'>MaGMa</RouterLink>
    </div>

    <div class='domain-switcher'>
      <button :class="{'dom': true, 'selected': tactics.domain === 'enterprise-attack'}" @click="tactics.setDomain('enterprise-attack')">Enterprise</button>
      <button :class="{'dom': true, 'selected': tactics.domain === 'mobile-attack'}" @click="tactics.setDomain('mobile-attack')">Mobile</button>
      <button :class="{'dom': true, 'selected': tactics.domain === 'ics-attack'}" @click="tactics.setDomain('ics-attack')">ICS</button>
    </div>

    <main>
      <div class="content">
        <RouterView />
      </div>
    </main>

  </div>
</template>


<style>

/* The mount point in index.html (#app) and the page frame (.app) share this style. */
#app, .app {
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
  width: 0; /* This makes the navigation buttons and the domain buttons all have the same width. */
}

.selected {
  background-color: rgb(57, 55, 139);
  color: white;
}

</style>