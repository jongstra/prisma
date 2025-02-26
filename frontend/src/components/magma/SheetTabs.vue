<script setup lang="ts">
import Swal from 'sweetalert2';
import { ref, computed } from 'vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const magma = magmaStore();
const tactics = tacticsStore();
const tabs = ref<string[]>(['L1', 'L2', 'L3', 'Results']);

// Initialize the default use cases.
magma.initializeDefaultUseCases();

// Always update the L3 use cases visibility when switching to the MaGMa page.
magma.updateAllL3UseCasesVisibility()

// Define header maps for each tab.
const L1Headers = {
  name: 'Use Case Name',
  id: 'ID',
  visibility: 'Visibility %',
  implementation: 'Implementation %',
  effectiveness: "Effectiveness %",
  weight: "Weight %",
  potential: "Potential %",
  inImpact: "IN Impact %",
  thrImpact: "THR Impact %",
  outImpact: "OUT Impact %",
  risk: "Risk",
};

const L2Headers = {
  name: 'Use Case Name',
  id: 'ID',
  parentIds: 'Parent Use Case',
  visibility: 'Visibility %',
  implementation: 'Implementation %',
  effectiveness: "Effectiveness %",
  weight: "Weight %",
  potential: "Potential %",
};

const L3Headers = {
  name: 'Use Case Name',
  id: 'ID',
  parentIds: 'Parent Use Case',
  attackTechniqueId: 'ATT&CK Technique',
  visibilityFromAttackTechniqueOverride: 'Override',
  visibility: 'Visibility %',
  implementation: 'Implementation %',
  effectiveness: "Effectiveness %",
  weight: "Weight %",
  potential: "Potential %",
};

// Define editable fields for each tab
const editableFieldsMap = {
  L1: { name: true, id: true, inImpact: true, thrImpact: true, outImpact: true},
  L2: { name: true, id: true, parentIds: true, },
  L3: { name: true, id: true, parentIds: true, attackTechniqueId: true, visibilityFromAttackTechniqueOverride: true, visibility: true, implementation: true, effectiveness: true }
};

const activeTabData = computed(() => {
  switch (magma.activeTab) {
    case 'L1':
      return magma.L1UseCases(tactics.domain);
    case 'L2':
      return magma.L2UseCases(tactics.domain);
    case 'L3':
      return magma.L3UseCases(tactics.domain);
    default:
      const numberDomainUsecases = magma.L1UseCases(tactics.domain).length;
      const averageVisibility = magma.L1UseCases(tactics.domain).reduce((acc, useCase) => acc + (useCase.visibility || 0), 0) / numberDomainUsecases;
      const averageImplementation = magma.L1UseCases(tactics.domain).reduce((acc, useCase) => acc + (useCase.implementation || 0), 0) / numberDomainUsecases;
      const averageEffectiveness = magma.L1UseCases(tactics.domain).reduce((acc, useCase) => acc + (useCase.effectiveness || 0), 0) / numberDomainUsecases;
      const averageWeight = magma.L1UseCases(tactics.domain).reduce((acc, useCase) => acc + (useCase.weight || 0), 0) / numberDomainUsecases;
      const averagePotential = magma.L1UseCases(tactics.domain).reduce((acc, useCase) => acc + (useCase.potential || 0), 0) / numberDomainUsecases;
      return [{
        TotalVisibility: averageVisibility.toFixed(2),
        TotalImplementation: averageImplementation.toFixed(2),
        TotalEffectiveness: averageEffectiveness.toFixed(2),
        TotalWeight: averageWeight.toFixed(2),
        TotalPotential: averagePotential.toFixed(2),
      }]; // Format to 2 decimal places
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
      return { };
  }
});

const addNewUseCase = () => {
  const tab = magma.activeTab;
  const level = parseFloat(tab.slice(-1));
  magma.addNewUseCase(level, tactics.domain);
};

const exportYaml = () => {
  const yamlData = magma.exportUseCases();
  const blob = new Blob([yamlData], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'magma_data.yaml';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const importYaml = (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const yamlContent = e.target?.result as string;
      magma.removeAllUseCases(); // Clear any existing use cases before importing new ones.
      magma.initializeDefaultUseCases();
      magma.importUseCases(yamlContent);
      fileInput.value = ''; // Reset the file input value (if the user uploads the same file again to 'reset', we want to register a change so the file gets processed).
    };
    reader.readAsText(file);
  }
};

const confirmRemoveUseCase = (useCase: any) => {
  Swal.fire({
    title: `Delete use case '${useCase.id}'?`,
    text: "You won't be able to revert this.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: 'green',
    confirmButtonText: 'Yes, delete this use case!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      magma.removeUseCaseByUid(useCase.uid, tactics.domain);
    }
  });
};

