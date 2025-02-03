import { defineStore } from 'pinia';

export const stateStore = defineStore('state', {

  state: () => ({
    activeAttackDomain: 'enterprise-attack',  // The active ATT&CK domain.
    activeMagmaTab: 'L1',  // The active MaGMa tab.
  }),

  getters: {
    getActiveAttackDomain: (state) => state.activeAttackDomain,
    getActiveMagmaTab: (state) => state.activeMagmaTab,
  },

  actions: {
    setActiveAttackDomain(domain: string) {this.activeAttackDomain = domain;},
    setActiveMagmaTab(tab: string) {this.activeMagmaTab = tab;},
  }

});