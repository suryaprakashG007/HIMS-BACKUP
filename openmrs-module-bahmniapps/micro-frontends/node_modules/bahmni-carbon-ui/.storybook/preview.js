import React from "react";
import { IntlProvider } from "react-intl";
import "../src/styles/styles.scss";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const withIntlProvider = (storyFn) => {
  return <IntlProvider locale="en">{storyFn()}</IntlProvider>;
};

export const decorators = [withIntlProvider];
