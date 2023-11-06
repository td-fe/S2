import { PivotSheet, DataCell } from '@tant/s2';
import { isObject } from 'lodash';

/**
 * 自定义 DataCell，给数值单元格添加背景图
 * 查看更多方法 https://github.com/antvis/S2/blob/master/packages/s2-core/src/cell/data-cell.ts
 */
class CustomDataCell extends DataCell {
  // 重写绘制背景方法, 添加一个背景图片
  drawBackgroundShape() {
    this.backgroundShape = this.addShape('image', {
      attrs: {
        ...this.getCellArea(),
        img: 'https://gw.alipayobjects.com/zos/antfincdn/og1XQOMyyj/1e3a8de1-3b42-405d-9f82-f92cb1c10413.png',
      },
    });
  }
}

fetch(
  'https://gw.alipayobjects.com/os/bmw-prod/cd9814d0-6dfa-42a6-8455-5a6bd0ff93ca.json',
)
  .then((res) => res.json())
  .then((res) => {
    const container = document.getElementById('container')!;
    const s2DataConfig = {
      fields: {
        rows: ['province', 'city'],
        columns: ['type', 'sub_type'],
        values: ['number'],
      },
      meta: res.meta,
      data: res.data,
    };

    const s2Options = {
      width: 600,
      height: 480,
      interaction: {
        hoverHighlight: false, // 关闭 hover 十字高亮, 为了视觉效果，可不设置
      },
      dataCell: (viewMeta) => {
        return new CustomDataCell(viewMeta, viewMeta?.spreadsheet);
      },
    };
    const s2 = new PivotSheet(container, s2DataConfig, s2Options);

    s2.render();
  });
