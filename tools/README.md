# Tools

Python notebooks that prepare data for PRISMA: the ATT&CK catalog, and conversions from Excel to MaGMa YAML.

| Name | Description |
|---|---|
| [`dettect_files/`](dettect_files/) | Extra DeTT&CT data sources per technique, used by the catalog notebook |
| [`mitre_attack_files/`](mitre_attack_files/) | ATT&CK v17.1 source data from MITRE |
| [`build_attack_catalog.ipynb`](build_attack_catalog.ipynb) | Builds the ATT&CK catalog the app loads (`frontend/public/`) |
| [`convert_magma_excel.ipynb`](convert_magma_excel.ipynb) | Converts a filled-in [MaGMa template](../templates/) to MaGMa YAML |
| [`convert_manual_excel.ipynb`](convert_manual_excel.ipynb) | Converts a simple list of detection rules to MaGMa YAML |
| [`requirements.txt`](requirements.txt) | Python packages the notebooks need |

## Setup

```sh
cd tools
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/jupyter notebook
```

## New ATT&CK version

Download the new files from [MITRE's ATT&CK STIX data](https://github.com/mitre-attack/attack-stix-data) into `mitre_attack_files/`, update the file names in `build_attack_catalog.ipynb`, and run it. Then refresh the template's technique list (see [`templates/`](../templates/)).
