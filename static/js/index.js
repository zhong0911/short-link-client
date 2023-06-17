$(document).ready(function () {
    initShortLinks();
    $("#long-link").keyup(function () {
        checkLongLink()
    });
    $("#clear-history").click(function () {
        clearHistory()
    });
    $("#footer").load("https://www.antx.cc/static/html/footer/footer.html");
});
let debug = 'off';

function initShortLinks() {
    let protocol = $.cookie('protocol')
    if (protocol && (protocol === "https" || protocol === "https")) $("#protocol").val(protocol);
    else $.cookie('protocol', 'http', {expires: 30, path: "/"});
    let cookie = $.cookie('short_links');
    if (!cookie) {
        $.cookie('short_links', '[]', {expires: 1, path: "/"});
    } else {
        if (cookie === '[]') $("#clear").hide();
        if (debug === 'on') console.log(cookie);
        let short_links = JSON.parse(cookie);
        for (let i = 0; i < short_links.length; i++) {
            let short_link = short_links[i]['short_link'];
            let long_link = short_links[i]['long_link'];
            let generation_time = short_links[i]['generation_time'];
            let expiration_time = short_links[i]['expiration_time'];
            let remaining_days = ((new Date(expiration_time) - new Date(generation_time)) / (1000 * 3600 * 24)).toFixed(0);
            let list = `<tr><td><a class='text-decoration-none' target="_blank" href='${"https://" + short_link}'>${short_link}</a></td><td><a class='text-decoration-none' target="_blank" href='${long_link}'>${long_link}</a></td><td>${generation_time}</td><td>${expiration_time}</td><td>${remaining_days}</td></tr>`;
            $("#short-links").append(list)
        }
    }
}

function clearHistory() {
    $.cookie('short_links', '[]', {expires: 1, path: "/"});
    $("#short-links").empty()
}

function generateShortLInk() {
    if (checkLongLink()) {
        let protocol = $("#protocol").val();
        let long_link = protocol + "://" + $("#long-link").val();
        let expiration_time = '';
        let short_links = JSON.parse($.cookie('short_links'));
        for (let i = 0; i < short_links.length; i++) {
            let generated_long_link = short_links[i]['long_link'];
            if (long_link === generated_long_link) {
                $("#long-link-error").html(error + " 该长链接链接已被生成");
                return false
            }
        }
        $("#generate").prop('disabled', true).html("<span class='spinner-border spinner-border-sm'></span> 生成中...");
        let api = expiration_time ? 'https://u.antx.cc/api/gen.php?long_link=' + long_link + '&expiration_time=' + expiration_time : 'https://u.antx.cc/api/gen.php?long_link=' + long_link;
        $.post(api, function (data) {
            if (debug === 'on') console.log(data);
            setTimeout(function () {
                if (data['success']) {
                    $.cookie('protocol', protocol.replace("://", ""), {expires: 30, path: "/"});
                    $prompt.success("短链接生成成功");
                    let short_link = data['short_link'].replace("https://", "");
                    let generation_time = data['generation_time'];
                    let expiration_time = data['expiration_time'];
                    let remaining_days = ((new Date(expiration_time) - new Date(generation_time)) / (1000 * 3600 * 24)).toFixed(0);
                    let list = `<tr><td><a class='text-decoration-none' target="_blank" href='${"https://" + short_link}'>${short_link}</a></td><td><a class='text-decoration-none' target="_blank" href='${long_link}'>${long_link}</a></td><td>${generation_time}</td><td>${expiration_time}</td><td>${remaining_days}</td></tr>`;
                    $("#short-links").append(list);
                    let link_json = {
                            "short_link": short_link,
                            "long_link": long_link,
                            "generation_time": generation_time,
                            "expiration_time": expiration_time
                        }
                    ;
                    short_links.push(link_json);
                    let short_links_string = JSON.stringify(short_links);
                    $.cookie('short_links', short_links_string, {expires: 1, path: "/"})
                } else {
                    $prompt.error("短链接生成失败")
                }
                $("#generate").prop('disabled', false).html("生成短链接")
            }, 1000)
        }, 'json', false)
    } else {
    }
    return false
}

function checkLongLink() {
    let long_link = $("#long-link").val();
    if (long_link) {
        if (isUrl(long_link)) {
            if (!(long_link.startsWith('https:') || long_link.startsWith('http:'))) {
                $("#long-link-error").html("");
                return true
            } else {
                $("#long-link-error").html(error + " 长链接请勿包含协议头");
                return false
            }
        } else {
            $("#long-link-error").html(error + " 长链接格式错误");
            return false
        }
    } else {
        $("#long-link-error").html(error + " 长链接不可为空");
        return false
    }
}