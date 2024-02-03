document.getElementById("jwt").addEventListener("change", parseJWT);

function parseJWT() {
    var jwt= document.getElementById("jwt").value;
    // alert('Hari Bol ' + jwt + '.');
    // clean out whitespace
    jwt = jwt.replace(/\n/g, '')
    jwt = jwt.replace(/\ /g, '')

    // split and display token components
    jwt = jwt.split('.')
    // alert(jwt[0])
    // alert(jwt[1])
    // alert(jwt[2])
    
    try {
        document.getElementById("header").innerHTML = JSON.stringify(JSON.parse(atob(jwt[0])), null, 2)
    } catch (err) { 
        document.getElementById("header").innerHTML = "The Header is not properly encoded\n\n" + err 
    }

    try {
        document.getElementById("body").innerHTML = JSON.stringify(JSON.parse(atob(jwt[1])), null, 2)
    } catch (err) { 
        document.getElementById("body").innerHTML = "The Body is not properly encoded\n\n" + err 
    }

    document.getElementById("sig").innerHTML = jwt[2]

    // resize the textareas to show full text by height
    document.getElementById("header").style.height = (document.getElementById("header").scrollHeight) + "px";
    document.getElementById("body").style.height = (document.getElementById("body").scrollHeight) + "px";
    document.getElementById("sig").style.height = (document.getElementById("sig").scrollHeight) + "px";

    return
}

