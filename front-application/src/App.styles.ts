import styled from "styled-components";


export const AppWrapper = styled('div')`
    margin: 20px;
`;

// export const SelectBoxOption = styled('div')<{size: SelectSize}>`
//     align-items: center;
//     cursor: pointer;
//     display: flex;
//     width: inherit;
//     font-size: 12px;
//     background-color: ${props => props.theme.carousel.mainColor.white};
//     color: ${props => props.theme.carousel.mainColor.shade1};

//     ${props =>
//         props.size === SelectSize.SMALL &&
//         `
//             padding: 9px;
//             line-height: 1;
//     `};

//     ${props =>
//         props.size === SelectSize.MEDIUM &&
//         `
//             line-height: 1.25;
//             padding: 12px;
//     `};

//     :hover {
//         background-color: ${props => props.theme.carousel.mainColor.shade6};
//     }
// `;