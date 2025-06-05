/** Common helper utils goes hers
@author Vigneshwaran.P
**/
// 'use strict'

//lib imports
const moment = require('moment');
const WebFont = require("webfontloader");

/** To load JS file on demand
@api {public}
@param {string} filePath
@param {string} id
@param {function} callback
**/
exports.loadJSFile = (filePath, id, callback)=>{
    console.log("loadJSFile");
    if(!document.getElementById(id)){//skip if script already loaded
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.id=id?id:"";
        if(callback)script.onload=callback;

        document.getElementsByTagName("head")[0].appendChild(script);
        script.src = filePath;
    }else{
        callback();
    }
};

/** To extract URL from url with querystring
@api {public}
@param {string} URL
@return {string} URL
**/
exports.getPathFromUrl = (URL)=>{
    return URL.split("?")[0];
}
// Set data in localstorage key = string value = data
exports.localStorageSet =(key,value)=>{
   localStorage.setItem(key,JSON.stringify(value)); 
}
// Get data in localstorage key = string
exports.localStorageGet =(key)=>{
    return  JSON.parse(localStorage.getItem(key));      
}

/** Validate the URL 
@api {public}
@param {string} myURL
@return {boolean} true/false
**/
exports.isValidURL = (myURL)=> {
    const pattern = new RegExp('^(http|https):\\/\\/'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ //port
    '(\\?[;&amp;a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i');
    return pattern.test(myURL);
}

/** Removes querstring from URL 
@api {public}
@param {string} url
@param {string} parameter
@return {string} url
**/
exports.removeURLParameter = (url, parameter)=>{
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');   
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {    
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
                pars.splice(i, 1);
            }
        }
        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}

           
         

/** LMS Date Format
@api {public}
@param {string} date
@return {string} formatted date
 **/
exports.lmsDateFormat = function(date){
    return moment(date).format('DD-MMM-YYYY'); 
}

/** LMS Time Format
@api {public}
@param {string} time
@return {string} formatted time
 **/
exports.lmsTimeFormat = function(time){
    return moment(time).format('hh:mm A');
}

/** LMS Date and Time Format
@api {public}
@param {string} date and time
@return {string} formatted date and time
 **/
exports.lmsDateAndTimeFormat = function(date){
    return moment.utc(date).format('DD-MMM-YYYY hh:mm A');
}

/** LMS Date and Time Format with no UTC
@api {public}
@param {string} date and time
@return {string} formatted date and time
 **/
exports.lmsNonUTCDateAndTimeFormat = function(date){
    return moment(date).format('DD-MMM-YYYY hh:mm A');
}

/** Calculate Number of days between two  dates
 @api {public}
 @param {string} startDt 
 @param {string} EndDt 
 @returns {number} daysCount
 **/
exports.getDaysCountBetween = (startDt, EndDt) => {
    return moment(startDt).diff(moment(EndDt), 'days');
}


/** Calculate Number of hours between two dates
 @api {public}
 @param {string} startDt 
 @param {string} EndDt 
 @returns {number} hours
 **/
exports.getHoursBetweenDates = (startDt, EndDt) => {
    const days=moment(startDt).diff(moment(EndDt), 'days')
    let hrs=moment(startDt).diff(moment(EndDt), "hours")
    hrs = hrs - days*24; // convert to 12 hr format
    return hrs;
}


/**Generating the hexa decimal code
@api {public}
@param {string} String of _id
@returns {number} RGB code
 **/
exports.generateHexDecCode = (string) =>{
    if(string && string.length){
        let hash = 0;
        let color = '#';
        for (let hsCd = 0; hsCd < string.length; hsCd++) {
            hash = string.charCodeAt(hsCd) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        for (let clr = 0; clr < 3; clr++) {
            let value = (hash >> (clr * 8)) & 255;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return hexToRGB(color);
    }
    
}

//Converting hexa decimal code to RGB color code
function hexToRGB(hex, alpha){
    let alphaOpcty = alpha ? alpha : '0.32';
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
        if (alphaOpcty) {
          return "rgba(" + r + ", " + g + ", " + b + ", " + alphaOpcty + ")";
        } else {
          return "rgb(" + r + ", " + g + ", " + b + ")";
        }  
}

exports.hexToRGB = (hexaClrCd, alpha) => {
    return hexToRGB(hexaClrCd, alpha);
}
  

/** Get the client Timezone difference
 @api {public}
 @returns {number} hours
**/
exports.getClientTimeZoneDiff=()=>{
    return (new Date()).getTimezoneOffset();
}


/** To load the support fonts
 @api {public}
**/
exports.loadEditorSupportedFonts = () => {
	WebFont.load({
		custom: {
			families: ["Caveat", "Courier Prime", "EB Garamond", "Lobster", "Montserrat","Open Sans", "Roboto Mono"],
            urls: ['/assets/css/google-fonts.css']
        },
	});
};


/*it's for download a file with specific names*/
exports.dwnldExcelFileWithName = (data, type, filename) => {
    const blob = new Blob([data],{type:type}),
    url = window.URL.createObjectURL(blob),
    anchortag = document.createElement("a");
    document.body.appendChild(anchortag);
    anchortag.style = "display: none";
    anchortag.href = url;
    anchortag.download = filename;
    anchortag.click();
    window.URL.revokeObjectURL(url);
    anchortag.remove();
};

exports.isBeforeDate = (date) => {
    if(date){
        if(moment(date) < moment()){
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

exports.isSubtractOneDay = (date, day = 1) => {
    
    const modifyDt = moment(date).subtract(day, 'days');  // No need to wrap in new Date()
    // Format the modified date and return as local time
    return modifyDt.local().format('DD-MMM-YYYY hh:mm A');
}