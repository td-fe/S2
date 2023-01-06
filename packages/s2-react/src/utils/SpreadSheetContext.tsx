import React from 'react';
import type { SpreadSheet } from '@tant/s2';

export const SpreadSheetContext = React.createContext<SpreadSheet>(null as any);

export function useSpreadSheetRef() {
  return React.useContext(SpreadSheetContext);
}
