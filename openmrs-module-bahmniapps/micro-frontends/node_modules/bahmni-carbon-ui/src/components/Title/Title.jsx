import React from "react";
import "./Title.scss";
import PropTypes from "prop-types";

const Title = (props) => {
  const { text, isRequired } = props;
  return (
    <div className="titleText">
      <span>{text + " "}</span>
      {isRequired && <span className="required">*</span>}
    </div>
  );
};

Title.propTypes = {
  text: PropTypes.string,
  isRequired: PropTypes.bool,
};
export default Title;
