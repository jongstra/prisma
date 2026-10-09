# Reading and writing files

Everything PRISMA reads from or writes to a file: the ATT&CK catalog, DeTT&CT and MaGMa files, and downloads. The stores only hold data and calculate; showing messages is up to the components.

| Name | Description |
|---|---|
| [`__tests__/`](__tests__/) | Tests for these files |
| [`downloadFile.ts`](downloadFile.ts) | Offers text as a file download (Save MaGMa YAML) |
| [`loadCatalog.ts`](loadCatalog.ts) | Loads the ATT&CK catalog (`public/tactics_and_techniques_by_domain.json`) |
| [`magmaFile.ts`](magmaFile.ts) | The MaGMa file format: reading and checking a file, writing the use cases, the import summary |
| [`readYamlFile.ts`](readYamlFile.ts) | Checks the file type and reads the YAML in a file that the user chose |
