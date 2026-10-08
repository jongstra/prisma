# MaGMa Excel

The MaGMa Excel template file in this directory is an enhanced version that aims to automatically assign an L2 use case for each L3 use case on the L3 sheet. This file should help users fill in their list of use cases more quickly.

The Python Notebook file in [`tools/convert_magma_excel.ipynb`](../tools/convert_magma_excel.ipynb) can be used to convert the resulting Excel file to a valid MaGma YAML file, which can be loaded into the DeTT&CT MaGMa Visualizer tool.

After a new ATT&CK version has been processed (see [`tools/build_attack_catalog.ipynb`](../tools/build_attack_catalog.ipynb)), refresh the technique list on the *Mitre Techniques* sheet with `tools/.venv/bin/python templates/update_template_techniques.py <ATT&CK version>`. The script recalculates the workbook when LibreOffice is installed; otherwise, open and save the template once in Excel or LibreOffice.
