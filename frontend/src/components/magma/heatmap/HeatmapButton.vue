<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
import { magmaStore } from '@/stores/magma';
import { ref, computed } from 'vue';
import { ancestorCounts, heatmapValue } from '@/domain/magma/heatmap';
import { isDetectable } from '@/domain/attack/visibility';
import { NOT_DETECTABLE_STYLE } from '@/components/common/notDetectableStyle';
import TechniqueTooltip from '@/components/common/TechniqueTooltip.vue';
import { useTechniqueTooltip } from '@/components/common/useTechniqueTooltip';

const store = tacticsStore();
const props = defineProps(['technique']);
const magma = magmaStore();

const domain: any = store.currentDomain;

const buttonRef = ref<HTMLElement | null>(null);
const { open: tooltipOpen, pinned, show: showTooltip, hide: hideTooltip, togglePin, unpin } = useTechniqueTooltip();


// The L3 use cases in the current domain that detect this technique or one of its sub-techniques.
const relatedUseCases = computed(() => magma.l3UseCasesForTechnique(props.technique.external_id, store.domain));

// The heatmap value (0-100) for the metrics selected with the checkboxes, or null when there is nothing to show.
const value = computed(() => heatmapValue(relatedUseCases.value, {
  visibility: magma.heatmapVisibility,
  implementation: magma.heatmapImplementation,
  effectiveness: magma.heatmapEffectiveness,
}));

function getBackgroundColor() {
  return value.value === null ? undefined : `rgba(0, 255, 0, ${value.value / 100})`;
}

// Techniques without use cases that ATT&CK lists no data components for are striped, as in the DeTT&CT matrix: a known
// blind spot. Techniques with use cases are coloured by their heatmap value (and marked with a thicker border).
function getButtonStyle() {
  if (relatedUseCases.value.length === 0 && !isDetectable(props.technique)) {
    return NOT_DETECTABLE_STYLE;
  }
  return { backgroundColor: getBackgroundColor() };
}


function getTooltipText() {
  const useCases = relatedUseCases.value;
  const onSubTechniques = useCases.filter(useCase => useCase.attackTechniqueId !== props.technique.external_id).length;
  const { l2, l1 } = ancestorCounts(useCases, magma.useCases);
  const percentage = (metrics: { visibility: boolean, implementation: boolean, effectiveness: boolean }) =>
    `${(heatmapValue(useCases, metrics) ?? 0).toFixed(0)}%`;

  const notDetectable = isDetectable(props.technique) ? '' : 'Not detectable via data sources: ATT&CK lists no data components for this technique.\n\n';
  const tooltipText = `<a href='https://attack.mitre.org/techniques/${props.technique.external_id}/' target="_blank">${props.technique.name}</a> (${props.technique.external_id})\n\n${notDetectable}<hr/>
  Weight: ${percentage({ visibility: true, implementation: true, effectiveness: true })}
  Visibility: ${percentage({ visibility: true, implementation: false, effectiveness: false })}
  Implementation: ${percentage({ visibility: false, implementation: true, effectiveness: false })}
  Effectiveness: ${percentage({ visibility: false, implementation: false, effectiveness: true })}

  <hr/>
  Related L3 Use Cases: ${useCases.length}${onSubTechniques > 0 ? ` (${onSubTechniques} on sub-techniques)` : ''}
  Related L2 Use Cases: ${l2}
  Related L1 Use Cases: ${l1}

  <hr>
  Nr groups using: ${props.technique.occurrence_groups}
  Nr software using: ${props.technique.occurrence_software}
  Total occurrence: ${props.technique.occurrence_total}
  
  `
  return tooltipText
};


