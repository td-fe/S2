import type { S2Theme } from '@tant/s2';

const FONT_COLOR = '#202241';
const HEAD_FONT_COLOR = '#0a1032';
const HEAD_BG_COLOR = '#f9f9fb';
const BORDER_COLOR = '#ebedf3';
const BG_COLOR = '#fff';
const HOVER_COLOR = '#f6f6f9';
const HEAD_HOVER_COLOR = '#f2f3f8';
const RESIZE_BG_COLOR = '#1E76F0';
const SHADOW_COLORS_LEFT = 'rgba(0, 0, 0, 0.1)';
const SHADOW_COLORS_RIGHT = 'rgba(0, 0, 0, 0)';
const BRUSH_SELECTED_BG_COLOR = '#3583EF';
const FONT_FAMILY =
  "'TA-Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

export const getCustomTheme = (type, isCard) => {
  const FONT_SIZE = isCard ? 12 : 14;
  const isPivot = type === 'privot';

  return {
    background: {
      color: BG_COLOR,
    },
    resizeArea: {
      background: RESIZE_BG_COLOR,
    },
    prepareSelectMask: {
      backgroundColor: BRUSH_SELECTED_BG_COLOR,
      borderColor: RESIZE_BG_COLOR,
    },
    splitLine: {
      horizontalBorderColor: BORDER_COLOR,
      verticalBorderColor: BORDER_COLOR,
      // verticalBorderColorOpacity: 1,
      // horizontalBorderColorOpacity: 1,
      // horizontalBorderWidth: 1,
      // verticalBorderWidth: 0.5,
      // showRightShadow: true,
      // shadowWidth: 10,
      shadowColors: {
        left: SHADOW_COLORS_LEFT,
        right: SHADOW_COLORS_RIGHT,
      },
    },
    cornerCell: {
      icon: {
        size: 14,
        margin: {
          right: 0,
        },
      },
      cell: {
        horizontalBorderColor: BORDER_COLOR,
        verticalBorderColor: BORDER_COLOR,
        // horizontalBorderColorOpacity: 1,
        // verticalBorderColorOpacity: 1,
        // verticalBorderWidth: 0.5,
        // horizontalBorderWidth: 0.5,
        padding: {
          top: 0,
          right: 12,
          bottom: 0,
          left: 12,
        },
        interactionState: {
          hover: {
            backgroundColor: HEAD_HOVER_COLOR,
            backgroundOpacity: 1,
          },
          selected: {
            backgroundOpacity: 0,
            borderWidth: 0,
          },
          unselected: {
            backgroundOpacity: 0,
            // borderWidth: 0,
          },
        },
        backgroundColor: HEAD_BG_COLOR,
      },
      text: {
        fill: HEAD_FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 500,
        textAlign: 'center',
        fontFamily: FONT_FAMILY,
      },
      bolderText: {
        fill: HEAD_FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
      },
    },
    rowCell: {
      icon: {
        size: 14,
        margin: {
          right: 0,
        },
      },
      text: {
        fill: FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 'normal',
        fontFamily: FONT_FAMILY,
      },
      bolderText: {
        fill: FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 'normal',
        fontFamily: FONT_FAMILY,
      },
      cell: {
        horizontalBorderColor: BORDER_COLOR,
        verticalBorderColor: BORDER_COLOR,
        // verticalBorderColorOpacity: 1,
        // horizontalBorderColorOpacity: 1,
        padding: {
          top: 0,
          right: 12,
          bottom: 0,
          left: 12,
        },
        backgroundColor: BG_COLOR,
        interactionState: {
          hover: {
            backgroundColor: HOVER_COLOR,
            backgroundOpacity: 1,
          },
          selected: {
            backgroundOpacity: 0,
            borderWidth: 0,
            borderOpacity: 0,
          },
          unselected: {
            backgroundOpacity: 0,
            borderWidth: 0,
          },
        },
        verticalBorderWidth: 0.5,
        horizontalBorderWidth: 0.5,
      },
    },
    colCell: {
      icon: {
        size: 14,
        margin: {
          right: 0,
        },
      },
      cell: {
        horizontalBorderColor: BORDER_COLOR,
        verticalBorderColor: BORDER_COLOR,
        // horizontalBorderColorOpacity: 1,
        // verticalBorderColorOpacity: 1,
        // verticalBorderWidth: 0.5,
        // horizontalBorderWidth: 0.5,

        padding: {
          top: 0,
          right: 12,
          bottom: 0,
          left: 12,
        },
        backgroundColor: HEAD_BG_COLOR,
        interactionState: {
          hover: {
            backgroundColor: HEAD_HOVER_COLOR,
            backgroundOpacity: 1,
          },
          selected: {
            backgroundOpacity: 0,
            borderWidth: 0,
          },
          unselected: {
            backgroundOpacity: 0,
            borderWidth: 0,
          },
        },
      },
      measureText: {
        fill: HEAD_FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
      },
      text: {
        fill: HEAD_FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
      },
      bolderText: {
        fill: HEAD_FONT_COLOR,
        fontSize: FONT_SIZE,
        fontWeight: 500,
        // cursor: 'pointer',
        textAlign: 'center',
        fontFamily: FONT_FAMILY,
      },
    },
    dataCell: {
      cell: {
        horizontalBorderColor: BORDER_COLOR,
        verticalBorderColor: BORDER_COLOR,
        // verticalBorderColorOpacity: 1,
        // horizontalBorderColorOpacity: 1,
        // verticalBorderWidth: 0.5,
        // horizontalBorderWidth: 0.5,
        crossBackgroundColor: BG_COLOR,
        backgroundColor: BG_COLOR,
        backgroundColorOpacity: 1,
        interactionState: {
          hover: {
            backgroundColor: HOVER_COLOR,
            backgroundOpacity: 1,
            borderWidth: 0,
          },
          hoverFocus: {
            backgroundColor: HOVER_COLOR,
            backgroundOpacity: 1,
            borderWidth: 0,
          },
          selected: {
            backgroundColor: BRUSH_SELECTED_BG_COLOR,
            borderOpacity: 0,
          },
          unselected: {
            backgroundOpacity: 0,
            borderWidth: 0,
          },
          prepareSelect: {
            backgroundOpacity: 0,
            borderWidth: 0,
          },
        },
        padding: {
          top: 0,
          right: 12,
          bottom: 0,
          left: 12,
        },
      },
      text: {
        fill: FONT_COLOR,
        fontSize: FONT_SIZE,
        fontFamily: FONT_FAMILY,
        fontWeight: 'normal',
      },
      bolderText: {
        fill: FONT_COLOR,
        fontSize: FONT_SIZE,
        fontFamily: FONT_FAMILY,
        fontWeight: 'normal',
      },
    },
  } as S2Theme;
};
