import { createTheme } from "@mui/material/styles";

const brandPalette = {
  primary: {
    main: "#125e5e",
    dark: "#072327",
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
