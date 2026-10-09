<script setup lang="ts">
// The L1, L2 or L3 sheet of the MaGMa page (the active tab): one row per use case of the current domain, with a button
// to add a use case. The columns are defined in useCaseColumns.ts.
import Swal from 'sweetalert2';
import { computed } from 'vue';
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';
import { USE_CASE_COLUMNS, type SheetLevel } from './useCaseColumns';

const magma = magmaStore();
const tactics = tacticsStore();

const columns = computed(() => USE_CASE_COLUMNS[magma.activeTab as SheetLevel]);
const useCases = computed(() => magma.activeTabUseCases(tactics.domain));

// The value of the use case field that a column shows.
const fieldValue = (useCase: object, field: string) => (useCase as Record<string, any>)[field];

// The percentages that are typed in a number field, and the calculated ones that are only shown.
const PERCENTAGE_INPUTS = ['visibility', 'implementation', 'effectiveness', 'inImpact', 'thrImpact', 'outImpact'];
const PERCENTAGES_SHOWN = ['visibility', 'implementation', 'effectiveness', 'weight', 'potential'];
const TEXT_FIELDS = ['name', 'description', 'dataSource'];

// The averages in the row below the L1 sheet.
const averages = computed(() => {
  const data = useCases.value;
  if (data.length === 0) {
    return {};
  }
  const average = (field: string) => (data.reduce((sum, useCase) => sum + (fieldValue(useCase, field) || 0), 0) / data.length).toFixed(2);
  return {
    visibility: average('visibility'),
    implementation: average('implementation'),
    effectiveness: average('effectiveness'),
    weight: average('weight'),
    potential: average('potential'),
  };
});

const addNewUseCase = () => {
  const level = parseFloat(magma.activeTab.slice(-1));
  magma.addNewUseCase(level, tactics.domain);
};

// A short list of use case IDs for a message, e.g. "DOS-1-1, DOS-1-2 and 3 more".
const listIds = (useCases: any[], max = 5) => {
  const ids = useCases.slice(0, max).map(useCase => useCase.id).join(', ');
  return useCases.length > max ? `${ids} and ${useCases.length - max} more` : ids;
};

// Child use cases are kept when their parent is deleted, but lose their parent, so the dialog warns about them.
const confirmRemoveUseCase = (useCase: any) => {
  const children = magma.getChildUseCases(useCase);
  const childrenWarning = children.length === 0 ? '' :
    `"${useCase.id}" still has ${children.length} child use case(s): ${listIds(children)}. They will lose their parent (and turn red), so you can move them to another parent.\n\n`;
  Swal.fire({
    titleText: `Delete use case '${useCase.id}'?`,
    text: childrenWarning + "You won't be able to revert this.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: 'green',
    confirmButtonText: 'Yes, delete this use case',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      magma.removeUseCaseByUid(useCase.uid);
    }
  });
};

