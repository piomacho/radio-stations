import styled from "styled-components";

interface OverlayType {
    active: boolean;
}

export const MapLeaflet = styled('div')`
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 0;
    border-radius: 5px;
    margin: 20px;
`;

export const OverLayElement = styled('div')<OverlayType>`
    position: fixed;
    display: ${({active}) => active === true ? 'block' : 'none'};
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 2;
`
export const LoaderContainer = styled('div')`
    position: absolute;
    top: 50%;
    left: 50%;
`;