import React, { useEffect, useRef } from "react";
import "./NotificationCarbon.scss";
import { PropTypes } from "prop-types";
import { InlineNotification } from "carbon-components-react";

export function NotificationCarbon(props) {
  const {
    showMessage = false,
    title,
    onClose,
    messageDuration = 5000,
    lowContrast,
    kind,
    hideCloseButton,
  } = props;
  const ref = useRef(null);
  useEffect(() => {
    if (showMessage) {
      if (ref.current) {
        clearTimeout(ref.current);
      }
      ref.current = setTimeout(() => {
        onClose();
      }, messageDuration);
    }
  }, [showMessage]);

  return (
    <div className="alertContainer">
      {showMessage && (
        <div>
          <InlineNotification
            kind={kind || "success"}
            title={title}
            lowContrast={lowContrast || true}
            hideCloseButton={hideCloseButton || false}
          />
        </div>
      )}
    </div>
  );
}

NotificationCarbon.propTypes = {
  showMessage: PropTypes.bool,
  title: PropTypes.string,
  onClose: PropTypes.func,
  messageDuration: PropTypes.number,
  lowContrast: PropTypes.bool,
  kind: PropTypes.string,
  hideCloseButton: PropTypes.bool,
};
