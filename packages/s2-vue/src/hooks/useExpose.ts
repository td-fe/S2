import { shallowRef } from 'vue';
import type { SpreadSheet } from '@tant/s2';

export interface SheetExpose {
  instance: SpreadSheet | undefined;
}

export const useExpose = (expose: (exposed?: Record<string, any>) => void) => {
  const s2Ref = shallowRef<SheetExpose>();

  expose({
    get instance() {
      return s2Ref.value?.instance;
    },
  });

  return s2Ref;
};
