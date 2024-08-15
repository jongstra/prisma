import { defineStore } from 'pinia'
import axios from 'axios';

// Define interfaces
interface SubTechnique {
  technique: string;
  external_id: string;
  platforms: string[];
  data_sources: string[];
  data_components: string[];
  available_datasources: string[];
  visibility?: boolean;
}

interface Technique {
  name: string;
  external_id: string;
  platforms: string[];
  data_sources: string[];
  data_components: string[];
  available_datasources: string[];
  visibility?: boolean;
  alpha?: number;
  sub_techniques?: SubTechnique[];
}

interface Tactic {
  name: string;
  techniques: Technique[];
}

interface Attribute {
  name: string;
  active: boolean;
}

interface Attributes {
  name: string;
  attributes: Attribute[];
}

interface Domain {
  tactics: Tactic[];
  platforms: Attributes;
  data_sources: Attributes;
  data_components: Attributes;
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
    enterprise: [] as Domain[],
    ics: [] as Domain[],
    mobile: [] as Domain[],
  }),


  getters: {

    // activePlatforms: (state) => {
    //   let data;
    //   if (state.domain == 'enterprise-attack') {
    //     data = state.enterprise;
    //   }
    //   else if (state.domain == 'mobile-attack') {
    //     data = state.mobile;
    //   }
    //   else if (state.domain == 'ics-attack') {
    //     data = state.ics;
    //   }
    //   else data = {};

    //   const active_platforms = data.platforms
    //     .filter(item => item.active) // Filter the array to include only active items
    //     .map(item => item.name);
  
    //   return active_platforms;
    // },

    // Generalized getter function (attribute_type examples: platform/data_sources/data_components)
    activeAttributes: (state) => (attribute_type: string) => {
      // Determine the correct data source based on the domain
      let data;
      switch (state.domain) {
        case 'enterprise-attack':
          data = state.enterprise[attribute_type];
          break;
        case 'mobile-attack':
          data = state.mobile[attribute_type];
          break;
        case 'ics-attack':
          data = state.ics[attribute_type];
          break;
        default:
          data = {}; // Default to an empty object if domain doesn't match
      }

      // Check if the attributeType exists in the data
      if (!data) {
        return []; // Return an empty array if attributeType is not found in the data
      }

      // Filter and map the active items based on the attributeType
      const active_attributes = data
        .filter(item => item.active) // Filter the array to include only active items
        .map(item => item.name);

      return active_attributes;
    },


    tacticStats: (state) => (domain: string) => {

      let tactics: Tactic[];
      if (domain == 'enterprise-attack') {
        tactics = state.enterprise.tactics;
      } else if (domain == 'mobile-attack') {
        tactics = state.mobile.tactics;
      } else if (domain == 'ics-attack') {
        tactics = state.ics.tactics;
      } else {
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
      let tactics: Tactic[];
      if (data.domain == 'enterprise-attack') {
        tactics = this.enterprise.tactics;
      } else if (data.domain == 'mobile-attack') {
        tactics = this.mobile.tactics;
      } else if (data.domain == 'ics-attack') {
        tactics = this.ics.tactics;
      } else {
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

  }

});
