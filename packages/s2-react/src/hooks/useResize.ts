import React from 'react';
import { type ResizeEffectParams, createResizeObserver } from '@tant/s2-shared';

export const useResize = (params: ResizeEffectParams) => {
  const { s2, adaptive, container, wrapper } = params;

  React.useLayoutEffect(() => {
    return createResizeObserver({ s2, adaptive, wrapper, container });
  }, [s2, wrapper, container, adaptive]);
};
