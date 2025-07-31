import React from "react";
import NumberInputCarbon from "./NumberInputCarbon.jsx";

export default {
  title: "Number Input",
};

export const Primary = () => {
  return (
    <NumberInputCarbon
      id={"Dropdown"}
      onChange={() => {}}
      titleText={"Number Input"}
      invalidText={"Enter a valid number"}
      value={1}
    />
  );
};
