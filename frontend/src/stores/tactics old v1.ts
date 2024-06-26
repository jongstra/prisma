import { defineStore } from 'pinia'

// Define the Tactic interface
interface Tactic {
  name: string;
  techniques: string[];
}


// TODO: renamen naar enterpriseStore. Ook mobileStore en icsStore maken.
export const tacticsStore = defineStore('tactics', {

  state : () => ({
    'tactics' : [
      {'name': 'Reconaissance', 'techniques':
        ['Active Scanning', 'Gather Victim Host Information', 'Gather Victim Identity Information']},
      {'name': 'Resource Development', 'techniques':
        ['Acquire Access', 'Acquire Infrastructure']},
      {'name': 'Initial Access', 'techniques':
        ['Content Injection', 'Drive-by Compromise']},
      {'name': 'Execution', 'techniques':
        ['Cloud Administration Command', 'Command and Scripting Interpreter', 'Container Administration Command']},
    ]
  }),
  
  getters: {
    tacticsWithTechniqueCount: (state): Record<string, number> => {
      return state.tactics.reduce((acc: Record<string, number>, tactic: Tactic) => {
        acc[tactic.name] = tactic.techniques.length;
        return acc;
      }, {});
    }
  }
})