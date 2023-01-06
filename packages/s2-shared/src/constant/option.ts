import type { S2Options } from '@tant/s2';

export const SHEET_COMPONENT_DEFAULT_OPTIONS: S2Options = {
  tooltip: {
    showTooltip: true,
    autoAdjustBoundary: 'body',
    operation: {
      hiddenColumns: true,
      trend: false,
      sort: true,
    },
  },
  showDefaultHeaderActionIcon: true,
} as const;