const confirmRemoveUseCaseLevel = () => {
  if (magma.activeTabUseCases(tactics.domain).length > 0) {
    // The use cases on the level below are kept, but lose their parent.
    const deleted = magma.activeTabUseCases(tactics.domain).filter((useCase: any) => !useCase.permanent);
    const orphans = new Set(deleted.flatMap((useCase: any) => magma.getChildUseCases(useCase)));
    const orphansWarning = orphans.size === 0 ? '' : `\n\n${orphans.size} use case(s) on the level below will lose their parent.`;
    Swal.fire({
      title: `You are about to delete all ${magma.activeTab} use cases`,
      text: `This is a permanent and irreversible action.${orphansWarning}\n\nDo you wish to proceed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'green',
      confirmButtonText: `Yes, delete all ${magma.activeTab} use cases`,
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        magma.removeActiveTabUseCases(tactics.domain);
      }
    });
  }
};

// Rename a use case when its ID field is committed (Enter, or leaving the field). Its children move along to the new ID.
// A refused rename (empty, or an ID that already exists) is explained, and the field shows the current ID again.
const renameUseCase = (useCase: any, event: Event) => {
  const input = event.target as HTMLInputElement;
  const problem = magma.renameUseCase(useCase.uid, input.value);
  if (problem) {
    input.value = useCase.id;
    Swal.fire({ icon: 'error', titleText: 'ID not changed', text: problem });
  }
};

const updateObjectField = (uid: string, field: string, value: any) => {
  magma.updateUseCase(uid, {[field]: value}, tactics.domain);
};

// A typed percentage: kept between 0 and 100 (see validateAndFormat), then saved.
const updatePercentage = (useCase: any, field: string, event: Event) => {
  validateAndFormat(event);
  updateObjectField(useCase.uid, field, (event.target as HTMLInputElement).value);
};

// Turning the override off takes the visibility from the ATT&CK technique again (by setting the technique again).
const updateOverride = (useCase: any, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  updateObjectField(useCase.uid, 'visibilityFromAttackTechniqueOverride', checked);
  if (!checked) {
    updateObjectField(useCase.uid, 'attackTechniqueId', useCase.attackTechniqueId);
  }
};

// Fields that are shown but cannot be changed: those of the permanent IN and THR use cases, and a visibility that
// comes from the use case's ATT&CK technique (unless it is overridden).
const isLocked = (useCase: any, field: string) => field === 'visibility'
  ? useCase.visibilityFromAttackTechnique && !useCase.visibilityFromAttackTechniqueOverride
  : useCase.permanent;

const getBackgroundColor = (useCase: any, field: string) => {

  if (['inImpact', 'thrImpact', 'outImpact'].includes(field)) {
    if (useCase.permanent) {
      return 'black'
    } else if ((Number(useCase.inImpact ?? 0) + Number(useCase.thrImpact ?? 0) + Number(useCase.outImpact ?? 0)) == 100) {
      return 'white'
    } else {
      return 'crimson'
    }
  }

  if (field === 'risk') {
    return useCase.permanent ? 'black': 'lightgoldenrodyellow';
  }

  if (useCase.permanent) {
      return 'lightgoldenrodyellow'
  }

  if (field === 'visibility') {
    if (useCase.visibilityFromAttackTechnique && !useCase.visibilityFromAttackTechniqueOverride) {
      return 'lightgoldenrodyellow'
    }
    else {
      return 'white';
    }
  }

  if (field === 'id') {
    const id = useCase.id;
    const allIds = magma.getAllIds(tactics.domain);
    const noDuplicateId = (allIds.filter(item => item === id).length <= 1);
    if (noDuplicateId) {
      return 'white';
    } else {
      return 'crimson';
    }
  }

  if (field === 'parentIds') {
    const parentIds = useCase.parentIds;
    const validParentIds = Array.isArray(parentIds) && parentIds.every(id => magma.getAllIds(tactics.domain).includes(id));
    if (validParentIds) {
      return 'white';
    } else {
      return 'crimson';
    }
  }

};

// The use cases one level up that can be chosen as parent, sorted by ID. IDs that occur more than once are left out.
const parentLevelUseCases = computed(() => {
  const useCases = magma.activeTab === 'L3' ? magma.L2UseCases(tactics.domain)
    : magma.activeTab === 'L2' ? magma.L1UseCases(tactics.domain)
    : [];

  const idCounts = new Map<string, number>();
  useCases.forEach(useCase => {
    idCounts.set(useCase.id, (idCounts.get(useCase.id) || 0) + 1);
  });

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
</script>

<template>
  <table border="1" class="fixed-table">
    <thead>
      <tr>
        <!-- Deletes all use cases of this level. -->
        <th class="remove-col" @click="confirmRemoveUseCaseLevel()" style="background-color: #e73030; color: white; cursor: pointer;">&#10806;</th>
        <th v-for="column in columns" :key="column.field" :style="{ width: `${column.width}px` }">
          {{ column.title }}
        </th>
      </tr>
    </thead>
    <tbody>

      <!-- Rows for all use cases. -->
      <tr v-for="(useCase, index) in useCases" :key="index">

        <!-- Remove-use-case buttons -->
        <td class="remove-col">
          <button
            v-if="!useCase.permanent"
            class='remove-button'
            @click="confirmRemoveUseCase(useCase)"
            style="background-color: #e73030; color: white; border: none; cursor: pointer; width: 100%; height: 100%"
          >
            &times;
          </button>
        </td>

        <td v-for="column in columns" :key="column.field">
          <!-- Editable fields -->
          <template v-if="column.editable">
            <input
              v-if="PERCENTAGE_INPUTS.includes(column.field)"
              type="number"
              :value="fieldValue(useCase, column.field)"
              @input="(event) => updatePercentage(useCase, column.field, event)"
              :disabled="isLocked(useCase, column.field)"
              :style="{backgroundColor: getBackgroundColor(useCase, column.field)}"
            />

            <input
              v-else-if="column.field === 'id'"
              :value="useCase.id"
              @change="(event) => renameUseCase(useCase, event)"
              :disabled="isLocked(useCase, column.field)"
              :style="{backgroundColor: getBackgroundColor(useCase, column.field)}"
            />

            <textarea
              v-else-if="TEXT_FIELDS.includes(column.field)"
              :value="fieldValue(useCase, column.field)"
              @input="(event) => updateObjectField(useCase.uid, column.field, (event.target as HTMLTextAreaElement).value)"
              :disabled="isLocked(useCase, column.field)"
              :style="{backgroundColor: getBackgroundColor(useCase, column.field)}"
            ></textarea>

            <select
              v-else-if="column.field === 'parentIds'"
              class="parent-ids select-with-wrap"
              :value="useCase.parentIds"
              @change="(event) => updateObjectField(useCase.uid, 'parentIds', Array.from((event.target as HTMLSelectElement).selectedOptions).map(option => option.value))"
              :style="{backgroundColor: getBackgroundColor(useCase, column.field)}"
            >
              <option value="none">None</option>
              <option v-for="parent in parentLevelUseCases" :key="parent.id" :value="parent.id">{{ parent.id }}: {{ parent.name }}</option>
            </select>

            <select
              v-else-if="column.field === 'attackTechniqueId'"
              class="attack-technique select-with-wrap"
              :value="useCase.attackTechniqueId || 'none'"
              @change="(event) => updateObjectField(useCase.uid, 'attackTechniqueId', (event.target as HTMLSelectElement).value)"
            >
              <option value="none">None</option>
              <option v-for="technique in tactics.allTechniquesIdsAndNames" :key="technique.id" :value="technique.id">{{ technique.id }}: {{ technique.name }}</option>
            </select>

            <input
              v-else-if="column.field === 'visibilityFromAttackTechniqueOverride'"
              type="checkbox"
              :checked="useCase.visibilityFromAttackTechniqueOverride"
              @change="(event) => updateOverride(useCase, event)"
            />
          </template>

          <!-- Calculated fields -->
          <div v-else-if="column.field === 'L1nrChildren' || column.field === 'L2nrChildren'" class="uneditable">
            {{ magma.getChildUseCases(useCase).length }}
          </div>

          <div v-else-if="column.field === 'L1nrGrandChildren'" class="uneditable">
            {{ magma.getGrandChildUseCases(useCase).length }}
          </div>

          <div v-else-if="PERCENTAGES_SHOWN.includes(column.field)" class="uneditable">
            {{ formatPercentage(fieldValue(useCase, column.field)) }}
          </div>

          <input
            v-else-if="column.field === 'risk'"
            :value="useCase.permanent ? '' : formatPercentage(useCase.risk || 0)"
            :style="{backgroundColor: getBackgroundColor(useCase, column.field)}"
            disabled
          />

          <template v-else>
            {{ fieldValue(useCase, column.field) }}
          </template>
        </td>

      </tr>

      <!-- The empty rows add a little space (the table's border spacing) above and below the averages. -->
      <tr></tr>
      <tr v-if="magma.activeTab == 'L1'">
        <td style="border: none"></td>
        <td style="border: none"></td>
        <td style="border: none"></td>
        <td style="background-color: #eee">Averages &rarr;</td>
        <td style="border: none"></td>
        <td style="border: none"></td>
        <td style="background-color: #eee">{{ averages.visibility }}</td>
        <td style="background-color: #eee">{{ averages.implementation }}</td>
        <td style="background-color: #eee">{{ averages.effectiveness }}</td>
        <td style="background-color: #eee">{{ averages.weight }}</td>
        <td style="background-color: #eee">{{ averages.potential }}</td>
      </tr>
      <tr></tr>

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
</template>

<style scoped>
.fixed-table {
  width: 100%;
  table-layout: fixed;
}

/* Default cell settings, will be overwritten later. But gives more consistent feel. */
th, td, input {
  width: 140px;
  height: 30px;
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

input {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  width: 100%;
  border: 0px;
  min-height: 55px;
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
  width: 40px;
}

select {
  height: 50px;
  text-align: center;
}

.select-with-wrap {
  white-space: normal;
  overflow-wrap: break-word;
  border: 0px;
}

select.parent-ids {
  width: 144px;
}

select.attack-technique {
  width: 164px;
}

input, .uneditable {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.uneditable {
  background-color: lightgoldenrodyellow;
}

input[type=checkbox] {
  accent-color: white;
}

textarea {
  resize: none;
  width: 100%;
  height: 100%;
  border: 0px;
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 4px;
}
</style>
