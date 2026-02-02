import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.scss";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7b61ff' },
    secondary: { main: '#00e6a0' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true }
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
