// The MaGMa file format: a YAML list of use cases, saved with "Save MaGMa YAML" on the MaGMa page, or made from the MaGMa
// Excel template with tools/convert_magma_excel.ipynb.
import * as yaml from 'yaml';
import type { ImportResult, UseCase } from '@/stores/magma';

// The ATT&CK domains that use cases can belong to, in the usual order.
export const SUPPORTED_DOMAINS = ['enterprise-attack', 'mobile-attack', 'ics-attack'];

// A number for the file; values that are not a valid number are left out instead of being saved as NaN.
export const exportNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

// Check the YAML read from a MaGMa file: a list of use cases, for at least one supported domain. Throws an error with an
// explanation otherwise, so the file can be refused before anything changes.
export function readMagmaFile(data: unknown): any[] {
  if (!Array.isArray(data) || !data.every((useCase) => useCase && typeof useCase === 'object' && !Array.isArray(useCase))) {
    throw new Error('The file does not contain a list of MaGMa use cases.');
  }
  if (!data.some((useCase) => !useCase.permanent && SUPPORTED_DOMAINS.includes(useCase.domain))) {
    throw new Error(`The file contains no use cases for a supported domain (${SUPPORTED_DOMAINS.join(', ')}).`);
  }
  return data;
}

// The supported domains that a file has use cases for, in the usual order. The permanent IN and THR use cases do not
// count: every file saved by PRISMA contains them for all domains.
export function magmaFileDomains(useCases: any[]): string[] {
  const domains = new Set(useCases.filter((useCase) => !useCase.permanent).map((useCase) => useCase.domain));
  return SUPPORTED_DOMAINS.filter((domain) => domains.has(domain));
}

// The use cases as a MaGMa file.
export function writeMagmaFile(useCases: UseCase[]): string {
  const exportedUseCases = useCases.map(useCase => {
    const baseAttributes = {
      domain: useCase.domain,
      level: useCase.level,
      id: useCase.id,
      name: useCase.name,
      description: useCase.description,
      parentIds: useCase.parentIds,
      permanent: useCase.permanent,
      visibility: exportNumber(useCase.visibility),
      implementation: exportNumber(useCase.implementation),
      effectiveness: exportNumber(useCase.effectiveness),
      weight: exportNumber(useCase.weight),
      impact: exportNumber(useCase.weight),
    };
    
    // For the non-permanent level 1 use cases with inImpact/thrImpact/outImpact, add these attributes.
    if (useCase.level === 1 && !useCase.permanent) {
      return {
        ...baseAttributes,
        inImpact: exportNumber(useCase.inImpact),
        thrImpact: exportNumber(useCase.thrImpact),
        outImpact: exportNumber(useCase.outImpact),
      };
    }

    // Add the attackTechniqueId visibilityFromAttackTechniqueOverride attributes for all Level 3 use cases.
    if (useCase.level === 3) {
      return {
        ...baseAttributes,
        dataSource: useCase.dataSource,
        attackTechniqueId: useCase.attackTechniqueId,
        visibilityFromAttackTechniqueOverride: useCase.visibilityFromAttackTechniqueOverride,
      };
    }

    // All other use cases 
    return baseAttributes;

  });

  return yaml.stringify(exportedUseCases);
}

// The message after loading a MaGMa file: how many use cases were loaded, which ones failed and why, and the warnings.
export function importSummary(result: ImportResult) {
  let text = `Successful imports: ${result.imported}. Failed imports: ${result.failed.length}.`;
  if (result.failed.length > 0) {
    text += " _________________________________________________ FAILED USE CASES _________________________________________________ " + result.failed.join("• ");
  }
  if (result.warnings.length > 0) {
    text += " _________________________________________________ WARNINGS _________________________________________________ " + result.warnings.join("• ");
  }
  return { text, problems: result.failed.length > 0 || result.warnings.length > 0 };
}
