<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import VueMultiselect from 'vue-multiselect'
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';


const magma = magmaStore();
const tactics = tacticsStore();
const tabs = ref<string[]>(['L1', 'L2', 'L3', 'Results']);


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
  attackTechniqueIdAndName: 'ATT&CK Technique',
  visibility: 'Visibility %',
};

// Define editable fields for each tab
const editableFieldsMap = {
  L1: { name: true, id: true, visibility: false },
  L2: { name: true, id: true, parentIds: true, visibility: false },
  L3: { name: true, id: true, parentIds: true, attackTechniqueIdAndName: true, visibility: true }
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


const confirmRemove = (uid: string) => {
  if (confirm('Are you sure you want to remove this item?')) {
    magma.removeUseCaseByUid(uid);
  }
};


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


const parentIdsOptions = computed(() => {
  switch (magma.activeTab) {
    case 'L3':
      return magma.L2UseCases.map(useCase => useCase.id);
    case 'L2':
      return magma.L1UseCases.map(useCase => useCase.id);
    default:
      return [];
  }
});


const formatVisibility = (number: number) => {
  console.log(number);
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
magma.addExistingUseCase({id: 'L3-1', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case', visibility: 67, attackTechniqueIdAndName: 'T1595: Active Scanning'});
magma.addExistingUseCase({id: 'L3-2', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case #2', visibility: 37});
magma.addExistingUseCase({id: 'L2-1', level: 2, parentIds: ['L1-1'], name: 'Sample L2 Use Case'});
magma.addExistingUseCase({id: 'L1-1', level: 1, name: 'Sample L1 Use Case'});
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
          <th class="remove-col"></th>
          <th v-for="(columnName, columnKey) in headers" :key="columnKey" :class="{ 'use-case-name': columnName === 'Use Case Name', attack: columnName === 'ATT&CK Technique', parent: columnName === 'Parent Use Case'}">
            {{ columnName }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in activeTabData" :key="index">

          <!-- Remove-use-case buttons -->
          <td class="remove-col">
            <button class='remove-button' @click="confirmRemove(item.uid)" style="background-color: #e73030; color: white; border: none; cursor: pointer;">
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
                :value="item[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(item.uid, columnKey, event.target.value); }"
                :style="{backgroundColor: item.visibilityFromAttackTechnique ? 'lightgoldenrodyellow' : getBackgroundColor(item.uid, columnKey)}"
                :disabled="item.visibilityFromAttackTechnique"
              />

              <!-- Editable ID fields -->
              <template v-else>
                <input 
                  v-if="columnKey === 'id'"
                  :value="item[columnKey]"
                  @input="(event) => {updateObjectField(item.uid, columnKey, event.target.value);}"
                  :style="{backgroundColor: getBackgroundColor(item.uid, columnKey)}"
                />

                <!-- Editable Use Case Name div -->
                <div
                  class="use-case-name-editable"
                  v-if="columnKey === 'name'"
                  contenteditable="true"
                  @input="(event) => {updateObjectField(item.uid, columnKey, event.target.innerText);}"
                  :style="{backgroundColor: getBackgroundColor(item.uid, columnKey)}"
                >
                  {{ item[columnKey] }}
                </div>

                <!-- Editable Parent Use Case selector -->
                <template v-if="columnKey === 'parentIds'">
                  <select
                    class="parent-ids"
                    :value="item[columnKey]"
                    @change="(event) => {updateObjectField(item.uid, columnKey, Array.from(event.target.selectedOptions).map(option => option.value));}"
                    :style="{backgroundColor: getBackgroundColor(item.uid, columnKey)}"
                  >
                    <option value="none">None</option>
                    <option v-for="parentId in parentIdsOptions" :key="parentId" :value="parentId">{{ parentId }}</option>
                  </select>
                </template>

                <!-- Editable Attack Technique selector -->
                <template v-if="columnKey === 'attackTechniqueIdAndName'">
                  <select
                    class="attack-technique"
                    :value="item[columnKey]"
                    @change="(event) => {updateObjectField(item.uid, columnKey, event.target.value);}"
                  >
                    <option value="none">None</option>
                    <option v-for="techniqueNameAndId in tactics.allTechniquesIdsAndNames" :key="techniqueNameAndId" :value="techniqueNameAndId">{{ techniqueNameAndId }}</option>
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
              {{ formatVisibility(item[columnKey]) }}
              </div>
            </template>
              
            <template v-else>
              {{ item[columnKey] }}
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
  /* font-weight: bold; */
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

td.remove-col {
  background-color: #e73030;
}
button.remove-button {
  font-size: 35px;
}

.add-button-cell {
  border: 0px;
  text-align: center; /* Center the button within the cell */
}

.add-button-cell button {
  width: 1200px;
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

th.remove-col {
  background-color: lightpink;
}

th.use-case-name {
  width: 200px;
}

select {
  height: 50px;
  text-align: center;
}

th.parent {
  width: 160px;
}
select.parent-ids {
  width: 154px;
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