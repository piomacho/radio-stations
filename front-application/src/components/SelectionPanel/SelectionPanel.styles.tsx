import styled from "styled-components";
import Button from "../Button/Button";
import React, { memo } from "react";


export const Wrapper = styled('div')`
    margin: 40px;
    display: flex;
    flex-direction: column;
    padding: 10px;
`;

export const ButtonWrapper = styled('div')`
    margin: 20px 10px 0 0;
    display: flex;
    justify-content: center;
`;

export const LoaderOverLay = styled('div')`
    background: none repeat scroll 0 0 rgba(0, 0, 0, 0.75);
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 101;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const LoaderWrapper = styled('div')`
    z-index: 200;
`;

export const NavigationWrapper = styled('div')`
    display: flex;
    justify-content: center;
`
export const NavigationPanel = styled('div')`
    display: flex;
    justify-content: space-between;
    margin-top: 150px;
`;

export const SubmitPlotButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#686de0"}
      backColorHover={"#30336b"}
      label={"Create plot"}
      onClick={callback}
    />
  );

  export const SubmitMapsButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#2ecc71"}
      backColorHover={"#27ae60"}
      label={"Show Google Maps"}
      onClick={callback}
    />
  );

  export const SendToOctaveButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#ff7675"}
      backColorHover={"#d63031"}
      label={"Calculate one point"}
      onClick={callback}
    />
  );

  export const SendAllToOctaveButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#000f18"}
      backColorHover={"#005482"}
      label={"Get full calculation"}
      onClick={callback}
    />
  );


export const SubmitPlotMemoButton = memo(SubmitPlotButton);
export const SubmitMapsMemoButton = memo(SubmitMapsButton);