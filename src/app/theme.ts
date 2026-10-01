import { createTheme } from "@mui/material/styles";

const brandPalette = {
  primary: {
    main: "#125e5e",
    dark: "#082326",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#c4e8a0",
    dark: "#7aac80",
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
