<script setup lang="ts">
// The tab bar of the MaGMa page, with the buttons to load and save the use cases as a MaGMa YAML file.
import Swal from 'sweetalert2';
import { magmaStore } from '@/stores/magma';

const magma = magmaStore();
const tabs = ['L1', 'L2', 'L3', 'Heatmap', 'Insights', 'Summary'];

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
  magma.markAsSaved();
};

// Display names of the ATT&CK domains, for messages.
const domainNames: Record<string, string> = { 'enterprise-attack': 'Enterprise', 'mobile-attack': 'Mobile', 'ics-attack': 'ICS' };

// Load a MaGMa YAML file. Its use cases replace the current use cases of the domains in the file; the other domains stay
// as they are. A dialog asks for confirmation when current use cases will be replaced, and nothing changes
// when the file cannot be read.
const importYaml = (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];
  fileInput.value = ''; // Reset the input, so selecting the same file again is registered as a change.
  if (!file) {
    return;
  }

  const allowedMimeTypes = ["text/yaml", "text/x-yaml", "text/yml", "text/x-yml", "application/yaml", "application/x-yaml", "application/yml", "application/x-yml"];
  const allowedExtensions = [".yaml", ".yml"];
  if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid file type',
      text: 'Please select a valid MaGMa YAML file.'
    })
    return
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const yamlContent = e.target?.result as string;

    let domains: string[];
    try {
      domains = magma.useCaseFileDomains(yamlContent);
    } catch (error) {
      Swal.fire({ icon: 'error', titleText: 'The file was not loaded', text: `${(error as Error).message} Nothing was changed.` });
      return;
    }

    // Ask for confirmation when current use cases will be replaced.
    const currentCount = (domain: string) => magma.useCases.filter((useCase: any) => !useCase.permanent && useCase.domain === domain).length;
    const replaced = domains.filter(domain => currentCount(domain) > 0);
    if (replaced.length > 0) {
      const kept = Object.keys(domainNames).filter(domain => !domains.includes(domain));
      const replacedText = replaced.map(domain => `${domainNames[domain]} (${currentCount(domain)} use cases)`).join(' and ');
      const keptText = kept.length > 0 ? ` ${kept.map(domain => domainNames[domain]).join(' and ')} will stay as they are.` : '';
      const result = await Swal.fire({
        icon: 'warning',
        titleText: 'Replace the current use cases?',
        text: `The file contains use cases for ${domains.map(domain => domainNames[domain]).join(', ')}. It replaces the current use cases of ${replacedText}.${keptText}`,
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'green',
        confirmButtonText: 'Yes, load the file',
        cancelButtonText: 'No, cancel',
        reverseButtons: true,
      });
      if (!result.isConfirmed) {
        return;
      }
    }

    magma.loadUseCaseFile(yamlContent);
  };
  reader.readAsText(file);
};
</script>

<template>
  <div class="sheet-tabs">
    <button
      v-for="tab in tabs"
      :key="tab"
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
</template>

<style scoped>
.sheet-tabs {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #777;
}

.sheet-tab {
  width: 90px; /* Set the width of each tab */
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

.load-button, .save-button {
  font-size: 14px;
  background-color: #d61b1b;
  border: 2px solid black;
  border-radius: 4px;
  color: rgb(255, 255, 255);
  padding: 7.5px 7.5px;
  margin-bottom: 1px;
  cursor: pointer;
}

.load-button {
  margin-left: 53px;
}

.save-button {
  margin-left: 5px;
}

.load-button:hover, .save-button:hover {
  background-color: rgb(214, 133, 27);
  color: rgb(255, 255, 255);
}
</style>
