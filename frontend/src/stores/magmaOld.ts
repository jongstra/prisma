import { defineStore } from 'pinia';

export const magmaStore = defineStore('magma', {
  state: () => ({
    L1UseCases: [],
    L2UseCases: [],
    L3UseCases: [],
    activeTab: 'L1', // Initialize the active tab here
  }),
  getters: {
    getL1UseCaseById: (state) => (id) => state.L1UseCases.find(L1 => L1['id'] === id),
    getL2UseCaseById: (state) => (id) => state.L2UseCases.find(L2 => L2['id'] === id),
    getL3UseCaseById: (state) => (id) => state.L3UseCases.find(L3 => L3['id'] === id),
    getActiveTab: (state) => state.activeTab, // Getter for active tab
  },
  actions: {

    addL1UseCase(useCase) {
      if (this.getL1UseCaseById(useCase['id'])) {
        console.error(`L1 Object with id ${useCase['id']} already exists.`);
        return;
      }
      this.L1UseCases.push(useCase);
      this.updateL1Visibility(useCase['id']);
    },
    removeL1UseCase(id) {
      this.L1UseCases = this.L1UseCases.filter(L1 => L1['id'] !== id);
    },

    addL2UseCase(useCase) {
      if (this.getL2UseCaseById(useCase['id'])) {
        console.error(`L2 use case with id ${useCase['id']} already exists.`);
        return;
      }
      this.L2UseCases.push(useCase);
      this.updateL2Visibility(useCase['id']);
      this.updateL1Visibility(useCase['L1id']);
    },
    removeL2UseCase(id) {
      const L2 = this.getL2UseCaseById(id);
      if (L2) {
        this.L2UseCases = this.L2UseCases.filter(L2 => L2['id'] !== id);
      }
    },

    addL3UseCase(useCase) {
      if (this.getL3UseCaseById(useCase['id'])) {
        console.error(`L3 use case with id ${useCase['id']} already exists.`);
        return;
      }
      this.L3UseCases.push(useCase);
      this.updateL2Visibility(useCase['L2id']);
    },
    removeL3UseCase(id) {
      const L3 = this.getL3UseCaseById(id);
      if (L3) {
        this.L3UseCases = this.L3UseCases.filter(L3 => L3['id'] !== id);
      }
    },

    updateL2Visibility(L2id) {
      const L3Objects = this.L3UseCases.filter(l3 => l3['L2id'] === L2id);
      const visibility = this.calculateMeanVisibility(L3Objects);
      const L2UseCase = this.getL2UseCaseById(L2id);
      if (L2UseCase) {
        L2UseCase.visibility = visibility || null;
        this.updateL1Visibility(L2UseCase['L1id']);
      }
    },

    updateL1Visibility(L1id) {
      const L2Objects = this.L2UseCases.filter(l2 => l2['L1id'] === L1id);
      const visibility = this.calculateMeanVisibility(L2Objects);
      const L1UseCase = this.getL1UseCaseById(L1id);
      if (L1UseCase) {
        L1UseCase.visibility = visibility || null;
      }
    },

    calculateMeanVisibility(objects) {
      if (objects.length === 0) return null;
    
      // Filter out objects with visibility outside the range [0, 100]
      const validObjects = objects.filter(obj => {
        const visibility = Number(obj['visibility']) || 0;
        return visibility >= 0 && visibility <= 100 && !obj.invalid;
      });
    
      // If no valid objects are left, return null
      if (validObjects.length === 0) return null;
    
      // Calculate the mean of the valid visibility values
      const meanVisibility = validObjects.reduce((sum, obj) => sum + (Number(obj['visibility']) || 0), 0) / validObjects.length;
      return meanVisibility;
    },

    setActiveTab(tab) { // Action to set the active tab
      this.activeTab = tab;
    },


    updateL1UseCase(id, updatedFields) {
      const L1UseCase = this.getL1UseCaseById(id);
      if (L1UseCase) {
        Object.assign(L1UseCase, updatedFields);
        this.updateL1Visibility(L1UseCase['id'])
      }
    },

    updateL2UseCase(id, updatedFields) {
      const L2UseCase = this.getL2UseCaseById(id);
      if (L2UseCase) {
        Object.assign(L2UseCase, updatedFields);
        this.updateL2Visibility(L2UseCase['id'])
        this.updateL1Visibility(L2UseCase['L1id']);
      }
    },

    updateL3UseCase(id, updatedFields) {
      const L3UseCase = this.getL3UseCaseById(id);
      if (L3UseCase) {
        Object.assign(L3UseCase, updatedFields);
        this.updateL2Visibility(L3UseCase['L2id']);
      }
    },

  },
});
