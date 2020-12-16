/**
 * [{
 *  "value": "",
 *  "time" : 00:00
 * }]
 * 
 * 
 */

const getComment = () => {
    let api_data = $('#js-initial-watch-data').attr('data-api-data');
    let api_json = JSON.parse(api_data);
    let req = new Array();
    let data = new Array();
    let num = 0;

    api_json["commentComposite"]["threads"].forEach((thread) => {
        if (thread["isActive"] == true) {

            data[num] = [
                { "ping": { "content": `ps:${num}` } },
                {
                    "thread": {
                        "thread": `${thread["id"]}`,
                        "version": "20090904",
                        "fork": `${thread["fork"]}`,
                        "language": 0,
                        "user_id": `${api_json["viewer"]["id"]}`,
                        "with_global": 1,
                        "scores": 1,
                        "nicoru": 3,
                        "userkey": `${api_json["context"]["userkey"]}`
                    }
                },
                { "ping": { "content": `${num}` } }
            ];
            num++;

            if (thread["isLeafRequired"] == true) {
                let x = parseInt(api_json["video"]["duration"] / 60) + 1;
                let y = x <= 1 ? 250 : x <= 10 ? 500 : 1000;
                data[num] = [
                    { "ping": { "content": `ps:${num}` } },
                    {
                        "thread_leaves": {
                            "thread": `${thread["id"]}`,
                            "language": 0,
                            "user_id": `${api_json["viewer"]["id"]}`,
                            "content": `0-${x}:100,${y},nicoru:100`,
                            "scores": 1,
                            "nicoru": 3,
                            "userkey": `${api_json["context"]["userkey"]}`
                        }
                    },
                    { "ping": { "content": `${num}` } }
                ];
                num++;
            }
        }
    });

    req = [{ "ping": { "content": "rs:0" } }, data, { "ping": { "content": "rf:0" } }].flat(2);
    return JSON.stringify(req);
}

const fetchComment = async () => {
    const req = getComment();
    const url = "https://nmsg.nicovideo.jp/api.json/";
    const res = await fetch(url, {method:"post", body: req });
    const data = await res.json();
    console.log(data);
}

$(function () {
    console.log("hello");
    $('.ControllerContainer').before('<div class="adin"></div>');
    $('.adin').css({
        "position": "relative",
        "top": 0,
        "right": 0,
        "bottom": 0,
        "left": 0,
        "height": "50px"
    });

    fetchComment();
});