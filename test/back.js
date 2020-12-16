
console.log("back")

function getComment() {
    let payload = [{
        "ping": {
            "content": "rs:0"
        }
    }, {
        "ping": {
            "content": "ps:0"
        }
    }, {
        "thread": {
            "thread": "1463483922",
            "version": "20090904",
            "language": 0,
            "user_id": "53842185",
            "with_global": 1,
            "scores": 1,
            "nicoru": 0,
            "userkey": "1502173042.~1~MzCxfaTZL7rDZztXT4fhmR3fXdyv-_24iGol36KOkRA"
        }
    }, {
        "ping": {
            "content": "pf:0"
        }
    }, {
        "ping": {
            "content": "ps:1"
        }
    }, {
        "thread_leaves": {
            "thread": "1463483922",
            "language": 0,
            "user_id": "53842185",
            "content": "0-22:100,1000", //0-22の22は分単位の動画時間（秒は切り上げ）
            "scores": 1,
            "nicoru": 0,
            "userkey": "1502173042.~1~MzCxfaTZL7rDZztXT4fhmR3fXdyv-_24iGol36KOkRA"
        }
    }, {
        "ping": {
            "content": "pf:1"
        }
    }, {
        "ping": {
            "content": "rf:0"
        }
    }]
}

