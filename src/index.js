const color_comment = "#4990E2";
const color_nicoru = "#D9A300";
const color_back = "#252525";

const addin_container = "nico2-comment-voltage-container";
const addin_inner = "nico2-comment-voltage-inner";
const canvas_container = "container";
let canvas_id = "comment-voltage-canvas";

/** @type {Array<Number>} */
let json_data;

/** @type {Array<Number>} */
let comment_data;

/** @type {Array<Number>} */
let nicoru_data;

/**
 * 拡張機能情報出力
 */
 const titleInfo = () => {
    const manifest = chrome.runtime.getManifest();
    console.log(`${manifest.name}: version: ${manifest.version}`);
}

/** Request用Json作成 */
const makeJson = () => {
    let api_data = $('#js-initial-watch-data').attr('data-api-data');
    let api_json = JSON.parse(api_data);
    let req = new Array();
    let data = new Array();
    let num = 0;

    api_json["comment"]["threads"].forEach((thread) => {
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
 * コメント数を配列に格納
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

/**
 * ニコる数を配列に格納
 * @param {JSON} data_json 
 * @returns {Array<number>} Array\<number>[100]
 */
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

/**
 * コメント取得
 */
const getData = async () => {
    data_json = await fetchComment();
    comment_data = getCommentData(data_json);
    nicoru_data = getNicoruData(data_json);
}

/**
 * 拡張機能用DOM差し込み
 */
const addDom = () => {
    $('.ControllerContainer').before(`<div class="${addin_container}"></div>`);
    $(`.${addin_container}`).css({
        "position": "relative",
        "top": 0,
        "right": 0,
        "bottom": 0,
        "left": 0,
        "height": "50px",
        "width": "100%"
    });

    $(`.${addin_container}`).append(`<div class="${addin_inner}"></div>`);
    $(`.${addin_inner}`).css({
        "border-radius": "8px",
        "background-color": color_back,
        "height": "100%",
        "margin-top": "5px",
        "margin-left": "5px",
        "margin-right": "5px",
        "width": "100% - 10px"
    });

    $(`.${addin_inner}`).append(`<div class="${canvas_container}"></div>`);
    $(`.${canvas_container}`).css({
        "height": "100%",
        "margin-left": "5px",
        "margin-right": "5px",
        "width": "100% - 10px"
    });
}

/**
 * コメントボルテージ描画
 */
const drawVoltage = () => {
    const w = $(`.${canvas_container}`).width();
    const h = $(`.${canvas_container}`).height();
    const canvas_dom = `<canvas id=\"${canvas_id}\" width=\"${w}\" height=\"${h}\"></canvas>`;
    let canvas = document.getElementById(canvas_id);

    if (canvas) {
        canvas.remove();
    }

    $(`.${canvas_container}`).append(canvas_dom);
    $(`#${canvas_id}`).css({
        "width": "100%",
        "height": `${h}px`
    })

    canvas = document.getElementById(canvas_id);

    if (canvas.getContext) {
        /**@type {CanvasRenderingContext2D} */
        let ctx = canvas.getContext('2d');
        const api_data = $('#js-initial-watch-data').attr('data-api-data');
        const api_json = JSON.parse(api_data);
        const duration = api_json["video"]["duration"];

        let x = 0;
        let y = 0;
        let width = w / duration;
        let height = 0;

        // コメントデータ描画
        ctx.fillStyle = color_comment;
        comment_data.forEach((c, i) => {
            height = c;
            x = i * width;
            y = h - height;

            ctx.fillRect(x, y, width, height);
        });

        // ニコるデータ描画
        ctx.fillStyle = color_nicoru;
        nicoru_data.forEach((c, i) => {
            height = (c / h) * 100;
            height = height > 100 ? 100 : height;
            x = i * width;
            y = h - height;

            ctx.fillRect(x, y, width / 2, height);
        });
    }
}

/**
 * 全画面の切り替え監視
 */
const observer = () => {
    const body = document.body;
    const manifest = chrome.runtime.getManifest();
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            /** @type {string} className*/
            const className = mutation.target.className;
            if (className.includes("is-fullscreen")) {
                console.log(`${manifest.name}: 画面サイズ： フルスクリーン`);
                drawVoltage();
            } else {
                console.log(`${manifest.name}: 画面サイズ： 通常`);
                drawVoltage();
            }
        });
    });

    /** @type {MutationObserverInit}   */
    const config = { attributes: true };
    observer.observe(body, config);
}

/** メイン */
$(async function () {

    titleInfo();

    addDom();

    await getData();

    drawVoltage();

    observer();
});