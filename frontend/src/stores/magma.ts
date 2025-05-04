import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { tacticsStore } from '@/stores/tactics';
import * as yaml from 'yaml';
import Swal from 'sweetalert2';

const tactics = tacticsStore();

interface UseCase {
  domain: string;
  id: string;
  uid: string;
  name: string;
  description: string;
  level: number;
  parentIds?: Array<string>;
  attackTechniqueId?: string;
  visibilityFromAttackTechnique?: boolean;
  visibilityFromAttackTechniqueOverride?: boolean;
  visibility?: number | null;
  implementation?: number | null;
  effectiveness?: number | null;
  weight?: number | null;
  potential?: number | null;
  invalidVisibility?: boolean;
  invalidId?: boolean;
  invalidParentIds?: boolean;
  permanent?: boolean;
  inImpact?: number;
  thrImpact?: number;
  outImpact?: number;
  risk?: number;
}

interface UpdatedFields {
  name?: string;
  id?: string;
  description?: string;
  parentIds?: Array<string>;
  attackTechniqueId?: string;
  visibilityFromAttackTechniqueOverride?: boolean;
  visibility?: number | null;
  implementation?: number | null;
  effectiveness?: number | null;
}

const formatPercentage = (number: any) => {
  number = Number(number);
  return number.toFixed(2);
};

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
    domainSortedUseCases(state) {
      const domainOrder = {
        'enterprise-attack': 1,
        'mobile-attack': 2,
        'ics-attack': 3,
      };
  
      return state.useCases.slice().sort((a, b) => {
        return domainOrder[a.domain] - domainOrder[b.domain] || a.id.localeCompare(b.id);
      });
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
      return (useCase: UseCase) => {
        if (useCase && Array.isArray(useCase.parentIds)) {
          const parentUseCases = state.useCases.filter(parentUseCase => useCase.parentIds.includes(parentUseCase['id']) && (parentUseCase.domain === useCase.domain));
          return parentUseCases;
        } else {
          return [];
        }
      };
    },
    getChildUseCases(state) {
      return (useCase: UseCase) => {
        const childUseCases = state.useCases.filter(childUseCase => Array.isArray(childUseCase['parentIds']) && childUseCase['parentIds'].includes(useCase.id) && (childUseCase.domain === useCase.domain));
        return childUseCases;
      };
    },
    getGrandChildUseCases(state) {
      return (useCase: UseCase) => {
        const childUseCases = this.getChildUseCases(useCase);
        const grandChildUseCases = childUseCases.map(childUseCase => this.getChildUseCases(childUseCase)).flat();
        return grandChildUseCases
      };
    },
    getUseCasesByAttackTechniqueId(state) {
      return (attackTechniqueId: string) => {
        return state.useCases.filter(useCase => useCase['level'] === 3 && useCase.attackTechniqueId === attackTechniqueId);
      }
    },
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
    
      // Generate the new use case ID.
      const uid = uuidv4();

      // Create new UseCase object.
      const useCase: UseCase = {
        domain: domain,
        level,
        id: `L${level}-${newSuffix.toString()}`,
        // parentIds: ['none'],
        name: '',
        description: '',
        attackTechniqueId: 'none',
        visibilityFromAttackTechnique: false,
        visibilityFromAttackTechniqueOverride: false,
        visibility: null,
        implementation: null,
        effectiveness: null,
        weight: 0,
        potential: 100,
        uid: uid,
        invalidVisibility: false,
        invalidId: false,
        invalidParentIds: false,
      };

      // Default value of 100 (to prevent the IN/THR/OUT Impact % cells from becoming red). Only present for level 1 use cases.
      if (level === 1) {
        useCase.inImpact = 100;
      }
      
      // Add the new use case to the store.
      this.useCases.push(useCase);
    },
    

    addExistingUseCase(useCase: UseCase) {

      // Check that the domain is set to a valid value.
      if (!['enterprise-attack', 'mobile-attack', 'ics-attack'].includes(useCase.domain)) {
        throw new Error(`Use case domain "${useCase.domain}" is not supported. Please use one of: 'enterprise-attack', 'mobile-attack', 'ics-attack'. Use case: ${JSON.stringify(useCase)}`);
      }

      // Ensure that the use case has an ID.
      if (!useCase.id) {
        throw new Error(`The use case has no ID. Use case: ${JSON.stringify(useCase)}`);
      }

      // Catch duplicate IDs.
      if (this.getUseCaseById(useCase.id, useCase.domain)) {
        throw new Error(`Use case with id "${useCase.id}" in domain "${useCase.domain}" already exists. Use case: ${JSON.stringify(useCase)}`);
      }

      // Check that the use case has a level.
      if (!useCase.level) {
        throw new Error(`No use case level found. Use case: ${JSON.stringify(useCase)}`);
      }

      // Check that the use case level is valid.
      if (useCase.level !== 1 && useCase.level !== 2 && useCase.level !== 3) {
        throw new Error(`Use case level is incorrect. Use case: ${JSON.stringify(useCase)}`);
      }

      // Check that the visibility, implementation and effectiveness values are valid (between 0 and 100).
      if (useCase.visibility && (useCase.visibility < 0 || useCase.visibility > 100)) {
        throw new Error(`Use case visibility "${useCase.visibility}" is not valid. It must be between 0 and 100. Use case: ${JSON.stringify(useCase)}`);
      }
      if (useCase.implementation && (useCase.implementation < 0 || useCase.implementation > 100)) {
        throw new Error(`Use case implementation "${useCase.implementation}" is not valid. It must be between 0 and 100. Use case: ${JSON.stringify(useCase)}`);
      }
      if (useCase.effectiveness && (useCase.effectiveness < 0 || useCase.effectiveness > 100)) {
        throw new Error(`Use case effectiveness "${useCase.effectiveness}" is not valid. It must be between 0 and 100. Use case: ${JSON.stringify(useCase)}`);
      }
      
      // Check that the inImpact, thrImpact and outImpact values are valid (between 0 and 100).
      if (useCase.inImpact && (useCase.inImpact < 0 || useCase.inImpact > 100)) {
        throw new Error(`Use case inImpact "${useCase.inImpact}" is not valid. It must be between 0 and 100. Use case: ${JSON.stringify(useCase)}`);
      }
      if (useCase.thrImpact && (useCase.thrImpact < 0 || useCase.thrImpact > 100)) {
        throw new Error(`Use case thrImpact "${useCase.thrImpact}" is not valid. It must be between 0 and 100. Use case: ${JSON.stringify(useCase)}`);
      }
      if (useCase.outImpact && (useCase.outImpact < 0 || useCase.outImpact > 100)) {
        throw new Error(`Use case outImpact "${useCase.outImpact}" is not valid. It must be between 0 and 100. Use case: ${JSON.stringify(useCase)}`);
      }

      // If visibilityFromAttackTechniqueOverride is not set, use the default value 'false'.
      if (!useCase.visibilityFromAttackTechniqueOverride) {
        useCase.visibilityFromAttackTechniqueOverride = false;
      }

      // Ensure that visibilityFromAttackTechniqueOverride is a boolean.
      if (typeof useCase.visibilityFromAttackTechniqueOverride !== 'boolean') {
        throw new Error(`Use case has an invalid (non-boolean) value for property visibilityFromAttackTechniqueOverride. Use case: ${JSON.stringify(useCase)}`);
      }

      // If an attackTechnique is set, check that it exists and is valid.
      if (useCase.attackTechniqueId && useCase.attackTechniqueId !== 'none') {
        if (!tactics.domainTechniqueByIdMap(useCase.domain).hasOwnProperty(useCase.attackTechniqueId)) {
          throw new Error(`Use case attackTechniqueId "${useCase.attackTechniqueId}" does not exist in the specified domain. Use case: ${JSON.stringify(useCase)}`);
        } else {
          // If the useCase.attackTechniqueId is valid, update the use case visibility based on the visibility of the attack technique.
          // Handle a possible visibility override.
          if (!useCase.visibilityFromAttackTechniqueOverride) {
            useCase.visibility = formatPercentage(tactics.getDomainTechniqueVisibilityPercentageById(useCase.attackTechniqueId, useCase.domain))??0;
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

      // Compute the weight and the potential.
      useCase.weight = ((useCase.visibility??0)/100) * ((useCase.implementation??0)/100) * ((useCase.effectiveness??0)/100) * 100;
      useCase.potential = 100 - useCase.weight;

      // Add a unique ID and some organizational parameters to the use case, and add it to the store.
      useCase.uid = uuidv4();
      useCase.invalidVisibility = false;
      useCase.invalidId = false;
      useCase.invalidParentIds = false;
      useCase.domain = useCase.domain;
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
        if (!useCase.permanent) {
          this.removeUseCaseByUid(useCase.uid);
        }
      });
    },


    removeL1UseCases(domain?: string) {
      this.L1UseCases(domain).forEach(useCase => {
        if (!useCase.permanent) {
          this.removeUseCaseByUid(useCase.uid);
        }
      })
    },


    removeL2UseCases(domain?: string) {
      this.L2UseCases(domain).forEach(useCase => {
        if (!useCase.permanent) {
          this.removeUseCaseByUid(useCase.uid);
        }
      })
    },


    removeL3UseCases(domain?: string) {
      this.L3UseCases(domain).forEach(useCase => {
        if (!useCase.permanent) {
          this.removeUseCaseByUid(useCase.uid);
        }
      })
    },


    recomputeUseCases(useCases: Array<UseCase>) {
      useCases.forEach((useCase) => {
        const parentUseCases = this.getParentUseCases(useCase);
        const childUseCases = this.getChildUseCases(useCase);

        // Only recompute the visibility for a use case on L1 or L2.
        if (useCase.level != 3) {
          const meanVisibility = childUseCases.reduce((sum, obj) => sum + (Number(obj['visibility']) || 0), 0) / childUseCases.length;
          const meanImplementation = childUseCases.reduce((sum, obj) => sum + (Number(obj['implementation']) || 0), 0) / childUseCases.length;
          const meanEffectiveness = childUseCases.reduce((sum, obj) => sum + (Number(obj['effectiveness']) || 0), 0) / childUseCases.length;
          const meanWeight = childUseCases.reduce((sum, obj) => sum + (Number(obj['weight']) || 0), 0) / childUseCases.length;
          useCase['visibility'] = meanVisibility || 0;
          useCase['implementation'] = meanImplementation || 0;
          useCase['effectiveness'] = meanEffectiveness || 0;
          useCase['weight'] = meanWeight || 0;
          useCase['potential'] = 100 - (meanWeight || 0);
        }
        
        // Compute Risk on level 1.
        if (useCase.level === 1 && !useCase.permanent) {
          const inWeight = this.getUseCaseByUid('IN', useCase.domain).weight;
          const thrWeight = this.getUseCaseByUid('THR', useCase.domain).weight;
          const inRisk = ((useCase.inImpact??0)/100) * ((inWeight??0)/100);
          const thrRisk = ((useCase.thrImpact??0)/100)*((thrWeight??0)/100);
          const outRisk = ((useCase.outImpact??0)/100)*((useCase.weight??0)/100);
          useCase.risk = Math.max(0, (1-(inRisk+thrRisk+outRisk))) * 100;
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
              useCase.visibility = formatPercentage(tactics.getDomainTechniqueVisibilityPercentageById(attackTechniqueId, domain))??0;
            }
            useCase.visibilityFromAttackTechnique = true;
          }
        }

        // Update the use case.
        Object.assign(useCase, updatedFields);

        // Recompute the weight and the potential (strictly only necessary if at least one of the following updatedFields was changed: [ID, attackTechniqueId, visibilityFromAttackTechniqueOverride, visibility, implementation, effectiveness]).
        useCase.weight = ((useCase.visibility??0)/100) * ((useCase.implementation??0)/100) * ((useCase.effectiveness??0)/100) * 100;
        useCase.potential = 100 - useCase.weight;

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

  // Update the L3 use cases visibility based on the dettect visibility value, and update the depending weight/potential values. Also update any parent use cases.
    updateAllL3UseCasesBasedOnDettectVisibility() {
      this.L3UseCases().forEach((useCase) => {
        if (useCase.visibilityFromAttackTechnique === true && useCase.visibilityFromAttackTechniqueOverride === false) {
          useCase.visibility = formatPercentage(tactics.getDomainTechniqueVisibilityPercentageById(useCase.attackTechniqueId, useCase.domain))??0;
          useCase.weight = ((useCase.visibility??0)/100) * ((useCase.implementation??0)/100) * ((useCase.effectiveness??0)/100) * 100;
          useCase.potential = 100 - useCase.weight;
          const parentUseCases = this.getParentUseCases(useCase, useCase.domain);
          this.recomputeUseCases(parentUseCases);
        }
      });
    },


    exportUseCases() {
      const exportedUseCases = this.domainSortedUseCases.map(useCase => {
        const baseAttributes = {
          domain: useCase.domain,
          level: useCase.level,
          id: useCase.id,
          name: useCase.name,
          description: useCase.description,
          parentIds: useCase.parentIds,
          permanent: useCase.permanent,
          visibility: Number(useCase.visibility),
          implementation: Number(useCase.implementation),
          effectiveness: Number(useCase.effectiveness),
          weight: Number(useCase.weight),
          impact: Number(useCase.weight),
        };
        
        // For the non-permanent level 1 use cases with inImpact/thrImpact/outImpact, add these attributes.
        if (useCase.level === 1 && !useCase.permanent) {
          return {
            ...baseAttributes,
            inImpact: Number(useCase?.inImpact),
            thrImpact: Number(useCase?.thrImpact),
            outImpact: Number(useCase?.outImpact),
          };
        }

        // Add the attackTechniqueId visibilityFromAttackTechniqueOverride attributes for all Level 3 use cases.
        if (useCase.level === 3) {
          return {
            ...baseAttributes,
            attackTechniqueId: useCase.attackTechniqueId,
            visibilityFromAttackTechniqueOverride: useCase.visibilityFromAttackTechniqueOverride,
          };
        }

        // All other use cases 
        return baseAttributes;
    
      });
    
      return yaml.stringify(exportedUseCases);
    },


    importUseCases(yamlData: string) {
      try {
        // Parse the YAML data
        const useCases = yaml.parse(yamlData);
    
        // Initialize counters and an array for error messages
        let successCount = 0;
        let failCount = 0;
        const errorMessages: string[] = [];
    
        // Iterate over each use case and try to add it.
        useCases.forEach((useCase: any) => {
          // Skip permanent use cases, since they should always be present already for all 3 domains).
          if (useCase.permanent) {
            return
          }
          try {
            this.addExistingUseCase(useCase);
            successCount++;
          } catch (error) {
            failCount++;
            errorMessages.push(error.message);
          }
        });
        
        // Recompute all level 1 use cases
        this.recomputeUseCases(this.useCases.filter(useCase => useCase['level'] === 1));

        // Prepare the summary message
        let summary = `Successful imports: ${successCount}. Failed imports: ${failCount}.`;
    
        // If there are any errors, append them to the summary
        if (errorMessages.length > 0) {
          summary += " _________________________________________________ FAILED USE CASES _________________________________________________ " + errorMessages.join("• ");
        }
    
        // Show the summary message
        Swal.fire({
          title: 'Import Summary',
          text: summary,
          icon: failCount > 0 ? 'warning' : 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Failed to parse YAML data:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to parse YAML data. Please check the file.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },


    initializeDefaultUseCases() {
      if (this.useCases.length === 0) {
        this.useCases = [
          {
            domain: 'enterprise-attack',
            level: 1,
            uid: 'IN',
            id: 'IN',
            name: 'Cumulative IN risk',
            description: 'Cumulative risk of IN stages and techniques, serving as a risk amplifier for the business risks.',
            visibility: 0,
            implementation: 0,
            effectiveness: 0,
            weight: 0,
            potential: 100,
            permanent: true,
          },
          {
            domain: 'enterprise-attack',
            level: 1,
            uid: 'THR',
            id: 'THR',
            name: 'Cumulative THROUGH risk',
            description: 'Cumulative risk of THROUGH stages and techniques, serving as a risk amplifier for the business risks.',
            visibility: 0,
            implementation: 0,
            effectiveness: 0,
            weight: 0,
            potential: 100,
            permanent: true,
          },
          {
            domain: 'mobile-attack',
            level: 1,
            uid: 'IN',
            id: 'IN',
            name: 'Cumulative IN risk',
            description: 'Cumulative risk of IN stages and techniques, serving as a risk amplifier for the business risks.',
            visibility: 0,
            implementation: 0,
            effectiveness: 0,
            weight: 0,
            potential: 100,
            permanent: true,
          },
          {
            domain: 'mobile-attack',
            level: 1,
            uid: 'THR',
            id: 'THR',
            name: 'Cumulative THROUGH risk',
            description: 'Cumulative risk of THROUGH stages and techniques, serving as a risk amplifier for the business risks.',
            visibility: 0,
            implementation: 0,
            effectiveness: 0,
            weight: 0,
            potential: 100,
            permanent: true,
          },
          {
            domain: 'ics-attack',
            level: 1,
            uid: 'IN',
            id: 'IN',
            name: 'Cumulative IN risk',
            description: 'Cumulative risk of IN stages and techniques, serving as a risk amplifier for the business risks.',
            visibility: 0,
            implementation: 0,
            effectiveness: 0,
            weight: 0,
            potential: 100,
            permanent: true,
          },
          {
            domain: 'ics-attack',
            level: 1,
            uid: 'THR',
            id: 'THR',
            name: 'Cumulative THROUGH risk',
            description: 'Cumulative risk of THROUGH stages and techniques, serving as a risk amplifier for the business risks.',
            visibility: 0,
            implementation: 0,
            effectiveness: 0,
            weight: 0,
            potential: 100,
            permanent: true,
          },
        ];
      }
    },


  }
});
