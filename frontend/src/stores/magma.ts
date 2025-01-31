import { defineStore } from 'pinia';

export const magmaStore = defineStore('magma', {
  state: () => ({
    L1Objects: [],
    L2Objects: [],
    L3Objects: [],
    activeTab: 'L3', // Initialize the active tab here
  }),
  getters: {
    getL1ObjectById: (state) => (id) => state.L1Objects.find(L1 => L1['id'] === id),
    getL2ObjectById: (state) => (id) => state.L2Objects.find(L2 => L2['id'] === id),
    getL3ObjectById: (state) => (id) => state.L3Objects.find(L3 => L3['id'] === id),
    getActiveTab: (state) => state.activeTab, // Getter for active tab
  },
  actions: {

    addL1Object(useCase) {
      if (this.getL1ObjectById(useCase['id'])) {
        console.error(`L1 Object with id ${useCase['id']} already exists.`);
        return;
      }
      this.L1Objects.push(useCase);
      this.updateL1Visibility(useCase['id']);
    },
    removeL1Object(id) {
      this.L1Objects = this.L1Objects.filter(L1 => L1['id'] !== id);
    },

    addL2Object(useCase) {
      if (this.getL2ObjectById(useCase['id'])) {
        console.error(`L2 Object with id ${useCase['id']} already exists.`);
        return;
      }
      this.L2Objects.push(useCase);
      this.updateL2Visibility(useCase['id']);
      this.updateL1Visibility(useCase['L1id']);
    },
    removeL2Object(id) {
      const L2 = this.getL2ObjectById(id);
      if (L2) {
        this.L2Objects = this.L2Objects.filter(L2 => L2['id'] !== id);
      }
    },

    addL3Object(useCase) {
      if (this.getL3ObjectById(useCase['id'])) {
        console.error(`L3 Object with id ${useCase['id']} already exists.`);
        return;
      }
      this.L3Objects.push(useCase);
      this.updateL2Visibility(useCase['L2id']);
    },
    removeL3Object(id) {
      const L3 = this.getL3ObjectById(id);
      if (L3) {
        this.L3Objects = this.L3Objects.filter(L3 => L3['id'] !== id);
      }
    },

    updateL2Visibility(L2id) {
      const L3Objects = this.L3Objects.filter(l3 => l3['L2id'] === L2id);
      const visibility = this.calculateMeanVisibility(L3Objects);
      const L2Object = this.getL2ObjectById(L2id);
      if (L2Object) {
        L2Object.visibility = visibility || null;
        this.updateL1Visibility(L2Object['L1id']);
      }
    },

    updateL1Visibility(L1id) {
      const L2Objects = this.L2Objects.filter(l2 => l2['L1id'] === L1id);
      const visibility = this.calculateMeanVisibility(L2Objects);
      const L1Object = this.getL1ObjectById(L1id);
      if (L1Object) {
        L1Object.visibility = visibility || null;
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

    updateL3Object(id, updatedFields) {
      const L3Object = this.getL3ObjectById(id);
      if (L3Object) {
        Object.assign(L3Object, updatedFields);
        this.updateL2Visibility(L3Object['L2id']);
      }
    },

    updateL2Object(id, updatedFields) {
      const L2Object = this.getL2ObjectById(id);
      if (L2Object) {
        Object.assign(L2Object, updatedFields);
        this.updateL2Visibility(L2Object['id'])
        this.updateL1Visibility(L2Object['L1id']);
      }
    },

    updateL1Object(id, updatedFields) {
      const L1Object = this.getL1ObjectById(id);
      if (L1Object) {
        Object.assign(L1Object, updatedFields);
        this.updateL1Visibility(L1Object['id'])
      }
    },

  },
});
