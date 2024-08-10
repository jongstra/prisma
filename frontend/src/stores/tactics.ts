import { defineStore } from 'pinia'
import axios from 'axios';

// Define interfaces
interface SubTechnique {
  technique: string;
  external_id: string;
  visibility: boolean;
  available_datasources: Array<string>;
  show_on_page: boolean;
}

interface Technique {
  name: string;
  external_id: string;
  platforms: Array<string>;
  data_components: Array<string>;
  visibility: boolean;
  alpha: number;
  available_datasources: Array<string>;
  show_on_page: boolean;
  sub_techniques: Array<SubTechnique>;
}

interface Tactic {
  name: string;
  techniques: Technique[];
}

interface Domain {
  tactics: Tactic[];
  platforms: Array<string>;
  data_sources: Array<string>;
  data_components: Array<string>;
}

interface TacticStats {
  name: string;
  totalTechniques: number;
  visibleTechniques: number;
  visibilityPercentage: number;
}


// Helper functions
// function applyDefaults(technique: Technique): Technique {
//   return {
//     ...technique,
//     visibility: technique.show_on_page !== undefined ? technique.visibility : false,
//     available_datasources: technique.available_datasources
//     show_on_page: technique.show_on_page !== undefined ? technique.show_on_page : true
//   };
// }

// function applyDefaultsToTactics(tactics: Technique[]): Technique[] {
//   return tactics.map(applyDefaults);
// }


export const tacticsStore = defineStore('tactics', {
  state: () => ({
    domain: 'enterprise-attack',  // Alternative initial value: 'none'.
    enterprise: [] as Domain[],
    ics: [] as Domain[],
    mobile: [] as Domain[],
  }),


  getters: {
    tacticStats: (state) => (domain: string) => {
      let tactics: Array<Tactic>;

      switch(domain) {
        case 'enterprise-attack':
          tactics = state.enterprise.tactics;
          break;
        case 'mobile-attack':
          tactics = state.mobile.tactics;
          break;
        case 'ics-attack':
          tactics = state.ics.tactics;
          break;
        default:
          return [];
      }

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
        const response = await axios.get('http://localhost:5001/api/tactics');
        this.enterprise = response.data.enterprise;
        this.mobile = response.data.mobile;
        this.ics = response.data.ics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      }
    },


    // TODO: this function may require optimization in the future.
    // Possible option: process file using Python, and re-fill Pinia store using API.
    async processDettectJson(data: any) {
      console.log('Processing DeTT&CT json file.');
      this.domain = data.domain;

      // Get tactics data of the current domain from the store.
      let tactics;
      switch(data.domain) {
        case 'enterprise-attack':
          tactics = this.enterprise.tactics;
          break;
        case 'mobile-attack':
          tactics = this.mobile.tactics;
          break;
        case 'ics-attack':
          tactics = this.ics.tactics;
          break;
        default:
          return [];
      }

      // Create a lookup dictionary with (sub)technique IDs as keys, using the user-uploaded DeTT&CT json.
      // In this DeTT&CT json file, all techniques and sub-techniques are presented in a flattened list.
      let techniques_dict = {};  // Note! This dict will contain techniques AND subtechniques.
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
              // technique.available_datasources = technique_update_data.available_datasources;
              technique.available_datasources = technique_update_data.available_datasources.split(',');  // String splitting could be turned off for a speed improvement, if we do not end up using the 'available data sources' individually in further processing.
            }
            technique.visibility = technique_update_data.has_available_datasources;
            technique.alpha = 1;
          }
          
          // Update all sub-techniques. 
          if (typeof technique.sub_techniques !== "undefined") {
            let total_subtechniques_visibility = 0;
            technique.sub_techniques.forEach( (sub_technique: Array) => {
              let sub_technique_update_data = techniques_dict[sub_technique.external_id];
              if(typeof sub_technique_update_data !== "undefined") {
                if (sub_technique_update_data.available_datasources !== '-') {
                  total_subtechniques_visibility += 1;
                  // sub_technique.available_datasources = sub_technique_update_data.available_datasources;
                  sub_technique.available_datasources = sub_technique_update_data.available_datasources.split(',');  // String splitting could be turned off for a speed improvement, if we do not end up using the 'available data sources' individually in further processing.
                }
                sub_technique.visibility = sub_technique_update_data.has_available_datasources;
              }
            });
            technique.alpha = (total_subtechniques_visibility+1) / (technique.sub_techniques.length+1);
          }

        });

      });
    },

    setDomain(newDomain: string) {
      this.domain = newDomain;
    },


    // // CODE HIERONDER WERKEND MAKEN (prototype van aanpassen van de show_on_page variabele).
    // // DAARNA DOORWERKEN AAN TechniqueFilter.vue.
    // applyTechniqueFilter() {

    //   // Get tactics data of the current domain from the store.
    //   let tactics;
    //   switch(this.domain) {
    //     case 'enterprise-attack':
    //       tactics = this.enterprise_tactics;
    //       break;
    //     case 'mobile-attack':
    //       tactics = this.mobile_tactics;
    //       break;
    //     case 'ics-attack':
    //       tactics = this.ics_tactics;
    //       break;
    //   }
      
    //   tactics.forEach( (tactic: Tactic) => {
    //     // console.log('test');
    //     // console.log(tactic);
    //     tactic.forEach( (technique: Technique) => {
    //       technique.show_on_page = false;
    //       // technique.show_on_page = technique.name == "Active Scanning" ? true : false;
    //     });
    //   });

    // },

    // toggleTechniqueVisiblity(technique: Technique | SubTechnique) {
    //   technique.visibility = !technique.visibility;
    // },

  }

});
