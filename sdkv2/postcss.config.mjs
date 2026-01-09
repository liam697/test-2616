import tailwindcss from "@tailwindcss/postcss";
import postcssPrefixSelector from "postcss-prefix-selector";

const config = {
  plugins: [
    tailwindcss(),
    postcssPrefixSelector({
      prefix: "#chat-sdk-root",
      transform(prefix, selector, prefixedSelector) {
        if (
          selector.startsWith(":root") ||
          selector.startsWith("html") ||
          selector.startsWith("body")
        ) {
          return selector;
        }
        return prefixedSelector;
      },
    }),
  ],
};

export default config;