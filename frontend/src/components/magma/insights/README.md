# MaGMa insights

The Insights tab of the MaGMa page: charts about the use cases per level, data source and technique, and their improvement potential.

| Name | Description |
|---|---|
| [`InsightDataSourceMeanEffectiveness.vue`](InsightDataSourceMeanEffectiveness.vue) | Mean effectiveness per data source |
| [`InsightDataSourceMeanImplementation.vue`](InsightDataSourceMeanImplementation.vue) | Mean implementation per data source |
| [`InsightDataSourceMeanVisibility.vue`](InsightDataSourceMeanVisibility.vue) | Mean visibility per data source |
| [`InsightImprovementPotentialForL3UseCases.vue`](InsightImprovementPotentialForL3UseCases.vue) | L3 use cases with the most improvement potential |
| [`InsightImprovementPotentialL3UseCasesForL1UseCase.vue`](InsightImprovementPotentialL3UseCasesForL1UseCase.vue) | The same, for one L1 use case |
| [`InsightMostFrequentlyLinkedAttackTechniques.vue`](InsightMostFrequentlyLinkedAttackTechniques.vue) | Techniques with the most L3 use cases |
| [`InsightNumberOfUniqueAttackTechniquesPerDataSource.vue`](InsightNumberOfUniqueAttackTechniquesPerDataSource.vue) | Number of different techniques per data source |
| [`InsightNumberOfUseCasesPerDataSource.vue`](InsightNumberOfUseCasesPerDataSource.vue) | Number of use cases per data source |
| [`InsightNumberUseCasesPerLayer.vue`](InsightNumberUseCasesPerLayer.vue) | Number of use cases per level (L1, L2, L3) |
| [`MagmaInsights.vue`](MagmaInsights.vue) | The tab itself: all MaGMa charts |
| [`potentialSegments.ts`](potentialSegments.ts) | Splits an L3 use case's potential over V, I and E, for the charts |
