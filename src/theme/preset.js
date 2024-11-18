export const preset = {
  colors: {
    text: '#333333',
    background: 'rgb(240,240,240)',
    primary: 'black',
    secondary: '#333333',
    blk50: '#00000080',
    blk70: '#6B6B6B',
    blk80: '#2B2C29',
    blk90: '#181816',
    grayLt: '#EDEDED',
    gray70: '#EDEDED',
    gray80: '#E8E8E8',
    gray90: '#E3E3E3',
    gray95: '#CACACA',
    gray100: '#B5B5B5',
    gray150: '#989898',
    gray500: '#333333',
    lightGreen: '#63C500',

    green100: '#D9F9B8',
    green500: '#76EC00',
    green900: '#3F7E00',

    gray: '#D1D1D1',
    select: '#F7F7F8',
    active: '#595B5F',
    success: '#DEFDBF',
    successBorder: '#9DEF4C',
    successBg: '#9DEF4C',
    successTxt: '#0A7500',
    pendingBg: '#FFF3DD',
    pendingTxt: '#A86D00',
    error: 'red',
    link: '#00C2FF',
    border: '#E1E1E1',
    highlight: '#70E000',
  },

  breakpoints: ['40em', '1200px', '64em'],
  fonts: {
    body: 'Montserrat, sans-serif',
    heading: 'Montserrat, sans-serif',
    monospace: 'Montserrat, sans-serif',
  },
  fontSizes: [13, 14, 16, 18, 24, 34, 38, 64, 72, 95],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  input: {
    py: 2,
    px: 1,
    border: 'none',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  space: [0, 4, 8, 16, 30, 64, 128, 256, 512],
  sizes: {
    avatar: 48,
  },
  radii: {
    default: 10,
    rounded: 20,
    circle: 99999,
  },
  shadows: {
    card: '0 0 4px rgba(0, 0, 0, .125)',
  },
  rounded: {
    borderRadius: 'default',
  },
  transition: {
    backgroundColor: 'red',
    transition: 'background-color 300ms ease-in-out',
    // bg: 'red',
  },

  // rebass variants
  text: {
    h4: {
      fontSize: 2,
      paddingBottom: 3,
      fontWeight: 700,
    },

    p: {
      lineHeight: 1.5,
      opacity: 0.7,
      fontSize: 2,
    },

    label: {
      fontSize: 2,
      color: 'blk70',
      fontWeight: 400,
    },

    description: {
      fontSize: 2,
      fontWeight: 700,
    },

    warning: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      color: 'yellow',
    },
    error: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      color: 'red',
    },

    success: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      color: 'green',
    },
    italic: {
      fontStyle: 'italic',
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
    },
    display: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      fontSize: [5, 6, 7],
    },
    caps: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  border: {
    width: '100%',
    borderTop: '1px solid #E1E1E1',
  },
  borderLight: {
    width: '100%',
    opacity: 0.4,
    borderTop: '1px solid #E1E1E1',
  },
  target: {
    width: 44,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  variants: {
    badge: {
      py: 2,
      px: 3,
      bg: 'gray80',
      display: 'flex',
      fontWeight: 600,
      borderRadius: '9999px',
    },
    badgeSuccess: {
      py: 2,
      px: 3,
      bg: 'success',
      display: 'flex',
      border: `1px solid #9DEF4C`,
      fontWeight: 600,
      borderRadius: '9999px',
    },
    link: {
      cursor: 'pointer',
      color: 'primary',
    },
    avatar: {
      width: 'avatar',
      height: 'avatar',
      borderRadius: 'circle',
    },
    glass: {
      background: 'rgba(98, 98, 98, 0.15)',
      borderRadius: '12px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(4.5px)',
      '-webkit-backdropFilter': 'blur(4.1px)',
    },
    card: {
      p: 4,
      bg: 'white',
      boxShadow: 'transparent',
      borderRadius: 'rounded',
    },

    outline: {
      border: '1px solid #E8E8E8',
      borderRadius: 'default',
    },
    outlineLight: {
      border: '1px solid rgba(60,61,65,0.5)',
      borderRadius: 'default',
    },
    loading: {
      background: 'linear-gradient(270deg, #FAFAFA, #E5E5E5)',
      backgroundSize: '400% 400%',
      borderRadius: '5px',
      zIndex: 9,
      animation: `pulse 2s linear infinite`,
      '@keyframes pulse': {
        '0%': {
          'background-position': '0% 0%',
        },
        '6.25%': {
          'background-position': '25% 25%',
        },
        '12.5%': {
          'background-position': '50% 50%',
        },
        '25%': {
          'background-position': '75% 75%',
        },
        '50%': {
          'background-position': '100% 100%',
        },
        '62.5%': {
          'background-position': '75% 75%',
        },
        '75%': {
          'background-position': '50% 50%',
        },
        '87.5%': {
          'background-position': '25% 25%',
        },
        '100%': {
          'background-position': '0% 0%',
        },
      },
    },

    loadingDark: {
      background: 'linear-gradient(270deg,#AFAFAF, #E5E5E5)',
      backgroundSize: '400% 400%',
      borderRadius: '5px',
      zIndex: 9,
      animation: `pulse 2s linear infinite`,
      '@keyframes pulse': {
        '0%': {
          'background-position': '0% 0%',
        },
        '6.25%': {
          'background-position': '25% 25%',
        },
        '12.5%': {
          'background-position': '50% 50%',
        },
        '25%': {
          'background-position': '75% 75%',
        },
        '50%': {
          'background-position': '100% 100%',
        },
        '62.5%': {
          'background-position': '75% 75%',
        },
        '75%': {
          'background-position': '50% 50%',
        },
        '87.5%': {
          'background-position': '25% 25%',
        },
        '100%': {
          'background-position': '0% 0%',
        },
      },
    },
    nav: {
      fontSize: 1,
      fontWeight: 'bold',
      display: 'inline-block',
      p: 2,
      color: 'inherit',
      textDecoration: 'none',
      ':hover,:focus,.active': {
        color: 'primary',
      },
    },
  },
  listHover: {
    cursor: 'pointer',
    ':hover,:focus,.active': {
      bg: 'black',
    },
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },

  buttons: {
    fontSize: 0,
    primary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      color: 'white',
      fontWeight: 700,
      outline: 'none',
      minHeight: 45,
      width: '100%',
      bg: 'primary',
      transition: 'all 30ms ease-in-out',
      outline: '1px solid primary',
      borderRadius: 'default',
      '&:hover': {
        outline: '1px solid #333333',
        bg: 'white',
        color: 'secondary',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    outline: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      fontWeight: 700,
      minHeight: 45,
      width: '100%',
      color: 'secondary',
      bg: 'transparent',
      transition: 'all 30ms ease-in-out',
      outline: '1px solid #333333',

      borderRadius: 'default',
      '&:hover': {
        bg: '#70E000',
        color: 'secondary',
        border: '1px solid #70E000',
        outline: '1px solid #70E000',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    error: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      height: 45,
      px: 3,
      fontWeight: 700,
      outline: 'none',
      width: '100%',
      color: '#333333',
      border: '1px solid #333333',
      bg: 'background',
      transition: 'all 50ms ease-in-out',
      zIndex: 1,
      borderRadius: 'default',
      pointerEvents: 'none',
    },
    secondary: {
      cursor: 'pointer',
      outline: 'none',
      position: 'relative',
      color: 'white',
      bg: 'secondary',
      fontWeight: 600,
      fontSize: 0,
      transition: 'all 30ms ease-in-out',
      borderRadius: 'default',
      '&:hover': {
        bg: '#70E000',
        color: 'secondary',
        outline: '1px solid #70E000',
      },
      '&:disabled': {
        opacity: '0.5',
        pointerEvents: 'none',
      },
    },
    disabled: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      fontWeight: 700,
      outline: 'none',
      minHeight: 45,
      width: '100%',
      color: 'black',
      bg: 'gray',
      transition: 'opacity 200ms ease-in-out',
      border: 'none',
      borderRadius: 'default',
      opacity: 0.5,
      pointerEvents: 'none',
    },

    tertiary: {
      cursor: 'pointer',
      outline: 'none',
      position: 'relative',
      color: 'white',
      bg: '#303436',
      fontSize: 0,
      fontWeight: 500,
      transition: 'background 200ms ease-in-out',
      borderRadius: 'default',
      '&:hover': {
        opacity: [1, 0.7],
      },
      '&:active': {
        opacity: 0.7,
      },
      '&:disabled': {
        opacity: '0.5',
        pointerEvents: 'none',
      },
    },

    transparent: {
      bg: 'transparent',
      color: 'black',
      fontSize: 0,
      cursor: 'pointer',
      '&:active': {
        bg: 'gray90',
      },
    },

    image: {
      cursor: 'pointer',
      outline: 'none',
      display: 'flex',
      px: 0,
      py: 0,
      my: 0,
      py: 0,
      bg: 'transparent',
      height: 'fit-content',
      width: 'fit-content',
      border: '0px',

      transition: 'opacity 200ms ease-in-out',
      '&:hover': {
        opacity: 0.7,
      },
    },

    icon: {
      cursor: 'pointer',
      outline: 'none',
      display: 'flex',
      px: 0,
      py: 0,
      my: 0,
      py: 0,
      bg: 'transparent',
      height: 'fit-content',
      width: 'fit-content',
      border: '0px',
      opacity: 0.7,
      transition: 'opacity 200ms ease-in-out',
      '&:hover': {
        opacity: 1,
      },
    },

    greenPrimary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      py: 0,
      color: 'blk90',
      fontWeight: 700,
      outline: 'none',
      minHeight: 40,
      minWidth: 'fit-content',
      width: '100%',
      bg: 'green500',
      transition: 'all 200ms ease-in-out',
      outline: '2px solid #76EC00',
      borderRadius: 'circle',
      '&:hover': {
        bg: 'transparent',
        color: 'green500',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    greenSecondary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      py: 0,
      color: 'green500',
      fontWeight: 700,
      outline: 'none',
      minHeight: 40,
      minWidth: 'fit-content',
      width: '100%',
      bg: 'transparent',
      transition: 'all 200ms ease-in-out',
      outline: '2px solid #76EC00',
      borderRadius: 'circle',
      '&:hover': {
        bg: 'green500',
        color: 'blk90',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },

    blackPrimary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      py: 0,
      color: 'white',
      fontWeight: 700,
      outline: 'none',
      minHeight: 40,
      minWidth: 'fit-content',
      width: 'auto',
      bg: 'black',
      transition: 'all 200ms ease-in-out',
      outline: '2px solid black',
      borderRadius: 'circle',
      '&:hover': {
        bg: 'transparent',
        color: 'black',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    blackSecondary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      py: 0,
      color: 'black',
      fontWeight: 700,
      outline: 'none',
      minHeight: 40,
      minWidth: 'fit-content',
      width: 'auto',
      bg: 'transparent',
      transition: 'all 200ms ease-in-out',
      outline: '2px solid black',
      borderRadius: 'circle',
      '&:hover': {
        bg: 'black',
        color: 'white',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },

    blackShadowPrimary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      py: 0,
      color: 'white',
      fontWeight: 700,
      outline: 'none',
      minHeight: 40,
      minWidth: 'fit-content',
      width: 'auto',
      bg: 'blk80',
      transition: 'all 200ms ease-in-out',
      outline: '2px solid #2B2C29',
      borderRadius: 'circle',
      boxShadow: '0px 4px 2px 0px rgba(0, 0, 0, 0.16), 0px 0px 16px 0px rgba(255, 255, 255, 0.08) inset',
      '&:hover': {
        bg: 'transparent',
        color: 'blk80',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },

    grayPrimary: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: 1,
      px: 3,
      py: 0,
      color: 'white',
      fontWeight: 700,
      outline: 'none',
      minHeight: 40,
      minWidth: 'fit-content',
      width: 'auto',
      bg: 'secondary',
      transition: 'all 200ms ease-in-out',
      outline: '2px solid #333333',
      borderRadius: 'circle',
      '&:hover': {
        bg: 'transparent',
        color: 'secondary',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
  },
  styles: {
    root: {
      lineHeight: '1.2em',
      fontFamily: 'body',
      fontWeight: 'body',
    },
  },
}
