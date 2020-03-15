import styled from "styled-components";

interface ButtonType { 
    width?: number;
    height?: number;
    color?: string;
    colorHover?: string;
    backColor?: string;
    backColorHover?: string;
}

export const Wrapper = styled('div')<ButtonType>`
    width: ${props => props.width ?  props.width : '40'}px;
    height: ${props => props.height ?  props.height : '40'}px;
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

    &:hover {
        background: ${props => props.backColorHover ?  props.backColorHover : '#fff'};
        color: ${props => props.colorHover ?  props.colorHover : '#fff'};
        letter-spacing: 1px;
        -webkit-box-shadow: 0px 5px 40px -10px rgba(0,0,0,0.57);
        -moz-box-shadow: 0px 5px 40px -10px rgba(0,0,0,0.57);
        box-shadow: 5px 40px -10px rgba(0,0,0,0.57);
        transition: all 0.4s ease 0s;
    }
`;