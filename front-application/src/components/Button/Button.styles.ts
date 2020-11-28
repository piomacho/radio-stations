import styled from "styled-components";

interface ButtonType {
    width?: number;
    height?: number;
    color?: string;
    colorHover?: string;
    backColor?: string;
    backColorHover?: string;
    disabled?: boolean;
}

export const Wrapper = styled('div')<ButtonType>`
    width: ${props => props.width ?  `${props.width}px` : 'auto'};
    height: ${props => props.height ?  `${props.width}px` : 'auto'};
`;

export const SubmitButton = styled('a')<ButtonType>`
    color: ${props => props.color ?  props.color : '#fff '};
    text-decoration: none;
    background:${props => props.backColor ?  props.backColor : '#ed3330'};
    padding: 20px;
    border-radius: 5px;
    display: inline-block;
    border: none;
    transition: all 0.4s ease 0s;
    cursor: pointer;
    display: flex;
    align-content: center;
    justify-content: center;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 0 15px #ffebeb;

    &:hover {
        background: ${props => props.backColorHover ?  props.backColorHover : '#fff'};
        color: ${props => props.colorHover ?  props.colorHover : '#fff'};
        letter-spacing: 1px;
        box-shadow: 5px 40px -10px rgba(0,0,0,0.57);
        transition: all 0.4s ease 0s;
    }

    ${props => props.disabled && `
        background-color: gray;
        pointer-events: none;
    `}
`;

export const ButtonWrapper = styled("div")`
    position: absolute;
    bottom: 20px;
    right: 50px;
`;