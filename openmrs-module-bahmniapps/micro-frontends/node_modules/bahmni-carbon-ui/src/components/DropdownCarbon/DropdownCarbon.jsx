import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "carbon-components-react";
import Title from "../Title/Title.jsx";
import "../../styles/carbon-conflict-fixes.scss";
import "../../styles/carbon-theme.scss";

const DropdownCarbon = (props) => {
  const {
    options,
    placeholder,
    onChange,
    isDisabled,
    selectedValue,
    id,
    titleText,
    isRequired,
    label,
  } = props;
  const title = titleText && <Title text={titleText} isRequired={isRequired} />;
  return (
    <div
      className="dropdown"
      data-testid="select dropdown"
      style={{ marginRight: "5px" }}
    >
      <Dropdown
        id={id}
        items={options}
        onChange={onChange}
        titleText={title}
        disabled={isDisabled}
        label={label}
        initialSelectedItem={selectedValue}
        placeholder={placeholder}
      />
    </div>
  );
};

DropdownCarbon.propTypes = {
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  isRequired: PropTypes.bool,
  selectedValue: PropTypes.object,
  id: PropTypes.string,
  titleText: PropTypes.string,
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
};

export default DropdownCarbon;
