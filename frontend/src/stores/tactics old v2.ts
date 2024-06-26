import { defineStore } from 'pinia'
import axios from 'axios';

// Define interfaces
interface Technique {
  technique: string;
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

  // state : () => ({
  //   tactics : [
  //     {
  //       name: 'Reconaissance', 
  //       techniques: [
  //         {name: 'Active Scanning', visibility: true},
  //         {name: 'Gather Victim Host Information', visibility: false}, 
  //         {name: 'Gather Victim Identity Information', visibility: false}
  //       ]
  //     },
  //     {
  //       name: 'Resource Development',
  //       techniques: [
  //         { name: 'Acquire Access', visibility: true },
  //         { name: 'Acquire Infrastructure', visibility: false }
  //       ]
  //     },
  //     {
  //       name: 'Initial Access',
  //       techniques: [
  //         { name: 'Content Injection', visibility: false },
  //         { name: 'Drive-by Compromise', visibility: true }
  //       ]
  //     },
  //     {
  //       name: 'Execution',
  //       techniques: [
  //         { name: 'Cloud Administration Command', visibility: true },
  //         { name: 'Command and Scripting Interpreter', visibility: false },
  //         { name: 'Container Administration Command', visibility: true }
  //       ]
  //     }
  //   ]

    // 'tactics' : [
    //   {'name': 'Reconaissance', 'techniques':
    //     ['Active Scanning', 'Gather Victim Host Information', 'Gather Victim Identity Information']},
    //   {'name': 'Resource Development', 'techniques':
    //     ['Acquire Access', 'Acquire Infrastructure']},
    //   {'name': 'Initial Access', 'techniques':
    //     ['Content Injection', 'Drive-by Compromise']},
    //   {'name': 'Execution', 'techniques':
    //     ['Cloud Administration Command', 'Command and Scripting Interpreter', 'Container Administration Command']},
    // ]
  // }),
  

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