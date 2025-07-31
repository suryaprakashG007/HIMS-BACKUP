import moment from "moment";
import React from "react";
import TimePickerCarbon from "./TimePicker.jsx";

export default {
  title: "Time Picker with AM and PM",
};

export const Primary = () => {
  return (
    <TimePickerCarbon
      labelText={"Start Time"}
      isRequired={true}
      onChange={() => {}}
      translationKey={"APPOINTMENT_TIME_FROM_LABEL"}
      defaultTranslationKey={"Start Time"}
      defaultTime={moment()}
    />
  );
};
