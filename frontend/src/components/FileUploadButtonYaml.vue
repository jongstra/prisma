<script setup lang="ts">
import { ref } from 'vue'
import { tacticsStore } from '@/stores/tactics';
import * as YAML from 'js-yaml';

const input = ref<HTMLInputElement>()
const isLoading = ref(false) // Track loading state

const uploadFile = async () => {
  try {
    isLoading.value = true // Start loading
    const file = input.value?.files?.[0]
    if (!file) {
      alert("No file selected")
      return
    }

    if (file.type !== "text/yaml" && file.type !== "application/x-yaml") {
      alert("Please upload a valid YAML file")
      isLoading.value = false // End loading
      return
    }

    const fileContent = await file.text() // Reading file content asynchronously
    const yamlData = YAML.load(fileContent) // Parsing JSON content, now use js-yaml to load yaml data

    const store = tacticsStore() // Accessing the Pinia store
    store.processDettectYaml(yamlData) // Updating the store with YAML data

    console.log("YAML file successfully uploaded and store updated!")
  } catch (error) {
    console.log("Error")
    console.error(error)
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
      {{ isLoading ? "Loading File..." : "Upload DeTT&CT File (YAML)" }}
    </label>
  </div>
</template>

<style scoped>
.file-button {
  display: inline-block;
  padding: 10px;
  cursor: pointer;
  background-color: #d61b1b;
  color: rgb(255, 255, 255);
  border: 2px solid black;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  transition: 0.1s;
  width: 220px;
}

.file-button:hover {
  background-color: rgb(214, 133, 27);
  color: rgb(255, 255, 255);
}

</style>
