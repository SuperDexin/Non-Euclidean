"use strict";

const FRONT     = 0;
const LEFT      = -1;
const RIGHT     = 1;
const BACK      = 3;

const TOP       = 0;
const R_TOP     = 1;
const R_BOTTOM  = 2;
const BOTTOM    = 3;
const L_BOTTOM  = 4;
const L_TOP     = 5;

const TOP4      = 0;
const RIGHT4    = 1;
const BOTTOM4   = 2;
const LEFT4     = 3;

const MAP_LEN = 5;

const BOX = "⧈";

let map_face = TOP;
let role_face = TOP4;
let role_pos4 = [2, 2];
let role_block;
let box_block;

let map6 = new Array(MAP_LEN);
let map4 = new Array(MAP_LEN);

let pos_show = false;

class blocks {
    constructor(value){
        this.value = value;
        this.neighbour = [null, null, null, null, null, null]; // TOP RT RB B LB LT
        this.box = false;
        this.finish = false;
        this.corner = false;
    }

    link(block, dir6){
        this.neighbour[dir6] = block;
    }

    get(dir4){ // FRONT LEFT RIGHT BACK
        let dir6 = switch_dir6(dir4);
        return this.neighbour[dir6];
    }
}

function make_map6(){
    let temp = [[0, 3], [0, 4], [0, 5], [1, 5], [2, 5]];
    for (let i = 0; i < MAP_LEN; i ++){
        map6[i] = new Array(MAP_LEN);
        for (let j = temp[i][0]; j < temp[i][1]; j++){
            map6[i][j] = new blocks(`(${i}, ${j})`);
        }
    }
    for (let i = 0; i < MAP_LEN; i ++){
        for (let j = temp[i][0]; j < temp[i][1]; j++){
            if (j < temp[i][1] - 1){
                map6[i][j].link(map6[i][j+1], R_TOP);
            }
            if (j > temp[i][0]){
                map6[i][j].link(map6[i][j-1], L_BOTTOM);
            }
            if (i > 0){
                if (j < temp[i-1][1]){
                    map6[i][j].link(map6[i-1][j], TOP);
                }
                if (j >= temp[i-1][0]){
                    map6[i][j].link(map6[i-1][j-1], L_TOP);
                }
            }
            if (i < MAP_LEN - 1){
                if (j >= temp[i+1][0]){
                    map6[i][j].link(map6[i+1][j], BOTTOM);
                }
                if (j < temp[i+1][1] - 1){
                    map6[i][j].link(map6[i+1][j+1], R_BOTTOM);
                }
            }
        }
    }
    map6[0][0].corner = true;
    map6[0][2].corner = true;
    map6[2][0].corner = true;
    map6[2][4].corner = true;
    map6[4][2].corner = true;
    map6[4][4].corner = true;
    role_block = map6[2][2];
}

function make_map4(){
    reset_map4();
    map4[role_pos4[0]][role_pos4[1]] = role_block;
    fill_map4(role_pos4, FRONT);
    fill_map4(role_pos4, BACK);
    if (role_face % 2 == 0){ // TOP and BOTTOM
        for(let i = 0; i < MAP_LEN; i++){
            fill_map4([i, role_pos4[1]], LEFT);
            fill_map4([i, role_pos4[1]], RIGHT);
        }
    }
    else{ // LEFT and RIGHT
        for(let i = 0; i < MAP_LEN; i++){
            fill_map4([role_pos4[0], i], LEFT);
            fill_map4([role_pos4[0], i], RIGHT);
        }
    }
    show_map4();
}

function reset_map4(){
    for (let i = 0; i < MAP_LEN; i ++){
        map4[i] = new Array(MAP_LEN);
        for (let j = 0; j < MAP_LEN; j++){
            map4[i][j] = new blocks("X");
        }
    }
}

function fill_map4(now_pos, dir4){
    let next_i = now_pos[0];
    let next_j = now_pos[1];
    let dir = switch_dir4(dir4);
    switch(dir){
        case TOP4: {
            next_i -= 1;
            if (next_i < 0){
                return;
            }
            break;
        }
        case LEFT4: {
            next_j -= 1;
            if (next_j < 0){
                return;
            }
            break;
        }
        case RIGHT4: {
            next_j += 1;
            if (next_j > MAP_LEN - 1){
                return;
            }
            break;
        }
        case BOTTOM4: {
            next_i += 1;
            if (next_i > MAP_LEN - 1){
                return;
            }
            break;
        }
    }

    let obj = map4[now_pos[0]][now_pos[1]].get(dir4);
    if (obj == null){
        return;
    }
    map4[next_i][next_j] = obj;
    fill_map4([next_i, next_j], dir4);
}

