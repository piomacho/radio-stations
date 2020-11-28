import styled from "styled-components";
import Bg from './img/bg.jpg';

export const AppWrapper = styled('div')`
    padding: 20px;
    height: 100vh;
    position: relative;
    background: linear-gradient( rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) ),  url(${Bg});
    object-fit: cover;
    background-size: cover;
    background-repeat: no-repeat;
`;