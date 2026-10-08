# DeTT&CT page components

Components of the DeTT&CT page: the ATT&CK matrix with visibility, and its filters.

| Name | Description |
|---|---|
| [`Button.vue`](Button.vue) | One technique in the matrix, with its tooltip |
| [`ButtonColumn.vue`](ButtonColumn.vue) | One tactic column of the matrix |
| [`ComponentSelectionTool.vue`](ComponentSelectionTool.vue) | Shows the techniques of selected data components |
| [`FileUploadButtonYaml.vue`](FileUploadButtonYaml.vue) | Loads a DeTT&CT data source file |
| [`GroupSelectionTool.vue`](GroupSelectionTool.vue) | Shows the techniques used by selected groups |
| [`notDetectableStyle.ts`](notDetectableStyle.ts) | Striped style for techniques that cannot be detected |
| [`SearchBar.vue`](SearchBar.vue) | Searches techniques by name or ID |
| [`TechniqueAttributeFilter.vue`](TechniqueAttributeFilter.vue) | Filters techniques by platform |
| [`TechniqueTotalOccurrenceFilter.vue`](TechniqueTotalOccurrenceFilter.vue) | Not used; replaced by the binned version |
| [`TechniqueTotalOccurrenceFilterBinned.vue`](TechniqueTotalOccurrenceFilterBinned.vue) | Filters techniques by how often they are used |
| [`TechniqueVisibilityPercentageFilter.vue`](TechniqueVisibilityPercentageFilter.vue) | Filters techniques by visibility percentage |
| [`VisibilityLegend.vue`](VisibilityLegend.vue) | Colour legend for visibility |