const showButton = computed(() => {

  // The heatmap value of the technique (based on the heatmap style checkmarks); 0 when there are no related use cases.
  const currentValue = value.value ?? 0;

  // Compute whether the button should be shown based on its current value (based on the heatmap style checkmarks) and the heatmapFilterValue.
  let valueFilterResult = (currentValue >= magma.heatmapFilterValue)

  let searchQueryFilterResult = (
    !magma.heatmapSearchQuery ||  // There is no search query.
    props.technique.name.toLowerCase().includes(magma.heatmapSearchQuery.toLowerCase()) ||  // The search query matches on the technique name.
    props.technique.external_id.toLowerCase().includes(magma.heatmapSearchQuery.toLowerCase())  // The search query matches on the technique ID.
  )

  // When the group tool mask toggle (domain.only_show_selected_groups_magma_heatmap) is switch to 'true', we want to hide all techniques that are not covered by the selected groups.
  let groupMaskFilterResult = (
    !(domain.only_show_selected_groups_magma_heatmap && !store.selectedGroupsTechniquesSetMagmaHeatmap.has(props.technique.name))
  );

    return valueFilterResult && searchQueryFilterResult && groupMaskFilterResult

});


const occursInSelectedGroups = () => {
  if (store.selectedGroupsTechniquesSetMagmaHeatmap.has(props.technique.name)) {
    return true
  } else {
    return false
  }
};

</script>


<template>
  <button v-if="showButton"
    ref="buttonRef"
    :style="getButtonStyle()"
    @click="togglePin"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    :class="{ pinned, 'occurs-in-selected-groups': occursInSelectedGroups(), 'has-use-cases': relatedUseCases.length > 0 }"
  >
    <span class="buttontext">{{ technique.name }}</span>
  </button>

  <!-- The tooltip, shown next to the button -->
  <TechniqueTooltip v-if="tooltipOpen" :anchor="buttonRef" :pinned="pinned" @unpin="unpin">
    <div v-html="getTooltipText()"></div>

    <!-- Show which groups use this technique. -->
    <div v-if="props.technique.groups.length > 0">
      <hr>
      <br>
      Groups:
      <br>
      <!-- Group buttons -->
      <label v-for="group in props.technique.groups" :key="group" for="${group}-${Math.random()}" style="display: inline-flex; align-items: center; margin-right: 5px;">
        <span
          class="group-box"
          :style="{
            display: 'inline-block',
            padding: '5px 5px',
            marginLeft: '1px',
            marginTop: '2px',
            marginBottom: '2px',
            backgroundColor: 'gray',
            borderColor: domain.groups.find(g => g.name === group)?.selected ? 'rgb(230, 0, 0)' : '#ccc',
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, border-color 0.2s',
            fontSize: '11px'
          }">
          {{ group }}
        </span>
      </label>
    </div>
  </TechniqueTooltip>
</template>

<style scoped>

button {
  margin-top: 0px;
  margin-bottom: 3px;
  background-color: rgb(255, 255, 255);
  border: 2px solid rgb(42, 42, 42);
  border-radius: 4px; /* Slightly rounded corners */
  transition: transform 0.1s ease, box-shadow 0.1s ease; /* Smooth transition for hover effects */
  position: relative; /* Ensure the button's stacking context is isolated */
}

button:hover, button.pinned {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 3px, rgb(51, 51, 51) 0px 0px 0px 2.5px; /* On hover, add a thick black 'outline' to the button. */
  z-index: 1001;
}

/* Techniques with L3 use cases get a thicker (4px) dark border, so a technique with use cases at 0% still stands out from
   techniques without use cases. The extra 2px is drawn outside the normal border, so the button keeps its size, and the
   red border of a selected group (below) stays visible inside it. */
button.has-use-cases {
  box-shadow: 0 0 0 2px rgb(42, 42, 42);
}

button.occurs-in-selected-groups {
  border: 2px solid red;  /* Change the border color on group select */
}

.buttontext {
  width: 125px;
  height: 24px;
  font-size: 10.5px;
  overflow: hidden;
  display: block;
  text-overflow: ellipsis;
  text-align: center;
}

</style>