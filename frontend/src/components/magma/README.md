# MaGMa page components

The MaGMa page: the use case sheets, the heatmap, the insights and the summary.

| Name | Description |
|---|---|
| [`Heatmap.vue`](Heatmap.vue) | Heatmap tab: the ATT&CK matrix coloured by use case scores |
| [`HeatmapButton.vue`](HeatmapButton.vue) | One technique in the heatmap, with its tooltip |
| [`HeatmapButtonColumn.vue`](HeatmapButtonColumn.vue) | One tactic column of the heatmap |
| [`HeatmapGroupSelectionTool.vue`](HeatmapGroupSelectionTool.vue) | Shows the techniques used by selected groups |
| [`HeatmapSearchBar.vue`](HeatmapSearchBar.vue) | Searches techniques in the heatmap |
| [`HeatmapSliderFilter.vue`](HeatmapSliderFilter.vue) | Filters the heatmap by percentage |
| [`HeatmapStyleCheckboxes.vue`](HeatmapStyleCheckboxes.vue) | Chooses the scores the heatmap colours use |
| [`InsightDataSourceMeanEffectiveness.vue`](InsightDataSourceMeanEffectiveness.vue) | Mean effectiveness per data source |
| [`InsightDataSourceMeanImplementation.vue`](InsightDataSourceMeanImplementation.vue) | Mean implementation per data source |
| [`InsightDataSourceMeanVisibility.vue`](InsightDataSourceMeanVisibility.vue) | Mean visibility per data source |
| [`InsightImprovementPotentialForL3UseCases.vue`](InsightImprovementPotentialForL3UseCases.vue) | L3 use cases with the most improvement potential |
| [`InsightImprovementPotentialL3UseCasesForL1UseCase.vue`](InsightImprovementPotentialL3UseCasesForL1UseCase.vue) | The same, for one L1 use case |
| [`InsightMostFrequentlyLinkedAttackTechniques.vue`](InsightMostFrequentlyLinkedAttackTechniques.vue) | Techniques with the most L3 use cases |
| [`InsightNumberOfUniqueAttackTechniquesPerDataSource.vue`](InsightNumberOfUniqueAttackTechniquesPerDataSource.vue) | Number of different techniques per data source |
| [`InsightNumberOfUseCasesPerDataSource.vue`](InsightNumberOfUseCasesPerDataSource.vue) | Number of use cases per data source |
| [`InsightNumberUseCasesPerLayer.vue`](InsightNumberUseCasesPerLayer.vue) | Number of use cases per level (L1, L2, L3) |
| [`MagmaInsights.vue`](MagmaInsights.vue) | Insights tab: all MaGMa charts |
| [`MagmaSummary.vue`](MagmaSummary.vue) | Summary tab: averages and counts |
| [`SheetTabs.vue`](SheetTabs.vue) | The page itself: the L1/L2/L3 sheets, tabs, loading and saving |
