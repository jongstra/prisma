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
  only_show_selected_groups: boolean;
  only_show_selected_components: boolean;
  only_show_selected_groups_magma_heatmap: boolean;
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
    minTotalOccurrencesBinned: 0 as number,
    pinnedTooltipId: '' as string,
  }),


  getters: {

    allTechniquesIdsAndNames: (state) => {
      let tactics;

      if (state.domain === 'enterprise-attack') {
        tactics = state.enterprise?.tactics || [];
      } else if (state.domain === 'mobile-attack') {
        tactics = state.mobile?.tactics || [];
      } else if (state.domain === 'ics-attack') {
        tactics = state.ics?.tactics || [];
      } else {
        tactics = [];
      }

      let allTechniquesIdsAndNames = tactics.flatMap(tactic => {
        return tactic.techniques.map(technique => ({
          id: technique.external_id,
          name: technique.name
        }));
      });

      // Remove duplicates using a Set based on the ID
      const uniqueTechniques = Array.from(new Map(allTechniquesIdsAndNames.map(item => [item.id, item])).values());

      // Sort the array alphabetically based on the ID
      uniqueTechniques.sort((a, b) => a.id.localeCompare(b.id));

      return uniqueTechniques;
    },


    allTechniquesAndSubtechniquesIdsAndNames: (state) => {
      let tactics;

      if (state.domain === 'enterprise-attack') {
        tactics = state.enterprise?.tactics || [];
      } else if (state.domain === 'mobile-attack') {
        tactics = state.mobile?.tactics || [];
      } else if (state.domain === 'ics-attack') {
        tactics = state.ics?.tactics || [];
      } else {
        tactics = [];
      }

      let allTechniquesAndSubtechniquesIdsAndNames = tactics.flatMap(tactic => {
        return tactic.techniques.flatMap(technique => {
          let techniqueData = [
            {
              id: technique.external_id,
              name: technique.name
            }
          ];

          if (technique.sub_techniques) {
            techniqueData.push(...technique.sub_techniques.map(subTechnique => ({
              id: subTechnique.external_id,
              name: subTechnique.name
            })));
          }

          return techniqueData;
        });
      });

      // Remove duplicates using a Set based on the ID
      const uniqueTechniques = Array.from(new Map(allTechniquesAndSubtechniquesIdsAndNames.map(item => [item.id, item])).values());

      // Sort the array alphabetically based on the ID
      uniqueTechniques.sort((a, b) => a.id.localeCompare(b.id));

      return uniqueTechniques;
    },


    domainTechniqueByIdMap: (state) => (domain) => {
      let tactics;
      if (domain === 'enterprise-attack') {
        tactics = state.enterprise?.tactics;
      } else if (domain === 'mobile-attack') {
        tactics = state.mobile?.tactics;
      } else if (domain === 'ics-attack') {
        tactics = state.ics?.tactics;
      }

      let domainTechniqueByIdMap = {};

      if (tactics) {
        tactics.forEach(tactic => {
          tactic.techniques.forEach(technique => {
            domainTechniqueByIdMap[technique.external_id] = technique;
            if (technique.sub_techniques) {
              technique.sub_techniques.forEach(subTechnique => {
                domainTechniqueByIdMap[subTechnique.external_id] = subTechnique;
              });
            }
          });
        });
      }

      return domainTechniqueByIdMap;
    },


    getDomainTechniqueVisibilityPercentageById: (state) => (id: string, domain: string) => {
      let technique = state.domainTechniqueByIdMap(domain)[id];

      if (technique) {
        return technique.visibility_ratio * 100;
      }

      return null;
    },


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


    selectedGroupsTechniquesSetMagmaHeatmap: (state) => {
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
        if (group?.selectedInMagmaHeatmap) {
          groupsTechniques.push(...group.techniques)
        }
      });

      // Remove duplicates in the techniques list, and return it.
      const groupsTechniquesSet = new Set(groupsTechniques);
      return groupsTechniquesSet;
    },



    hoveredComponentsTechniquesSet: (state) => {
      let components;

      if (state.domain === 'enterprise-attack') {
        components = state.enterprise?.data_components;
      } else if (state.domain === 'mobile-attack') {
        components = state.mobile?.data_components;
      } else if (state.domain === 'ics-attack') {
        components = state.ics?.data_components;
      }

      // Add all techniques of hovered data_components to a list.
      let componentsTechniques = [];
      components.forEach(component => {
        if (component?.hovered) {
          componentsTechniques.push(...component.techniques)
        }
      });

      // Remove duplicates in the techniques list, and return it.
      const componentsTechniquesSet = new Set(componentsTechniques);
      return componentsTechniquesSet;
    },

    selectedComponentsTechniquesSet: (state) => {
      let components;

      if (state.domain === 'enterprise-attack') {
        components = state.enterprise?.data_components;
      } else if (state.domain === 'mobile-attack') {
        components = state.mobile?.data_components;
      } else if (state.domain === 'ics-attack') {
        components = state.ics?.data_components;
      }

      // Add all techniques of selected data_components to a list.
      let componentsTechniques = [];
      components.forEach(component => {
        if (component?.selected) {
          componentsTechniques.push(...component.techniques)
        }
      });

      // Remove duplicates in the techniques list, and return it.
      const componentsTechniquesSet = new Set(componentsTechniques);
      return componentsTechniquesSet;
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
        this.dataLoaded = false;
        const response = await axios.get('tactics_and_techniques_by_domain.json');
        this.enterprise = response.data.enterprise;
        this.mobile = response.data.mobile;
        this.ics = response.data.ics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      } finally {
        this.dataLoaded = true;
      }
    },

    setDomain(newDomain: string) {
      this.domain = newDomain;
    },


    processDettectYaml(data: any) {

      // Check for duplicate data source names in the YAML.
      const dataSourceNames = data.data_sources.map((ds: any) => ds.data_source_name);
      const seen = new Set<string>();
      const duplicates: string[] = [];
      for (const name of dataSourceNames) {
        if (seen.has(name)) {
          if (!duplicates.includes(name)) duplicates.push(name);
        }
        seen.add(name);
      }
      if (duplicates.length > 0) {
        throw new Error(`Duplicate data sources found in YAML: ${duplicates.join(', ')}. Please remove the duplicates before loading.`);
      }

      // Switch to relevant domain based on the uploaded file.
      this.domain = data.domain;
      // Reset any previous component visibility settings for this domain (set visibility=false as the default for each component).
      this.resetDomainVisibility(data.domain);

      // Access data of the current domain from the store.
      let tactics;
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
      data.data_sources.forEach((data_source) => {
        let component = data_components_list.find((component) => component.name === data_source.data_source_name)

        for (const quality_indicator in data_source.data_source[0]['data_quality']) {
          component['quality'][quality_indicator] = data_source.data_source[0]['data_quality'][quality_indicator]
        }

        component.visibility = true;
      });


      // Get all DeTT&CT data sources that are administerd in the YAML file, and make an array of Objects (name, device_completeness) for them.
      let dettect_data_sources = data.data_sources.map(
        (data_source) => ({
          name: data_source.data_source_name,
          device_completeness: data_source.data_source[0]['data_quality']['device_completeness']
        })
      );

      // Data sources in DeTT&CT are the same as data components in MITRE ATT&CK.
      let active_data_components = dettect_data_sources;

      // Loop over all tactics/techniques/subtechniques in the Pinia store to update their visibility and alpha.
      tactics.forEach((tactic: object) => {

        // Update the visibility properties of techniques.
        tactic.techniques.forEach((technique: object) => {
          // const matchingComponents = technique.data_components.filter(component => active_data_components.includes(component));
          const matchingComponents = active_data_components.filter(component => technique.data_components.includes(component.name));
          technique.visibility = matchingComponents.length > 0;
          if (technique.data_components.length === 0) {technique.visibility_ratio = 0;}
          else {
            technique.visibility_ratio = 0
            // Use unique data component names to avoid double-counting duplicates in the ATT&CK definitions
            const uniqueDataComponents = [...new Set(technique.data_components)];
            for (const component of matchingComponents) {
              technique.visibility_ratio += (component.device_completeness / 5) / uniqueDataComponents.length;
            }
          }
          // else {technique.visibility_ratio = matchingComponents.length / technique.data_components.length;}
        })

        // Update the visibility properties of subtechniques. And update the technique visibility_ratio as well when it has such subtechniques.
        tactic.techniques.forEach((technique: object) => {
          if (typeof technique.sub_techniques !== "undefined") {
            technique.visibility_ratio = technique.visibility_ratio / (technique.sub_techniques.length+1)  // Normalize technique visibility_ratio based on amount of subtechniques plus the technique itsself as the normalization factor.
            technique.sub_techniques.forEach((subtechnique: object) => {
              const matchingComponents = active_data_components.filter(component => subtechnique.data_components.includes(component.name));
              subtechnique.visibility = matchingComponents.length > 0;
              if (subtechnique.data_components.length === 0) {subtechnique.visibility_ratio = 0;}
              else {
                subtechnique.visibility_ratio = 0
                // Use unique data component names to avoid double-counting duplicates in the ATT&CK definitions
                const uniqueDataComponents = [...new Set(subtechnique.data_components)];
                for (const component of matchingComponents) {
                  subtechnique.visibility_ratio += (component.device_completeness / 5) / uniqueDataComponents.length;
                }
                technique.visibility_ratio += (subtechnique.visibility_ratio / (technique.sub_techniques.length+1)) // For each subtechnique, update technique visibility_ratio using the same normalization factor as above.
              }
            })
          }
        })
      })
    },


    resetDomainVisibility(domain: string) {
      let tactics;
      let data_components: Attributes[];
      if (domain == 'enterprise-attack') {
        tactics = this.enterprise.tactics;
        data_components = this.enterprise.data_components;
      } else if (domain == 'mobile-attack') {
        tactics = this.mobile.tactics;
        data_components = this.mobile.data_components;
      } else if (domain == 'ics-attack') {
        tactics = this.ics.tactics;
        data_components = this.ics.data_components;
      } else {
        return;
      }

      // Reset all components to visibility = false
      data_components.forEach(component => {
        component.visibility = false;
      });

      // Reset all techniques and subtechniques to visibility_ratio = 0
      tactics.forEach((tactic: any) => {
        tactic.techniques.forEach((technique: any) => {
          technique.visibility = false;
          technique.visibility_ratio = 0;

          if (typeof technique.sub_techniques !== "undefined") {
            technique.sub_techniques.forEach((subtechnique: any) => {
              subtechnique.visibility = false;
              subtechnique.visibility_ratio = 0;
            });
          }
        });
      });
    },
  }
});
