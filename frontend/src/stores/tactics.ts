import { defineStore } from 'pinia'
import { onMounted } from 'vue';
import axios from 'axios';

// Define interfaces
interface Technique {
  technique: string;
  external_id: string;
  visibility: boolean;
}

interface Tactic {
  name: string;
  techniques: Technique[];
}

interface TacticStats {
  name: string;
  totalTechniques: number;
  visibleTechniques: number;
  visibilityPercentage: number;
}

export const tacticsStore = defineStore('tactics', {

  state: () => ({
    domain: null,
    enterprise_tactics: [],
    mobile_tactics: [],
    ics_tactics: [],
  }),


  getters: {
    tacticStats: (state) => (domain) => {
      let tactics;

      switch(domain) {
        case 'enterprise-attack':
          tactics = state.enterprise_tactics;
          break;
        case 'mobile-attack':
          tactics = state.mobile_tactics;
          break;
        case 'ics-attack':
          tactics = state.ics_tactics;
          break;
        default:
          return [];
      }

      return tactics.map(tactic => {
        const totalTechniques = tactic.techniques.length;
        const visibleTechniques = tactic.techniques.filter(technique => technique.visibility).length;
        const visibilityPercentage = (visibleTechniques / totalTechniques) * 100;
        return {
          name: tactic.name,
          totalTechniques,
          visibleTechniques,
          visibilityPercentage
        };
      });
    }
  },

  // getters: {
  //   // Deze functie domein afhankelijk maken.
  //   tacticStats: (state) => {
  //     return state.tactics.map(tactic => {
  //       const totalTechniques = tactic.techniques.length;
  //       const visibleTechniques = tactic.techniques.filter(technique => technique.visibility).length;
  //       const visibilityPercentage = (visibleTechniques / totalTechniques) * 100;
  //       return {
  //         name: tactic.name,
  //         totalTechniques,
  //         visibleTechniques,
  //         visibilityPercentage
  //       };
  //     });
  //   }
  // },

  actions: {
    async fetchTactics() {
      try {
        const response = await axios.get('http://localhost:5001/api/data');
        this.enterprise_tactics = response.data.enterprise_tactics;
        this.mobile_tactics = response.data.mobile_tactics;
        this.ics_tactics = response.data.ics_tactics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      }
    },

    async processDettectJson(data: string) {
      console.log('Processing DETT&CT json file.');
      console.log(data);

      console.log(data.domain)
      this.domain = data.domain;
    }

  }

});


// // Call fetchTactics when the store is initialized
// const store = tacticsStore();
// onMounted(() => {
//   store.fetchTactics();
// });;