# MaGMa-DeTT&CT Visualizer

## Installation Instructions


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
- Backend: Python/Flask

## Future
- When ready, the aim is to distribute this project under an open source license (AGPL-3).
- The name of the project 'MaGMa-DeTT&CT Visualizer' is still subject to change.
- This project has a strong focus on pragmatism and simplicity for the benefit of the end user. Its design is sometimes strongly opinionated and limited with this goal in mind. New features may be added based on common user needs, but should not undermine this philosphy.
- Python is currently used to pre-process the MITRE ATT&CK data and to serve this data to the front end. It is possible that a switch to JS will be made for this last part.

## Thanks
The initial development of this project has been funded by the Dutch government. This support has been instrumental for the creation this project.