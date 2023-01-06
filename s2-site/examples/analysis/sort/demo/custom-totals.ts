import { PivotSheet, EXTRA_FIELD, TOTAL_VALUE } from '@tant/s2';

fetch(
  'https://gw.alipayobjects.com/os/bmw-prod/4347c2dd-6554-451b-9d44-15b04e5de657.json',
)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById('container');
    const s2DataConfig = {
      fields: {
        rows: ['province', 'city'],
        columns: ['type'],
        values: ['price'],
      },
      meta: [
        {
          field: 'province',
          name: '省份',
        },
        {
          field: 'city',
          name: '城市',
        },
        {
          field: 'type',
          name: '商品类别',
        },
        {
          field: 'price',
          name: '价格',
        },
      ],
      data,
      sortParams: [
        {
          // province 依据（ province - 小计 ）&（ 总计 - price ）& 升序 排序
          sortFieldId: 'province',
          sortMethod: 'ASC',
          sortByMeasure: TOTAL_VALUE,
          query: {
            [EXTRA_FIELD]: 'price',
          },
        },
        {
          // type 依据 （ type - 小计 ）&（ price ）& 降序 排序
          sortFieldId: 'type',
          sortMethod: 'DESC',
          sortByMeasure: TOTAL_VALUE,
          query: {
            province: '浙江',
            [EXTRA_FIELD]: 'price',
          },
        },
      ],
    };

    const s2Options = {
      width: 600,
      height: 480,
      totals: {
        row: {
          showGrandTotals: true,
          showSubTotals: true,
          reverseLayout: true,
          reverseSubLayout: true,
          subTotalsDimensions: ['province'],
        },
        col: {
          showGrandTotals: true,
          showSubTotals: true,
          reverseLayout: true,
          reverseSubLayout: true,
          subTotalsDimensions: ['type'],
        },
      },
    };
    const s2 = new PivotSheet(container, s2DataConfig, s2Options);

    s2.render();
  });
