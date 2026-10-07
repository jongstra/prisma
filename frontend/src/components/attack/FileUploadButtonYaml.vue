<script setup lang="ts">
import { ref } from 'vue'
import { tacticsStore } from '@/stores/tactics';
import * as yaml from 'yaml';
import Swal from 'sweetalert2';

const input = ref<HTMLInputElement>()
const isLoading = ref(false)
const store = tacticsStore()

// Load a DeTT&CT data source administration file. When the file has a problem, a message explains it and nothing
// changes (the previously loaded visibility stays). Data sources that ATT&CK does not know are ignored, with a warning.
const uploadFile = async () => {
  const file = input.value?.files?.[0]
  if (input.value) {
    input.value.value = '' // Reset the input, so selecting the same file again is registered as a change.
  }
  if (!file) {
    return
  }

  const allowedMimeTypes = ["text/yaml", "text/x-yaml", "text/yml", "text/x-yml", "application/yaml", "application/x-yaml", "application/yml", "application/x-yml"];
  const allowedExtensions = [".yaml", ".yml"];
  if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid file type',
      text: 'Please select a valid DeTT&CT YAML file.'
    });
    return;
  }

  isLoading.value = true
  try {
    let yamlData: unknown
    try {
      yamlData = yaml.parse(await file.text())
    } catch (error) {
      throw new Error(`The file is not valid YAML: ${(error as Error).message}`)
    }
    const { unknownDataSources } = store.processDettectYaml(yamlData)
    if (unknownDataSources.length > 0) {
      Swal.fire({
        icon: 'warning',
        titleText: 'DeTT&CT file loaded, with unknown data sources',
        text: `These data sources are not data components in MITRE ATT&CK v17.1, so they were ignored: ${unknownDataSources.join(', ')}.`,
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      titleText: 'The DeTT&CT file was not loaded',
      text: `${(error as Error).message} Nothing was changed.`,
    })
  } finally {
    isLoading.value = false
  }
}

// Add event listener to call uploadFile when file is selected
const onFileChange = () => {
  if (input.value?.files?.length) {
    uploadFile()
  }
}
</script>

<template>
  <div>
    <input
      ref="input"
      id="fileInput"
      type="file"
      @change="onFileChange"
      style="display: none;"
    >
    <label for="fileInput" class="file-button" :class="{ 'loading': isLoading }">
      {{ isLoading ? "Loading File..." : "Load DeTT&CT Data Sources YAML" }}
    </label>
  </div>
</template>

<style scoped>
.file-button {
  display: flex;
  padding: 3px;
  cursor: pointer;
  background-color: #d61b1b;
  color: rgb(255, 255, 255);
  border: 2px solid black;
  border-radius: 4px;
  text-align: center;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  transition: 0.1s;
  width: 105px;
  height: 70px;
}

.file-button:hover {
  background-color: rgb(214, 133, 27);
  color: rgb(255, 255, 255);
}
</style>
