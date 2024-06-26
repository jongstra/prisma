import { defineStore } from 'pinia'
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

// TODO: renamen naar enterpriseStore. Ook mobileStore en icsStore maken.
export const tacticsStore = defineStore('tactics', {

  state: () => ({
    tactics: []
  }),

  getters: {
    tacticsWithTechniqueCount: (state) => {
      return state.tactics.map (tactic => {
        return {
          [tactic.name]: tactic.techniques.length,
        }
      })
    },
    tacticStats: (state) => {
      return state.tactics.map(tactic => {
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

  actions: {
    async fetchTactics() {
      try {
        const response = await axios.get('http://localhost:5001/api/data');
        this.tactics = response.data.tactics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      }
    }
  }

})