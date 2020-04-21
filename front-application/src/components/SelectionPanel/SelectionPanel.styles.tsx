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
    margin-top: 20px;
    display: flex;
    justify-content: center;
`;

export const LoaderOverLay = styled('div')`
    background: none repeat scroll 0 0 rgba(0, 0, 0, 0.5);
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

export const SubmitPlotButton = ({ callback }: any) => (
    <Button
      width={150}
      height={50}
      backColor={"#686de0"}
      backColorHover={"#30336b"}
      label={"Create plot"}
      onClick={callback}
    />
  );

  export const SubmitMapsButton = ({ callback }: any) => (
    <Button
      width={150}
      height={50}
      backColor={"#2ecc71"}
      backColorHover={"#27ae60"}
      label={"Show Google Maps"}
      onClick={callback}
    />
  );

  export const SendToOctaveButton = ({ callback }: any) => (
    <Button
      width={150}
      height={50}
      backColor={"#ff7675"}
      backColorHover={"#d63031"}
      label={"Send to Octave"}
      onClick={callback}
    />
  );


export const SubmitPlotMemoButton = memo(SubmitPlotButton);
export const SubmitMapsMemoButton = memo(SubmitMapsButton);