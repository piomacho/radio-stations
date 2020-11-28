import styled from "styled-components";
import Floppy from "./floppy.svg";

interface ExportModalType {
    error?: boolean;
}

export const FloppyIcon = styled('div')`
    background-color: 'rgb(223, 220, 227)';
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
    align-items: center;
    padding-top: 25px;
    flex-direction: column;
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
    width: 150px;
    margin-bottom: 5px;
`;

export const TypeSpan = styled("span")`
    text-align: center;
    padding: 9px 10px;
    margin-bottom: 5px;
    line-height: 25px;
    color: #99A3BA;
    background: #EEF4FF;
    border: 1px solid #99A3BA;
    transition: background .3s ease, border .3s ease, color .3s ease;
`;

export const InputContainer = styled('div')`
    display: flex;
    height: 45px;
    /* margin-right: 20px; */
    align-items: center;
    position: absolute;
    bottom: 15%;
`;

export const ExportWrapper = styled('div')`
    display: flex;
    margin-left: 20px;
`;

export const Message = styled('p')<ExportModalType>`
    color:  ${props => props.error ? `#ff0000` : `#2ecc71`};
    font-weight: 700;
`;

export const AdapterCoordsWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;

`;
export const Coord = styled('div')`
    font-weight: 700;
    color: #2980b9;
    text-align: center;
    display: flex;
    justify-content: center;
`;

export const AdaptersHeader = styled('div')`
    font-weight: 700;
    color: #2c3e50;
    font-size: 20px;
    margin-bottom: 10px;
`;

export const ExportInputWrapper = styled('div')`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

export const DistanceDisplay = styled('p')`
    font-weight: 700;
    margin-bottom: 30px;
`;

export const ProgressBarWrapper = styled('div')`
    width: 350px;
    margin-left: 30px;
    margin-top: 20px;
`;
