import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';


interface UseCase {
  id: string;
  uid: string;
  parentIds: Array<string>;
  name: string;
  level: number;
  visibility: number;
}


export const magmaStore = defineStore('magma', {
  state: () => ({
    useCases: [],
    activeTab: 'L1', // Initialize the active tab here
  }),

  getters: {
    getUseCaseById: (state) => (id: string) => {
      return state.useCases.find(useCase => useCase['id'] === id);
    },
    getUseCaseByUid: (state) => (uid: string) => {
      return state.useCases.find(useCase => useCase['uid'] === uid);
    },
    L1UseCases: (state) => {
      return state.useCases.filter(useCase => useCase['level'] === 1);
    },
    L2UseCases: (state) => {
      return state.useCases.filter(useCase => useCase['level'] === 2);
    },
    L3UseCases: (state) => {
      return state.useCases.filter(useCase => useCase['level'] === 3);
    },
    getAllIds: (state) => {
      return state.useCases.map(useCase => useCase['id']);
    },
    getAllUids: (state) => {
      return state.useCases.map(useCase => useCase['uid']);
    },
    getParentUseCasesById: (state) => (id: string) => {
      const useCase = state.useCases.find(useCase => useCase['id'] === id);
      if (useCase.parentIds) {
        const parentIds = useCase.parentIds;
        const parentUseCases = state.useCases.filter(useCase => parentIds.includes(useCase['id']));
        // const parentUseCases = state.useCases.filter(useCase => Array.isArray(useCase['parentIds']) && useCase['parentIds'].includes(id));
        // console.log(`Found ${parentUseCases.length} parent use cases for id: "${id}": ${JSON.stringify(parentUseCases)}.`);
        return parentUseCases;
      } else {
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
      const uid = uuidv4()
      const useCase: UseCase = {
        id: `L${level}-${uid.substring(0, 8)}`, // Example ID format
        parentIds: ['none'],
        name: '',
        level,
        visibility: 0,
        uid: uid,
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
        throw new Error(`Use case with id ${useCase['id']} already exists. Use case has not been added.`); 
      };

      // If the use case does not have a level set, extract it from the ID.
      if (!useCase.level) {
        useCase.level = parseInt(useCase['id'].substring(1, 2));
        // console.log(`Extracted level from the ID for use case: "${JSON.stringify(useCase)}"`)
      }

      // Check that the use case has a valid use case level.
      if (useCase.level !== 1 && useCase.level !== 2 && useCase.level !== 3) {
        throw new Error(`Use case level is incorrect for use case "${JSON.stringify(useCase)}". Use case has not been added.`); 
      }

      // Check that the level in the useCase.level and useCase.id are consistent with eachother.
      if (useCase.level !== parseInt(useCase['id'].substring(1, 2))) {
        throw new Error(`Usecase level "${useCase.level}" and usecase ID "${useCase.id}" are not consistent with each other. Use case has not been added.`);
      }

      // Add the level and a unique ID to the use case, and add it to the store.
      useCase['uid'] = uuidv4();
      this.useCases.push(useCase);
      // console.log(`Added use case: "${JSON.stringify(useCase)}"`)
      
      // If a L1 or L2 use case was added, recompute its values it after adding.
      if (useCase.level < 3) {
        this.recomputeUseCases([this.getUseCaseById(useCase.id)!]);
      }

      // If a L3 use case was added, recompute the values of any parents.
      if (useCase.level > 1) {
        // console.log(useCase.id)
        if (useCase.parentIds) {
          this.recomputeUseCases(this.getParentUseCasesById(useCase.id));
        }
      }
    },

    
    removeUseCaseByUid(uid: string) {
      const useCase = this.getUseCaseByUid(uid);
      if (!useCase) {throw new Error(`No use case with uid "${uid}" exists.`);}

      // Find parent use cases.
      var parentUseCases = [];
      if (useCase.parentIds) {
        parentUseCases = this.getParentUseCasesById(useCase.id);
      }

      // remove the use case.
      this.useCases = this.useCases.filter(x => x['uid'] !== uid);
      // console.log(`Removed use case: "${JSON.stringify(useCase)}"`)
      
      // Recompute values of any use cases that were parents of this one.
      if (useCase.level > 1) {
        this.recomputeUseCases(parentUseCases);
      }
    },


    recomputeUseCases(useCases: Array<UseCase>) {
      // console.log(`Updating use cases: ${JSON.stringify(useCases)}`);
      useCases.forEach((useCase) => {
        const parentUseCases = this.getParentUseCasesById(useCase.id);
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
    
      // Filter out useCases which have a visibility value outside of the valid range (0-100), or have a property named 'invalid'.
      const validObjects = useCases.filter(useCase => {
        const visibility = Number(useCase['visibility']) || 0;
        return visibility >= 0 && visibility <= 100 && !useCase.invalid;
      });
    
      // If no valid objects are left, return 0.
      if (validObjects.length === 0) return 0;
    
      // Calculate and return the mean of the valid visibility values.
      const meanVisibility = validObjects.reduce((sum, obj) => sum + (Number(obj['visibility']) || 0), 0) / validObjects.length;
      return meanVisibility;
    },



    updateUseCase(uid: string, updatedFields: {}) {
      const useCase = this.getUseCaseByUid(uid);

      if (useCase) {

        // Get old parent use cases.
        const parentUseCases = this.getParentUseCasesById(useCase.id);

        // Update use case.
        Object.assign(useCase, updatedFields);
        this.recomputeUseCases([useCase]);

        // Update old parent use cases, if use case is L2 or L3.
        if (useCase.level > 1) {
          this.recomputeUseCases(parentUseCases);
        }
      }


    },


  }


});
