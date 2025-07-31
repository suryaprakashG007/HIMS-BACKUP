import moment from "moment";
import React from "react";
import DatePickerCarbon from "./DatePickerCarbon.jsx";

export default {
  title: "Date Picker",
};

export const Primary = () => {
  return (
    <DatePickerCarbon
      id={"Dropdown"}
      onChange={() => {}}
      titleText={"Dropdown"}
      minDate={moment().format("MM-DD-YYYY")}
      title={"Start Date"}
    />
  );
};
