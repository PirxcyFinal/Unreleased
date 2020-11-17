var generated_device_auths = false;
getDeviceAuths()
function getDeviceAuths() {
    console.log('Creating websocket, attempting to connect & send "start_device_code_process".');
    const socket = new WebSocket("wss://partybot.net/ws");
    socket.addEventListener("open", function(event) {
        var message = {
            type: "start_device_code_process",
            content: null,
        };
        socket.send(JSON.stringify(message));
    });
    socket.addEventListener("message", function(event) {
        var message = JSON.parse(event.data);
        console.log(message);
        if (message.type == "update_device_code_link") {
            console.log("Opening device code authorization link in new tab.");
            var button = document.getElementById("sign_in");
            button.setAttribute("onclick", `window.open('${message.content}', '_blank');`);
        } else if (message.type == "recieve_authorization_code") {
            console.log("Updating text bow with new device auth details.");
            var deviceAuths = JSON.parse(message.content);
            var textarea = document.getElementById("deviceAuthsText");
            textarea.innerHTML = `DEVICE_ID="${deviceAuths.deviceId}"\n` + `ACCOUNT_ID="${deviceAuths.accountId}"\n` + `SECRET="${deviceAuths.secret}"`;
            generated_device_auths = true;
        } else if (message.type == "login_expired") {
            alert("Failed to login in time, please try again. If you're having trouble, watch the tutorial.");
            location.reload(true);
        }
    });
}
function copyDeviceAuths() {
    var textarea = document.getElementById("deviceAuthsText");
    if (!generated_device_auths) {
        alert("Please perform step 1 & wait for the device auths.");
        return;
    }
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    document.execCommand("copy");
    console.log("Copied device auths.");
}
function uploadReplLink() {
    var url = document.getElementById("urlInput").value;
    if (url == "") {
        alert("Please enter a url before submitting.");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload-repl-url", false);
    xhr.send(JSON.stringify({
        url: url
    }));
    var data = JSON.parse(xhr.responseText);
    console.log(data);
    if (xhr.status == 200) {
        alert("Your bot has successfully been started, enjoy!");
    } else {
        if ("exception"in data) {
            if (data.exception == "ClientConnectorSSLError") {
                alert("Failed to add bot as it has not been started, please start your bot.");
            } else {
                alert(`Unknown error: ${data.exception}, please report it in the discord.`);
            }
        } else {
            alert(data.error);
        }
    }
}

