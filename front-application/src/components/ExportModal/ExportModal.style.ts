import styled from "styled-components";
import Floppy from "./floppy.svg";



export const FloppyIcon = styled('div')`
    background-color: #fff;
    background-image: url(${Floppy});
    background-position: center;
    background-repeat: no-repeat;
    background-size: auto auto;
    padding: 0 10px;
    height: 50px;
`;

export const InputWrapper = styled("div")`
    display: flex;
    justify-content: center;
    padding-top: 60px;
`;

export const Input = styled("input")`
    display: block;
    width: 30%;
    outline: none;
    padding: 8px 16px;
    line-height: 25px;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    color: #99A3BA;
    background: #fff;
    transition: border .3s ease;
`;

export const TypeSpan = styled("span")`
    text-align: center;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 25px;
    color: #99A3BA;
    background: #EEF4FF;
    border: 1px solid #99A3BA;
    transition: background .3s ease, border .3s ease, color .3s ease;
`
// export const