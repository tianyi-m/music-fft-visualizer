let canvas = document.getElementById('MusicVisualizerCanvas');
let context = canvas.getContext('2d');
let audio = document.getElementById('song')
let spectgram = []
let wave_amp = []
let ymax = 0
let stride_size = 0
let x_interval = 0
let window_ms = 50
let song_url = audio.src
song_url = song_url.split('0/')[1]

window.onload = function(){
	init(context);
	window.addEventListener("resize", init, false);
	context.fillStyle = 'black';
	let x = context.canvas.width
	let y = Math.floor(context.canvas.height * 0.2)
	context.beginPath();
	context.moveTo(0, y);
	context.lineTo(x, y);
	context.stroke();
}

function init(context){
	let width = window.innerWidth
	let height = window.innerHeight
	context.canvas.width = width;
	context.canvas.height = height;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
console.log(csrftoken)

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

let canPlay = false
let duration = 30
for (let i = 0; i < audio.duration; i += duration){
	if (i+duration < audio.duration){
		//processSong(i, duration)
	} else {
		//processSong(i, audio.duration-i)
	}
}

canPlay = true

audio.addEventListener('play', function(){
	if !canPlay{
		audio.pause()
	} else {
		myInterval = setInterval(visualizeMusic, window_ms);
	}
});

let interval = 1

function visualizeMusic(){
	if !audio.paused{
		time_idx = Math.floor(audio.currentTime / (0.001* window_ms / 2)) 
		paintFreq(time_idx)
		paintAmp(time_idx)
		context.clearRect(0, 0, canvas.width, canvas.height);
	} else {
		clearInterval(myInterval)
	}
}

function paintFreq(time_idx){
	let freq = spectgram[time_idx]
	let bins_num = freq.length
	let width = context.canvas.width
	let height = context.canvas.height
	let bin_len = Math.floor(width / bins_num)
	context.fillStyle = 'black';
	for (let x = 0; x < bins_num; x++){
		let scale = 500 / Math.max(freq)
		let amp = Math.floor(freq[x] * scale)
		context.fillRect(x * bin_len, height - amp, bin_len, height);
	}
}

seg = 500 / (window_ms / 2)
paint_seg = Math.floor(context.canvas.width / (seg + 2*2))
if canPlay{
	x_interval = Math.floor(paint_seg / stride_size)
}

function paintAmp(time_idx){
	context.fillStyle = 'black';
	if (time_idx >= seg - 1){
		let x = paint_seg * 2
		let y = Math.floor(context.canvas.height * 0.2)
		paintEdge(0, x)
		scale = 50 / ymax
		context.beginPath();
		context.moveTo(x, y);
		for (let time_idx_seg = time_idx - seg; time_idx_seg <= seg; time_idx_seg++){
			for (let amp in wave_amp[time_idx_seg]){
				let y = Math.floor(y - amp * scale)
				context.lineTo(x + x_interval,  y);
				x += x_interval
			}
		}
		paintEdge(x, context.canvas.width)
	} else {
		let x = paint_seg * (1 + seg - time_idx)
		let y = Math.floor(context.canvas.height * 0.2)
		paintEdge(0, x)
		scale = 50 / ymax
		context.beginPath();
		context.moveTo(x, y);
		for (let time_idx_seg = 0; time_idx_seg <= time_idx; time_idx_seg++){
			for (let amp in wave_amp[time_idx_seg]){
				let y = Math.floor(y - amp * scale)
				context.lineTo(x + x_interval, y);
				x += x_interval
			}
		}
		paintEdge(x, context.canvas.width)
	}
}

function paintEdge(x1, x2){
	let y = Math.floor(context.canvas.height * 0.2)
	context.beginPath();
	context.moveTo(x1, y);
	context.lineTo(x2, y);
	context.stroke();
}

function processSong(startSec, duration){
	$.ajax({
		type: "POST",
		url: "processed",
		data: { csrfmiddlewaretoken: csrftoken, song_url: song_url, window_ms: window_ms, startSec: startSec, duration: duration},
		success: storeData,
		error: function(xhr, status, error){
			var errorMessage = xhr.status + ': ' + xhr.statusText
			console.log('Error - ' + errorMessage)
		}
});
}

function storeData(response){
	for (var spectgram_step in response['spectgram']){
		spectgram.push(spectgram_step)
	}
	for (var wave_amp_step in response['wave_amp']){
		wave_amp.push(wave_amp_step)
	}
	ymax = response['ymax']
	stride_size = spectgram[0].length
	console.log(spectgram)
	console.log(wave_amp)
}