function show_map4(){
    let role_char = ["⇧", "⇨", "⇩", "⇦"];
    for (let i = 0; i < MAP_LEN; i ++){
        for (let j = 0; j < MAP_LEN; j++){
            let content = (pos_show && map4[i][j].value != "X") ? map4[i][j].value : "";
            if (map4[i][j].value == "X"){
                document.getElementById(`${i}${j}`).style.background = "gray";
            }
            else {
                document.getElementById(`${i}${j}`).style.background = "";
            }
            if (map4[i][j].box){
                content += "<br>";
                content += BOX;
            }
            if (map4[i][j].finish){
                content += "<br>A"
            }
            if (i == role_pos4[0] && j == role_pos4[1]){
                content += "<br>" + role_char[role_face];
            }
            document.getElementById(`${i}${j}`).innerHTML = content;
        }
    }
}

function init(){
    make_map6();
    generate_box();
    make_map4();
}

function turn(dir4){  
    role_face = switch_dir4(dir4);
    map_face = switch_dir6(dir4);
    make_map4();
}

function move(){
    let next = role_block.get(FRONT);
    if (next == null){
        return;
    }
    if (next.box){
        push();
    }
    else{
        role_block = next;
    }
    make_map4();
}

function switch_dir6(dir4){
    let dir6 = map_face;
    dir6 += dir4;
    if (dir6 < 0){
        dir6 += 6;
    }
    if (dir6 > 5){
        dir6 -= 6;
    }
    return dir6;
}

function switch_dir4(dir4){
    let dir = role_face;
    if (dir4 == BACK){
        dir += 2;
    }
    else{
        dir += dir4;
    }
    if (dir < 0){
        dir += 4;
    }
    if (dir > 3){
        dir -= 4;
    }
    return dir;
}


document.addEventListener('keydown', function(e) {
    let dir;
    switch (e.keyCode) {
        case 65: //A
        case 37: //LEFT
            dir = LEFT4;
            break;
        case 38: //UP
        case 87: //W
            dir = TOP4;
            break;
        case 39: //RIGHT
        case 68: //D
            dir = RIGHT4;
            break;
        case 40: //DOWN
        case 83: //S
            dir = BOTTOM4;
            break;
        case 74:{ //J
            turn(RIGHT);
            return;
        }
        default: return;
    }
    if (dir == role_face){
        move();
    }
    else{
        let t = dir - role_face;
        if (t < -1){
            t += 4;
        }
        if (t > 2){
            t -= 4;
        }
        if (t == 2){
            t = 3;
        }
        turn(t);
        move();
    }
 })

function generate_box(){
    let x = Math.floor(Math.random()*6);
    let temp = [[1,1], [1,2], [2,1], [2,3], [3,2], [3,3]];
    box_block = map6[temp[x][0]][temp[x][1]];
    box_block.box = true;
    let a, b;
    let m;
    do{
        m = false;
        a = Math.floor(Math.random()*5);
        b = Math.floor(Math.random()*5);
        if (map6[a][b] == undefined || (a == 2 && b == 2) || (a == temp[x][0] && b == temp[x][1])){
            m = true;
        }
        else{
            for (let i = 0; i < 6; i ++){
                if (map6[a][b].neighbour[i] != null){
                    if (map6[a][b].neighbour[i].box){
                        m = true;
                        break; 
                    }
                }
            }
        }
    }while(m);
    map6[a][b].finish = true;
}

function push(){
    let next = box_block.get(FRONT);
    if (next == null){
        return;
    }
    else{
        box_block.box = false;
        next.box = true;
        role_block = box_block;
        box_block = next;
    }
    if(box_block.finish){
        alert("恭喜你成功了！");
    }
    else if(box_block.corner){
        alert("箱子进角落了，已无路可走");
    }
}

function show_pos(){
    pos_show = !pos_show;
    document.getElementById("show_pos").innerHTML = pos_show ? "关闭坐标" : "打开坐标";
    show_map4();
}