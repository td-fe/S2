/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import {
  customMerge,
  type DataType,
  generatePalette,
  getPalette,
  type HeaderActionIconProps,
  Node,
  type S2DataConfig,
  SpreadSheet,
  type TargetCellInfo,
  type ThemeCfg,
  type TooltipAutoAdjustBoundary,
  getLang,
  type InteractionOptions,
  DEFAULT_STYLE,
  type InteractionCellSelectedHighlightType,
} from '@tant/s2';
import type { Adaptive, SheetType } from '@tant/s2-shared';
import corePkg from '@tant/s2/package.json';
import { useUpdateEffect } from 'ahooks';
import {
  Button,
  Collapse,
  DatePicker,
  Input,
  Popover,
  Radio,
  type RadioChangeEvent,
  Select,
  Slider,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import 'antd/dist/antd.min.css';
import { debounce, forEach, isBoolean, random } from 'lodash';
import React from 'react';
import { ChromePicker } from 'react-color';
import ReactDOM from 'react-dom';
import reactPkg from '../package.json';
import type {
  PartDrillDown,
  PartDrillDownInfo,
  SheetComponentOptions,
} from '../src';
import { SheetComponent } from '../src';
import { customTreeFields } from '../__tests__/data/custom-tree-fields';
import { dataCustomTrees } from '../__tests__/data/data-custom-trees';
import { mockGridAnalysisDataCfg } from '../__tests__/data/grid-analysis-data';
import {
  StrategySheetDataConfig,
  StrategyOptions,
} from '../__tests__/data/strategy-data';
import {
  defaultOptions,
  mockGridAnalysisOptions,
  pivotSheetDataCfg,
  s2Options,
  sliderOptions,
  tableSheetDataCfg,
  tableSheetMultipleColumns,
  tableSheetSingleColumns,
} from './config';
import './index.less';
import { ResizeConfig } from './resize';

const { TabPane } = Tabs;

const fieldMap = {
  channel: ['物美', '华联'],
  sex: ['男', '女'],
};

const partDrillDown: PartDrillDown = {
  drillConfig: {
    dataSet: [
      {
        name: '销售渠道',
        value: 'channel',
        type: 'text',
      },
      {
        name: '客户性别',
        value: 'sex',
        type: 'text',
      },
    ],
    extra: <div>test</div>,
  },
  // drillItemsNum: 1,
  fetchData: (meta, drillFields) =>
    new Promise<PartDrillDownInfo>((resolve) => {
      // 弹窗 -> 选择 -> 请求数据
      const preDrillDownfield =
        meta.spreadsheet.store.get('drillDownNode')?.field;
      const dataSet = meta.spreadsheet.dataSet;
      const field = drillFields[0];
      const rowDatas = dataSet
        .getMultiData(meta.query, true, true, [preDrillDownfield])
        .filter(
          (item) => item.sub_type && item.type && item[preDrillDownfield],
        );
      console.log(rowDatas);
      const drillDownData: DataType[] = [];
      forEach(rowDatas, (data: DataType) => {
        const { number, sub_type: subType, type } = data;
        const number0 = random(50, number);
        const number1 = number - number0;
        const dataItem0 = {
          ...meta.query,
          number: number0,
          sub_type: subType,
          type,
          [field]: fieldMap[field][0],
        };
        drillDownData.push(dataItem0);
        const dataItem1 = {
          ...meta.query,
          number: number1,
          sub_type: subType,
          type,
          [field]: fieldMap[field][1],
        };

        drillDownData.push(dataItem1);
      });
      console.log(drillDownData);
      resolve({
        drillField: field,
        drillData: drillDownData,
      });
    }),
};

const onSheetMounted = (s2: SpreadSheet) => {
  console.log('onSheetMounted: ', s2);
  // @ts-ignore
  window.s2 = s2;
  // @ts-ignore
  window.g_instances = [s2.container];
};

const CustomTooltip = () => (
  <div>
    自定义 Tooltip <div>1</div>
    <div style={{ width: 1000, height: 2000 }}>我很宽很长</div>
    <DatePicker.RangePicker getPopupContainer={(node) => node.parentElement} />
  </div>
);

const CustomColTooltip = () => <div>custom colTooltip</div>;

const ActionIconTooltip = ({ name }) => <div>{name} Tooltip</div>;

function MainLayout() {
  //  ================== State ========================
  const [render, setRender] = React.useState(true);
  const [sheetType, setSheetType] = React.useState<SheetType>('pivot');
  const [showPagination, setShowPagination] = React.useState(false);
  const [showTotals, setShowTotals] = React.useState(false);
  const [themeCfg, setThemeCfg] = React.useState<ThemeCfg>({
    name: 'default',
  });
  const [themeColor, setThemeColor] = React.useState<string>('#FFF');
  const [showCustomTooltip, setShowCustomTooltip] = React.useState(false);
  const [adaptive, setAdaptive] = React.useState<Adaptive>(false);
  const [options, setOptions] =
    React.useState<SheetComponentOptions>(defaultOptions);
  const [dataCfg, setDataCfg] = React.useState<S2DataConfig>(pivotSheetDataCfg);
  const [strategyDataCfg, setStrategyDataCfg] = React.useState<S2DataConfig>(
    StrategySheetDataConfig,
  );
  const [columnOptions, setColumnOptions] = React.useState([]);
  const [tableSheetColumnType, setTableSheetColumnType] = React.useState<
    'single' | 'multiple'
  >('single');

  //  ================== Refs ========================
  const s2Ref = React.useRef<SpreadSheet>();
  const scrollTimer = React.useRef<NodeJS.Timer>();

  //  ================== Callback ========================
  const updateOptions = (newOptions: Partial<SheetComponentOptions>) => {
    setOptions(customMerge(options, newOptions));
  };

  const updateDataCfg = (newDataCfg: Partial<S2DataConfig>) => {
    const currentDataCfg =
      sheetType === 'pivot' ? pivotSheetDataCfg : tableSheetDataCfg;

    setDataCfg(customMerge(currentDataCfg, newDataCfg));
  };

  const onAutoAdjustBoundaryChange = (value: TooltipAutoAdjustBoundary) => {
    updateOptions({
      tooltip: {
        autoAdjustBoundary: value || null,
      },
    });
  };

  const onOverscrollBehaviorChange = (
    overscrollBehavior: InteractionOptions['overscrollBehavior'],
  ) => {
    updateOptions({
      interaction: {
        overscrollBehavior,
      },
    });
  };

  const onLayoutWidthTypeChange = (e: RadioChangeEvent) => {
    updateOptions({
      style: {
        layoutWidthType: e.target.value,
      },
    });
  };

  const onTableColumnTypeChange = (e: RadioChangeEvent) => {
    setTableSheetColumnType(e.target.value);
  };

  const onSizeChange = (type: 'width' | 'height') =>
    debounce((e) => {
      updateOptions({
        [type]: Number(e.target.value),
      });
    }, 300);

  const onScrollSpeedRatioChange =
    (type: 'horizontal' | 'vertical') => (value: number) => {
      updateOptions({
        interaction: {
          scrollSpeedRatio: {
            [type]: value,
          },
        },
      });
    };

  const onToggleRender = () => {
    setRender(!render);
  };

  const onThemeChange = (e: RadioChangeEvent) => {
    setThemeCfg({
      name: e.target.value,
    });
  };

  const onSheetTypeChange = (e: RadioChangeEvent) => {
    setSheetType(e.target.value);
  };

  const logHandler =
    (name: string, callback?: () => void) =>
    (...args: unknown[]) => {
      if (s2Ref.current?.options?.debug) {
        console.log(name, ...args);
      }
      callback?.();
    };

  const onColCellClick = (cellInfo: TargetCellInfo) => {
    logHandler('onColCellClick')(cellInfo);
    if (!options.showDefaultHeaderActionIcon) {
      const { event } = cellInfo;
      s2Ref.current.showTooltip({
        position: { x: event.clientX, y: event.clientY },
        content: <CustomColTooltip />,
      });
    }
  };

  const getColumnOptions = (type: SheetType) => {
    if (type === 'table') {
      return dataCfg.fields.columns;
    }
    return s2Ref.current?.getInitColumnLeafNodes().map(({ id }) => id) || [];
  };

  //  ================== Hooks ========================

  useUpdateEffect(() => {
    switch (sheetType) {
      case 'table':
        setDataCfg(tableSheetDataCfg);
        updateOptions(defaultOptions);
        break;
      default:
        setDataCfg(pivotSheetDataCfg);
        updateOptions(defaultOptions);
        break;
    }
    setColumnOptions(getColumnOptions(sheetType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetType]);

  useUpdateEffect(() => {
    setDataCfg(
      customMerge(tableSheetDataCfg, {
        fields: {
          columns:
            tableSheetColumnType === 'single'
              ? tableSheetSingleColumns
              : tableSheetMultipleColumns,
        },
      }),
    );
  }, [tableSheetColumnType]);

  //  ================== Config ========================

  const mergedOptions: SheetComponentOptions = customMerge(
    {},
    {
      pagination: showPagination && {
        pageSize: 10,
        current: 1,
      },
      tooltip: {
        content: showCustomTooltip ? <CustomTooltip /> : null,
      },
      totals: showTotals && {
        row: {
          showGrandTotals: true,
          showSubTotals: true,
          subTotalsDimensions: ['province'],
        },
        col: {
          showGrandTotals: true,
          showSubTotals: true,
          subTotalsDimensions: ['type'],
        },
      },
      customSVGIcons: !options.showDefaultHeaderActionIcon && [
        {
          name: 'Filter',
          svg: 'https://gw.alipayobjects.com/zos/antfincdn/gu1Fsz3fw0/filter%26sort_filter.svg',
        },
        {
          name: 'FilterAsc',
          svg: 'https://gw.alipayobjects.com/zos/antfincdn/UxDm6TCYP3/filter%26sort_asc%2Bfilter.svg',
        },
      ],
      headerActionIcons: !options.showDefaultHeaderActionIcon && [
        {
          iconNames: ['Filter'],
          belongsCell: 'colCell',
          displayCondition: (node: Node) =>
            node.id !== 'root[&]家具[&]桌子[&]number',
          action: ({ event }: HeaderActionIconProps) => {
            s2Ref.current?.showTooltip({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="Filter colCell" />,
            });
          },
        },
        {
          iconNames: ['SortDown'],
          belongsCell: 'colCell',
          displayCondition: (node: Node) =>
            node.id === 'root[&]家具[&]桌子[&]number',
          action: ({ event }: HeaderActionIconProps) => {
            s2Ref.current?.showTooltip({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="SortDown colCell" />,
            });
          },
        },
        {
          iconNames: ['FilterAsc'],
          belongsCell: 'cornerCell',
          action: ({ event }: HeaderActionIconProps) => {
            s2Ref.current?.showTooltip({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="FilterAsc cornerCell" />,
            });
          },
        },
        {
          iconNames: ['SortDown', 'Filter'],
          belongsCell: 'rowCell',
          action: ({ event }: HeaderActionIconProps) => {
            s2Ref.current?.showTooltip({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="SortDown & Filter rowCell" />,
            });
          },
        },
      ],
    },
    options,
  );

  return (
    <div className="playground">
      <Tabs
        defaultActiveKey={localStorage.getItem('debugTabKey') || 'basic'}
        type="card"
        destroyInactiveTabPane
      >
        <TabPane tab="基础表" key="basic">
          <Collapse defaultActiveKey={['filter', 'interaction']}>
            <Collapse.Panel header="筛选器" key="filter">
              <Space>
                <Tooltip title="表格类型">
                  <Radio.Group
                    onChange={onSheetTypeChange}
                    defaultValue={sheetType}
                  >
                    <Radio.Button value="pivot">透视表</Radio.Button>
                    <Radio.Button value="table">明细表</Radio.Button>
                  </Radio.Group>
                </Tooltip>
                {sheetType === 'table' && (
                  <Tooltip title="明细表多级表头">
                    <Radio.Group
                      onChange={onTableColumnTypeChange}
                      defaultValue={tableSheetColumnType}
                    >
                      <Radio.Button value="single">单列头</Radio.Button>
                      <Radio.Button value="multiple">多列头</Radio.Button>
                    </Radio.Group>
                  </Tooltip>
                )}
                <Tooltip title="布局类型">
                  <Radio.Group
                    onChange={onLayoutWidthTypeChange}
                    defaultValue="adaptive"
                  >
                    <Radio.Button value="adaptive">行列等宽</Radio.Button>
                    <Radio.Button value="colAdaptive">列等宽</Radio.Button>
                    <Radio.Button value="compact">紧凑</Radio.Button>
                  </Radio.Group>
                </Tooltip>
                <Tooltip title="主题">
                  <Radio.Group onChange={onThemeChange} defaultValue="default">
                    <Radio.Button value="default">默认</Radio.Button>
                    <Radio.Button value="gray">简约灰</Radio.Button>
                    <Radio.Button value="colorful">多彩蓝</Radio.Button>
                  </Radio.Group>
                </Tooltip>
              </Space>
              <Space>
                <Popover
                  placement="bottomRight"
                  content={
                    <>
                      <ChromePicker
                        color={themeColor}
                        onChangeComplete={(color) => {
                          setThemeColor(color.hex);
                          const palette = getPalette(themeCfg.name);
                          const newPalette = generatePalette({
                            ...palette,
                            brandColor: color.hex,
                          });
                          setThemeCfg({
                            name: themeCfg.name,
                            palette: newPalette,
                          });
                        }}
                      />
                    </>
                  }
                >
                  <Button size="small" style={{ marginLeft: 20 }}>
                    主题色调整
                  </Button>
                </Popover>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    s2Ref.current?.destroy();
                    s2Ref.current?.render();
                  }}
                >
                  卸载组件 (s2.destroy)
                </Button>
              </Space>
              <Space style={{ margin: '20px 0', display: 'flex' }}>
                <Tooltip title="tooltip 自动调整: 显示的tooltip超过指定区域时自动调整, 使其不遮挡">
                  <Select
                    defaultValue={mergedOptions.tooltip.autoAdjustBoundary}
                    onChange={onAutoAdjustBoundaryChange}
                    style={{ width: 230 }}
                    size="small"
                  >
                    <Select.Option value="container">
                      container (表格区域)
                    </Select.Option>
                    <Select.Option value="body">
                      body (浏览器可视区域)
                    </Select.Option>
                    <Select.Option value="">关闭</Select.Option>
                  </Select>
                </Tooltip>
                <Input
                  style={{ width: 150 }}
                  onChange={onSizeChange('width')}
                  defaultValue={mergedOptions.width}
                  suffix="px"
                  prefix="宽度"
                  size="small"
                />
                <Input
                  style={{ width: 150 }}
                  onChange={onSizeChange('height')}
                  defaultValue={mergedOptions.height}
                  suffix="px"
                  prefix="高度"
                  size="small"
                />
                <Button
                  size="small"
                  onClick={() => {
                    s2Ref.current?.changeSheetSize(400, 400);
                    s2Ref.current?.render(false);
                  }}
                >
                  改变表格大小 (s2.changeSheetSize)
                </Button>
                <Popover
                  placement="bottomRight"
                  content={
                    <>
                      <div style={{ width: '600px' }}>
                        水平滚动速率 ：
                        <Slider
                          {...sliderOptions}
                          defaultValue={
                            mergedOptions.interaction.scrollSpeedRatio
                              .horizontal
                          }
                          onChange={onScrollSpeedRatioChange('horizontal')}
                        />
                        垂直滚动速率 ：
                        <Slider
                          {...sliderOptions}
                          defaultValue={
                            mergedOptions.interaction.scrollSpeedRatio.vertical
                          }
                          onChange={onScrollSpeedRatioChange('vertical')}
                        />
                      </div>
                    </>
                  }
                >
                  <Button size="small">滚动速率调整</Button>
                </Popover>
                <Tooltip title="滚动链控制(overscrollBehavior): https://developer.mozilla.org/zh-CN/docs/Web/CSS/overscroll-behavior">
                  <Select
                    defaultValue={mergedOptions.interaction.overscrollBehavior}
                    onChange={onOverscrollBehaviorChange}
                    style={{ width: 150 }}
                    size="small"
                  >
                    <Select.Option value="auto">auto</Select.Option>
                    <Select.Option value="contain">contain</Select.Option>
                    <Select.Option value="none">none</Select.Option>
                  </Select>
                </Tooltip>
                <Button
                  size="small"
                  onClick={() => {
                    const rowNode = s2Ref.current
                      ?.getColumnNodes()
                      .find(({ id }) => id === 'root[&]办公用品[&]纸张');

                    console.log(rowNode);
                    clearInterval(scrollTimer.current);
                    s2Ref.current.updateScrollOffset({
                      offsetX: {
                        value: rowNode?.x,
                        animate: true,
                      },
                    });
                  }}
                >
                  滚动至 [成都市]
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    clearInterval(scrollTimer.current);
                    s2Ref.current.updateScrollOffset({
                      offsetY: {
                        value: 0,
                        animate: true,
                      },
                    });
                  }}
                >
                  滚动到顶部
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    if (
                      scrollTimer.current ||
                      !s2Ref.current.facet.vScrollBar
                    ) {
                      clearInterval(scrollTimer.current);
                      return;
                    }
                    scrollTimer.current = setInterval(() => {
                      const { scrollY } = s2Ref.current.facet.getScrollOffset();
                      if (s2Ref.current.facet.isScrollToBottom(scrollY)) {
                        console.log('滚动到底部');
                        s2Ref.current.updateScrollOffset({
                          offsetY: {
                            value: 0,
                            animate: false,
                          },
                        });
                        return;
                      }
                      s2Ref.current.updateScrollOffset({
                        offsetY: {
                          value: scrollY + 50,
                          animate: true,
                        },
                      });
                    }, 500);
                  }}
                >
                  {scrollTimer.current ? '停止滚动' : '循环滚动'}
                </Button>
              </Space>
              <Space
                style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap' }}
              >
                <Switch
                  checkedChildren="渲染组件"
                  unCheckedChildren="卸载组件"
                  defaultChecked={render}
                  onChange={onToggleRender}
                />
                <Switch
                  checkedChildren="调试模式开"
                  unCheckedChildren="调试模式关"
                  defaultChecked={mergedOptions.debug}
                  onChange={(checked) => {
                    updateOptions({ debug: checked });
                  }}
                />
                <Switch
                  checkedChildren="树形"
                  unCheckedChildren="平铺"
                  checked={mergedOptions.hierarchyType === 'tree'}
                  onChange={(checked) => {
                    updateOptions({
                      hierarchyType: checked ? 'tree' : 'grid',
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Tooltip title="树状模式生效">
                  <Switch
                    checkedChildren="收起子节点"
                    unCheckedChildren="展开子节点"
                    disabled={mergedOptions.hierarchyType !== 'tree'}
                    checked={mergedOptions.style.hierarchyCollapse}
                    onChange={(checked) => {
                      updateOptions({
                        style: {
                          hierarchyCollapse: checked,
                        },
                      });
                    }}
                  />
                </Tooltip>
                <Switch
                  checkedChildren="数值挂列头"
                  unCheckedChildren="数值挂行头"
                  defaultChecked={dataCfg.fields?.valueInCols}
                  onChange={(checked) => {
                    updateDataCfg({
                      fields: {
                        valueInCols: checked,
                      },
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="隐藏数值"
                  unCheckedChildren="显示数值"
                  defaultChecked={mergedOptions.style.colCfg?.hideMeasureColumn}
                  onChange={(checked) => {
                    updateOptions({
                      style: {
                        colCfg: {
                          hideMeasureColumn: checked,
                        },
                      },
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="显示行小计/总计"
                  unCheckedChildren="隐藏行小计/总计"
                  defaultChecked={
                    mergedOptions.totals?.row?.showSubTotals as boolean
                  }
                  onChange={(checked) => {
                    updateOptions({
                      totals: {
                        row: {
                          showGrandTotals: checked,
                          showSubTotals: checked,
                          reverseLayout: true,
                          reverseSubLayout: true,
                          subTotalsDimensions: ['province'],
                        },
                      },
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="显示列小计/总计"
                  unCheckedChildren="隐藏列小计/总计"
                  defaultChecked={
                    mergedOptions.totals?.col?.showSubTotals as boolean
                  }
                  onChange={(checked) => {
                    updateOptions({
                      totals: {
                        col: {
                          showGrandTotals: checked,
                          showSubTotals: checked,
                          reverseLayout: true,
                          reverseSubLayout: true,
                          subTotalsDimensions: ['type'],
                        },
                      },
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="冻结行头开"
                  unCheckedChildren="冻结行头关"
                  defaultChecked={mergedOptions.frozenRowHeader}
                  onChange={(checked) => {
                    updateOptions({
                      frozenRowHeader: checked,
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="容器宽高自适应开"
                  unCheckedChildren="容器宽高自适应关"
                  defaultChecked={Boolean(adaptive)}
                  onChange={setAdaptive}
                />
                <Switch
                  checkedChildren="显示序号"
                  unCheckedChildren="不显示序号"
                  checked={mergedOptions.showSeriesNumber}
                  onChange={(checked) => {
                    updateOptions({
                      showSeriesNumber: checked,
                    });
                  }}
                />
                <Switch
                  checkedChildren="分页"
                  unCheckedChildren="不分页"
                  checked={showPagination}
                  onChange={setShowPagination}
                />
                <Switch
                  checkedChildren="汇总"
                  unCheckedChildren="无汇总"
                  checked={showTotals}
                  onChange={setShowTotals}
                />
                <Switch
                  checkedChildren="默认actionIcons"
                  unCheckedChildren="自定义actionIcons"
                  checked={mergedOptions.showDefaultHeaderActionIcon}
                  onChange={(checked) => {
                    updateOptions({
                      showDefaultHeaderActionIcon: checked,
                    });
                  }}
                />
                <Switch
                  checkedChildren="开启Tooltip"
                  unCheckedChildren="关闭Tooltip"
                  checked={mergedOptions.tooltip.showTooltip}
                  onChange={(checked) => {
                    updateOptions({
                      tooltip: {
                        showTooltip: checked,
                      },
                    });
                  }}
                />
                <Switch
                  checkedChildren="自定义Tooltip"
                  unCheckedChildren="默认Tooltip"
                  checked={showCustomTooltip}
                  onChange={setShowCustomTooltip}
                />
                <Switch
                  checkedChildren="打开链接跳转"
                  unCheckedChildren="无链接跳转"
                  checked={!!mergedOptions.interaction.linkFields.length}
                  onChange={(checked) => {
                    updateOptions({
                      interaction: {
                        linkFields: checked ? ['province', 'city'] : [],
                      },
                    });
                  }}
                />
                <Switch
                  checkedChildren="隐藏列头"
                  unCheckedChildren="显示列头"
                  checked={mergedOptions.style?.colCfg?.height === 0}
                  onChange={(checked) => {
                    updateOptions({
                      style: {
                        colCfg: {
                          height: checked
                            ? 0
                            : s2Options.style.colCfg.height ??
                              DEFAULT_STYLE.colCfg.height,
                        },
                      },
                    });
                  }}
                />
              </Space>
            </Collapse.Panel>
            <Collapse.Panel header="交互配置" key="interaction">
              <Space>
                <Tooltip title="高亮选中单元格">
                  <Switch
                    checkedChildren="选中聚光灯开"
                    unCheckedChildren="选中聚光灯关"
                    checked={mergedOptions.interaction.selectedCellsSpotlight}
                    onChange={(checked) => {
                      updateOptions({
                        interaction: {
                          selectedCellsSpotlight: checked,
                        },
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title="高亮选中单元格行为，演示这里旧配置优先级最高">
                  <Select
                    style={{ width: 260 }}
                    placeholder="单元格选中高亮"
                    allowClear
                    mode="multiple"
                    onChange={(type) => {
                      let selectedCellHighlight:
                        | boolean
                        | InteractionCellSelectedHighlightType = false;
                      const oldIdx = type.findIndex((typeItem) =>
                        isBoolean(typeItem),
                      );

                      if (oldIdx > -1) {
                        selectedCellHighlight = type[oldIdx];
                      } else {
                        selectedCellHighlight = {
                          rowHeader: false,
                          colHeader: false,
                          rowCells: false,
                          colCells: false,
                        };
                        type.forEach((i) => {
                          selectedCellHighlight[i] = true;
                        });
                      }

                      updateOptions({
                        interaction: {
                          selectedCellHighlight,
                        },
                      });
                    }}
                  >
                    <Select.Option value={true}>
                      （旧）高亮选中单元格所在行列头
                    </Select.Option>
                    <Select.Option value="rowHeader">
                      rowHeader: 高亮所在行头
                    </Select.Option>
                    <Select.Option value="colHeader">
                      colHeader: 高亮所在列头
                    </Select.Option>
                    <Select.Option value="rowCells">
                      rowCells: 高亮所在行
                    </Select.Option>
                    <Select.Option value="colCells">
                      colCells: 高亮所在列
                    </Select.Option>
                  </Select>
                </Tooltip>
                <Tooltip title="高亮当前行列单元格">
                  <Switch
                    checkedChildren="hover十字器开"
                    unCheckedChildren="hover十字器关"
                    checked={mergedOptions.interaction.hoverHighlight}
                    onChange={(checked) => {
                      updateOptions({
                        interaction: {
                          hoverHighlight: checked,
                        },
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title="在数值单元格悬停800ms,显示tooltip">
                  <Switch
                    checkedChildren="hover聚焦开"
                    unCheckedChildren="hover聚焦关"
                    checked={mergedOptions.interaction.hoverFocus as boolean}
                    onChange={(checked) => {
                      updateOptions({
                        interaction: {
                          hoverFocus: checked,
                        },
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title="开启后,点击空白处,按下ESC键, 取消高亮, 清空选中单元格, 等交互样式">
                  <Switch
                    checkedChildren="自动重置交互样式开"
                    unCheckedChildren="自动重置交互样式关"
                    defaultChecked={
                      mergedOptions?.interaction?.autoResetSheetStyle
                    }
                    onChange={(checked) => {
                      updateOptions({
                        interaction: {
                          autoResetSheetStyle: checked,
                        },
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={<p>透视表树状模式默认行头展开层级配置</p>}>
                  <Select
                    style={{ width: 180 }}
                    defaultValue={mergedOptions.style.rowExpandDepth}
                    placeholder="默认行头展开层级"
                    onChange={(level) => {
                      updateOptions({
                        style: {
                          rowExpandDepth: level,
                        },
                      });
                    }}
                  >
                    <Select.Option value={0}>第一级</Select.Option>
                    <Select.Option value={1}>第二级</Select.Option>
                    <Select.Option value={2}>第三级</Select.Option>
                  </Select>
                </Tooltip>
                <Tooltip
                  title={
                    <>
                      <p>默认隐藏列 </p>
                      <p>明细表: 列头指定 field: number</p>
                      <p>透视表: 列头指定id: root[&]家具[&]沙发[&]number</p>
                    </>
                  }
                >
                  <Select
                    style={{ width: 300 }}
                    defaultValue={mergedOptions.interaction.hiddenColumnFields}
                    mode="multiple"
                    placeholder="默认隐藏列"
                    onChange={(fields) => {
                      updateOptions({
                        interaction: {
                          hiddenColumnFields: fields,
                        },
                      });
                    }}
                  >
                    {columnOptions.map((column) => {
                      return (
                        <Select.Option value={column} key={column}>
                          {column}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Tooltip>
              </Space>
            </Collapse.Panel>
            <Collapse.Panel header="宽高调整热区配置" key="resize">
              <ResizeConfig setOptions={setOptions} setThemeCfg={setThemeCfg} />
            </Collapse.Panel>
          </Collapse>
          {render && (
            <SheetComponent
              dataCfg={{
                data: [
                  {
                    '0': '#active_time',
                    '1': '2019-08-15 00:00:00.000',
                    '2': '2019-08-15 00:00:00.000',
                    '3': '2019-08-17 00:00:00.000',
                    '4': '2019-08-15 00:00:00.000',
                    '5': '2019-08-16 00:00:00.000',
                    '6': '2019-08-16 00:00:00.000',
                    '7': '2019-08-16 00:00:00.000',
                    '8': '2019-08-20 00:00:00.000',
                    '9': '2019-08-19 00:00:00.000',
                    '10': '2019-08-17 00:00:00.000',
                    '11': '2019-08-18 00:00:00.000',
                    '12': '2019-08-18 00:00:00.000',
                    '13': '2019-08-17 00:00:00.000',
                    '14': '2019-08-20 00:00:00.000',
                    '15': '2019-08-20 00:00:00.000',
                    '16': '2019-08-21 00:00:00.000',
                    '17': '2019-08-21 00:00:00.000',
                    '18': '2019-08-22 00:00:00.000',
                    '19': '2019-08-22 00:00:00.000',
                    '20': '2019-08-23 00:00:00.000',
                    '21': '2019-08-23 00:00:00.000',
                    '22': '2019-08-25 00:00:00.000',
                    '23': '2019-08-24 00:00:00.000',
                    '24': '2019-08-23 00:00:00.000',
                    '25': '2019-08-24 00:00:00.000',
                    '26': '2019-08-27 00:00:00.000',
                    '27': '2019-08-26 00:00:00.000',
                    '28': '2019-08-29 00:00:00.000',
                    '29': '2019-08-26 00:00:00.000',
                    '30': '2019-08-25 00:00:00.000',
                    '31': '2019-08-28 00:00:00.000',
                    '32': '2019-08-27 00:00:00.000',
                    '33': '2019-08-31 00:00:00.000',
                    '34': '2019-08-30 00:00:00.000',
                    '35': '2019-08-28 00:00:00.000',
                    '36': '2019-08-31 00:00:00.000',
                    '37': '2019-09-02 00:00:00.000',
                    '38': '2019-09-01 00:00:00.000',
                    '39': '2019-08-30 00:00:00.000',
                    '40': '2019-08-30 00:00:00.000',
                    '41': '2019-08-31 00:00:00.000',
                    '42': '2019-09-01 00:00:00.000',
                    '43': '2019-09-04 00:00:00.000',
                    '44': '2019-09-06 00:00:00.000',
                    '45': '2019-09-02 00:00:00.000',
                    '46': '2019-09-08 00:00:00.000',
                    '47': '2019-09-02 00:00:00.000',
                    '48': '2019-09-08 00:00:00.000',
                    '49': '2019-09-01 00:00:00.000',
                    '50': '2019-09-09 00:00:00.000',
                    '51': '2019-09-10 00:00:00.000',
                    '52': '2019-09-09 00:00:00.000',
                    '53': '2019-09-11 00:00:00.000',
                    '54': '2019-09-07 00:00:00.000',
                    '55': '2019-09-08 00:00:00.000',
                    '56': '2019-09-09 00:00:00.000',
                    '57': '2019-09-05 00:00:00.000',
                    '58': '2019-09-12 00:00:00.000',
                    '59': '2019-09-08 00:00:00.000',
                    '60': '2019-09-10 00:00:00.000',
                    '61': '2019-09-11 00:00:00.000',
                    '62': '2019-09-15 00:00:00.000',
                    '63': '2019-09-11 00:00:00.000',
                    '64': '2019-09-09 00:00:00.000',
                    '65': '2019-09-12 00:00:00.000',
                    '66': '2019-09-16 00:00:00.000',
                    '67': '2019-09-12 00:00:00.000',
                    '68': '2019-09-17 00:00:00.000',
                    '69': '2019-09-13 00:00:00.000',
                    '70': '2019-09-18 00:00:00.000',
                    '71': '2019-09-14 00:00:00.000',
                    '72': '2019-09-18 00:00:00.000',
                    '73': '2019-09-15 00:00:00.000',
                    '74': '2019-09-21 00:00:00.000',
                    '75': '2019-09-22 00:00:00.000',
                    '76': '2019-09-20 00:00:00.000',
                    '77': '2019-09-19 00:00:00.000',
                    '78': '2019-09-18 00:00:00.000',
                    key: '#active_time@~@1',
                  },
                  {
                    '0': 'channel',
                    '1': '(null)',
                    '2': '华为应用商城',
                    '3': '小米应用商城',
                    '4': 'AppStore',
                    '5': '小米应用商城',
                    '6': '华为应用商城',
                    '7': 'AppStore',
                    '8': '华为应用商城',
                    '9': 'Taptap',
                    '10': '应用宝',
                    '11': 'AppStore',
                    '12': '华为应用商城',
                    '13': '华为应用商城',
                    '14': 'Taptap',
                    '15': 'AppStore',
                    '16': '谷歌应用商城',
                    '17': '华为应用商城',
                    '18': '华为应用商城',
                    '19': 'AppStore',
                    '20': '华为应用商城',
                    '21': '谷歌应用商城',
                    '22': 'AppStore',
                    '23': '华为应用商城',
                    '24': 'Taptap',
                    '25': 'AppStore',
                    '26': 'Taptap',
                    '27': '(null)',
                    '28': '华为应用商城',
                    '29': '小米应用商城',
                    '30': '小米应用商城',
                    '31': '华为应用商城',
                    '32': '华为应用商城',
                    '33': '华为应用商城',
                    '34': 'AppStore',
                    '35': '谷歌应用商城',
                    '36': 'AppStore',
                    '37': 'Taptap',
                    '38': '(null)',
                    '39': '华为应用商城',
                    '40': '小米应用商城',
                    '41': '谷歌应用商城',
                    '42': '应用宝',
                    '43': 'AppStore',
                    '44': '华为应用商城',
                    '45': 'AppStore',
                    '46': '谷歌应用商城',
                    '47': '(null)',
                    '48': 'AppStore',
                    '49': '小米应用商城',
                    '50': '(null)',
                    '51': 'AppStore',
                    '52': '华为应用商城',
                    '53': '小米应用商城',
                    '54': 'AppStore',
                    '55': '华为应用商城',
                    '56': '小米应用商城',
                    '57': 'AppStore',
                    '58': '应用宝',
                    '59': 'Taptap',
                    '60': '应用宝',
                    '61': '(null)',
                    '62': '华为应用商城',
                    '63': '华为应用商城',
                    '64': 'AppStore',
                    '65': '华为应用商城',
                    '66': 'Taptap',
                    '67': '(null)',
                    '68': '(null)',
                    '69': 'AppStore',
                    '70': '谷歌应用商城',
                    '71': '华为应用商城',
                    '72': '小米应用商城',
                    '73': '小米应用商城',
                    '74': '(null)',
                    '75': '华为应用商城',
                    '76': '谷歌应用商城',
                    '77': 'AppStore',
                    '78': '华为应用商城',
                    key: 'channel@~@1',
                  },
                  {
                    '0': 'temperature',
                    '1': -249.76,
                    '2': -48.45,
                    '3': 83.8,
                    '4': 16.72,
                    '5': -159.95,
                    '6': 84.05,
                    '7': 0,
                    '8': -63.44,
                    '9': -75.86,
                    '10': -101.3,
                    '11': 191.52,
                    '12': -30.55,
                    '13': -4.95,
                    '14': -22.9,
                    '15': -163.02,
                    '16': 37.03999999999999,
                    '17': -340.81,
                    '18': -103.62,
                    '19': -240.03,
                    '20': -233.8,
                    '21': 5.62,
                    '22': -22.16,
                    '23': -231.06,
                    '24': -102.04,
                    '25': 0,
                    '26': 134.98,
                    '27': -91.99,
                    '28': -67.9,
                    '29': 0,
                    '30': -44.36,
                    '31': -256.88,
                    '32': -177.38,
                    '33': -130.4,
                    '34': -253.65,
                    '35': -146.03,
                    '36': -316.46000000000004,
                    '37': -224.65,
                    '38': 200.41,
                    '39': -86.38,
                    '40': 197.6,
                    '41': 176.55,
                    '42': -22.14,
                    '43': -189.8,
                    '44': -84.65,
                    '45': -487.62,
                    '46': -56.97,
                    '47': 0,
                    '48': -8.31,
                    '49': -87.85,
                    '50': 25.390000000000015,
                    '51': 15.04,
                    '52': -60.129999999999995,
                    '53': -94.49,
                    '54': -193.84,
                    '55': 197.82,
                    '56': -151.76,
                    '57': 131.39,
                    '58': 137.46,
                    '59': 58.41,
                    '60': -123.08,
                    '61': -157.74,
                    '62': -350.68,
                    '63': -67.86,
                    '64': -262.75,
                    '65': -255.96,
                    '66': 162.85,
                    '67': -222.3,
                    '68': -119.81,
                    '69': 312.05,
                    '70': 176.17,
                    '71': 70.12,
                    '72': 59.93,
                    '73': 113.16,
                    '74': 196.33,
                    '75': -238.2,
                    '76': 59.29,
                    '77': -168.65,
                    '78': 121.31,
                    key: 'temperature@~@1',
                  },
                ],
                totalData: [],
                fields: {
                  rows: [],
                  columns: [
                    '0',
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    '10',
                    '11',
                    '12',
                    '13',
                    '14',
                    '15',
                    '16',
                    '17',
                    '18',
                    '19',
                    '20',
                    '21',
                    '22',
                    '23',
                    '24',
                    '25',
                    '26',
                    '27',
                    '28',
                    '29',
                    '30',
                    '31',
                    '32',
                    '33',
                    '34',
                    '35',
                    '36',
                    '37',
                    '38',
                    '39',
                    '40',
                    '41',
                    '42',
                    '43',
                    '44',
                    '45',
                    '46',
                    '47',
                    '48',
                    '49',
                    '50',
                    '51',
                    '52',
                    '53',
                    '54',
                    '55',
                    '56',
                    '57',
                    '58',
                    '59',
                    '60',
                    '61',
                    '62',
                    '63',
                    '64',
                    '65',
                    '66',
                    '67',
                    '68',
                    '69',
                    '70',
                    '71',
                    '72',
                    '73',
                    '74',
                    '75',
                    '76',
                    '77',
                    '78',
                  ],
                  values: ['temperature@~@1'],
                  customTreeItems: [],
                  valueInCols: true,
                },
                meta: [
                  {
                    field: '0',
                    name: '0',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                    formatter: (val, _, meta) => {
                      console.log(meta);

                      return val;
                    },
                  },
                  {
                    field: '1',
                    name: '1',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '2',
                    name: '2',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '3',
                    name: '3',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '4',
                    name: '4',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '5',
                    name: '5',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '6',
                    name: '6',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '7',
                    name: '7',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '8',
                    name: '8',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '9',
                    name: '9',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '10',
                    name: '10',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '11',
                    name: '11',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '12',
                    name: '12',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '13',
                    name: '13',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '14',
                    name: '14',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '15',
                    name: '15',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '16',
                    name: '16',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '17',
                    name: '17',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '18',
                    name: '18',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '19',
                    name: '19',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '20',
                    name: '20',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '21',
                    name: '21',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '22',
                    name: '22',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '23',
                    name: '23',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '24',
                    name: '24',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '25',
                    name: '25',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '26',
                    name: '26',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '27',
                    name: '27',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '28',
                    name: '28',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '29',
                    name: '29',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '30',
                    name: '30',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '31',
                    name: '31',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '32',
                    name: '32',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '33',
                    name: '33',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '34',
                    name: '34',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '35',
                    name: '35',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '36',
                    name: '36',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '37',
                    name: '37',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '38',
                    name: '38',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '39',
                    name: '39',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '40',
                    name: '40',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '41',
                    name: '41',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '42',
                    name: '42',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '43',
                    name: '43',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '44',
                    name: '44',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '45',
                    name: '45',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '46',
                    name: '46',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '47',
                    name: '47',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '48',
                    name: '48',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '49',
                    name: '49',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '50',
                    name: '50',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '51',
                    name: '51',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '52',
                    name: '52',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '53',
                    name: '53',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '54',
                    name: '54',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '55',
                    name: '55',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '56',
                    name: '56',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '57',
                    name: '57',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '58',
                    name: '58',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '59',
                    name: '59',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '60',
                    name: '60',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '61',
                    name: '61',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '62',
                    name: '62',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '63',
                    name: '63',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '64',
                    name: '64',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '65',
                    name: '65',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '66',
                    name: '66',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '67',
                    name: '67',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '68',
                    name: '68',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '69',
                    name: '69',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '70',
                    name: '70',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '71',
                    name: '71',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '72',
                    name: '72',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '73',
                    name: '73',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '74',
                    name: '74',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '75',
                    name: '75',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '76',
                    name: '76',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '77',
                    name: '77',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                  {
                    field: '78',
                    name: '78',
                    align: 'center',
                    useAutoWidth: true,
                    extraWidth: 8,
                    hasDateTime: true,
                  },
                ],
                sortParams: [],
                filterParams: [],
                isClickChangeXAndY: true,
                reRenderExtraProps: {
                  formats: {},
                  curSort: {
                    sortMethod: 'NONE',
                  },
                },
                sheetType: 'table',
                celWidthObj: {
                  '0': 155,
                  '1': 253,
                  '2': 253,
                  '3': 253,
                  '4': 253,
                  '5': 253,
                  '6': 253,
                  '7': 253,
                  '8': 253,
                  '9': 253,
                  '10': 253,
                  '11': 253,
                  '12': 253,
                  '13': 253,
                  '14': 253,
                  '15': 253,
                  '16': 253,
                  '17': 253,
                  '18': 253,
                  '19': 253,
                  '20': 253,
                  '21': 253,
                  '22': 253,
                  '23': 253,
                  '24': 253,
                  '25': 253,
                  '26': 253,
                  '27': 253,
                  '28': 253,
                  '29': 253,
                  '30': 253,
                  '31': 253,
                  '32': 253,
                  '33': 253,
                  '34': 253,
                  '35': 253,
                  '36': 253,
                  '37': 253,
                  '38': 253,
                  '39': 253,
                  '40': 253,
                  '41': 253,
                  '42': 253,
                  '43': 253,
                  '44': 253,
                  '45': 253,
                  '46': 253,
                  '47': 253,
                  '48': 253,
                  '49': 253,
                  '50': 253,
                  '51': 253,
                  '52': 253,
                  '53': 253,
                  '54': 253,
                  '55': 253,
                  '56': 253,
                  '57': 253,
                  '58': 253,
                  '59': 253,
                  '60': 253,
                  '61': 253,
                  '62': 253,
                  '63': 253,
                  '64': 253,
                  '65': 253,
                  '66': 253,
                  '67': 253,
                  '68': 253,
                  '69': 253,
                  '70': 253,
                  '71': 253,
                  '72': 253,
                  '73': 253,
                  '74': 253,
                  '75': 253,
                  '76': 253,
                  '77': 253,
                  '78': 253,
                },
                isShowColorScale: true,
              }}
              themeCfg={{
                theme: {
                  prepareSelectMask: {
                    backgroundColor: 'yellow',
                    borderColor: 'yellowgreed',
                  },
                },
              }}
              options={{
                interaction: {
                  hoverFocus: false,
                  selectedCellsSpotlight: false,
                  hoverHighlight: true,
                  brushSelection: {
                    row: false,
                    col: false,
                    data: true,
                  },
                  multiSelection: true,
                  rangeSelection: true,
                  selectedCellMove: false,
                  resize: {
                    rowCellVertical: false,
                    cornerCellHorizontal: true,
                    colCellHorizontal: true,
                    colCellVertical: false,
                  },
                  enableCopy: true,
                  copyWithFormat: true,
                  copyWithHeader: !dataCfg.isClickChangeXAndY,
                  // 关闭浏览器默认的滚动边界行为
                  overscrollBehavior: window.location.hash.includes('va/va')
                    ? 'none'
                    : 'auto',
                },
                tooltip: {
                  showTooltip: false,
                  col: {
                    showTooltip: false,
                  },
                  row: {
                    showTooltip: false,
                  },
                  data: {
                    showTooltip: false,
                  },
                  operation: {
                    hiddenColumns: false,
                  },
                },
                // 控制排序按钮的显隐
                showDefaultHeaderActionIcon: false,
              }}
              sheetType={sheetType}
              adaptive={adaptive}
              ref={s2Ref}
              partDrillDown={partDrillDown}
              showPagination={showPagination}
              onDataCellTrendIconClick={logHandler('onDataCellTrendIconClick')}
              onAfterRender={logHandler('onAfterRender')}
              onRangeSort={logHandler('onRangeSort')}
              onMounted={onSheetMounted}
              onDestroy={logHandler('onDestroy', () => {
                clearInterval(scrollTimer.current);
              })}
              onColCellClick={onColCellClick}
              onRowCellClick={logHandler('onRowCellClick')}
              onCornerCellClick={(cellInfo) => {
                s2Ref.current.showTooltip({
                  position: {
                    x: cellInfo.event.clientX,
                    y: cellInfo.event.clientY,
                  },
                  content: 'click',
                });
              }}
              onDataCellClick={logHandler('onDataCellClick')}
              onLayoutResize={logHandler('onLayoutResize')}
              onCopied={logHandler('onCopied')}
              onLayoutColsHidden={logHandler('onLayoutColsHidden')}
              onLayoutColsExpanded={logHandler('onLayoutColsExpanded')}
              onSelected={logHandler('onSelected')}
              onScroll={logHandler('onScroll')}
              onRowCellScroll={logHandler('onRowCellScroll')}
              onLinkFieldJump={logHandler('onLinkFieldJump', () => {
                window.open(
                  'https://s2.antv.antgroup.com/zh/docs/manual/advanced/interaction/link-jump#%E6%A0%87%E8%AE%B0%E9%93%BE%E6%8E%A5%E5%AD%97%E6%AE%B5',
                );
              })}
              onDataCellBrushSelection={logHandler('onDataCellBrushSelection')}
              onColCellBrushSelection={logHandler('onColCellBrushSelection')}
              onRowCellBrushSelection={logHandler('onRowCellBrushSelection')}
            />
          )}
        </TabPane>
        <TabPane tab="自定义目录树" key="customTree">
          <SheetComponent
            dataCfg={{
              data: dataCustomTrees,
              fields: customTreeFields,
            }}
            options={{ width: 600, height: 480, hierarchyType: 'customTree' }}
          />
        </TabPane>
        <TabPane tab="趋势分析表" key="strategy">
          <SheetComponent
            sheetType="strategy"
            dataCfg={strategyDataCfg}
            options={StrategyOptions}
            onRowCellClick={logHandler('onRowCellClick')}
            onMounted={onSheetMounted}
            header={{
              title: '趋势分析表',
              description: '支持子弹图',
              switcherCfg: { open: true },
              exportCfg: { open: true },
              extra: (
                <Switch
                  checkedChildren="单列头"
                  unCheckedChildren="多列头"
                  checked={strategyDataCfg.fields.columns.length === 1}
                  onChange={(checked) => {
                    setStrategyDataCfg(
                      customMerge(StrategySheetDataConfig, {
                        fields: {
                          columns: StrategySheetDataConfig.fields.columns.slice(
                            0,
                            checked ? 1 : 2,
                          ),
                        },
                      }),
                    );
                  }}
                />
              ),
            }}
          />
        </TabPane>
        <TabPane tab="网格分析表" key="gridAnalysis">
          <SheetComponent
            sheetType="gridAnalysis"
            dataCfg={mockGridAnalysisDataCfg}
            options={mockGridAnalysisOptions}
            ref={s2Ref}
            onMounted={onSheetMounted}
          />
        </TabPane>
        <TabPane tab="编辑表" key="editable">
          <SheetComponent
            sheetType="editable"
            dataCfg={tableSheetDataCfg}
            options={mergedOptions}
            ref={s2Ref}
            themeCfg={themeCfg}
            onMounted={onSheetMounted}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

ReactDOM.render(<MainLayout />, document.getElementById('root'));
