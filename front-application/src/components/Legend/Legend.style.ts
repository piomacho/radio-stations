import styled from "styled-components";

interface LegendType {
    level: number;
}

export const LegendColorBlock = styled('div')<LegendType>`
    background-color: ${({ level }) => level === 48 ? '#7f7fff' : level === 54 ? '#7fdcff' : level === 60 ? '#80ff89' : level === 66 ?  '#f9ff80' : level === 69 ? '#ffb680' : level === 74 ? '#ff7900' : level === 85 ? '#ff0000' :  ''};
    height: 30px;
    width: 50px;
`;

export const LegendWrapper = styled('div')`
    display: flex;
    align-items: center;
`;