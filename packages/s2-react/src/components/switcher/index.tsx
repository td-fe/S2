import { Button, Popover, type PopoverProps } from 'antd';
import React, {
  type FC,
  type ReactNode,
  useState,
  isValidElement,
} from 'react';
import { i18n } from '@tant/s2';
import { SwitcherIcon } from '../icons';
import { SwitcherContent, type SwitcherContentProps } from './content';
import { getSwitcherClassName } from './util';
import './index.less';

export interface SwitcherProps
  extends Omit<SwitcherContentProps, 'onToggleVisible'> {
  title?: ReactNode;
  // ref: https://ant.design/components/popover-cn/#API
  popover?: PopoverProps;
  disabled?: boolean;
}

export const Switcher: FC<SwitcherProps> = ({
  title,
  popover,
  disabled,
  ...otherProps
}) => {
  const [visible, setVisible] = useState(false);
  const onToggleVisible = () => {
    setVisible((prev) => !prev);
  };

  return (
    <Popover
      visible={!disabled && visible}
      content={
        <SwitcherContent {...otherProps} onToggleVisible={onToggleVisible} />
      }
      onVisibleChange={onToggleVisible}
      trigger="click"
      placement="bottomLeft"
      destroyTooltipOnHide
      {...popover}
    >
      {isValidElement(title) ? (
        title
      ) : (
        <Button
          className={getSwitcherClassName('entry-button')}
          size="small"
          disabled={disabled}
          icon={<SwitcherIcon />}
        >
          {title || i18n('行列切换')}
        </Button>
      )}
    </Popover>
  );
};
