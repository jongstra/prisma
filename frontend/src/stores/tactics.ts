import { defineStore } from 'pinia'
import { onMounted } from 'vue';
import axios from 'axios';

// Define interfaces
interface SubTechnique {
  technique: string;
  external_id: string;
  visibility: boolean;
  available_datasources: Array<string>;
}

interface Technique {
  technique: string;
  external_id: string;
  visibility: boolean;
  available_datasources: Array<string>;
  sub_techniques: Array<SubTechnique>;
  show_on_page: boolean;
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
    domain: 'enterprise-attack',  // Alternative initial value: 'none'.
    enterprise_tactics: [] as Tactic[],
    mobile_tactics: [] as Tactic[],
    ics_tactics: [] as Tactic[],
  }),


  getters: {
    tacticStats: (state) => (domain: string) => {
      let tactics: Array<Tactic>;

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
      
      console.log(tactics);

      return tactics.map( (tactic: Tactic) => {
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
        this.enterprise_tactics = response.data.enterprise_tactics;
        this.mobile_tactics = response.data.mobile_tactics;
        this.ics_tactics = response.data.ics_tactics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      }
    },

    async processDettectJson(data: any) {
      console.log('Processing DeTT&CT json file.');
      this.domain = data.domain;

      // Get tactics data of the current domain from the store.
      let tactics;
      switch(data.domain) {
        case 'enterprise-attack':
          tactics = this.enterprise_tactics;
          break;
        case 'mobile-attack':
          tactics = this.mobile_tactics;
          break;
        case 'ics-attack':
          tactics = this.ics_tactics;
          break;
        default:
          return [];
      }

      // Process each technique from the user-uploaded DeTT&CT json; create a lookup dict per (sub)technique.
      let techniques_dict = {};
      data.techniques.forEach( (technique: object) => {
        techniques_dict[technique.techniqueID] = {
          available_datasources: technique.metadata[1].value,
          has_available_datasources: technique.metadata[1].value !== '-',
          is_subtechnique: technique.techniqueID.includes('.'),  // We assume that subtechniques have a '.' in their techniqueID.
        }
      });

      // The code below updates the Pinia store.
      // It loops over all (sub)technique in the tactics of the current domain, and updates them using the info from the techniques_dict.
      tactics.forEach( (tactic: object) => {
        
        // Update all techniques in the Pinia store.
        tactic.techniques.forEach( (technique: object) => {

          // If a technique is not present in the store, ignore it for now. 
          // TODO: find out why this non-presence may occur, and handle situations accordingly.
          let technique_update_data = techniques_dict[technique.external_id];
          if(typeof technique_update_data !== "undefined") {
            if (technique_update_data.available_datasources !== '-') {
              technique.available_datasources = technique_update_data.available_datasources;
              // technique.available_datasources = technique_update_data.available_datasources.split(',');  // String splitting could be turned off for a speed improvement, if we do not end up using the 'available data sources' individually in further processing.
            }
            technique.visibility = technique_update_data.has_available_datasources;
          }
          
          // Update all sub-techniques. 
          if (typeof technique.sub_techniques !== "undefined") {
            technique.sub_techniques.forEach( (sub_technique: Array) => {
              let sub_technique_update_data = techniques_dict[sub_technique.external_id];
              if(typeof sub_technique_update_data !== "undefined") {
                if (sub_technique_update_data.available_datasources !== '-') {
                  sub_technique.available_datasources = sub_technique_update_data.available_datasources;
                  // sub_technique.available_datasources = sub_technique_update_data.available_datasources.split(',');  // String splitting could be turned off for a speed improvement, if we do not end up using the 'available data sources' individually in further processing.
                }
                sub_technique.visibility = sub_technique_update_data.has_available_datasources;
              }
            });
          }

        });

      });
    },

    setDomain(newDomain: string) {
      this.domain = newDomain;
    },

    toggleTechniqueVisiblity(technique: Technique | SubTechnique) {
      technique.visibility = !technique.visibility;
    },

  }

});
