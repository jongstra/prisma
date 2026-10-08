import { defineStore } from 'pinia'
import Swal from 'sweetalert2';
import { ownVisibility, techniqueVisibility } from '@/domain/attack/visibility';
import { readDettectFile } from '@/domain/attack/dettect';


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

      const techniquesMap: Record<string, { name: string, group_occurrence: number, software_occurrence: number, total_occurrence: number }> = {};

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


    // TODO: possibly merge this code with the function above (by adding an extra parameter to the function call).
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
        const response = await fetch('tactics_and_techniques_by_domain.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.enterprise = data.enterprise;
        this.mobile = data.mobile;
        this.ics = data.ics;
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
        Swal.fire({
          icon: 'error',
          titleText: 'The ATT&CK data was not loaded',
          text: `Could not load the ATT&CK data (tactics_and_techniques_by_domain.json): ${(error as Error).message}. Please reload the page.`,
        });
      } finally {
        this.dataLoaded = true;
      }
    },

    setDomain(newDomain: string) {
      this.domain = newDomain;
    },


    // Load a DeTT&CT data source administration file. The whole file is checked first (see domain/attack/dettect.ts):
    // when it has a problem, an error explains it and nothing changes. Data sources that ATT&CK does not know are ignored
    // and returned, so they can be reported.
    processDettectYaml(data: any): { unknownDataSources: string[] } {
      const domainData = (domain: string): any =>
        ({ 'enterprise-attack': this.enterprise, 'mobile-attack': this.mobile, 'ics-attack': this.ics } as any)[domain];
      if (!this.enterprise?.tactics) {
        throw new Error('The ATT&CK data is not loaded (yet). Please reload the page.');
      }
      const file = readDettectFile(data, (domain) => (domainData(domain)?.data_components ?? []).map((component: any) => component.name));

      // Switch to the domain of the file, and start from a clean state for that domain.
      this.domain = file.domain;
      this.resetDomainVisibility(file.domain);
      const tactics = domainData(file.domain).tactics;
      const dataComponents = domainData(file.domain).data_components;

      // Apply the quality scores of the data sources (DeTT&CT) to the data components (ATT&CK).
      for (const [name, entry] of file.dataSources) {
        const component = dataComponents.find((component: any) => component.name === name);
        Object.assign(component.quality, entry.data_quality);
        component.visibility = true;
      }

      // Device completeness of every known data source in the file (0-5 in DeTT&CT, here as a fraction 0-1).
      const completeness = file.completeness;

      // Update the visibility of all techniques and sub-techniques of the domain. Techniques and sub-techniques for which
      // ATT&CK lists no data components cannot be detected via data sources; they get visibility_ratio 0 and are left
      // out of the visibility averages (see domain/attack/visibility.ts).
      tactics.forEach((tactic: any) => {
        tactic.techniques.forEach((technique: any) => {
          technique.visibility = technique.data_components.some((component: string) => completeness.has(component));
          technique.visibility_ratio = techniqueVisibility(technique, completeness) ?? 0;
          technique.sub_techniques?.forEach((subtechnique: any) => {
            subtechnique.visibility = subtechnique.data_components.some((component: string) => completeness.has(component));
            subtechnique.visibility_ratio = ownVisibility(subtechnique, completeness) ?? 0;
          });
        });
      });

      return { unknownDataSources: file.unknownDataSources };
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
