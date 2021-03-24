let canvas = document.getElementById('MusicVisualizerCanvas');
let context = canvas.getContext('2d');
let audio = document.getElementById('song')
let spectgram = []
let wave_amp = []
let window_ms = 50
let song_url = audio.url

$.ajax({
   type: "POST",
   url: "{% url process_song %}",
   data: { csrfmiddlewaretoken: '{{ csrf_token }}', 'song_url': song_url, 'window_ms': window_ms},
   success: storeData
});

function storeData(response){
	console.log(response)
	spectgram = response['spectgram']
	wave_amp = response['wave_amp']
	console.log(spectgram)
	console.log(wave_amp)
}