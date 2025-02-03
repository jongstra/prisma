<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { magmaStore } from '@/stores/magma';
import { stateStore } from '@/stores/state';

const magma = magmaStore();
const state = stateStore()
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
  parentIds: 'Parent Use Cases',
  visibility: 'Visibility %',
};

const L3Headers = {
  name: 'Use Case Name',
  id: 'ID',
  parentIds: 'Parent Use Cases',
  visibility: 'Visibility %',
};

// Define editable fields for each tab
const editableFieldsMap = {
  L1: { name: true, id: true, visibility: false },
  L2: { name: true, id: true, L1id: true, visibility: false },
  L3: { name: true, id: true, L2id: true, visibility: true }
};

const activeTabData = computed(() => {
  switch (state.getActiveMagmaTab) {
    case 'L1':
      return magma.L1UseCases;
    case 'L2':
      return magma.L2UseCases;
    case 'L3':
      return magma.L3UseCases;
    default:
      const averageVisibility = magma.useCases.reduce((acc, useCase) => acc + (useCase.visibility || 0), 0) / magma.L1UseCases.length;
      return [{ TotalVisibility: averageVisibility.toFixed(2) }]; // Format to 2 decimal places
  }
});

const headers = computed(() => {
  switch (state.getActiveMagmaTab) {
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
  switch (state.getActiveMagmaTab) {
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
  const tab = state.getActiveMagmaTab;
  const level = parseFloat(tab.slice(-1));
  magma.addNewUseCase(level);
};


const confirmRemove = (uid: string) => {
  console.log(uid);
  if (confirm('Are you sure you want to remove this item?')) {
    magma.removeUseCaseByUid(uid);
  }
};



const updateObjectField = (uid: string, field: string, value: any) => {
  
  if (field === 'visibility') {
    // Convert the value to a number and check if it's valid.
    const numericValue = parseFloat(value);
    value = numericValue;
  }

  if (field === 'id') {
    
  }

  magma.updateUseCase(uid, { [field]: value });
};



const getBackgroundColor = (uid: string, field: string) => {
  if (field === 'visibility') {
    // Check the validity of the number and return a backgroundcolor based on the validity of the number.
    const visibility = magma.getUseCaseByUid(uid).visibility;
    const validVisibility = !isNaN(visibility) && visibility >= 0 && visibility <= 100;
    if (validVisibility) {return 'white';} else {return 'red';}
    
  }

  if (field === 'id') {
    const id = magma.getUseCaseByUid(uid).id;
    const allIds = magma.getAllIds;
    const validId = (allIds.filter(item => item === id).length <= 1)
    if (validId) {return 'white';} else {return 'red';}
  }
};


// Add Mock data
magma.addExistingUseCase({id: 'L3-1', parentIds: ['L2-1'], name: 'Spearphishing Attachment', visibility: 60});
magma.addExistingUseCase({id: 'L2-1', parentIds: ['L1-1'], name: 'Spearphishing Attachment'});
magma.addExistingUseCase({id: 'L1-1', name: 'Spearphishing Attachment'});
magma.addExistingUseCase({id: 'L3-2', parentIds: ['L2-1'], name: 'Test Attachment', visibility: 20});
magma.addNewUseCase(3);
magma.getParentUseCasesById('L2-1');

magma.getParentUseCasesById('L2-1');
// magma.removeUseCasebyId('L3-1');
// magma.removeUseCasebyUId('L2-1');
// magma.addExistingUseCase({id: 'L2-1', parentIds: ['L1-1'], name: 'Spearphishing Attachment'});
// console.log(magma.useCases);


</script>


<template>

  <!-- Tab switcher -->
  <div class="sheet-tabs">
    <button 
      v-for="(tab) in tabs" 
      class="sheet-tab"
      :class="{ active: state.getActiveMagmaTab === tab }"
      @click="state.setActiveMagmaTab(tab)"
    >
      {{ tab }}
    </button>
  </div>

  <!-- Scrolling container -->
  <div class="scroll-container">
    <table v-if="state.getActiveMagmaTab !== 'Results'" border="1" class="fixed-table">  <!-- Show a table when L1, L2 or L3 is the active tab. When the Results tab is active, we show another div element. -->
      <thead>
        <tr>
          <!-- Render column headers. -->
          <th class="remove-col"></th>
          <th v-for="(columnName, columnKey) in headers" :key="columnKey" :class="{ 'use-case-name': columnName === 'Use Case Name' }">
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

              <!-- Visibility fields -->
              <input
                v-if="columnKey === 'visibility'"
                :type="columnKey === 'visibility' ? 'number' : 'text'"
                :value="item[columnKey]"
                @input="(event) => { updateObjectField(item.uid, columnKey, event.target.value);}"
                :style="{ backgroundColor: getBackgroundColor(item.uid, columnKey)}"
              />

              <!-- ID fields -->
              <template v-else>
                <input 
                  v-if="columnKey === 'id'"
                  :value="item[columnKey]"
                  @input="(event) => { updateObjectField(item.uid, columnKey, event.target.value);}"
                  :style="{ backgroundColor: getBackgroundColor(item.uid, columnKey)}"
                />

                <!-- Use Case Name input fields -->
                <input 
                  v-if="columnKey === 'name'"
                  :value="item[columnKey]"
                  @input="(event) => { updateObjectField(item.uid, columnKey, event.target.value);}"
                  :style="{ backgroundColor: getBackgroundColor(item.uid, columnKey)}"
                />

                <!-- Any other editable fields -->
                <!-- <input 
                  v-else
                  :value="item[columnKey]" 
                /> -->
              </template>


            <!-- Non-editable fields -->
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
      <p>Average Visibility: {{ activeTabData[0].TotalVisibility }}%</p>
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

th, td {
  width: 150px;
  border-radius: 5px;
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

input {
  text-align: center;
  font-size: 14px;
  width: 100%;
  border: 0px;
  min-height: 42px;
  overflow-wrap: break-word;
}

/* tr:nth-child(even) {
  background-color: #f2f2f2;
} */

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
  width: 250px;
}
</style>