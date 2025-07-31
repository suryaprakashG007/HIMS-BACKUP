import React from "react";
import NotificationCarbon from "./NotificationCarbon.jsx";

export default {
  title: "Notifications",
};

export const Primary = () => {
  return (
    <NotificationCarbon
      showMessage={true}
      title={"Success"}
      onClose={() => {}}
    />
  );
};
