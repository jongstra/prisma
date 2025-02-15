<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';
import ParentIdSelector from './ParentIdSelector.vue';

const magma = magmaStore();
const tactics = tacticsStore();
const tabs = ref<string[]>(['L1', 'L2', 'L3', 'Results']);

// Always update the L3 use cases visibility when switching to the MaGMa page.
magma.updateAllL3UseCasesVisibility()

// Define header maps for each tab.
const L1Headers = {
  name: 'Use Case Name',
  id: 'ID',
  visibility: 'Visibility %',
  a: 'a',
  b: 'b',
  c: 'c',
  d: 'd',
  e: 'e',
  f: 'f',
  g: 'g',
  h: 'h',
};

const L2Headers = {
  name: 'Use Case Name',
  id: 'ID',
  parentIds: 'Parent Use Case',
  visibility: 'Visibility %',
};

const L3Headers = {
  name: 'Use Case Name',
  id: 'ID',
  parentIds: 'Parent Use Case',
  attackTechniqueId: 'ATT&CK Technique',
  visibility: 'Visibility %',
};

// Define editable fields for each tab
const editableFieldsMap = {
  L1: { name: true, id: true, visibility: false },
  L2: { name: true, id: true, parentIds: true, visibility: false },
  L3: { name: true, id: true, parentIds: true, attackTechniqueId: true, visibility: true }
};

const activeTabData = computed(() => {
  switch (magma.activeTab) {
    case 'L1':
      return magma.L1UseCases;
    case 'L2':
      return magma.L2UseCases;
    case 'L3':
      return magma.L3UseCases;
    default:
      const averageVisibility = magma.L1UseCases.reduce((acc, useCase) => acc + (useCase.visibility || 0), 0) / magma.L1UseCases.length;
      return [{ TotalVisibility: averageVisibility.toFixed(2) }]; // Format to 2 decimal places
  }
});

const headers = computed(() => {
  switch (magma.activeTab) {
    case 'L1':
      return L1Headers;
    case 'L2':
      return L2Headers;
    case 'L3':
      return L3Headers;
    default:
      return {};
  }
});

const editableFields = computed(() => {
  switch (magma.activeTab) {
    case 'L1':
      return editableFieldsMap.L1;
    case 'L2':
      return editableFieldsMap.L2;
    case 'L3':
      return editableFieldsMap.L3;
    default:
      return { TotalVisibility: false };
  }
});


const addNewUseCase = () => {
  const tab = magma.activeTab;
  const level = parseFloat(tab.slice(-1));
  magma.addNewUseCase(level);
};


const confirmRemoveUseCase = (uid: string) => {
  if (confirm('Are you sure you want to remove this use case?')) {
    magma.removeUseCaseByUid(uid);
  }
};

const confirmRemoveUseCaseLevel = () => {
  if (magma.activeTabUseCases().length > 0) {
    if (confirm(`Are you sure you want to remove ALL use cases in level ${magma.activeTab}?`)) {
      magma.removeActiveTabUseCases()
    }
  }
}


const updateObjectField = (uid: string, field: string, value: any) => {
  magma.updateUseCase(uid, {[field]: value});
};


const getBackgroundColor = (uid: string, field: string) => {
  const useCase = magma.getUseCaseByUid(uid);

  if (field === 'visibility') {
    // Check the validity of the number and return a backgroundcolor based on the validity of the number.
    const visibility = useCase.visibility;
    const validVisibility = !isNaN(visibility) && visibility >= 0 && visibility <= 100;
    if (validVisibility) {
      // useCase.invalidVisibility = false;
      return 'rgb(246, 246, 246)';
    } else {
      // useCase.invalidVisibility = true;
      return 'Crimson';
    } 
  }

  if (field === 'id') {
  const id = useCase.id;
  const allIds = magma.getAllIds;
  const noDuplicateId = (allIds.filter(item => item === id).length <= 1);
  
  // Regular expression to check if the format is 'prefix-numeric'
  const correctFormat = new RegExp(`^${magma.activeTab}-\\d+$`).test(id);
  
  const validId = noDuplicateId && correctFormat;
  
  if (validId) {
    // useCase.invalidId = false;
    return 'white';
  } else {
    // useCase.invalidId = true;
    return 'Crimson';
  }
}


  if (field === 'parentIds') {
    const parentIds = useCase.parentIds;
    const validParentIds = Array.isArray(parentIds) && parentIds.every(id => magma.getAllIds.includes(id));
    if (validParentIds) {
      // useCase.invalidParentIds = false;
      return 'white';
    } else {
      // useCase.invalidParentIds = true;
      return 'Crimson';
    }
  }

};


const parentLevelUseCases = computed(() => {
  const useCases = (() => {
    switch (magma.activeTab) {
      case 'L3':
        return magma.L2UseCases;
      case 'L2':
        return magma.L1UseCases;
      default:
        return [];
    }
  })();

  // Create a map to count occurrences of each ID
  const idCounts = new Map<string, number>();

  // Count occurrences of each ID
  useCases.forEach(useCase => {
    idCounts.set(useCase.id, (idCounts.get(useCase.id) || 0) + 1);
  });

  // Filter out IDs that occur more than once.
  return useCases
    .filter(useCase => (idCounts.get(useCase.id) || 0) === 1)
});



