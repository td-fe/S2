import {
  DEFAULT_MOBILE_OPTIONS,
  DEFAULT_STYLE,
  DeviceType,
  HOVER_FOCUS_DURATION,
  LayoutWidthTypes,
} from '@antv/s2';
import { pick } from 'lodash';
import {
  getBaseSheetComponentOptions,
  getMobileSheetComponentOptions,
} from '../../src';

describe('Options Tests', () => {
  test('should get safety options', () => {
    const options = getBaseSheetComponentOptions();

    expect(options).toStrictEqual({
      width: 600,
      height: 480,
      debug: false,
      hierarchyType: 'grid',
      conditions: {},
      totals: {},
      tooltip: {
        showTooltip: true,
        autoAdjustBoundary: 'body',
        operation: { hiddenColumns: true, sort: true, menus: [] },
      },
      frozen: {
        rowHeader: true,
        rowCount: 0,
        colCount: 0,
        trailingRowCount: 0,
        trailingColCount: 0,
      },
      interaction: {
        linkFields: [],
        hiddenColumnFields: [],
        selectedCellsSpotlight: false,
        hoverHighlight: true,
        hoverFocus: { duration: HOVER_FOCUS_DURATION },
        brushSelection: {
          data: true,
          row: false,
          col: false,
        },
        multiSelection: true,
        rangeSelection: true,
        scrollSpeedRatio: {
          horizontal: 1,
          vertical: 1,
        },
        scrollbarPosition: 'content',
        autoResetSheetStyle: true,
        resize: {
          rowCellVertical: true,
          cornerCellHorizontal: true,
          colCellHorizontal: true,
          colCellVertical: true,
          rowResizeType: 'current',
          colResizeType: 'current',
        },
        eventListenerOptions: false,
        overscrollBehavior: 'auto',
        selectedCellHighlight: false,
      },
      showSeriesNumber: false,
      customSVGIcons: [],
      showDefaultHeaderActionIcon: true,
      headerActionIcons: [],
      style: DEFAULT_STYLE,
      hdAdapter: true,
      cornerText: '',
      cornerExtraFieldText: '',
      placeholder: '-',
      supportCSSTransform: false,
      devicePixelRatio: window.devicePixelRatio,
      device: DeviceType.PC,
    });
  });

  test('should get custom options', () => {
    const options = getBaseSheetComponentOptions({
      tooltip: {
        showTooltip: false,
        operation: {
          sort: false,
          menus: [
            {
              key: 'custom',
              text: 'custom',
            },
          ],
        },
      },
    });

    expect(options.tooltip).toStrictEqual({
      showTooltip: false,
      autoAdjustBoundary: 'body',
      operation: {
        hiddenColumns: true,
        sort: false,
        menus: [
          {
            key: 'custom',
            text: 'custom',
          },
        ],
      },
    });
  });

  test('should get mobile options', () => {
    const options = getMobileSheetComponentOptions();
    const firstLevelOptions = pick(getMobileSheetComponentOptions(), [
      'height',
      'device',
    ]);
    const interactionOptions = pick(
      options.interaction,
      Object.keys(DEFAULT_MOBILE_OPTIONS.interaction!),
    );

    expect(interactionOptions).toEqual({
      hoverHighlight: false,
      hoverFocus: false,
      brushSelection: {
        data: false,
        row: false,
        col: false,
      },
      multiSelection: false,
      rangeSelection: false,
    });
    expect(options.style?.layoutWidthType).toEqual(
      LayoutWidthTypes.ColAdaptive,
    );
    expect(firstLevelOptions).toEqual({
      height: 380,
      device: DeviceType.MOBILE,
    });
  });
});