const confirmRemoveUseCaseLevel = () => {
  if (magma.activeTabUseCases(tactics.domain).length > 0) {
    Swal.fire({
      title: `Warning! You are about to delete ALL ${magma.activeTab} use cases.`,
      text: `This is a permanent and irreversible action.\n\nDo you wish to proceed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'green',
      confirmButtonText: `Yes, delete all ${magma.activeTab} use cases!`,
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        magma.removeActiveTabUseCases(tactics.domain);
      }
    });
  }
};

const updateObjectField = (uid: string, field: string, value: any) => {
  magma.updateUseCase(uid, {[field]: value}, tactics.domain);
};

const getBackgroundColor = (useCase: any, field: string) => {
  // const useCase = magma.getUseCaseByUid(uid, tactics.domain);

  if (useCase.permanent) {
      return 'lightgoldenrodyellow'
  }

  if (field === 'visibility') {
    // Check the validity of the number and return a backgroundcolor based on the validity of the number.
    const visibility = useCase.visibility;
    const validVisibility = !isNaN(visibility) && visibility >= 0 && visibility <= 100;
    if (validVisibility) {
      return 'white'; //'rgb(246, 246, 246)';
    } else {
      return 'Crimson';
    }
  }

  if (field === 'id') {

    const id = useCase.id;
    const allIds = magma.getAllIds(tactics.domain);
    const noDuplicateId = (allIds.filter(item => item === id).length <= 1);

    // Regular expression to check if the format is 'prefix-numeric'
    const correctFormat = new RegExp(`^${magma.activeTab}-\\d+$`).test(id);

    const validId = noDuplicateId && correctFormat;

    if (validId) {
      return 'white';
    } else {
      return 'Crimson';
    }
  }

  if (field === 'parentIds') {
    const parentIds = useCase.parentIds;
    const validParentIds = Array.isArray(parentIds) && parentIds.every(id => magma.getAllIds(tactics.domain).includes(id));
    if (validParentIds) {
      return 'white';
    } else {
      return 'Crimson';
    }
  }

};

const parentLevelUseCases = computed(() => {
  const useCases = (() => {
    switch (magma.activeTab) {
      case 'L3':
        return magma.L2UseCases(tactics.domain);
      case 'L2':
        return magma.L1UseCases(tactics.domain);
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
    .sort((a, b) => a.id.localeCompare(b.id));
});

const formatPercentage = (number: any) => {
  number = Number(number);
  return number.toFixed(2);
};

// Validation method to limit input to numbers with up to two decimal places, and rangebound between 0 and 100.
const validateAndFormat = (event: Event) => {
  const inputElement = event.target as HTMLInputElement;
  let value = inputElement.value;

  // Parse the value to a float
  const parsedValue = parseFloat(value);

  // Check if the parsed value is within the range [0, 100], and otherwise force it to be within this value.
  if (!isNaN(parsedValue)) {
    if (parsedValue < 0) {
      inputElement.value = '0';
    } else if (parsedValue > 100) {
      inputElement.value = '100';
    }
  }
};

// magma.addExistingUseCase({id: 'L3-1', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case', visibility: 58, visibilityFromAttackTechniqueOverride: true, attackTechniqueId: 'T1595', implementation: 80, effectiveness: 60, domain: 'enterprise-attack'});
// magma.addExistingUseCase({id: 'L3-2', level: 3, parentIds: ['L2-1'], name: 'Sample L3 Use Case #2', visibility: 85,  implementation: 80, effectiveness: 95, domain: 'enterprise-attack'});
// magma.addExistingUseCase({id: 'L2-1', level: 2, parentIds: ['L1-1'], name: 'Sample L2 Use Case', domain: 'enterprise-attack'});
// magma.addExistingUseCase({id: 'L1-1', level: 1, name: 'Sample L1 Use Case', domain: 'enterprise-attack'});

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
      <input
        id="importYamlFile"
        type="file"
        @change="importYaml"
        style="display: none;"
      />
      <label for="importYamlFile" class="load-button">Load MaGMa YAML</label>
      <label class="save-button" @click="exportYaml">Save MaGMa YAML</label>
  </div>

  <!-- Scrolling container -->
  <div class="scroll-container">
    <table v-if="magma.activeTab !== 'Results'" border="1" class="fixed-table">  <!-- Show a table when L1, L2 or L3 is the active tab. When the Results tab is active, we show another div element. -->
      <thead>
        <tr>
          <!-- Render column headers. -->
          <th class="remove-col" @click="confirmRemoveUseCaseLevel()" style="background-color: #e73030; color: white; cursor: pointer;">&#10806;</th>  <!-- Character found in list: https://www.w3schools.com/charsets/ref_utf_math.asp -->
          <th v-for="(columnName, columnKey) in headers" :key="columnKey" :class="{ name: columnName === 'Use Case Name',
                                                                                    id: columnName === 'ID',
                                                                                    parent: columnName === 'Parent Use Case',
                                                                                    attack: columnName === 'ATT&CK Technique',
                                                                                    override: columnName === 'Override',
                                                                                    visibility: columnName === 'Visibility %',
                                                                                    implementation: columnName === 'Implementation %',
                                                                                    effectiveness: columnName === 'Effectiveness %',
                                                                                    weight: columnName === 'Weight %',
                                                                                    potential: columnName === 'Potential %',
                                                                                    inImpact: columnName === 'IN Impact %',
                                                                                    thrImpact: columnName === 'THR Impact %',
                                                                                    outImpact: columnName === 'OUT Impact %',
                                                                                    risk: columnName === 'Risk',}">
            {{ columnName }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(useCase, index) in activeTabData" :key="index">

          <!-- Remove-use-case buttons -->
          <td class="remove-col">
            <button 
              v-if="!useCase.permanent"
              class='remove-button'
              @click="confirmRemoveUseCase(useCase)" 
              style="background-color: #e73030; color: white; border: none; cursor: pointer;"
            >
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
                :value="useCase[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
                :style="{backgroundColor: (useCase.visibilityFromAttackTechnique && !useCase.visibilityFromAttackTechniqueOverride) ? 'lightgoldenrodyellow' : getBackgroundColor(useCase, columnKey)}"
                :disabled="useCase.visibilityFromAttackTechnique && !useCase.visibilityFromAttackTechniqueOverride"
              />

              <!-- Editable Implementation fields -->
              <input
                v-if="columnKey === 'implementation'"
                type="number"
                :value="useCase[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
              />

              <!-- Editable Effectiveness fields -->
              <input
                v-if="columnKey === 'effectiveness'"
                type="number"
                :value="useCase[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
              />

              <!-- Editable L1 inImpact fields -->
              <input
                v-if="columnKey === 'inImpact'"
                type="number"
                :value="useCase[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
                :disabled="useCase.permanent"
                :style="{backgroundColor: useCase.permanent ? 'black': 'white'}"
              />

              <!-- Editable L1 thrImpact fields -->
              <input
                v-if="columnKey === 'thrImpact'"
                type="number"
                :value="useCase[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
                :disabled="useCase.permanent"
                :style="{backgroundColor: useCase.permanent ? 'black': 'white'}"
              />

              <!-- Editable L1 outImpact fields -->
              <input
                v-if="columnKey === 'outImpact'"
                type="number"
                :value="useCase[columnKey]"
                @input="(event) => { validateAndFormat(event); updateObjectField(useCase.uid, columnKey, event.target.value); }"
                :disabled="useCase.permanent"
                :style="{backgroundColor: useCase.permanent ? 'black': 'white'}"
              />


              <!-- Editable ID fields -->
              <template v-else>

                <!-- Editable Use Case Name div -->
                <div
                  class="use-case-name-editable"
                  v-if="columnKey === 'name'"
                  :contenteditable="!useCase.permanent"
                  @input="(event) => {updateObjectField(useCase.uid, columnKey, event.target.innerText);}"
                  :style="{backgroundColor: getBackgroundColor(useCase, columnKey)}"
                >
                  {{ useCase[columnKey] }}
                </div>

                <!-- Editable ID div -->
                <div
                  class="use-case-id-editable"
                  v-if="columnKey === 'id'"
                  :contenteditable="!useCase.permanent"
                  @input="(event) => {updateObjectField(useCase.uid, columnKey, event.target.innerText);}"
                  :style="{backgroundColor: getBackgroundColor(useCase, columnKey)}"
                >
                  {{ useCase[columnKey] }}
                </div>

                <!-- Editable Parent Use Case selector -->
                <template v-if="columnKey === 'parentIds'">
                  <select 
                    class="parent-ids select-with-wrap"
                    :value="useCase[columnKey]"
                    @change="(event) => {updateObjectField(useCase.uid, columnKey, Array.from(event.target.selectedOptions).map(option => option.value));}"
                    :style="{backgroundColor: getBackgroundColor(useCase, columnKey)}"
                  >
                    <option value="none">None</option>
                    <option v-for="useCase in parentLevelUseCases" :key="useCase.id" :value="useCase.id">{{ useCase.id }}: {{ useCase.name }}</option>
                  </select>
                </template>

                <!-- Editable Attack Technique selector -->
                <template v-if="columnKey === 'attackTechniqueId'">
                  <select
                    class="attack-technique select-with-wrap"
                    :value="useCase[columnKey] || 'none'"
                    @change="(event) => {updateObjectField(useCase.uid, columnKey, event.target.value);}"
                    :style="{backgroundColor: getBackgroundColor(useCase, columnKey)}"
                  >
                    <option value="none">None</option>
                    <option v-for="technique in tactics.allTechniquesIdsAndNames" :key="technique.id" :value="technique.id">{{ technique.id }}: {{ technique.name }}</option>
                  </select>
                </template>

                <!-- Editable Visibility Override checkbox -->
                <template v-if="columnKey === 'visibilityFromAttackTechniqueOverride'">
                  <input 
                    type="checkbox"
                    :checked="useCase[columnKey]"
                    @change="(event) => {
                      updateObjectField(useCase.uid, columnKey, event.target.checked);
                      if (!event.target.checked) {
                        // Reset attackTechniqueId to its previous value when visibilityFromAttackTechniqueOverride is unchecked
                        updateObjectField(useCase.uid, 'attackTechniqueId', useCase.attackTechniqueId);
                      }
                    }"
                    :style="{backgroundColor: getBackgroundColor(useCase, columnKey)}"
                  />
                </template>

                <!-- Any other editable fields -->
              </template>
            </template>


            <!-- Uneditable fields -->
            <template v-else-if="columnKey === 'visibility'">
              <div class="uneditable">
                {{ formatPercentage(useCase[columnKey]) }}
              </div>
            </template>

            <template v-else-if="columnKey === 'implementation'">
              <div class="uneditable">
                {{ formatPercentage(useCase[columnKey]) }}
              </div>
            </template>

            <template v-else-if="columnKey === 'effectiveness'">
              <div class="uneditable">
                {{ formatPercentage(useCase[columnKey]) }}
              </div>
            </template>

            <template v-else-if="columnKey === 'weight'">
              <div class="uneditable">
                {{ formatPercentage(useCase[columnKey]) }}
              </div>
            </template>

            <template v-else-if="columnKey === 'potential'">
              <div class="uneditable">
                {{ formatPercentage(useCase[columnKey]) }}
              </div>
            </template>

            <template v-else-if="columnKey === 'risk'">
              <input
                :value="useCase.permanent ? '' : formatPercentage(useCase[columnKey] || 0)"
                :style="{backgroundColor: useCase.permanent ? 'black': 'lightgoldenrodyellow'}"
                disabled="true"
              >
              </input>
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
            <button @click="addNewUseCase(tactics.domain)">
              + ADD NEW USE CASE +
            </button>
          </td>
        </tr>
      </tfoot>
    </table>

    <div v-else>
      <p>Average L1 UC Visibility: {{ activeTabData[0].TotalVisibility }}%</p>
      <p>Average L1 UC Implementation: {{ activeTabData[0].TotalImplementation }}%</p>
      <p>Average L1 UC Effectiveness: {{ activeTabData[0].TotalEffectiveness }}%</p>
      <p>Average L1 UC Weight: {{ activeTabData[0].TotalWeight }}%</p>
      <p>Average L1 UC Potential: {{ activeTabData[0].TotalPotential }}%</p>
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
  width: 120px; /* Set the width of each tab */
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

/* Default cell settings, will be overwritten later. But gives more consistent feel. */
th, td, input {
  width: 140px;
  border: 2px solid rgb(42, 42, 42);
  border-radius: 4px;
  background-color: white;
}

th {
  font-size: 14px;
  font-weight: bold;
  padding: 7px;
  background-color: rgb(196, 213, 234);
}

tr {
  font-size: 14px;
}

input, .use-case-name-editable, .use-case-id-editable {
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

select {
  height: 50px;
  text-align: center;
}

.select-with-wrap {
  white-space: normal; 
  overflow-wrap: break-word;
}

th.name {
  width: 155px;
}

th.id {
  width: 90px;
}

th.parent {
  width: 150px;
}
select.parent-ids {
  width: 144px;
}

th.attack {
  width: 170px;
}
select.attack-technique {
  width: 164px;
}

th.override {
  width: 75px;
}

th.visibility {
  width: 95px;
}

th.implementation {
  width: 140px;
}

th.effectiveness {
  width: 125px;
}

th.weight {
  width: 85px;
}

th.potential {
  width: 95px;
}

th.inImpact {
  width: 100px;
}

th.thrImpact {
  width: 120px;
}

th.outImpact {
  width: 120px;
}

th.risk {
  width: 50px;
}

input, .uneditable {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.uneditable {
  background-color: lightgoldenrodyellow;
}

input[type=checkbox] {
  accent-color: white;
}

.load-button, .save-button {
  font-size: 14px;
  background-color: #d61b1b;
  border: 2px solid black;
  border-radius: 4px;
  color: rgb(255, 255, 255);
  padding: 7.5px 10px;
  margin-bottom: 1px;
  cursor: pointer;
}

.load-button {
  margin-left: 102px;
}

.save-button {
  margin-left: 10px;
}

.load-button:hover, .save-button:hover {
  background-color: rgb(214, 133, 27);
  color: rgb(255, 255, 255);
}

</style>
