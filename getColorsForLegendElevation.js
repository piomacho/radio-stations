const getColorFotLegendElevation = (e) => {
    if(e >= 0 && e < 50) {
        return 0x7f7fffff;
    } else if(e >= 50 && e < 85) {
        return 0x7fdcffff;
    } else if(e >= 85 && e < 185) {
        return 0x80ff89ff;
    } else if(e >= 185 && e < 250) {
        return 0xf9ff80ff;
    } else if(e >= 250 && e < 330) {
        return 0xffb680ff;
    } else if(e >= 330 && e < 400) {
        return 0xff7900ff;
    } else if (e >= 400 && e < 450) {
        return  0xff0000ff;
    } else if(e >= 450 && e < 500) {
        return 0x800000ff
    } else if(e >= 500 && e < 650) {
        return 0x520000ff
    }
    else if(e >= 600 && e < 750) {
        return 0x330000ff
    }
    else if(e >= 750) {
        return 0x140000ff
    }
    return 0xffffff00;
}

module.exports = { getColorFotLegendElevation }