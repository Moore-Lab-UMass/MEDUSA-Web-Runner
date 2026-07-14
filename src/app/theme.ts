import { createTheme } from "@mui/material/styles";

const brandPalette = {
  primary: {
    main: "#123832",
    dark: "#0d2924",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#c3dc6f",
    dark: "#b3cf58",
    contrastText: "#123832",
  },
};

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: brandPalette,
    },
    dark: {
      palette: brandPalette,
    },
  },
});

export default theme;
