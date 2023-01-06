import type { S2CellType, TooltipShowOptions } from '@tant/s2';

export interface TooltipRenderProps<T = HTMLElement | string>
  extends TooltipShowOptions<T> {
  readonly content?: T;
  readonly cell: S2CellType;
}

export type TooltipInfosProps = {
  infos: string;
};
