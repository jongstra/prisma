import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { tacticsStore } from '@/stores/tactics';
const tactics = tacticsStore();


interface UseCase {
  id: string;
  uid: string;
  parentIds: Array<string>
  name: string;
  level: number;
  attackTechniqueIdAndName: string;
  visibilityFromAttackTechnique: boolean;
  visibility: number;
  invalidVisibility: boolean,
  invalidId: boolean,
  invalidParentIds: boolean,
}


export const magmaStore = defineStore('magma', {
  state: () => ({
    useCases: [],
    activeTab: 'L1',
  }),

  getters: {
    getUseCaseById(state) {
      return (id) => state.useCases.find(useCase => useCase['id'] === id);
    },
    getUseCaseByUid(state) {
      return (uid) => state.useCases.find(useCase => useCase['uid'] === uid);
    },
    L1UseCases(state) {
      return state.useCases.filter(useCase => useCase['level'] === 1);
    },
    L2UseCases(state) {
      return state.useCases.filter(useCase => useCase['level'] === 2);
    },
    L3UseCases(state) {
      return state.useCases.filter(useCase => useCase['level'] === 3);
    },
    activeTabUseCases(state) {
      return () => {
        if (state.activeTab === 'L1') {
          return this.L1UseCases;
        }
        if (state.activeTab === 'L2') {
          return this.L2UseCases;
        }
        if (state.activeTab === 'L3') {
          return this.L3UseCases;
        }
        return []; // Default case
      };
    },
    getAllIds(state) {
      return state.useCases.map(useCase => useCase['id']);
    },
    getAllUids(state) {
      return state.useCases.map(useCase => useCase['uid']);
    },
    getParentUseCases: (state) => (useCase) => {
      if (useCase && Array.isArray(useCase.parentIds)) {
        const parentUseCases = state.useCases.filter(childUseCase => useCase.parentIds.includes(childUseCase['id']));
        return parentUseCases;
      } else {
        // console.log('useCase or useCase.parentIds is undefined:', useCase);
        return [];
      }
    },
    getChildUseCasesById: (state) => (id: string) => {
      const childUseCases = state.useCases.filter(useCase => Array.isArray(useCase['parentIds']) && useCase['parentIds'].includes(id));
      // console.log(`Found ${childUseCases.length} child use cases for id: "${id}".`);
      return childUseCases;
    }
  },


  actions: {


    addNewUseCase(level: number = 0) {
      // Filter existing use cases to find those that match the specified level
      const filteredUseCases = this.useCases.filter(useCase => useCase['level'] === level);
    
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
        attackTechniqueIdAndName: 'none',
        visibilityFromAttackTechnique: false,
        visibility: 0,
        uid: uid,
        invalidVisibility: false,
        invalidId: false,
        invalidParentIds: false,
      };
      
      this.useCases.push(useCase);
    },
    

    addExistingUseCase(useCase: any) {
      
      // Ensure that the use case has an ID.
      if (!useCase.id) {
        throw new Error(`The use case "${JSON.stringify(useCase)}" has no ID. Use case has not been added.`); 
      }

      // Catch duplicate ID's.
      if (this.getUseCaseById(useCase['id'])) {
        console.log(`Use case with id ${useCase['id']} already exists. Use case has not been added.`); 
        return;
      };

      // // If the use case does not have a level set, extract it from the ID.
      // if (!useCase.level) {
      //   useCase.level = parseInt(useCase['id'].substring(1, 2));
      //   // console.log(`Extracted level from the ID for use case: "${JSON.stringify(useCase)}"`)
      // }


      // Check that the use case has a level.
      if (!useCase.level) {
        console.log(`No use case level found for use case "${JSON.stringify(useCase)}". Use case has not been added.`);
      }

      // Check that the use case level is valid.
      if (useCase.level !== 1 && useCase.level !== 2 && useCase.level !== 3) {
        console.log(`Use case level is incorrect for use case "${JSON.stringify(useCase)}". Use case has not been added.`);
        return;
      }

      // Check that the level in the useCase.level and useCase.id are consistent with eachother.
      if (useCase.level !== parseInt(useCase['id'].substring(1, 2))) {
        console.log(`Usecase level "${useCase.level}" and usecase ID "${useCase.id}" are not consistent with each other. Use case has not been added.`);
        return;
      }

      // If an attackTechnique is set, check that it exists and is valid.
      if (useCase.attackTechniqueIdAndName) {
        const attackTechniqueID = useCase.attackTechniqueIdAndName.split(':')[0];
        if (tactics.domainTechniqueByIdMap.hasOwnProperty(attackTechniqueID)) {
          // If the attackTechniqueID is valid, update the use case visibility based on the visibility of the attack technique.
          useCase.visibility = tactics.getDomainTechniqueVisibilityPercentageById(attackTechniqueID);
          useCase.visibilityFromAttackTechnique = true;
        }
      }

      // If no attackTechnique is set, use the default value 'none'.
      if (!useCase.attackTechniqueIdAndName) {
        useCase.attackTechniqueIdAndName = 'none'
        useCase.visibilityFromAttackTechnique = false;
      }

      // Add a unique ID and some organizational parameters to the use case, and add it to the store.
      useCase['uid'] = uuidv4();
      useCase['invalidVisibility'] = false;
      useCase['invalidId'] = false;
      useCase['invalidParentIds'] = false;
      this.useCases.push(useCase);
      // console.log(`Added use case: "${JSON.stringify(useCase)}"`)
      
      // If a L1 or L2 use case was added, recompute its values it after adding.
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
      if (!useCase) {throw new Error(`No use case with uid "${uid}" exists.`);}

      // Find parent use cases.
      const parentUseCases = this.getParentUseCases(useCase);

      // remove the use case.
      this.useCases = this.useCases.filter(x => x['uid'] !== uid);
      // console.log(`Removed use case: "${JSON.stringify(useCase)}"`)
      
      // Recompute values of any use cases that were parents of this one.
      if (useCase.level > 1) {
        this.recomputeUseCases(parentUseCases);
      }
    },


    removeAllUseCases() {
      this.useCases = [];
    },
    

    removeActiveTabUseCases() {
      this.activeTabUseCases().forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      });
    },


    removeL1UseCases() {
      this.L1UseCases.forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      })
    },


    removeL2UseCases() {
      this.L2UseCases.forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      })
    },


    removeL3UseCases() {
      this.L3UseCases.forEach(useCase => {
        this.removeUseCaseByUid(useCase.uid);
      })
    },


    recomputeUseCases(useCases: Array<UseCase>) {
      // console.log(`Updating use cases: ${JSON.stringify(useCases)}`);
      useCases.forEach((useCase) => {
        const parentUseCases = this.getParentUseCases(useCase);
        const childUseCases = this.getChildUseCasesById(useCase.id);
        const meanVisibility = this.calculateMeanVisibility(childUseCases);

        // Only recompute the visibility for a use case on L1 or L2.
        if (useCase.level != 3) {
          useCase['visibility'] = meanVisibility;
        }

        // If this use case has parents, check if they also need to be updated based on the new values of this use case.
        if (useCase.level > 1) {
          this.recomputeUseCases(parentUseCases);
        }
      });
    },



    calculateMeanVisibility(useCases: Array<UseCase>) {
      if (useCases.length === 0) return 0;
      

      // // DEZE PRINTS LATEN DE ERROR ZIEN. Lijkt mis te gaan met een race condition in getBackgroundColor.
      // console.log('ALL USE CASES:')
      // useCases.forEach((useCase) => console.log(useCase))
      // useCases.forEach((useCase) => console.log(useCase.invalidVisibility))
      // useCases.forEach((useCase) => console.log(useCase.invalidId))
      // useCases.forEach((useCase) => console.log(`${useCase.id} ${useCase.invalidParentIds}`))


      // PLEASE LOOK INTO THIS: Here all 5 use cases are shown. They all have properties invalidVisibility, invalidId and invalidParentIds set to false.
      const validUseCases = useCases.filter(useCase => {
        // console.log(useCase)
        return(useCase)
        // return (!useCase.invalidVisibility && !useCase.invalidId && !useCase.invalidParentIds);
      });

      // console.log('VALID USE CASES:')
      // validUseCases.forEach((useCase) => console.log(useCase))
      // PLEASE LOOK INTO THIS: Here only 4 use cases are shown. Why is one filtered out? Could this be due to a race condition? The missing use case is the one that was used in updateUseCase..
    
      // If no valid use cases are left, return 0.
      if (validUseCases.length === 0) return 0;
    
      // Calculate and return the mean of the valid visibility values.
      const meanVisibility = validUseCases.reduce((sum, obj) => sum + (Number(obj['visibility']) || 0), 0) / validUseCases.length;
      
      return meanVisibility;
    },
    

    // updateActiveUseCasesIdValidity() {
      
    //   // Find duplicate IDs in activeTabUseCases
    //   const useCases = this.activeTabUseCases();
    //   const useCasesIds = useCases.map(useCase => useCase.id);
    //   // Iterate through the useCasesIds array. For each id, check if the first occurrence index is different from the current index. If so, the id is a duplicate.
    //   const duplicateIds = useCasesIds.filter((id, index) => useCasesIds.indexOf(id) !== index);

    //   console.log(useCasesIds)

    //   // Set useCase.invalidId if useCase.id is in duplicateIds
    //   useCases.forEach(useCase => {
    //     useCase.invalidId = duplicateIds.has(useCase.id);
    //   });
    // },

    updateUseCase(uid: string, updatedFields: {}) {
      const useCase = this.getUseCaseByUid(uid);

      if (useCase) {

        // // Update the ID validity of all use cases in the active tab.
        // if (updatedFields.id) {
        //   this.updateActiveUseCasesIdValidity()
        // }
        //   // TODO: Find duplicate IDs in activeTabUseCases.
        //   const duplicateIds = this.activeTabUseCases()

        //   // TODO: set useCase invalidId if useCase.id is in duplicateIds.
        //   this.activeTabUseCases().forEach(useCase => {
            
        //   });
        // }
        
        // // Isolate the parentIds from the parentIdsAndNames.
        // if (updatedFields.parentIdsAndNames) {
        //   updatedFields.parentIds = updatedFields.parentIdsAndNames.map(idString => {
        //     // Use a regular expression to match the ID part of the string.
        //     const match = idString.match(/^([^:]+):/);v
        //     // If a match is found, return the captured group (the ID).
        //     if (match) {
        //       return match[1].trim();
        //     }
        //   });
        // }
        
        // Update the ID validity of all use cases in the active tab.


        // Get old parent use cases.
        const parentUseCases = this.getParentUseCases(useCase);
        
        // If the attackTechniqueIdAndName field was updated, do the following.
        if (updatedFields.attackTechniqueIdAndName) {
          // Set visibility based on the visibility ratio of the selected ATT&CK technique (if one is selected).
          if (updatedFields.attackTechniqueIdAndName == 'none') {
            useCase.visibilityFromAttackTechnique = false;
          } else {
            const attackTechniqueID = updatedFields.attackTechniqueIdAndName.split(':')[0];
            useCase.visibility = tactics.getDomainTechniqueVisibilityPercentageById(attackTechniqueID);
            useCase.visibilityFromAttackTechnique = true;
          }
        }

        // Update use case.
        Object.assign(useCase, updatedFields);
        this.recomputeUseCases([useCase]);
        // console.log(`useCase: ${JSON.stringify(useCase)}`);

        // Update old parent use cases, if use case is L2 or L3.
        if (useCase.level > 1) {
          this.recomputeUseCases(parentUseCases);
        }
      }
    },


    updateAllL3UseCasesVisibility() {
      this.L3UseCases.forEach((useCase) => {
        if (useCase.visibilityFromAttackTechnique === true) {
          const attackTechniqueID = useCase.attackTechniqueIdAndName.split(':')[0];
          useCase.visibility = tactics.getDomainTechniqueVisibilityPercentageById(attackTechniqueID);
          const parentUseCases = this.getParentUseCases(useCase);
          this.recomputeUseCases(parentUseCases);
        }
      });
    },


  }


});
