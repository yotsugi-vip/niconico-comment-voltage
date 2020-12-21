const color_comment = "#4990E2";
const color_nucoru = "#D9A300";
const color_back = "#252525";

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

    return arr;
}

const getNicoruData = (data_json) => {
    const api_data = $('#js-initial-watch-data').attr('data-api-data');
    const api_json = JSON.parse(api_data);
    const duration = api_json["video"]["duration"];
    let arr = new Array(duration).fill(0);

    // ニコるデータのみ抽出
    data_json.forEach((val) => {
        if (val["chat"]) {
            let _sec = parseInt(val["chat"]["vpos"] / 100);
            if (val["chat"]["nicoru"]) {
                arr[_sec] += val["chat"]["nicoru"];
            }
        }
    });

    return arr;
}

const titleInfo = () => {
    //URL取得
    var host = location.hostname;
    var path = location.pathname;
    var now_location = host + path + "";
    console.log("NicoNico Comment Voltage");
}

/** メイン */
$(async function () {

    let data_json;
    let comments;
    let nicoru;

    titleInfo();

    data_json = await fetchComment();
    comments = getCommentData(data_json);
    nicoru = getNicoruData(data_json);

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
        "background-color": color_back,
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
    const canvas_raw = `<canvas id=\"${canvas_id}\" width=\"${w}\" height=\"${h}\"></canvas>`;

    $('.canvas-container').append(canvas_raw);
    let canvas = document.getElementById(canvas_id);

    if (canvas.getContext) {
        /**@type {CanvasRenderingContext2D} */
        let ctx = canvas.getContext('2d');
        const api_data = $('#js-initial-watch-data').attr('data-api-data');
        const api_json = JSON.parse(api_data);
        const duration = api_json["video"]["duration"];

        let x = 0;
        let y = 0;
        const width = w / duration;
        let height = 0;

        // コメントデータ描画
        ctx.fillStyle = color_comment;
        comments.forEach((c, i) => {
            //height = (c / h) * 100;
            //height = height > 100 ? 100 : height;
            height = c;
            x = i * width;
            y = h - height;

            ctx.fillRect(x, y, width, height);
        });

        // ニコるデータ描画
        ctx.fillStyle = color_nucoru;
        nicoru.forEach((c, i) => {
            height = (c / h) * 100;
            height = height > 100 ? 100 : height;
            x = i * width;
            y = h - height;

            ctx.fillRect(x, y, width / 2, height);
        });
    }


});