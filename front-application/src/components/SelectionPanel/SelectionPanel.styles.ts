import styled from "styled-components";

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