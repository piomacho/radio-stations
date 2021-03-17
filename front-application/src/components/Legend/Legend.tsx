import React from 'react';
import { LegendColorBlock, LegendWrapper } from './Legend.style';


const levels = [48, 54, 60, 66, 69, 74, 85];
const Legend = () => {

    return (
        <LegendWrapper>
            {levels.map((level: number) =>
            (
                    <div>
                        <LegendColorBlock level={level}/>
                        <div>{level}</div>
                    </div>

         ))}
     </LegendWrapper>
    );

}

export default Legend;