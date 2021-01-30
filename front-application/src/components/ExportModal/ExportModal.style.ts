import styled from "styled-components";
import Trasmitter from './transmitter.svg';
import Adapter from './transmitter-tower.svg';

interface ExportModalType {
    error?: boolean;
}

export const TransmitterIcon = styled('div')`
    background-image: url(${Trasmitter});
    background-position: center;
    background-repeat: no-repeat;
    background-size: auto auto;
    padding: 0 20px;
    height: 50px;
`;

export const AdapterIcon = styled('div')`
    background-image: url(${Adapter});
    background-position: center;
    background-repeat: no-repeat;
    background-size: auto auto;
    padding: 0 20px;
    height: 50px;
`;

export const InputWrapper = styled("div")`
    display: flex;
    justify-content: center;
    padding-top: 25px;
    flex-direction: column;
`;

export const TemplateWrapper = styled('div')`
    padding-bottom: 20px;
`;

export const CloseButton = styled('div')`
    float: right;
    font-size: 25px;
    display: inline-block;
    color: #985e6d;
    cursor: pointer;

    &:hover {
        color: #2d1c20;
    }
`;

export const Title = styled('div')`
    font-size: 20px;
    padding: 10px 0;
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
    align-items: center;
`;

export const ExportWrapper = styled('div')`
    display: flex;
    margin-left: 20px;
`;

export const Message = styled('p')<ExportModalType>`
    color:  ${props => props.error ? `#ff0000` : `#88d317`};
    font-weight: 700;
`;

export const AdapterCoordsWrapper = styled('div')`
    display: flex;
    margin-bottom: 15px;
    align-items: center;


`;
export const Coord = styled('div')`
    font-weight: 700;
    color: #0f1626;
    text-align: center;
    padding-left: 10px;
`;

export const AdaptersHeader = styled('div')`
    font-weight: 700;
    color: #07889b;
    font-size: 20px;
    margin-bottom: 10px;
`;
export const TitleSpan = styled('span')`
    color: #ff533d;
    padding-bottom: 8px;
    font-weight: 700;
    padding-left: 10px;
`;

export const ValueSpan = styled('span')`
    color: #0f1626;
    font-size: initial;
`

export const ExportInputWrapper = styled('div')`
    display: flex;
    align-items: center;
    flex-direction: column;
`;
