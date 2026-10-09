// Reading a YAML file that the user chose: a DeTT&CT data source administration file or a MaGMa file.
import * as yaml from 'yaml';

// The types that browsers give YAML files; browsers do not always know the type, so the extension counts as well.
const YAML_TYPES = ["text/yaml", "text/x-yaml", "text/yml", "text/x-yml", "application/yaml", "application/x-yaml", "application/yml", "application/x-yml"];
const YAML_EXTENSIONS = [".yaml", ".yml"];

// Whether a file is a YAML file, judged by its type or its extension.
export function isYamlFile(file: File): boolean {
  return YAML_TYPES.includes(file.type) || YAML_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));
}

// The YAML in a file. Throws an error with an explanation when it is not valid YAML.
export async function readYamlFile(file: File): Promise<unknown> {
  const text = await file.text();
  try {
    return yaml.parse(text);
  } catch (error) {
    throw new Error(`The file is not valid YAML: ${(error as Error).message}`);
  }
}
