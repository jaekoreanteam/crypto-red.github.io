function loadJSON(url, callback_function) {

    let data_file = url;
    let http_request = new XMLHttpRequest();
    try{
        // Opera 8.0+, Firefox, Chrome, Safari
        http_request = new XMLHttpRequest();
    }catch (e) {
        // Internet Explorer Browsers
        try{
            http_request = new ActiveXObject("Msxml2.XMLHTTP");

        }catch (e) {

            try{
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e) {
                // Something went wrong
                callback_function("Cannot load data", null);
            }

        }
    }

    http_request.open("GET", url, true);


    http_request.onreadystatechange = function() {

        if (http_request.readyState == 4 && http_request.status == 200) {

            try {

                let jsonObj = JSON.parse(http_request.responseText);
                callback_function(null, jsonObj);
            }catch(e) {

                callback_function("Cannot understand response from network.", null);
            }

        }else if(http_request.readyState == 4 && http_request.status == 404){

            callback_function("Error 404", null);
        }
    }

    try {

        http_request.send();
    }catch (e) {

        callback_function("Failed to fetch", null);
    }
}

function postDATA(url, data, callback_function) {

    let http_request = new XMLHttpRequest();
    try{
        // Opera 8.0+, Firefox, Chrome, Safari
        http_request = new XMLHttpRequest();
    }catch (e) {
        // Internet Explorer Browsers
        try{
            http_request = new ActiveXObject("Msxml2.XMLHTTP");

        }catch (e) {

            try{
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e) {
                // Something went wrong
                callback_function("Cannot load data", null);
                return;
            }

        }
    }

    http_request.open("POST", url, true);
    http_request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    http_request.onreadystatechange = function() {

        if (http_request.readyState == 4 && http_request.status == 200) {

            try {

                let jsonObj = JSON.parse(http_request.responseText);
                callback_function(null, jsonObj);
            }catch(e) {

                callback_function("Cannot understand response from network.", null);
            }

        }else if(http_request.readyState == 4 && http_request.status == 404){

            callback_function("Error 404", null);
        }
    }

    try {

        http_request.send(data);
    }catch(e) {

        callback_function("Failed to post", null);
    }
}

module.exports = {
    loadJSON: loadJSON,
    postDATA: postDATA
};
