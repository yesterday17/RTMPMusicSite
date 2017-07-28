const express = require('express')
const http = require('http')
const ffmpeg = require('fluent-ffmpeg');
const mp3Duration = require('mp3-duration');




var imagePath = "public/bg.jpg";
var rtmp = "rtmp://txy.live-send.acg.tv/live-txy/",
    code = "?streamname=live_5756570_9523584&key=4538034d78aa78c768f5d47fac9e2ec7";

var outputPath = rtmp + code;

const offset = 60;

var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

var lastProgress = 0;

var play = liveMusic = function (musicStream) {
    return new Promise(function (resolve, reject) {
        console.log("Playing " + musicStream);
        mp3Duration(musicStream, function (err, duration) {
            var proc = ffmpeg(musicStream)
                //.input("concat:public/test.mp3|public/test2.mp3|public/test3.mp3")
                .input(imagePath)
                .loop(duration + offset)
                .audioCodec("libmp3lame")
                .audioBitrate(128)
                .on('start', function (cmd) {
                    console.log('Spawned FFmpeg with command: ' + cmd);
                })
                .on('error', function (err, stdout, stderr) {
                    console.error('error: ' + err.message);
                    console.error('stdout: ' + stdout);
                    console.error('stderr: ' + stderr);
                })
                .on('end', function () {
                    console.log('Processing finished !');
                    resolve();
                })
                .addOptions([
                    '-vcodec libx264',
                    '-preset veryfast',
                    '-c:a aac',
                    '-crf 22',
                    '-maxrate 1800k',
                    '-bufsize 3000k',
                    '-b:a 96k'
                ])
                .format('flv')
                .output(outputPath, {
                    end: true
                })
                .run();
        });
    })

}

var start = async function () {
    for(var j = 1;j<=4;j++){
        await play("public/" + j + ".mp3");
        await sleep(1000);
    }
}

start();