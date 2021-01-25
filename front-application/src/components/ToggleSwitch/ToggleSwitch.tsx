import React from "react";
import {CheckBox, CheckBoxLabel, CheckBoxWrapper} from "./ToggleSwitch.styles";

export const ToggleSwitch = () => {
  return (
      <CheckBoxWrapper>
        <CheckBox id="checkbox" type="checkbox" />
        <CheckBoxLabel htmlFor="checkbox" />
      </CheckBoxWrapper>
  );
};