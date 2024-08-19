<script setup lang="ts">
import { ref } from 'vue'
import { tacticsStore } from '@/stores/tactics';
import * as YAML from 'js-yaml';
const input = ref<HTMLInputElement>()


const uploadFile = async () => {
  const file = input.value?.files?.[0]
  if (!file) {
    alert("No file selected")
    return
  }

  if (file.type !== "text/yaml" && file.type !== "application/x-yaml") {
    alert("Please upload a valid YAML file")
    return
  }

  try {
    const fileContent = await file.text() // Reading file content asynchronously
    const yamlData = YAML.load(fileContent) // Parsing JSON content, now use js-yaml to load yaml data

    const store = tacticsStore() // Accessing the Pinia store
    store.processDettectYaml(yamlData) // Updating the store with YAML data

    console.log("YAML file successfully uploaded and store updated!")
  } catch (error) {
    console.log("Error")
    console.error(error)
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
    <label for="fileInput" class="file-button">
      Upload DeTT&CT File  (YAML)
    </label>
  </div>
</template>


<style scoped>
.file-button {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  background-color: #e1e1e1;
  border: 1px solid black;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
}

.file-button:hover {
  background-color: #0056b3;
  color: white;
}
</style>