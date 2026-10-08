# Templates

The MaGMa Excel template, for preparing many use cases before loading them into PRISMA.

| Name | Description |
|---|---|
| [`magma_template.xlsx`](magma_template.xlsx) | MaGMa 2.0 template: add L3 rules, the L2s are suggested |
| [`update_template_techniques.py`](update_template_techniques.py) | Refreshes the template's ATT&CK technique list |

## Using the template

1. On the *L3 UC* sheet, fill in a name, a description and the ATT&CK technique(s) per rule. The grey columns fill in automatically.
2. Convert the file with [`tools/convert_magma_excel.ipynb`](../tools/convert_magma_excel.ipynb) (set `input_file`), and load the YAML on the MaGMa page.

After a new ATT&CK version (see [`tools/`](../tools/)), refresh the technique list with `tools/.venv/bin/python templates/update_template_techniques.py <ATT&CK version>`. The script recalculates the workbook when LibreOffice is installed; otherwise, open and save the template once in Excel or LibreOffice.
