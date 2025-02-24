import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { tacticsStore } from '@/stores/tactics';
import * as yaml from 'yaml';

const tactics = tacticsStore();

interface UseCase {
  id: string;
  uid: string;
  parentIds: Array<string>;
  name: string;
  level: number;
  attackTechniqueId: string;
  visibilityFromAttackTechnique: boolean;
  visibilityFromAttackTechniqueOverride: boolean;
  visibility: number | null;
  implementation: number | null;
  effectiveness: number | null;
  weight: number | null;
  invalidVisibility: boolean;
  invalidId: boolean;
  invalidParentIds: boolean;
  domain: string;
}

interface UpdatedFields {
  name?: string;
  id?: string;
  parentIds?: Array<string>;
  attackTechniqueId?: string;
  visibilityFromAttackTechniqueOverride?: boolean;
  visibility?: number | null;
  implementation?: number | null;
  effectiveness?: number | null;
}


export const magmaStore = defineStore('magma', {
  state: () => ({
    useCases: [] as UseCase[],
    activeTab: 'L1',
  }),

  getters: {
    getUseCaseById(state) {
      return (id: string, domain?: string) => state.useCases.find(useCase => useCase['id'] === id && (!domain || useCase.domain === domain));
    },
    getUseCaseByUid(state) {
      return (uid: string, domain?: string) => state.useCases.find(useCase => useCase['uid'] === uid && (!domain || useCase.domain === domain));
    },
    L1UseCases(state) {
      return (domain?: string) => state.useCases.filter(useCase => useCase['level'] === 1 && (!domain || useCase.domain === domain));
    },
    L2UseCases(state) {
      return (domain?: string) => state.useCases.filter(useCase => useCase['level'] === 2 && (!domain || useCase.domain === domain));
    },
    L3UseCases(state) {
      return (domain?: string) => state.useCases.filter(useCase => useCase['level'] === 3 && (!domain || useCase.domain === domain));
    },
    activeTabUseCases(state) {
      return (domain?: string) => {
        if (state.activeTab === 'L1') {
          return this.L1UseCases(domain);
        }
        if (state.activeTab === 'L2') {
          return this.L2UseCases(domain);
        }
        if (state.activeTab === 'L3') {
          return this.L3UseCases(domain);
        }
        return []; // Default case
      };
    },
    getAllIds(state) {
      return (domain?: string) => state.useCases
        .filter(useCase => !domain || useCase.domain === domain)
        .map(useCase => useCase['id']);
    },
    getAllUids(state) {
      return (domain?: string) => state.useCases
        .filter(useCase => !domain || useCase.domain === domain)
        .map(useCase => useCase['uid']);
    },
    getParentUseCases(state) {
      return (useCase: UseCase, domain?: string) => {
        if (useCase && Array.isArray(useCase.parentIds)) {
          const parentUseCases = state.useCases.filter(childUseCase => useCase.parentIds.includes(childUseCase['id']) && (!domain || childUseCase.domain === domain));
          return parentUseCases;
        } else {
          // console.log('useCase or useCase.parentIds is undefined:', useCase);
          return [];
        }
      };
    },
    getChildUseCasesById(state) {
      return (id: string, domain?: string) => {
        const childUseCases = state.useCases.filter(useCase => Array.isArray(useCase['parentIds']) && useCase['parentIds'].includes(id) && (!domain || useCase.domain === domain));
        // console.log(`Found ${childUseCases.length} child use cases for id: "${id}".`);
        return childUseCases;
      };
    }
  },

  actions: {
    addNewUseCase(level: number = 0, domain: string) {
      // Filter existing use cases to find those that match the specified level
      const filteredUseCases = this.useCases.filter(useCase => useCase['level'] === level && (!domain || useCase.domain === domain));
    
      // Extract numeric suffixes from the IDs of these use cases
      let maxSuffix = 0;
      for (const useCase of filteredUseCases) {
        const suffixPart = useCase['id'].split('-')[1];
        if (suffixPart) {
          const suffix = parseInt(suffixPart);
          if (!isNaN(suffix)) {
            maxSuffix = Math.max(maxSuffix, suffix);
          }
        }
      }
    
      // Increment the highest numeric suffix to generate a new unique ID
      const newSuffix = maxSuffix + 1;
    
      // Generate the new use case ID
      const uid = uuidv4();
      const useCase: UseCase = {
        id: `L${level}-${newSuffix.toString()}`,
        parentIds: ['none'],
        name: '',
        level,
        attackTechniqueId: 'none',
        visibilityFromAttackTechnique: false,
        visibilityFromAttackTechniqueOverride: false,
        visibility: null,
        implementation: null,
        effectiveness: null,
        weight: null,
        uid: uid,
        invalidVisibility: false,
        invalidId: false,
        invalidParentIds: false,
        domain: domain,
      };
      
      this.useCases.push(useCase);
    },
    

    addExistingUseCase(useCase: any) {
  
      // Check that the domain is set to a valid value.
      if (!['enterprise-attack', 'mobile-attack', 'ics-attack'].includes(useCase.domain)) {
        console.log(`Use case domain "${useCase.domain}" is not supported. Please use one of: 'enterprise-attack', 'mobile-attack', 'ics-attack'. Use case has not been added.`);
        return;
      }

      // Ensure that the use case has an ID.
      if (!useCase.id) {
        throw new Error(`The use case "${JSON.stringify(useCase)}" has no ID. Use case has not been added.`); 
      }
    
      // Catch duplicate IDs.
      if (this.getUseCaseById(useCase['id'], useCase.domain)) {
        console.log(`Use case with id "${useCase['id']}" in domain "${useCase.domain}" already exists. Use case has not been added.`); 
        return;
      };
    
      // Check that the use case has a level.
      if (!useCase.level) {
        console.log(`No use case level found for use case "${JSON.stringify(useCase)}". Use case has not been added.`);
        return;
      }
    
      // Check that the use case level is valid.
      if (useCase.level !== 1 && useCase.level !== 2 && useCase.level !== 3) {
        console.log(`Use case level is incorrect for use case "${JSON.stringify(useCase)}". Use case has not been added.`);
        return;
      }
    
      // Check that the level in the useCase.level and useCase.id are consistent with each other.
      if (useCase.level !== parseInt(useCase['id'].substring(1, 2))) {
        console.log(`Use case level "${useCase.level}" and usecase ID "${useCase.id}" are not consistent with each other. Use case has not been added.`);
        return;
      }
    
      // Check that the visibility, implementation and effectiveness values are valid (between 0 and 100).
      if (useCase.visibility < 0 || useCase.visibility > 100) {
        console.log(`Use case visibility "${useCase.visibility}" is not valid. It must be between 0 and 100. Use case has not been added.`);
        return;
      }
      if (useCase.implementation < 0 || useCase.implementation > 100) {
        console.log(`Use case implementation "${useCase.implementation}" is not valid. It must be between 0 and 100. Use case has not been added.`);
        return;
      }
      if (useCase.effectiveness < 0 || useCase.effectiveness > 100) {
        console.log(`Use case effectiveness "${useCase.effectiveness}" is not valid. It must be between 0 and 100. Use case has not been added.`);
        return;
      }

      // If visibilityFromAttackTechniqueOverride is not set, use the default value 'false'.
      if (!useCase.visibilityFromAttackTechniqueOverride) {
        useCase.visibilityFromAttackTechniqueOverride = false;
      }
    
      // Ensure that visibilityFromAttackTechniqueOverride is a boolean.
      if (typeof useCase.visibilityFromAttackTechniqueOverride !== 'boolean') {
        console.log(`Use case has an invalid (non-boolean) value for property visibilityFromAttackTechniqueOverride. Use case has not been added.`);
        return;
      }
      
      // If an attackTechnique is set, check that it exists and is valid.
      if (useCase.attackTechniqueId) {
        if (tactics.domainTechniqueByIdMap.hasOwnProperty(useCase.attackTechniqueId)) {
          // If the useCase.attackTechniqueId is valid, update the use case visibility based on the visibility of the attack technique.
            // Handle a possible visibility override.
            if (!useCase.visibilityFromAttackTechniqueOverride) {
              useCase.visibility = tactics.getDomainTechniqueVisibilityPercentageById(useCase.attackTechniqueId);
              useCase.visibilityFromAttackTechnique = true;
            } else {
              useCase.visibilityFromAttackTechnique = false;
            }
        }
      }
    
      // If no attackTechnique is set, use the default value 'none'.
      if (!useCase.attackTechniqueId) {
        useCase.attackTechniqueId = 'none';
        useCase.visibilityFromAttackTechnique = false;
      }

      // Compute the weight.
      useCase.weight = (useCase.visibility/100) * (useCase.implementation/100) * (useCase.effectiveness/100) * 100;
    
      // Add a unique ID and some organizational parameters to the use case, and add it to the store.
      useCase['uid'] = uuidv4();
      useCase['invalidVisibility'] = false;
      useCase['invalidId'] = false;
      useCase['invalidParentIds'] = false;
      useCase['domain'] = useCase.domain;
      this.useCases.push(useCase);
      
      // If a L1 or L2 use case was added, recompute its values after adding.
      if (useCase.level < 3) {
        this.recomputeUseCases([this.getUseCaseById(useCase.id)!]);
      }
    
      // If a L3 use case was added, recompute the values of any parents.
      if (useCase.level > 1) {
        if (useCase.parentIds) {
          const parentUseCases = this.getParentUseCases(useCase);
          this.recomputeUseCases(parentUseCases);
        }
      }
    },

    
    removeUseCaseByUid(uid: string) {
      const useCase = this.getUseCaseByUid(uid);
      if (!useCase) { throw new Error(`No use case with uid "${uid}" exists.`);}

      // Find parent use cases.
      const parentUseCases = this.getParentUseCases(useCase);

      // remove the use case.
      this.useCases = this.useCases.filter(x => x['uid'] !== uid);
      
      // Recompute values of any use cases that were parents of this one.
      if (useCase.level > 1) {
        this.recomputeUseCases(parentUseCases);
      }
    },


    removeAllUseCases() {
      this.useCases = [];
    },
    

    removeActiveTabUseCases(domain?: string) {
      this.activeTabUseCases(domain).forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      });
    },


    removeL1UseCases(domain?: string) {
      this.L1UseCases(domain).forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      })
    },


    removeL2UseCases(domain?: string) {
      this.L2UseCases(domain).forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      })
    },


    removeL3UseCases(domain?: string) {
      this.L3UseCases(domain).forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      })
    },


    recomputeUseCases(useCases: Array<UseCase>) {
      useCases.forEach((useCase) => {
        const parentUseCases = this.getParentUseCases(useCase);
        const childUseCases = this.getChildUseCasesById(useCase.id);
        // const meanVisibility = this.calculateMeanVisibility(childUseCases);

        // Only recompute the visibility for a use case on L1 or L2.
        if (useCase.level != 3) {
          const meanVisibility = childUseCases.reduce((sum, obj) => sum + (Number(obj['visibility']) || 0), 0) / childUseCases.length;
          const meanImplementation = childUseCases.reduce((sum, obj) => sum + (Number(obj['implementation']) || 0), 0) / childUseCases.length;
          const meanEffectiveness = childUseCases.reduce((sum, obj) => sum + (Number(obj['effectiveness']) || 0), 0) / childUseCases.length;
          const meanWeight = childUseCases.reduce((sum, obj) => sum + (Number(obj['weight']) || 0), 0) / childUseCases.length;
          useCase['visibility'] = meanVisibility;
          useCase['implementation'] = meanImplementation;
          useCase['effectiveness'] = meanEffectiveness;
          useCase['weight'] = meanWeight;
        }

        // If this use case has parents, check if they also need to be updated based on the new values of this use case.
        if (useCase.level > 1) {
          this.recomputeUseCases(parentUseCases);
        }
      });
    },

    
    updateUseCase(uid: string, updatedFields: UpdatedFields, domain?: string) {
      const useCase = this.getUseCaseByUid(uid, domain);

      if (useCase) {

        // Get old parent use cases.
        const parentUseCases = this.getParentUseCases(useCase);
        
        // If the attackTechniqueId field was updated, do the following.
        if (updatedFields.attackTechniqueId) {
          // Set visibility based on the visibility ratio of the selected ATT&CK technique (if one is selected).
          if (updatedFields.attackTechniqueId === 'none') {
            useCase.visibilityFromAttackTechnique = false;
          } else {
            if (!useCase.visibilityFromAttackTechniqueOverride) {
              const attackTechniqueId = updatedFields.attackTechniqueId;
              useCase.visibility = tactics.getDomainTechniqueVisibilityPercentageById(attackTechniqueId);
            }
            useCase.visibilityFromAttackTechnique = true;
          }
        }

        // Update the use case.
        Object.assign(useCase, updatedFields);

        // Recompute the weight (strictly only necessary if at least one of the following updatedFields was changed: [attackTechniqueId, visibilityFromAttackTechniqueOverride, visibility, implementation, effectiveness]).
        useCase.weight = (useCase.visibility??0/100) * (useCase.implementation??0/100) * (useCase.effectiveness??0/100) * 100;

        if (domain) {
          useCase.domain = domain;
        }
        this.recomputeUseCases([useCase]);

        // Update old parent use cases, if use case is L2 or L3.
        if (useCase.level > 1) {
          this.recomputeUseCases(parentUseCases);
        }
      }
    },


    updateAllL3UseCasesVisibility(domain?: string) {
      this.L3UseCases(domain).forEach((useCase) => {
        if (useCase.visibilityFromAttackTechnique === true && useCase.visibilityFromAttackTechniqueOverride === false) {
          useCase.visibility = tactics.getDomainTechniqueVisibilityPercentageById(useCase.attackTechniqueId);
          const parentUseCases = this.getParentUseCases(useCase, domain);
          this.recomputeUseCases(parentUseCases);
        }
      });
    },


    exportUseCases() {
      const exportedUseCases = this.useCases.map(useCase => ({
        id: useCase.id,
        parentIds: useCase.parentIds,
        name: useCase.name,
        level: useCase.level,
        attackTechniqueId: useCase.attackTechniqueId,
        visibilityFromAttackTechniqueOverride: useCase.visibilityFromAttackTechniqueOverride,
        visibility: useCase.visibility,
        implementation: useCase.implementation,
        effectiveness: useCase.effectiveness,
        domain: useCase.domain
      }));
    
      return yaml.stringify(exportedUseCases);
    },


    importUseCases(yamlData: string) {
      const importedUseCases = yaml.parse(yamlData);

      importedUseCases.forEach(useCase => {
        this.addExistingUseCase({
          id: useCase.id,
          parentIds: useCase.parentIds,
          name: useCase.name,
          level: useCase.level,
          attackTechniqueId: useCase.attackTechniqueId,
          visibilityFromAttackTechniqueOverride: useCase.visibilityFromAttackTechniqueOverride,
          visibility: useCase.visibility,
          implementation: useCase.implementation,
          effectiveness: useCase.effectiveness,
          domain: useCase.domain
        });
      });
    },


  }
});
