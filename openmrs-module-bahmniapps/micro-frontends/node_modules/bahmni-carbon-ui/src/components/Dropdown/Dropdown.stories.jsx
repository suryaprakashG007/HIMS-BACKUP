import React from "react";
import Dropdown from "./Dropdown.jsx";

export default {
  title: "Combo box",
};

export const Primary = () => {
  return (
    <Dropdown
      id={"Dropdown"}
      onChange={() => {}}
      titleText={"Dropdown"}
      placeholder={"Select an item"}
      options={[
        { value: "item1", label: "Item 1" },
        { value: "item2", label: "Item 2" },
        { value: "item3", label: "Item 3" },
      ]}
    />
  );
};
