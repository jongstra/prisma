<script setup lang="ts">
import { ref } from 'vue'
import { tacticsStore } from '@/stores/tactics';
import * as YAML from 'js-yaml';
import Swal from 'sweetalert2';

const input = ref<HTMLInputElement>()
const isLoading = ref(false)
const store = tacticsStore()

const uploadFile = async () => {

  let yamlData: any = null; //

  // Try to load the data from the uploaded file.
  try {
    isLoading.value = true // Start loading
    const file = input.value?.files?.[0]
    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'No file selected',
        text: 'Please select a YAML file to upload.'
      })
      return
    }

    if (file.type !== "text/yaml" && file.type !== "application/x-yaml") {
      Swal.fire({
        icon: 'error',
        title: 'Invalid file type',
        text: 'Please select a valid DeTT&CT YAML file.'
      })
      isLoading.value = false // End loading
      return
    }

    const fileContent = await file.text() // Reading file content asynchronously
    yamlData = YAML.load(fileContent) // Parsing JSON content
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error uploading YAML file',
      text: `An error occurred while processing the uploaded file. Error details: ${error.message}`
    })
  }
  
  // Try to process the file data.
  try {
    store.processDettectYaml(yamlData) // Updating the tactics store with YAML data
    console.log("YAML file successfully uploaded and store updated!")
  } catch (error) {
    store.resetDomainVisibility(yamlData.domain);
    Swal.fire({
      icon: 'error',
      title: 'Error uploading YAML file',
      text: `An error occurred while processing the uploaded file. The visibility for this domain has been reset. Error details: ${error.message}`
    })
  } finally {
    isLoading.value = false // End loading
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
