<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { magmaStore } from '@/stores/magmaOld';
import { v4 as uuidv4 } from 'uuid';

const store = magmaStore();
const tabs = ref<string[]>(['L1', 'L2', 'L3', 'Results']);

// Define header maps for each tab
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
  L1id: 'Linked Use Case',
  visibility: 'Visibility %',
};

const L3Headers = {
  name: 'Use Case Name',
  id: 'ID',
  L2id: 'Linked Use Case',
  visibility: 'Visibility %',
};

// Define editable fields for each tab
const editableFieldsMap = {
  L1: { name: true, id: true, visibility: false },
  L2: { name: true, id: true, L1id: true, visibility: false },
  L3: { name: true, id: true, L2id: true, visibility: true }
};

const activeTabData = computed(() => {
  switch (store.getActiveTab) { // Use the getter from the store
    case 'L1':
      return store.L1UseCases;
    case 'L2':
      return store.L2UseCases;
    case 'L3':
      return store.L3UseCases;
    default:
      const averageVisibility = store.L1UseCases.reduce((acc, l1) => acc + (l1.visibility || 0), 0) / store.L1UseCases.length;
      return [{ TotalVisibility: averageVisibility.toFixed(2) }]; // Format to 2 decimal places
  }
});

const headers = computed(() => {
  switch (store.getActiveTab) {
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
  switch (store.getActiveTab) {
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

const setActiveTab = (index: number) => {
    store.setActiveTab(index); // Use the action from the store
};

const visibilityValidity = ref<{ [key: string]: boolean }>({});
const useCaseIdValidity = ref<{ [key: string]: boolean }>({});

const validateUseCaseId = (tab: string, id: string) => {
  const prefix = `${store.getActiveTab}-`;
  const isCorrectPrefix = id.startsWith(prefix);

  let useCases;
  switch (tab) {
    case 'L1':
      useCases = store.L1UseCases;
      break;
    case 'L2':
      useCases = store.L2UseCases;
      break;
    case 'L3':
      useCases = store.L3UseCases;
      break;
  }

  // Get the current use case being edited
  const activeUseCase = useCases.find(obj => obj.id === id);

  // Filter out the current use case being edited using its uid
  const filteredUseCases = useCases.filter(obj => obj.uid !== activeUseCase?.uid);

  // Check for uniqueness
  const isUnique = !filteredUseCases.some(obj => obj.id === id);

  console.log(activeUseCase)
  console.log(filteredUseCases)
  console.log(isUnique)

  useCaseIdValidity.value[`${tab}-${id}`] = isCorrectPrefix && isUnique;

};

const updateObjectField = (tab: string, id: string, field: string, value: any) => {
  if (field === 'visibility') {
    // Convert the value to a number and check if it's valid
    const numericValue = parseFloat(value);
    visibilityValidity.value[`${tab}-${id}`] = !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100;
    if (!visibilityValidity.value[`${tab}-${id}`]) {
      console.error('Invalid number for visibility. Must be between 0 and 100');
    }
    value = numericValue;
  }

  if (field === 'id') {
    // Validation will be handled on blur or enter
  }

  switch (tab) {
    case 'L1':
      store.updateL1UseCase(id, { [field]: value });
      break;
    case 'L2':
      store.updateL2UseCase(id, { [field]: value });
      break;
    case 'L3':
      store.updateL3UseCase(id, { [field]: value });
      break;
  }
};

const removeItem = (id: string) => {
  switch (store.getActiveTab) {
    case 'L1':
      store.removeL1UseCase(id);
      break;
    case 'L2':
      store.removeL2UseCase(id);
      break;
    case 'L3':
      store.removeL3UseCase(id);
      break;
  }
};

const confirmRemove = (id: string) => {
  if (confirm('Are you sure you want to remove this item?')) {
    removeItem(id);
  }
};

const addNewUseCase = () => {
  const newUid = uuidv4();
  const newId = `${store.getActiveTab}-${newUid.slice(26)}`; // Generate a unique ID based on the UID.
  const newUseCase: any = { uid: newUid, id: newId };
  
  Object.keys(headers.value).forEach(key => {
    if (key !== 'id') {
      newUseCase[key] = '';
    }
  });

  switch (store.getActiveTab) {
    case 'L1':
      store.addL1UseCase(newUseCase);
      break;
    case 'L2':
      store.addL2UseCase(newUseCase);
      break;
    case 'L3':
      store.addL3UseCase(newUseCase);
      break;
  }

  validateUseCaseId(store.getActiveTab, newId);
};

// Method to resize textarea
const resizeTextarea = (event: any) => {
  const target = event.target;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};

// Add mock data.
store.addL3UseCase({ id: 'L3-1', 'uid': uuidv4(), L2id: 'L2-1', name: 'Spearphishing Attachment', visibility: 60 });
store.addL3UseCase({ id: 'L3-2', 'uid': uuidv4(), L2id: 'L2-2', name: 'Windows Service', visibility: 0 });
store.addL3UseCase({ id: 'L3-3', 'uid': uuidv4(), L2id: 'L2-2', name: 'Scheduled Task/Job', visibility: 100 });
store.addL2UseCase({ id: 'L2-1', 'uid': uuidv4(), L1id: 'L1-1', name: 'Phishing'});
store.addL2UseCase({ id: 'L2-2', 'uid': uuidv4(), L1id: 'L1-2', name: 'System Services'});
store.addL1UseCase({ id: 'L1-1', 'uid': uuidv4(), name: 'Initial Access'});
store.addL1UseCase({ id: 'L1-2', 'uid': uuidv4(), name: 'Execution'});
</script>

<template>
  <div class="sheet-tabs">
    <button 
      v-for="(tab) in tabs" 
      class="sheet-tab"
      :class="{ active: store.getActiveTab === tab }"
      @click="setActiveTab(tab)"
    >
      {{ tab }}
    </button>
  </div>

  <div class="scroll-container">
    <table v-if="store.getActiveTab !== 'Results'" border="1" class="fixed-table">  <!-- Show a table when L1, L2 or L3 is the active tab. When the Results tab is active, we show another div element. -->
      <thead>
        <tr>
          <th class="remove-col"></th> <!-- Add a class for the remove button column -->
          <th v-for="(headerName, headerKey) in headers" :key="headerKey" :class="{ 'use-case-name': headerName === 'Use Case Name' }">
            {{ headerName }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in activeTabData" :key="index">
          <td class="remove-col"> <!-- Add the same class here -->
            <!-- Add the remove button with confirmation dialog -->
            <button class='remove-button' @click="confirmRemove(item.id)" style="background-color: #e73030; color: white; border: none; cursor: pointer;">
              &times;
            </button>
          </td>
          <td
            v-for="(headerName, headerKey) in headers" 
            :key="headerKey"
          >
            <template v-if="editableFields[headerKey]">
              <!-- Check if the field is 'visibility' to use type="number" -->
              <input 
                v-if="headerKey === 'visibility'"
                :type="headerKey === 'visibility' ? 'number' : 'text'" 
                :value="item[headerKey]"
                @input="(event) => { updateObjectField(store.getActiveTab, item.id, headerKey, event.target.value); resizeTextarea(event) }" 
                :style="{ backgroundColor: visibilityValidity[`${store.getActiveTab}-${item.id}`] === false ? 'red' : '' }"
              />
              <template v-else>
                <input 
                  v-if="headerKey === 'id'"
                  :value="item[headerKey]" 
                  @blur="(event) => { validateUseCaseId(store.getActiveTab, item.id); resizeTextarea(event) }" 
                  @keydown="(event) => { if (event.key === 'Enter') validateUseCaseId(store.getActiveTab, item.id) }" 
                  @input="(event) => { updateObjectField(store.getActiveTab, item.id, headerKey, event.target.value); resizeTextarea(event) }" 
                  :style="{ backgroundColor: useCaseIdValidity[`${store.getActiveTab}-${item.id}`] === false ? 'red' : '' }"
                />
                <input 
                  v-else
                  :value="item[headerKey]" 
                  @input="(event) => { updateObjectField(store.getActiveTab, item.id, headerKey, event.target.value); resizeTextarea(event) }" 
                  :style="{ backgroundColor: useCaseIdValidity[`${store.getActiveTab}-${item.id}`] === false ? 'red' : '' }"
                />
              </template>
            </template>
            <template v-else>
              {{ item[headerKey] }}
            </template>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
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
