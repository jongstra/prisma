<script setup lang="ts">
import { ref } from 'vue'
import { tacticsStore } from '@/stores/tactics';
const input = ref<HTMLInputElement>()


const uploadFile = async () => {
  const file = input.value?.files?.[0]
  if (!file) {
    alert("No file selected")
    return
  }

  if (file.type !== "application/json") {
    alert("Please upload a valid JSON file")
    return
  }

  try {
    const fileContent = await file.text() // Reading file content asynchronously
    const jsonData = JSON.parse(fileContent) // Parsing JSON content

    const store = tacticsStore() // Accessing the Pinia store
    store.processDettectJson(jsonData) // Updating the store with JSON data

    console.log("JSON file successfully uploaded and store updated!")
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
      Upload DETT&CT File (JSON)
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
  /* background-color: hsla(160, 100%, 37%, 0.2);
  color: black; */
}
</style>
