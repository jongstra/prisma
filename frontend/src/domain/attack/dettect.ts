// Reading DeTT&CT data source administration files (YAML, as made by the DeTT&CT editor).
//
// The whole file is checked before anything is applied, so a file with a problem changes nothing. Data sources in
// DeTT&CT are data components in MITRE ATT&CK; the visibility calculation uses their device completeness (0-5).

export const SUPPORTED_DOMAINS = ['enterprise-attack', 'mobile-attack', 'ics-attack'];

export interface DettectFile {
  domain: string;
  /** The DeTT&CT entries of the data sources that are data components of the domain, by name. */
  dataSources: Map<string, { data_quality: Record<string, unknown> }>;
  /** Device completeness per known data source, as a fraction between 0 and 1 (DeTT&CT score / 5). */
  completeness: Map<string, number>;
  /** Data sources in the file that are not data components of the domain in ATT&CK; these are ignored. */
  unknownDataSources: string[];
}

const isObject = (value: unknown): value is Record<string, any> => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Checks a parsed DeTT&CT file and reads its data sources. `dataComponents` gives the ATT&CK data component names of a
 * domain. Throws an Error that explains the problem when the file cannot be used.
 */
export function readDettectFile(data: unknown, dataComponents: (domain: string) => string[]): DettectFile {
  if (!isObject(data)) {
    throw new Error('The file is not a DeTT&CT data source administration file.');
  }
  if (data.file_type !== 'data-source-administration') {
    throw new Error(data.file_type
      ? `The file is a DeTT&CT "${data.file_type}" file; PRISMA needs a data source administration file ("data-source-administration").`
      : 'The file is not a DeTT&CT data source administration file (it has no file_type).');
  }
  if (!SUPPORTED_DOMAINS.includes(data.domain)) {
    throw new Error(`The domain of the file ("${data.domain}") is not supported; use ${SUPPORTED_DOMAINS.join(', ')}.`);
  }
  if (!Array.isArray(data.data_sources)) {
    throw new Error('The file contains no list of data sources (data_sources).');
  }

  const names = data.data_sources.map((dataSource: any) => dataSource?.data_source_name);
  const duplicates = [...new Set(names.filter((name: unknown, index: number) => names.indexOf(name) !== index))];
  if (duplicates.length > 0) {
    throw new Error(`Duplicate data sources found in YAML: ${duplicates.join(', ')}. Please remove the duplicates before loading.`);
  }

  const known = new Set(dataComponents(data.domain));
  const result: DettectFile = { domain: data.domain, dataSources: new Map(), completeness: new Map(), unknownDataSources: [] };
  for (const dataSource of data.data_sources) {
    const name = dataSource?.data_source_name;
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('The file contains a data source without a name (data_source_name).');
    }
    // DeTT&CT can register a data source per group of systems; PRISMA uses the first entry (see decision D6).
    const entry = Array.isArray(dataSource.data_source) ? dataSource.data_source[0] : undefined;
    if (!isObject(entry) || !isObject(entry.data_quality)) {
      throw new Error(`Data source "${name}" has no data quality scores (data_source / data_quality).`);
    }
    const deviceCompleteness = entry.data_quality.device_completeness ?? 0;
    if (typeof deviceCompleteness !== 'number' || !Number.isFinite(deviceCompleteness) || deviceCompleteness < 0 || deviceCompleteness > 5) {
      throw new Error(`Data source "${name}": device_completeness "${deviceCompleteness}" is not valid; it must be a number from 0 to 5.`);
    }
    if (!known.has(name)) {
      result.unknownDataSources.push(name);
      continue;
    }
    result.dataSources.set(name, entry as { data_quality: Record<string, unknown> });
    result.completeness.set(name, deviceCompleteness / 5);
  }
  return result;
}
