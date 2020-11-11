const getColorFotLegend = (e) => {
    if(e >= 35 && e < 48) {
        return "#787da9"
    } else if(e >= 48 && e < 54) {
        return "#7f7fff"
    } else if(e >= 54 && e < 60) {
        return "#7fdcff";
    } else if(e >= 60 && e < 66) {
        return "#80ff89";
    } else if(e >= 66 && e < 69) {
        return "#f9ff80";
    } else if(e >= 69 && e < 74) {
        return "#ffb680";
    } else if(e >= 74 && e < 85) {
        return "#ff7900";
    } else if (e >= 85) {
        return  "#ff0000";
    }
    return "#00000000"
}

module.exports = { getColorFotLegend }