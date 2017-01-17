'use strict';
const fs = require('fs');
//fsはファイルを扱うためのモジュール
const readline = require('readline');
//readlineはファイルを一行ずつ読み込むためのモジュール
const rs = fs.ReadStream('./popu-pref.csv');
//（）内のファイルからファイルの読み込みを行うStreamを作成する。streamとは非同期の情報を扱うための概念。
const rl = readline.createInterface({ 'input': rs, 'output': {} });
//rsをreadlineオブジェクトのinputとして設定し、rlオブジェクトを作成する。
const map = new Map();
//key:都道府県　value:集計データのオブジェクト
rl.on('line', (lineString) => {
    //rlオブジェクトでlineというイベントが発生したら無名関数を呼び出す
    const columns = lineString.split(',');
    //lineStringで与えられた文字列をカンマで分割して、それをcolumnsという配列にする
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    //配列となったcolumnsから並び順の番号にアクセスしてそれぞれの変数に保存
    if (year === 2010 || year === 2015) {
        let value = map.get(prefecture); //!valueを通った保存されたオブジェクトが取得される。ここでletを使ってる理由は再代入をするため。
        if (!value) { //都道府県を取得してきているが始めvalueが空なのでここを通る。別の県になればここを通る。項目ごとに通したいときに有効
            value = {
                p10: 0, //2010
                p15: 0, //2015
                change: null //人口変化率とするがここではunllとする
            };
        }
        if (year === 2010) {
            value.p10 += popu;
        }
        if (year === 2015) {
            value.p15 += popu;
        }
        map.set(prefecture, value); //ここで連想配列へ格納している
    }
    
});

rl.resume();
    //resumeメソッドを呼び出し、ストリームに情報を流し始める。
rl.on('close', () =>{　//closeイベントはすべての行を読み終わった際に呼び出される
    for(let pair of map){ //ここでいうmapには添字のprefectureと値のvalueが入っている
        const betu = pair[1]; //mapの中の値をbetuに代入している（テキストだとvalueになってる）、valueは他でletで使っているが他はif文の中で使っているのでまた使える
        betu.change = betu.p15 / betu.p10;
    }
    const rankingArray = Array.from(map).sort((p1,p2) => { //sort関数を使っている、正の数で返ってくればp2が前に来る
        return p2[1].change - p1[1].change;
    });
    const rankingStrings = rankingArray.map((p) => { //map関数を使っている、一括で変更するときに使える
        return p[0] + ': ' + p[1].p10 + '=>' + p[1].p15 + ' 変化率:' + p[1].change;
    });

    console.log(rankingStrings);
    
});
    
