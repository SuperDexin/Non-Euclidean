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

let map_face = TOP;
let role_face = TOP4;
let role_pos4 = [2, 2];
let role_block;

let map6 = new Array(MAP_LEN);
let map4 = new Array(MAP_LEN);

class blocks {
    constructor(value){
        this.value = value;
        this.neighbour = [null, null, null, null, null, null]; // TOP RT RB B LB LT
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
    for (let i = 0; i < MAP_LEN; i ++){
        for (let j = 0; j < MAP_LEN; j++){
            document.getElementById(`${i}${j}`).innerHTML = map4[i][j].value;
        }
    }
    let role_char = ["⇧", "⇨", "⇩", "⇦"]
    document.getElementById(`${role_pos4[0]}${role_pos4[1]}`).innerHTML = 
        map4[role_pos4[0]][role_pos4[1]].value + "<br>" + role_char[role_face];
}

function init(){
    make_map6();
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
    role_block = next;
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
        case 37:
            dir = LEFT4;
            break;
        case 38:
            dir = TOP4;
            break;
        case 39:
            dir = RIGHT4;
            break;
        case 40:
            dir = BOTTOM4;
            break;
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
    }
 })