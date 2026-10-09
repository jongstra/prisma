// The columns of the L1, L2 and L3 sheets on the MaGMa page, from left to right.

export type SheetLevel = 'L1' | 'L2' | 'L3';

export interface UseCaseColumn {
  field: string; // the use case field shown in the column, or one of the child counts (L1nrChildren, ...)
  title: string;
  width: number; // in pixels
  editable?: boolean; // whether the value can be changed in the sheet
}

export const USE_CASE_COLUMNS: Record<SheetLevel, UseCaseColumn[]> = {
  L1: [
    { field: 'id', title: 'ID', width: 100, editable: true },
    { field: 'name', title: 'Use Case Name', width: 180, editable: true },
    { field: 'description', title: 'Description', width: 300, editable: true },
    { field: 'L1nrChildren', title: 'L2 UC Related', width: 115 },
    { field: 'L1nrGrandChildren', title: 'L3 UC Related', width: 115 },
    { field: 'visibility', title: 'Visibility %', width: 95 },
    { field: 'implementation', title: 'Implementation %', width: 140 },
    { field: 'effectiveness', title: 'Effectiveness %', width: 125 },
    { field: 'weight', title: 'Weight %', width: 85 },
    { field: 'potential', title: 'Potential %', width: 95 },
    { field: 'inImpact', title: 'IN Impact %', width: 100, editable: true },
    { field: 'thrImpact', title: 'THR Impact %', width: 120, editable: true },
    { field: 'outImpact', title: 'OUT Impact %', width: 120, editable: true },
    { field: 'risk', title: 'Risk', width: 55 },
  ],
  L2: [
    { field: 'id', title: 'ID', width: 100, editable: true },
    { field: 'name', title: 'Use Case Name', width: 180, editable: true },
    { field: 'description', title: 'Description', width: 300, editable: true },
    { field: 'parentIds', title: 'Parent Use Case', width: 150, editable: true },
    { field: 'L2nrChildren', title: 'L3 UC Related', width: 115 },
    { field: 'visibility', title: 'Visibility %', width: 95 },
    { field: 'implementation', title: 'Implementation %', width: 140 },
    { field: 'effectiveness', title: 'Effectiveness %', width: 125 },
    { field: 'weight', title: 'Weight %', width: 85 },
    { field: 'potential', title: 'Potential %', width: 95 },
  ],
  L3: [
    { field: 'id', title: 'ID', width: 100, editable: true },
    { field: 'name', title: 'Use Case Name', width: 180, editable: true },
    { field: 'description', title: 'Description', width: 300, editable: true },
    { field: 'parentIds', title: 'Parent Use Case', width: 150, editable: true },
    { field: 'dataSource', title: 'Data Source', width: 140, editable: true },
    { field: 'attackTechniqueId', title: 'ATT&CK Technique', width: 170, editable: true },
    { field: 'visibilityFromAttackTechniqueOverride', title: 'Override', width: 75, editable: true },
    { field: 'visibility', title: 'Visibility %', width: 95, editable: true },
    { field: 'implementation', title: 'Implementation %', width: 140, editable: true },
    { field: 'effectiveness', title: 'Effectiveness %', width: 125, editable: true },
    { field: 'weight', title: 'Weight %', width: 85 },
    { field: 'potential', title: 'Potential %', width: 95 },
  ],
};
