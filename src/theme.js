import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#6FA8C6' },

    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#1E293B',   // main text
      secondary: '#64748B', // labels / secondary info
    },
  },

  typography: {
    fontFamily: 'Roboto, sans-serif',

    // 🔥 SECTION TITLES
    subtitle1: {
      fontWeight: 600,
      fontSize: '0.9rem',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },

    // 🔥 LABELS (Balls, Strikes, etc.)
    caption: {
      fontSize: '0.7rem',
      fontWeight: 500,
      letterSpacing: 0.6,
      color: '#64748B',
    },

    // 🔥 BIG NUMBERS
    h4: {
      fontWeight: 700,
      fontSize: '1.8rem',
    },

    h5: {
      fontWeight: 600,
      fontSize: '1.3rem',
    },

    // 🔥 BODY TEXT
    body2: {
      fontSize: '0.85rem',
    },

    // 🔥 BUTTON TEXT
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;