const getColorFotLegend = (e) => {
    if(e >= 35 && e < 48) {
        return 0x787da9ff;
    } else if(e >= 48 && e < 54) {
        return 0x7f7fffff;
    } else if(e >= 54 && e < 60) {
        return 0x7fdcffff;
    } else if(e >= 60 && e < 66) {
        return 0x80ff89ff;
    } else if(e >= 66 && e < 69) {
        return 0xf9ff80ff;
    } else if(e >= 69 && e < 74) {
        return 0xffb680ff;
    } else if(e >= 74 && e < 85) {
        return 0xff7900ff;
    } else if (e >= 85) {
        return  0xff0000ff;
    }
    return 0xFFFFFFFF;
}

module.exports = { getColorFotLegend }