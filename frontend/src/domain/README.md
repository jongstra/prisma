# Domain logic

Calculations and checks without user interface, so they can be tested on their own (see the `__tests__` folders).

| Name | Description |
|---|---|
| [`attack/`](attack/) | Reading DeTT&CT files (`dettect.ts`) and visibility per technique (`visibility.ts`) |
| [`magma/`](magma/) | MaGMa scores and risk (`calculations.ts`), heatmap values (`heatmap.ts`), import checks (`validation.ts`) |
