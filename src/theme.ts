import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#eaf7f0", // ← もう少し緑みのある淡色に
      100: "#d6efdf",
      200: "#b6e2c6",
      300: "#8fd5aa",
      400: "#6ac890",
      500: "#49b97a",
      600: "#3e9d63",
      700: "#317b4f",
      800: "#255e3d",
      900: "#1c4930",
    },
  },
  styles: {
    global: {
      "html, body, #root": { minHeight: "100%" },
      body: { bg: "brand.50" }, // ← ページ全体が淡い緑に
    },
  },
  shadows: { soft: "0 6px 24px rgba(0,0,0,0.06)" },
  components: {
    Button: {
      variants: {
        soft: {
          bg: "brand.50",
          _hover: { bg: "brand.100" },
          _active: { bg: "brand.200" },
          color: "brand.700",
          borderRadius: "xl",
          boxShadow: "soft",
          h: 10,
        },
      },
    },
    Tag: {
      variants: {
        soft: {
          container: {
            bg: "brand.50",
            color: "brand.700",
            borderRadius: "full",
          },
        },
      },
    },
    Link: { baseStyle: { color: "brand.700", _hover: { color: "brand.800" } } },
  },
});
export default theme;
