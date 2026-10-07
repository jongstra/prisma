import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { tacticsStore } from '@/stores/tactics';
import * as yaml from 'yaml';
import Swal from 'sweetalert2';
import { recalculateUseCases } from '@/domain/magma/calculations';
import { findParentCycles, findUnknownParents, percentageProblem } from '@/domain/magma/validation';

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
  dataSource?: string;  // Self-defined data source by user.
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

// The ATT&CK domains that use cases can belong to.
const SUPPORTED_DOMAINS = ['enterprise-attack', 'mobile-attack', 'ics-attack'];

// The percentages of a use case that are entered by the user or imported.
const PERCENTAGE_FIELDS = ['visibility', 'implementation', 'effectiveness', 'inImpact', 'thrImpact', 'outImpact'] as const;

// A number for the YAML export; values that are not a valid number are left out instead of being saved as NaN.
const exportNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const formatPercentage = (number: any) => {
  number = Number(number);
  return number.toFixed(2);
};

export const magmaStore = defineStore('magma', {
  state: () => ({
    useCases: [] as UseCase[],
    activeTab: 'L1',
    heatmapVisibility: true,
    heatmapImplementation: true,
    heatmapEffectiveness: true,
    heatmapFilterValue: 0,
    heatmapSearchQuery: '' as string,
  }),

  getters: {
    getUseCaseById(state) {
      return (id: string, domain?: string) => state.useCases.find(useCase => useCase['id'] === id && (!domain || useCase.domain === domain));
    },
    getUseCaseByUid(state) {
      return (uid: string, domain?: string) => state.useCases.find(useCase => useCase['uid'] === uid && (!domain || useCase.domain === domain));
    },
    getAllUseCases(state) {
      return (domain?: string) => state.useCases.filter(useCase => useCase['level'] === 1 && (!domain || useCase.domain === domain));
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
    // The L3 use cases in a domain that detect a technique or one of its sub-techniques (e.g. T1566 and T1566.001).
    l3UseCasesForTechnique(state) {
      return (techniqueId: string, domain: string) => state.useCases.filter(useCase =>
        useCase.level === 3 && useCase.domain === domain &&
        (useCase.attackTechniqueId === techniqueId || useCase.attackTechniqueId?.startsWith(`${techniqueId}.`)));
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

      // Default IN/THR/OUT impacts of 100/0/0, which add up to 100% (so the cells do not turn red). Only for level 1 use cases.
      if (level === 1) {
        useCase.inImpact = 100;
        useCase.thrImpact = 0;
        useCase.outImpact = 0;
      }
      
      // Add the new use case to the store, and recalculate (a new L1 use case gets a risk straight away).
      this.useCases.push(useCase);
      this.recalculateAll();
    },
    

    addExistingUseCase(useCase: UseCase, recalculate = true) {

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

      // Check that the visibility, implementation, effectiveness and IN/THR/OUT impact are empty or a number from 0 to 100.
      // Older versions of PRISMA could save empty impacts as NaN (.nan); those are read as empty.
      for (const field of PERCENTAGE_FIELDS) {
        if (Number.isNaN(useCase[field])) {
          delete useCase[field];
        }
        const problem = percentageProblem(useCase[field]);
        if (problem) {
          throw new Error(`Use case "${useCase.id}" in domain "${useCase.domain}": ${field} "${useCase[field]}" is not valid; ${problem}.`);
        }
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

      // Add a unique ID and some organizational parameters to the use case, and add it to the store.
      useCase.uid = uuidv4();
      useCase.invalidVisibility = false;
      useCase.invalidId = false;
      useCase.invalidParentIds = false;
      useCase.domain = useCase.domain;
      this.useCases.push(useCase);

      // Recalculate the derived values (an import recalculates once, after adding all use cases).
      if (recalculate) {
        this.recalculateAll();
      }
    },

    
    removeUseCaseByUid(uid: string) {
      const useCase = this.getUseCaseByUid(uid);
      if (!useCase) { throw new Error(`No use case with uid "${uid}" exists.`);}

      // Remove the use case, and recalculate the values that depended on it. Its child use cases are kept and lose
      // their parent; the editor warns about this before deleting.
      this.useCases = this.useCases.filter(x => x['uid'] !== uid);
      this.recalculateAll();
    },


    // Rename a use case. Its child use cases (in the same domain) move along to the new ID. Returns a message explaining
    // why the rename is refused, or null when the use case was renamed.
    renameUseCase(uid: string, newId: string): string | null {
      const useCase = this.getUseCaseByUid(uid);
      if (!useCase) {
        return `No use case with uid "${uid}" exists.`;
      }
      if (useCase.permanent) {
        return `Use case "${useCase.id}" cannot be renamed.`;
      }
      const id = newId.trim();
      if (id === '') {
        return 'The ID of a use case cannot be empty.';
      }
      if (id === useCase.id) {
        return null;
      }
      if (id === 'none' || this.getUseCaseById(id, useCase.domain)) {
        return `A use case with ID "${id}" already exists in this domain. Choose another ID.`;
      }

      // Move the children along, unless another use case still has the old ID (then they keep that parent).
      const oldId = useCase.id;
      const oldIdStillUsed = this.useCases.some(other => other !== useCase && other.domain === useCase.domain && other.id === oldId);
      useCase.id = id;
      if (!oldIdStillUsed) {
        for (const child of this.getChildUseCases({ ...useCase, id: oldId })) {
          child.parentIds = child.parentIds!.map(parentId => parentId === oldId ? id : parentId);
        }
      }
      this.recalculateAll();
      return null;
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


    // Recalculate the derived values (weight, potential, L1/L2 averages and L1 risks) of all use cases in all domains,
    // children before parents (see domain/magma/calculations.ts). Recalculating everything after each change ensures
    // that no dependent value can stay outdated, for example a business risk after a change under cumulative IN.
    recalculateAll() {
      recalculateUseCases(this.useCases);
    },

    
    updateUseCase(uid: string, updatedFields: UpdatedFields, domain?: string) {
      const useCase = this.getUseCaseByUid(uid, domain);

      if (useCase) {

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

        if (domain) {
          useCase.domain = domain;
        }

        // Recalculate the derived values; this also covers the old and new parents when the parents were changed.
        this.recalculateAll();
      }
    },

  // Update the L3 use cases visibility based on the dettect visibility value, and update the depending weight/potential values. Also update any parent use cases.
    updateAllL3UseCasesBasedOnDettectVisibility() {
      this.L3UseCases().forEach((useCase) => {
        if (useCase.visibilityFromAttackTechnique === true && useCase.visibilityFromAttackTechniqueOverride === false) {
          useCase.visibility = formatPercentage(tactics.getDomainTechniqueVisibilityPercentageById(useCase.attackTechniqueId, useCase.domain))??0;
        }
      });
      this.recalculateAll();
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
          visibility: exportNumber(useCase.visibility),
          implementation: exportNumber(useCase.implementation),
          effectiveness: exportNumber(useCase.effectiveness),
          weight: exportNumber(useCase.weight),
          impact: exportNumber(useCase.weight),
        };
        
        // For the non-permanent level 1 use cases with inImpact/thrImpact/outImpact, add these attributes.
        if (useCase.level === 1 && !useCase.permanent) {
          return {
            ...baseAttributes,
            inImpact: exportNumber(useCase.inImpact),
            thrImpact: exportNumber(useCase.thrImpact),
            outImpact: exportNumber(useCase.outImpact),
          };
        }

        // Add the attackTechniqueId visibilityFromAttackTechniqueOverride attributes for all Level 3 use cases.
        if (useCase.level === 3) {
          return {
            ...baseAttributes,
            dataSource: useCase.dataSource,
            attackTechniqueId: useCase.attackTechniqueId,
            visibilityFromAttackTechniqueOverride: useCase.visibilityFromAttackTechniqueOverride,
          };
        }

        // All other use cases 
        return baseAttributes;
    
      });
    
      return yaml.stringify(exportedUseCases);
    },


    // Read a MaGMa file as a list of use cases. Throws an error with an explanation when the file cannot be read as MaGMa
    // use cases, so callers can refuse the file before changing anything.
    parseUseCaseFile(yamlData: string): any[] {
      let useCases;
      try {
        useCases = yaml.parse(yamlData);
      } catch (error) {
        throw new Error(`The file is not valid YAML: ${(error as Error).message}`);
      }
      if (!Array.isArray(useCases) || !useCases.every((useCase) => useCase && typeof useCase === 'object' && !Array.isArray(useCase))) {
        throw new Error('The file does not contain a list of MaGMa use cases.');
      }
      if (!useCases.some((useCase) => !useCase.permanent && SUPPORTED_DOMAINS.includes(useCase.domain))) {
        throw new Error(`The file contains no use cases for a supported domain (${SUPPORTED_DOMAINS.join(', ')}).`);
      }
      return useCases;
    },


    // The supported domains that a MaGMa file contains use cases for, in the usual domain order. The permanent IN/THR use
    // cases do not count: every file saved by PRISMA contains them for all domains.
    useCaseFileDomains(yamlData: string): string[] {
      const domains = new Set(this.parseUseCaseFile(yamlData).filter((useCase) => !useCase.permanent).map((useCase) => useCase.domain));
      return SUPPORTED_DOMAINS.filter((domain) => domains.has(domain));
    },


    // Load a MaGMa file: its use cases replace the current use cases of the domains in the file, and the other domains
    // stay as they are. Nothing changes when the file cannot be read.
    loadUseCaseFile(yamlData: string) {
      const useCases = this.parseUseCaseFile(yamlData);
      const domains = this.useCaseFileDomains(yamlData);
      this.useCases = this.useCases.filter((useCase) => useCase.permanent || !domains.includes(useCase.domain));
      this.importUseCases(useCases);
    },


    // Add use cases from a MaGMa file (as YAML text, or already read as a list) to the current use cases.
    importUseCases(yamlData: string | any[]) {
      try {
        // Parse the YAML data
        const useCases = typeof yamlData === 'string' ? yaml.parse(yamlData) : yamlData;
    
        // Initialize counters and an array for error messages
        let successCount = 0;
        let failCount = 0;
        const errorMessages: string[] = [];

        // Use cases that are their own (indirect) parent cannot be calculated, so they are not imported.
        const parentCycles = findParentCycles(useCases.filter((useCase: any) => !useCase.permanent));
    
        // Iterate over each use case and try to add it.
        useCases.forEach((useCase: any) => {
          // Skip permanent use cases, since they should always be present already for all 3 domains).
          if (useCase.permanent) {
            return
          }
          try {
            const cycle = parentCycles.get(useCase);
            if (cycle) {
              throw new Error(`Use case "${useCase.id}" in domain "${useCase.domain}" is its own (indirect) parent: ${cycle.join(' → ')}.`);
            }
            this.addExistingUseCase(useCase, false);
            successCount++;
          } catch (error) {
            failCount++;
            errorMessages.push(error.message);
          }
        });
        
        // Recalculate all use cases once, now that the whole file has been added.
        this.recalculateAll();

        // Prepare the summary message
        let summary = `Successful imports: ${successCount}. Failed imports: ${failCount}.`;
    
        // If there are any errors, append them to the summary
        if (errorMessages.length > 0) {
          summary += " _________________________________________________ FAILED USE CASES _________________________________________________ " + errorMessages.join("• ");
        }

        // Use cases with a parent ID that does not exist are imported, but listed as a warning (the ID may contain a typo).
        const unknownParents = findUnknownParents(this.useCases).map(({ useCase, parentId }) =>
          `Use case "${useCase.id}" in domain "${useCase.domain}" has parent "${parentId}", which does not exist.`);
        if (unknownParents.length > 0) {
          summary += " _________________________________________________ WARNINGS _________________________________________________ " + unknownParents.join("• ");
        }
    
        // Show the summary message
        Swal.fire({
          title: 'Import Summary',
          text: summary,
          icon: failCount > 0 || unknownParents.length > 0 ? 'warning' : 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Failed to parse YAML data:', error);
        Swal.fire({
          title: 'Error',
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
