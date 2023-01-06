import type { S2CellType, ViewMeta } from '@tant/s2';
import { CustomCell } from './custom-cell';

export const GridAnalysisDataCell = (viewMeta: ViewMeta): S2CellType =>
  new CustomCell(viewMeta, viewMeta.spreadsheet);
