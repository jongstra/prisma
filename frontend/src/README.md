# Source code

The source code of the PRISMA web application.

| Name | Description |
|---|---|
| [`assets/`](assets/) | Global stylesheet |
| [`components/`](components/) | Vue components, grouped by page |
| [`domain/`](domain/) | Calculations and checks, without user interface |
| [`io/`](io/) | Reading and writing files: the ATT&CK catalog, DeTT&CT and MaGMa files, downloads |
| [`router/`](router/) | The page addresses |
| [`stores/`](stores/) | Shared state: ATT&CK data, DeTT&CT visibility, MaGMa use cases |
| [`views/`](views/) | The three pages: DeTT&CT, Insights and MaGMa |
| [`App.d.ts`](App.d.ts) | TypeScript declaration for `.vue` files |
| [`App.vue`](App.vue) | Page frame with navigation; loads the ATT&CK catalog |
| [`main.ts`](main.ts) | Starts the application |
