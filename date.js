module.exports.getDate =  () => { //can just be exports.getDate

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    };

    return new Date().toLocaleDateString("en-US", options);
}


