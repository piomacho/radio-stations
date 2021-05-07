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
      backColor={"#494e6b"}
      backColorHover={"#1d1f2a"}
      label={"Pokaż okolicę anteny"}
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
      backColor={"#98878f"}
      backColorHover={"#2d282a"}
      label={"Wykonaj obliczenia dla jednego punktu"}
      onClick={callback}
    />
  );

  export const SendAllToOctaveButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#985e6d"}
      backColorHover={"#2d1c20"}
      label={"Wykonaj pełne obliczenia"}
      onClick={callback}
    />
  );

  export const ShowResultMapsButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#2A8956"}
      backColorHover={"#1e392a"}
      label={"Zaprezentuj wyniki - Leaflet"}
      onClick={callback}
    />
  );

  export const ShowResultGMapsMapsButton = ({ callback }: any) => (
    <Button
      width={180}
      height={50}
      backColor={"#3582b9"}
      backColorHover={"#0e3995"}
      label={"Zaprezentuj wyniki - Google Maps"}
      onClick={callback}
    />
  );

export const SubmitPlotMemoButton = memo(SubmitPlotButton);
export const SubmitMapsMemoButton = memo(SubmitMapsButton);