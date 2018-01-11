// Technobitch.com Audio player and waveform graphic generator
// Programmed by Derek Morris
// Version 0.0.1b

function tbAudio (songAuthor, songName, songFile, songWaveData, songID) {
    var sAuthor = songAuthor;
    var sName = songName;
    var sFile = songFile;
    var sWaveData = songWaveData;
    var id = songID;
    var normalizedSongWaveData = [];
    var width = 630;
    var height = 75;
    var barWidth = 2;
    var barSpacing = 1;
    var style = "standard";
    var defaultBarColor = "#888888";
    var playingBarColor = "#0000AA";
    var hoverBarColor = "#4444FF";
    var currentPos = 0;
    var mouseX = null;
    var playingAudioPosition = 0;

    var audioElement = document.createElement("audio");
    audioElement.setAttribute("src", songFile);
    audioElement.load();

    var div = document.getElementById(id);
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    div.appendChild(canvas);

    var waveCanvas = canvas.getContext("2d");
    var bRect = canvas.getBoundingClientRect();

    var my_gradient = waveCanvas.createLinearGradient(0, 0, 0, height);
    my_gradient.addColorStop(0, "#4444FF");
    my_gradient.addColorStop(1, "#0000AA");

    var my_gradient2 = waveCanvas.createLinearGradient(0, 0, 0, height / 2);
    my_gradient2.addColorStop(0, "#CCCCCC");
    my_gradient2.addColorStop(1, "rgba(255, 255, 255, 0.4");

    var my_gradient3 = waveCanvas.createLinearGradient(0, 0, 0, height);
    my_gradient3.addColorStop(0, "rgba(68, 68, 255, 0.9)");
    my_gradient3.addColorStop(1, "rgba(0, 0, 170, 0.9)");

    // ---- Custom Waveform Normalizing Algorithm ----
    var sum = 0;
    var largest = 0;

    for(i = 0; i < sWaveData.length; i++) {
        sum += Math.abs(sWaveData[i]);

        if(Math.abs(sWaveData[i]) > largest) {
            largest = Math.abs(sWaveData[i]);
        }
    }

    var normalize = sum / sWaveData.length;
    var adjustRatio = height / (height - ((largest - normalize) * (height / 1.25)));

    for(i = 0; i < sWaveData.length; i++) {
        j = Math.round(height * Math.abs(sWaveData[i]));

        if(j > normalize * height) {
            j -= (j - (height * normalize)) / 1.25;
        }

        if(j < normalize * height) {
            j += ((height * normalize)-j) / 3.75;
        }

        j = j * adjustRatio;
        normalizedSongWaveData.push(j);
    }
    // -----------------------------------------------

    // External functions
    this.play = function() {
        audioElement.play();
    };

    this.pause = function() {
        audioElement.pause();
    };

    // Internal functions
    function skipTo(stposition) {
        audioElement.currentTime = audioElement.duration * stposition;
    }

    function getTime() {
        return audioElement.currentTime;
    }
    
    function duration() {
        return audioElement.duration;
    }

    function percentPlayed() {
        return (getTime() / duration());
    }

    function drawWaveform(dwStart, dwEnd, dwColor) {
        waveCanvas.fillStyle = dwColor;

        while(Math.round(dwStart) % (barWidth + barSpacing) != 0) {
            dwStart += 1;
        }

        dwStart = Math.round(dwStart);

        for(i = dwStart; i < dwEnd; i += (barWidth + barSpacing))
        {
            var j = normalizedSongWaveData[Math.round(i * (normalizedSongWaveData.length / width))];
            waveCanvas.fillRect(i, (height - j) / 2, barWidth, j);
        }
    }

    function colorBottomWaveform(cbwColor) {
        waveCanvas.fillStyle = cbwColor;
        waveCanvas.fillRect(0, height/2, width, height/2);
    }

    function clearCanvas() {
        waveCanvas.clearRect(0, 0, width, height);
    }

    function drawMasterWaveform(dmwPos, dmwMousePos, color1, color2, color3, color4) {
        clearCanvas();
        if(dmwMousePos < dmwPos && dmwMousePos != null) {
            drawWaveform(0, dmwMousePos, color1);
            drawWaveform(dmwMousePos, dmwPos, color2);
            drawWaveform(dmwPos, width, color3);
            colorBottomWaveform(color4);
        } else if(dmwMousePos > dmwPos) {
            drawWaveform(0, dmwPos, color1);
            drawWaveform(dmwPos, dmwMousePos, color2);
            drawWaveform(dmwMousePos, width, color3);
            colorBottomWaveform(color4);
        } else {
            drawWaveform(0, dmwPos, color1);
            drawWaveform(dmwPos, width, color3);
            colorBottomWaveform(color4);
        }
        drawTimes();
    }

    function currentTimeFormat() {
        var stringMinutes;
        var stringSeconds;
        stringMinutes = Math.floor(audioElement.currentTime / 60).toString();
        stringSeconds = Math.floor(audioElement.currentTime - (stringMinutes * 60)).toString();
        if(stringSeconds.length == 1) {
            stringSeconds = "0" + stringSeconds;
        }
        return (stringMinutes + ":" + stringSeconds);
    }

    function durationFormat() {
        var stringMinutes;
        var stringSeconds;
        stringMinutes = Math.floor(audioElement.duration / 60).toString();
        stringSeconds = Math.floor(audioElement.duration - (stringMinutes * 60)).toString();
        if(stringSeconds.length == 1) {
            stringSeconds = "0" + stringSeconds;
        }
        return (stringMinutes + ":" + stringSeconds);
    }

    function drawTimes() {
        waveCanvas.fillStyle = my_gradient3;
        waveCanvas.fillRect(0, 0+40, 30, 15);
        waveCanvas.fillRect(width-30, 0+40, 30, 15);
        waveCanvas.font = "10px Arial";
        waveCanvas.fillStyle = "#FFFFFF";
        waveCanvas.fillText(currentTimeFormat(), 5, 11+40);
        waveCanvas.fillText(durationFormat(), width-30+5, 11+40);
    }

    audioElement.addEventListener("loadeddata", function() {
        if(audioElement.readyState >= 2) {
            drawMasterWaveform(currentPos, mouseX, my_gradient, '#AAAAFF', '#888888', my_gradient2);
            audioElement.removeEventListener('loadeddata', false);
        }
    });

    canvas.addEventListener("mousemove", function(evt) {
        bRect = canvas.getBoundingClientRect();
        mouseX = (evt.clientX - bRect.left);
        drawMasterWaveform(currentPos, mouseX, my_gradient, '#AAAAFF', '#888888', my_gradient2);
    });

    canvas.addEventListener("click", function(evt) {
        bRect = canvas.getBoundingClientRect();
        mouseX = (evt.clientX - bRect.left);
        skipTo(mouseX / width);
    });

    canvas.addEventListener("mouseleave", function() {
        mouseX = null;
        drawMasterWaveform(currentPos, mouseX, my_gradient, '#AAAAFF', '#888888', my_gradient2);
    });

    audioElement.addEventListener("timeupdate", function() {
        if(audioElement.duration > 0) {
            currentPos = percentPlayed()*width;
        }
        drawMasterWaveform(currentPos, mouseX, my_gradient, '#AAAAFF', '#888888', my_gradient2);
    });
}