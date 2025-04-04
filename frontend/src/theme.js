import { extendTheme } from "@chakra-ui/theme-utils"; // ✅ Correct in Chakra UI v2

const theme = extendTheme({
  colors: {
    primary: {
      100: "#E3F2FD",
      500: "#2196F3",
      900: "#0D47A1",
    },
  },
  fonts: {
    heading: "Arial, sans-serif",
    body: "Arial, sans-serif",
  },
});

export default theme;
