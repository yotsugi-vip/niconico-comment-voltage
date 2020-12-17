/** Request用Json作成 */
const makeJson = () => {
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

/** 
 * コメントデータ取得 
 * */
const fetchComment = async () => {
    const req = makeJson();
    const url = "https://nmsg.nicovideo.jp/api.json/";
    const res = await fetch(url, { method: "post", body: req });
    const data = await res.json();
    return data;
}

/**
 * コメントを配列に格納
 * @param {JSON} data_json 
 * @returns {Array<number>} Array\<number>[100]
 */
const getCommentData = (data_json) => {
    const api_data = $('#js-initial-watch-data').attr('data-api-data');
    const api_json = JSON.parse(api_data);
    const duration = api_json["video"]["duration"];
    let arr = new Array(duration).fill(0);

    // コメントデータのみ抽出
    data_json.forEach((val) => {
        if (val["chat"]) {
            let _sec = parseInt(val["chat"]["vpos"] / 100);
            arr[_sec]++;
        }
    });

    console.log(arr);
    return arr;
}

/** メイン */
$(async function () {

    let data_json;
    let comments;

    console.log("NicoNico Comment Voltage");
    data_json = await fetchComment();
    comments = getCommentData(data_json);


    $('.ControllerContainer').before('<div class="adin"></div>');
    $('.adin').css({
        "position": "relative",
        "top": 0,
        "right": 0,
        "bottom": 0,
        "left": 0,
        "height": "50px"
    });

    $('.adin').append('<div class="adin-inner"></div>');
    $('.adin-inner').css({
        "border-radius": "8px",
        "background-color": "#252525",
        "height": "100%",
        "margin-top": "5px",
        "margin-left": "5px",
        "margin-right": "5px"
    });

    $(".adin-inner").append('<div class="canvas-container"></div>');
    $(".canvas-container").css({
        "height": "100%",
        "margin-left": "5px",
        "margin-right": "5px"
    });

    let w = $('.canvas-container').width();
    let h = $('.canvas-container').height();

    const canvas_id = "comment-voltage";
    console.log(w + "x" + h);
    const canvas_raw = `<canvas id=\"${canvas_id}\" width=\"${w}\" height=\"${h}\"></canvas>`;

    $('.canvas-container').append(canvas_raw);
    let canvas = document.getElementById(canvas_id);
    if (canvas.getContext) {

        /**@type {CanvasRenderingContext2D} */
        let ctx = canvas.getContext('2d');
        const api_data = $('#js-initial-watch-data').attr('data-api-data');
        const api_json = JSON.parse(api_data);
        const duration = api_json["video"]["duration"];

        ctx.fillStyle = 'blue';

        let x = 0;
        let y = 0;
        const width = w / duration;
        let height = 0;

        comments.forEach((c, i) => {
            height = (c / h) * 100;
            height = height > 100 ? 100 : height;
            x = i * width;
            y = h - height;

            ctx.fillRect(x, y, width, height);
        });
    }


});