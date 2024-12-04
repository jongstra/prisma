import { defineStore } from 'pinia'
import axios from 'axios';

// Define interfaces
interface SubTechnique {
  technique: string;
  external_id: string;
  platforms: string[];
  groups: string[];
  occurrence_groups: number;
  software: string[];
  occurrence_software: number;
  occurrence_total: number,
  data_sources: string[];
  data_components: string[];
  available_datasources: string[];
  visibility?: boolean;
}

interface Technique {
  name: string;
  external_id: string;
  platforms: string[];
  groups: string[];
  occurrence_groups: number;
  software: string[];
  occurrence_software: number;
  occurrence_total: number,
  data_sources: string[];
  data_components: string[];
  available_datasources: string[];
  visibility?: boolean;
  visibility_ratio?: number;
  sub_techniques?: SubTechnique[];
}

interface Tactic {
  name: string;
  techniques: Technique[];
}

interface Attribute {
  name: string;
  active_in_filter: boolean;
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
  groups: Attributes;
  softwares: Attributes;
  only_show_selected_groups: false,
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
    dataLoaded: false,
    enterprise: [] as Domain[],
    ics: [] as Domain[],
    mobile: [] as Domain[],
    searchQuery: '' as string,
    minVisibilityRatio: 0 as number,
    maxVisibilityRatio: 1 as number,
    minTotalOccurrences: 0 as number,
    pinnedTooltipId: '' as string,
  }),


  getters: {

    hoveredGroupsTechniquesSet: (state) => {
      let groups;

      if (state.domain === 'enterprise-attack') {
        groups = state.enterprise?.groups;
      } else if (state.domain === 'mobile-attack') {
        groups = state.mobile?.groups;
      } else if (state.domain === 'ics-attack') {
        groups = state.ics?.groups;
      }
      
      // Add all techniques of hovered groups to a list.
      let groupsTechniques = [];
      groups.forEach(group => {
        if (group?.hovered) {
          groupsTechniques.push(...group.techniques)
        }
      });
      
      // Remove duplicates in the techniques list, and return it.
      const groupsTechniquesSet = new Set(groupsTechniques);
      return groupsTechniquesSet;
    },


    selectedGroupsTechniquesSet: (state) => {
      let groups;

      if (state.domain === 'enterprise-attack') {
        groups = state.enterprise?.groups;
      } else if (state.domain === 'mobile-attack') {
        groups = state.mobile?.groups;
      } else if (state.domain === 'ics-attack') {
        groups = state.ics?.groups;
      }
      
      // Add all techniques of selected groups to a list.
      let groupsTechniques = [];
      groups.forEach(group => {
        if (group?.selected) {
          groupsTechniques.push(...group.techniques)
        }
      });
      
      // Remove duplicates in the techniques list, and return it.
      const groupsTechniquesSet = new Set(groupsTechniques);
      return groupsTechniquesSet;
    },


    techniquesOccurrences: (state) => {
      let tactics;
    
      if (state.domain === 'enterprise-attack') {
        tactics = state.enterprise?.tactics;
      } else if (state.domain === 'mobile-attack') {
        tactics = state.mobile?.tactics;
      } else if (state.domain === 'ics-attack') {
        tactics = state.ics?.tactics;
      }
    
      if (!tactics) {
        return [];
      }
    
      const techniquesMap = {};
    
      // Aggregate occurrences
      tactics.forEach(tactic => {
        tactic.techniques.forEach(technique => {
          const { name, software, groups } = technique;
          if (!techniquesMap[name]) {
            techniquesMap[name] = {
              name,
              group_occurrence: groups.length,
              software_occurrence: software.length,
              total_occurrence: groups.length + software.length,
            };
          }
        });
      });
    
      // Convert map to array without sorting
      return Object.values(techniquesMap);
    },

    
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
        .filter(item => item.active_in_filter) // Filter the array to include only active items.
        .map(item => item.name);

      return active_attributes;
    },


    // TODO: mogelijk deze code met de functie hierboven samenvoegen (extra parameter toevoegen aan function call).
    // Generalized getter function (attribute_type examples: platform/data_sources/data_components)
    visibleAttributes: (state) => (attribute_type: string) => {
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

      // Filter and map the visible items based on the attributeType
      const active_attributes = data
        .filter(item => item.visibility) // Filter the array to include only items with visibility
        .map(item => item.name);

      return active_attributes;
    },

  },


  actions: {

    async fetchTactics() {
      try {
        this.dataLoaded = false; // Set dataLoaded to true before fetching
        const response = await axios.get('http://localhost:5001/api/tactics');
        this.enterprise = response.data.enterprise;
        this.mobile = response.data.mobile;
        this.ics = response.data.ics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      } finally {
        this.dataLoaded = true; // Set dataLoadedw to false after fetching
      }
    },
    
    setDomain(newDomain: string) {
      this.domain = newDomain;
    },

    processDettectYaml(data: any) {

      // Switch to relevant domain.
      this.domain = data.domain;

      // Access data of the current domain from the store.
      let tactics: Tactics[];
      let data_components_list: Attributes[];
      if (data.domain == 'enterprise-attack') {
        tactics = this.enterprise.tactics;
        data_components_list = this.enterprise.data_components;
      } else if (data.domain == 'mobile-attack') {
        tactics = this.mobile.tactics;
        data_components_list = this.mobile.data_components;
      } else if (data.domain == 'ics-attack') {
        tactics = this.ics.tactics;
        data_components_list = this.ics.data_components;
      } else {
        return [];
      }

      // Apply the quality settings of the active data sources (DETT&CT) to the data components (ATT&CK) in the Pinia store.
      // TODO: correctly handle [DeTT&CT data source] items, such as "Internal DNS [DeTT&CT data source]".
      data.data_sources.forEach((data_source) => {
        let component = data_components_list.find((component) => component.name === data_source.data_source_name)

        for (const quality_indicator in data_source.data_source[0]['data_quality']) {
          component['quality'][quality_indicator] = data_source.data_source[0]['data_quality'][quality_indicator]
        }

        component.visibility = true;
      });


      // Get the names of all DeTT&CT data sources that are administerd in the YAML file.
      let dettect_data_sources_names = data.data_sources.map(
        (data_source) => data_source.data_source_name
      );

      // Data sources in DeTT&CT are the same as data components in MITRE ATT&CK.
      let active_data_components = dettect_data_sources_names;
      

      // // TODO: Deze logica verbeteren om het inlezen te versnellen.
      // data.data_sources.forEach((data_source) => {
      //   let component = data_components_list.find((component) => component.name === data_source.data_source_name)
      //   // console.log(component.detected_techniques);

      //   tactics.forEach((tactic: object) => {

      //     component.detected_techniques.forEach((detected_technique) => {
      //       let technique = tactic.techniques.find((technique) => technique.name == detected_technique);
      //       if (technique) {
      //         technique.visibility = true;
      //         technique.visibility_ratio = 1;
      //       }
      //     })
          
          
      //     // if (technique) {
      //     //   // console.log(tactic.name);
      //     //   // console.log(technique.name);
      //     //   technique.visibility = true;
      //     //   technique.visibility_ratio = 1;
            
      //     //   if (typeof technique.sub_techniques !== "undefined") {
      //     //     technique.sub_techniques.forEach((subtechnique: object) => {
      //     //       let detected_subtechnique = technique.sub_techniques.find((subtechnique) => component['detected_techniques'].includes(subtechnique.name));
      //     //       if (detected_subtechnique) {
      //     //         console.log(detected_subtechnique.name);
      //     //       }
      //     //     })
      //     //   }

      //     // }
      //   })

      // });


      // Loop over all tactics/techniques/subtechniques in the Pinia store to update their visibility and alpha.
      tactics.forEach((tactic: object) => {

        // Update the visibility properties of all techniques.
        tactic.techniques.forEach( (technique: object) => {
          const matchingComponents = technique.data_components.filter(component => active_data_components.includes(component));
          technique.visibility = matchingComponents.length > 0;
          if (technique.data_components.length === 0) {technique.visibility_ratio = 0;}
          else {technique.visibility_ratio = matchingComponents.length / technique.data_components.length;}
        })


        // // Old visibility computation, using subtechnique visibility.
        // // Update the visibility properties of all techniques.
        // tactic.techniques.forEach( (technique: object) => {
        //   // OPTION: dont use 'some', but compute a coverage statistic that can be added to the technique (also add to subtechnique!)
        //   let check = technique.data_components.some(component => active_data_components.includes(component));
        //   if (check) {
        //     technique.visibility = true;
        //     technique.visibility_ratio = 1;
        //   }

        //   // const active_data_components_set = new Set(active_data_components)
        //   // const intersection_technique = Array.from(active_data_components_set).filter(x =>  technique.data_components.includes(x));
        //   // console.log(intersection_technique);
        //   // if (intersection_technique.length > 0){
        //   //   technique.visibility = true;
        //   //   technique.visibility_ratio = 1;
        //   // }

        //   // Update all sub-techniques, as well as the alpha values of their parent techniques. 
        //   if (typeof technique.sub_techniques !== "undefined") {
        //     let total_sub_techniques_visible = 0;
        //     technique.sub_techniques.forEach( (sub_technique: Array) => {

        //       let check2 = sub_technique.data_components.some(component => active_data_components.includes(component));
        //       if (check2){
        //         sub_technique.visibility = true;
        //         total_sub_techniques_visible += 1;
        //       }
        //       // const intersection_subtechnique = Array.from(active_data_components_set).filter(x =>  sub_technique.data_components.includes(x));
        //       // if (intersection_subtechnique.length > 0){
        //       //   sub_technique.visibility = true;
        //       //   total_sub_techniques_visible= 1;
        //       // }

        //     });
        //     technique.visibility_ratio = (technique.visibility_ratio + total_sub_techniques_visible) / (technique.visibility_ratio + technique.sub_techniques.length);
        //   }

        // })



      })
      
    },




    // // TODO: this function may require optimization in the future. -> Using/processing YAML file is faster replacement.
    // async processDettectJson(data: any) {
    //   console.log('Processing DeTT&CT json file.');
    //   this.domain = data.domain;

    //   // Get tactics data of the current domain from the store.
    //   let tactics: Tactic[];
    //   if (data.domain == 'enterprise-attack') {
    //     tactics = this.enterprise.tactics;
    //   } else if (data.domain == 'mobile-attack') {
    //     tactics = this.mobile.tactics;
    //   } else if (data.domain == 'ics-attack') {
    //     tactics = this.ics.tactics;
    //   } else {
    //     return [];
    //   }

    //   // Create a lookup dictionary with (sub)technique IDs as keys, using the user-uploaded DeTT&CT json.
    //   // In this DeTT&CT json file, all techniques and sub-techniques are presented in a flattened list.
    //   let techniques_dict = {};  // Note! This dict will contain techniques AND subtechniques.
    //   data.techniques.forEach( (technique: object) => {
    //     techniques_dict[technique.techniqueID] = {
    //       available_datasources: technique.metadata[1].value,
    //       has_available_datasources: technique.metadata[1].value !== '-',
    //       is_subtechnique: technique.techniqueID.includes('.'),  // We assume that subtechniques have a '.' in their techniqueID.
    //     }
    //   });

    //   // The code below updates the Pinia store.
    //   // It loops over all (sub)technique in the tactics of the current domain, and updates them using the info from the techniques_dict.
    //   tactics.forEach( (tactic: object) => {
        
    //     // Update all techniques in the Pinia store.
    //     tactic.techniques.forEach( (technique: object) => {

    //       // If a technique is not present in the store, ignore it for now. 
    //       // TODO: find out why this non-presence may occur, and handle situations accordingly.
    //       let technique_update_data = techniques_dict[technique.external_id];
    //       if(typeof technique_update_data !== "undefined") {
    //         if (technique_update_data.available_datasources !== '-') {
    //           // technique.available_datasources = technique_update_data.available_datasources;
    //           technique.available_datasources = technique_update_data.available_datasources.split(',');  // String splitting could be turned off for a speed improvement, if we do not end up using the 'available data sources' individually in further processing.
    //         }
    //         technique.visibility = technique_update_data.has_available_datasources;
    //         technique.alpha = 1;
    //       }
          
    //       // Update all sub-techniques. 
    //       if (typeof technique.sub_techniques !== "undefined") {
    //         let total_subtechniques_visibility = 0;
    //         technique.sub_techniques.forEach( (sub_technique: Array) => {
    //           let sub_technique_update_data = techniques_dict[sub_technique.external_id];
    //           if(typeof sub_technique_update_data !== "undefined") {
    //             if (sub_technique_update_data.available_datasources !== '-') {
    //               total_subtechniques_visibility += 1;
    //               // sub_technique.available_datasources = sub_technique_update_data.available_datasources;
    //               sub_technique.available_datasources = sub_technique_update_data.available_datasources.split(',');  // String splitting could be turned off for a speed improvement, if we do not end up using the 'available data sources' individually in further processing.
    //             }
    //             sub_technique.visibility = sub_technique_update_data.has_available_datasources;
    //             sub_technique.alpha = 1;
    //           }
    //         });
    //         technique.alpha = (total_subtechniques_visibility+1) / (technique.sub_techniques.length+1);
    //       }

    //     });

    //   });
    // },

  }
});