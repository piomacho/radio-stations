import React from 'react';
import { SubmitButton, Wrapper } from './Button.styles';


export interface ButtonType{
    width?: number;
    height?: number;
    color?: string;
    colorHover?: string;
    backColor?: string;
    backColorHover?: string;
    label?: string;
    onClick: () => void;
}


const Button = ({label, width, height, color, colorHover, backColor, backColorHover, onClick} :ButtonType) => {
    return (
        <Wrapper width={width} height={height} onClick={onClick}>
            <SubmitButton color={color} colorHover={colorHover} backColor={backColor} backColorHover={backColorHover}>{label}</SubmitButton>
        </Wrapper>
    );
  
}

export default Button;