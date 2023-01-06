import { getTooltipOperatorSortMenus, S2CellType } from '@tant/s2';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TooltipComponent } from '../../../../src';

describe('Tooltip Component Tests', () => {
  // https://github.com/antvis/S2/issues/1716
  test.each(getTooltipOperatorSortMenus())(
    'should render sort menu and select %o menu',
    ({ key, text }) => {
      const { asFragment, container } = render(
        <TooltipComponent
          options={{
            onlyMenu: true,
            operator: {
              menus: getTooltipOperatorSortMenus(),
              defaultSelectedKeys: [key],
            },
          }}
          cell={null as unknown as S2CellType}
          position={{ x: 0, y: 0 }}
        />,
      );

      expect(asFragment).toMatchSnapshot();

      expect(screen.getByText('组内升序')).toBeDefined();
      expect(screen.getByText('组内降序')).toBeDefined();
      expect(screen.getByText('不排序')).toBeDefined();

      const selectedMenu = [
        ...container.querySelectorAll('.ant-menu-item-selected'),
      ];
      expect(selectedMenu).toHaveLength(1);
      expect(selectedMenu[0]?.textContent).toContain(text);
    },
  );
});
