import moment from "moment";
import React from "react";
import TimePicker24Hour from "./TimePicker24Hour.jsx";

export default {
  title: "Time Picker 24 hour",
};

export const Primary = () => {
  return (
    <TimePicker24Hour
      onChange={() => {}}
      labelText={"Start Time"}
      isRequired={true}
      translationKey={"APPOINTMENT_TIME_FROM_LABEL"}
      defaultTranslationKey={"Start Time"}
      defaultTime={moment().format("HH:mm")}
    />
  );
};