const formatVisibility = (number: number) => {
  return number.toFixed(2);
};


// Validation method to limit input to numbers with up to two decimal places, and rangebound between 0 and 100.
const validateAndFormat = (event: Event) => {
  const inputElement = event.target as HTMLInputElement;
  let value = inputElement.value;

  // Regular expression to match numbers with up to two decimal places
  const regex = /^\d*\.?\d{0,2}$/;

  // Check if the value matches the regex
  if (!regex.test(value)) {
    // Remove the last character (that caused the invalid input)
    inputElement.value = value.slice(0, -1);
    return;
  }

  // Parse the value to a float
  const parsedValue = parseFloat(value);

  // Check if the parsed value is within the range [0, 100]
  if (!isNaN(parsedValue)) {
    if (parsedValue < 0) {
      inputElement.value = '0.00';
    } else if (parsedValue > 100) {
      inputElement.value = '100.00';
    }
  }
};


// Add Mock data
// magma.addExistingUseCase({id: 'L3-1', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case', visibility: 67, attackTechniqueIdAndName: 'T1595: Active Scanning'});
// magma.addExistingUseCase({id: 'L2-1', level: 2, parentIds: ['L1-1'], name: 'Sample L2 Use Case Attachment'});
// magma.addExistingUseCase({id: 'L1-1', level: 1, name: 'Spearphishing Attachment'});
// magma.addExistingUseCase({id: 'L3-2', level: 3, parentIds: ['L2-1'], name: 'Test Attachment', visibility: 22});
// magma.addExistingUseCase({id: 'L3-4', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 43});
// magma.addExistingUseCase({id: 'L3-5', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 27});
// magma.addExistingUseCase({id: 'L3-6', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.removeAllUseCases();
magma.addExistingUseCase({id: 'L3-1', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case', visibility: 58, attackTechniqueId: 'T1595'});
magma.addExistingUseCase({id: 'L3-2', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case #2', visibility: 37});
magma.addExistingUseCase({id: 'L2-1', level: 2, parentIds: ['L1-1'], name: 'Sample L2 Use Case'});
magma.addExistingUseCase({id: 'L1-1', level: 1, name: 'Sample L1 Use Case'});
// console.log(magma.activeTabUseCases());
// magma.removeActiveTabUseCases()
// magma.addExistingUseCase({id: 'L3-7', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-8', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-9', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-10', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-11', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-12', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-13', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-14', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-15', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addExistingUseCase({id: 'L3-16', level: 3, parentIds: ['L2-1'], name: 'Test', visibility: 13.222});
// magma.addNewUseCase(3);
// magma.getParentUseCasesById('L2-1');

// magma.getParentUseCasesById('L2-1');
// magma.removeUseCasebyId('L3-1');
// magma.removeUseCasebyUId('L2-1');
// magma.addExistingUseCase({id: 'L2-1', level: 'L2', parentIds: ['L1-1'], name: 'Spearphishing Attachment'});
// console.log(magma.useCases);

</script>


<template>

  <!-- Tab switcher -->
  <div class="sheet-tabs">
    <button 
      v-for="(tab) in tabs" 
      class="sheet-tab"
      :class="{ active: magma.activeTab === tab }"
      @click="magma.activeTab = tab"
    >
      {{ tab }}
    </button>
  </div>

  <!-- Scrolling container -->
  <div class="scroll-container">
    <table v-if="magma.activeTab !== 'Results'" border="1" class="fixed-table">  <!-- Show a table when L1, L2 or L3 is the active tab. When the Results tab is active, we show another div element. -->
      <thead>
        <tr>
          <!-- Render column headers. -->
          <th class="remove-col" @click="confirmRemoveUseCaseLevel()" style="background-color: #e73030; color: white; cursor: pointer;">&#10806;</th>  <!-- Character found in list: https://www.w3schools.com/charsets/ref_utf_math.asp -->
          <th v-for="(columnName, columnKey) in headers" :key="columnKey" :class="{ 'use-case-name': columnName === 'Use Case Name', attack: columnName === 'ATT&CK Technique', parent: columnName === 'Parent Use Case'}">
            {{ columnName }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(useCase, index) in activeTabData" :key="index">

          <!-- Remove-use-case buttons -->
          <td class="remove-col">
            <button class='remove-button' @click="confirmRemoveUseCase(useCase.uid)" style="background-color: #e73030; color: white; border: none; cursor: pointer;">
              &times;
            </button>
          </td>
          

          <td v-for="(columnName, columnKey) in headers" :key="columnKey">

            <!-- Editable fields -->
            <template v-if="editableFields[columnKey]">

              <!-- Editable Visibility fields -->
              <input
                v-if="columnKey === 'visibility'"
                type="number"
                :value="formatVisibility(useCase[columnKey])"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
                :style="{backgroundColor: useCase.visibilityFromAttackTechnique ? 'lightgoldenrodyellow' : getBackgroundColor(useCase.uid, columnKey)}"
                :disabled="useCase.visibilityFromAttackTechnique"
              />

              <!-- Editable ID fields -->
              <template v-else>
                <input 
                  v-if="columnKey === 'id'"
                  :value="useCase[columnKey]"
                  @input="(event) => {updateObjectField(useCase.uid, columnKey, event.target.value);}"
                  :style="{backgroundColor: getBackgroundColor(useCase.uid, columnKey)}"
                />

                <!-- Editable Use Case Name div -->
                <div
                  class="use-case-name-editable"
                  v-if="columnKey === 'name'"
                  contenteditable="true"
                  @input="(event) => {updateObjectField(useCase.uid, columnKey, event.target.innerText);}"
                  :style="{backgroundColor: getBackgroundColor(useCase.uid, columnKey)}"
                >
                  {{ useCase[columnKey] }}
                </div>

                <!-- Editable Parent Use Case selector -->
                <template v-if="columnKey === 'parentIds'">
                  <select 
                    class="parent-ids"
                    :value="useCase[columnKey]"
                    @change="(event) => {updateObjectField(useCase.uid, columnKey, Array.from(event.target.selectedOptions).map(option => option.value));}"
                    :style="{backgroundColor: getBackgroundColor(useCase.uid, columnKey)}"
                  >
                    <option value="none">None</option>
                    <option v-for="useCase in parentLevelUseCases" :key="useCase.id" :value="useCase.id">{{ useCase.id }}: {{ useCase.name }}</option>
                  </select>
                </template>

                <!-- Editable Attack Technique selector -->
                <template v-if="columnKey === 'attackTechniqueId'">
                  <select
                    class="attack-technique"
                    :value="useCase[columnKey] || 'none'"
                    @change="(event) => {updateObjectField(useCase.uid, columnKey, event.target.value);}"
                    :style="{backgroundColor: getBackgroundColor(useCase.uid, columnKey)}"
                  >
                    <option value="none">None</option>
                    <option v-for="technique in tactics.allTechniquesIdsAndNames" :key="technique.id" :value="technique.id">{{ technique.id }}: {{ technique.name }}</option>
                  </select>
                </template>


                <!-- Any other editable fields -->
                <!-- <input 
                  v-else
                  :value="item[columnKey]" 
                /> -->
              </template>
            </template>


            <!-- Non-editable fields -->
            <template v-else-if="columnKey === 'visibility'"> 
              <div class="visibility-uneditable" style="background-color: lightgoldenrodyellow;">
              {{ formatVisibility(useCase[columnKey]) }}
              </div>
            </template>
              
            <template v-else>
              {{ useCase[columnKey] }}
            </template>
            
          </td>

        </tr>


      </tbody>
      <tfoot>
        <tr>
          <!-- Button to add new use cases. -->
          <td colspan="10" class="add-button-cell">
            <button @click="addNewUseCase">
              + ADD NEW USE CASE +
            </button>
          </td>
        </tr>
      </tfoot>
    </table>

    <div v-else>
      <p>Average L1 UC Visibility: {{ activeTabData[0].TotalVisibility }}%</p>
    </div>
  </div>
</template>


<style scoped>
.sheet-tabs {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #777;
}

.sheet-tab {
  width: 150px; /* Set the width of each tab */
  padding: 8px;
  margin-right: 2px;
  background-color: #ddd;
  border: 2px solid #777;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  position: relative;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  text-align: center; /* Center the text within each tab */
}

.sheet-tab:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.sheet-tab.active {
  background-color: rgb(57, 55, 139);
  color: white;
  border-bottom-color: transparent;
}

.sheet-content {
  padding: 0px;
  background-color: #f8f9fa;
}

.scroll-container {
  overflow-x: auto; /* Enables horizontal scrolling */
}

.fixed-table {
  width: 100%;
  table-layout: fixed; 
}

/* Defaul cell settings, will be overwritten later. But gives more consistent feel. */
th, td, input {
  width: 150px;
  border: 2px solid rgb(42, 42, 42);
  border-radius: 4px;
  background-color: white;
}

th {
  font-size: 16px;
  font-weight: bold;
  padding: 7px;
  background-color: rgb(196, 213, 234);
}

tr {
  font-size: 14px;
}

input, .use-case-name-editable {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  width: 100%;
  border: 0px;
  min-height: 50px;
}

th.remove-col {
  font-size: 28px;
  transform: rotateX(180deg);
  padding: 3px;
}

td.remove-col {
  background-color: #e73030;
}
button.remove-button {
  font-size: 30px;
}

.add-button-cell {
  border: 0px;
  text-align: center; /* Center the button within the cell */
}

.add-button-cell button {
  width: calc(100vw - 40px);
  padding: 10px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  float: left;
  font-size: 14px;
}

.remove-col {
  min-width: 40px;
  width: 40px
}



th.use-case-name {
  width: 200px;
}

select {
  height: 50px;
  text-align: center;
}

th.parent {
  width: 250px;
}
select.parent-ids {
  width: 244px;
}

th.attack {
  width: 250px;
}
select.attack-technique {
  width: 244px;
}

input, .visibility-uneditable {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}
</style>