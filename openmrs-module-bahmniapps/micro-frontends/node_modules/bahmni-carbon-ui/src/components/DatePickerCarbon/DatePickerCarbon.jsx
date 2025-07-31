import React from "react";
import PropTypes from "prop-types";
import { DatePicker, DatePickerInput } from "carbon-components-react";
import moment from "moment";
import Title from "../Title/Title.jsx";
import "../../styles/carbon-conflict-fixes.scss";
import "../../styles/carbon-theme.scss";

const DatePickerCarbon = (props) => {
  const {
    onChange,
    value,
    title,
    minDate,
    testId,
    width,
    isDisabled,
    isRequired,
    placeholder,
    id,
    datePickerType,
    datePickerInputSize,
    dateFormat,
  } = props;
  let defaultTime = value;
  if (value && value instanceof moment) {
    defaultTime = value.format(dateFormat || "MM/DD/YYYY");
  }
  let titleText = title && <Title text={title} isRequired={isRequired} />;
  return (
    <div data-testid={testId || "datePicker"} className="date-picker-carbon">
      <DatePicker
        datePickerType={datePickerType || "single"}
        onChange={onChange}
        disabled={isDisabled}
        minDate={minDate}
        value={defaultTime}
        dateFormat={dateFormat || "m/d/Y"}
      >
        <DatePickerInput
          id={id}
          placeholder={placeholder || "mm/dd/yyyy"}
          labelText={titleText}
          size={datePickerInputSize || "md"}
          style={{ width: width || "250px" }}
          autoComplete={"off"}
          disabled={isDisabled}
          required={isRequired}
        />
      </DatePicker>
    </div>
  );
};

DatePickerCarbon.propTypes = {
  onChange: PropTypes.func,
  width: PropTypes.string,
  title: PropTypes.string,
  testId: PropTypes.string,
  isDisabled: PropTypes.bool,
  isRequired: PropTypes.bool,
  minDate: PropTypes.string,
  value: PropTypes.object,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  datePickerType: PropTypes.string,
  datePickerInputSize: PropTypes.string,
  dateFormat: PropTypes.string,
};

export default DatePickerCarbon;
