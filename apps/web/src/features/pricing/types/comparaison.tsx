/**
 * Comparison row interface
 */
export interface ComparisonRow {
  feature: string;
  free: string | boolean;
  trader: string | boolean;
  expert: string | boolean;
}

/**
 * ComparisonTable props
 */
export interface ComparisonTableProps {
  data: ComparisonRow[];
}
