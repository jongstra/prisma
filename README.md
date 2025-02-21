# MaGMa-DeTT&CT Visualizer

## Installation Instructions

### Install Node.js
If you do not have Node.js installed, please [download](https://nodejs.org/en/download) and install it. After this step, we assume you have Node.js installed with npm as the package manager.

### Clone this Repository
```sh
git clone git@github.com:jongstra/dettect-visualizer.git
```

### Enter Project Frontend Directory
```sh
cd dettect-visualizer/frontend
```

### Install Application
```sh
npm install
```

### Run Application (for Development & Testing)
```sh
npm run dev
```

- To use the application, open the local link shown in your terminal (similar to localhost:5173) in your browser.
- To try out the application, you can load one of the example DeTT&CT YAML files (from the project's example-data-dettect folder) into the application using the big red button.
- Alternatively, you can create an example DETT&CT Data Sources YAML file using the [DeTT&CT Editor](https://rabobank-cdc.github.io/dettect-editor/#/datasources). The resulting YAML file can be saved to your computer, and loaded into the application using the big red button.

## Project Status 
This project is currently in development. You may run into unusual behavior and/or bugs.
- ATT&CK view: works mostly as intended.
- Insights view: works mostly as intended.
- MaGMa view: in active development.

## Development
- Software Development: Thomas Jongstra
- Ideological Guidance: Rob van Os
- Overarching Project (Inventarisatie (inter-)departementale capaciteiten cyberweerbaarheid): Rob van Os, Raymond Bierens & Tony van der Togt

## Project Goals
- Helping organizations manage their cyber security use cases (using the [MaGMa](https://www.betaalvereniging.nl/en/safety/magma/) framework).
- Visualizing the visibility organizations have on their digital infractructure (using [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT)/[dettectinator](https://github.com/siriussecurity/dettectinator)).
- Integrating DeTT&CT visibility with MaGMa use case management.
- Providing high-level insights and suggestions regarding visibility and use case management.

## Technical Setup
- Frontend: JS/Vue
- Backend: Python

## Future
- When ready, the aim is to distribute this project under an open source license (AGPL-3).
- The name of the project 'MaGMa-DeTT&CT Visualizer' is still subject to change.
- This project has a strong focus on pragmatism and simplicity for the benefit of the end user. Its design is sometimes strongly opinionated and limited with this goal in mind. New features may be added based on common user needs, but should not undermine this philosphy.

## Thanks
Thanks are extended to the following:
- Dutch Government: The initial development of this project has been funded by the Dutch government. This support has been instrumental for the creation this project.
- The MITRE Corporation: This project builds on the work of MITRE which provides actualized ATT&CK mapppings. These mappings form a crucial basis for this project.
- Developers of DeTT&CT: This project extends the work in DETT&CT and would not have existed without it.