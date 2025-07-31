import React from "react";
import { Tooltip } from "carbon-components-react";
import PropTypes from "prop-types";
import "../../styles/carbon-conflict-fixes.scss";
import "../../styles/carbon-theme.scss";

export function TooltipCarbon(props) {
  const { content, icon } = props;

  return (
    <Tooltip align="start" renderIcon={icon}>
      {content}
    </Tooltip>
  );
}

TooltipCarbon.propTypes = {
  content: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
    .isRequired,
  icon: PropTypes.element,
};
