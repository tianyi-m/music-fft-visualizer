let canvas = document.getElementById('MusicVisualizerCanvas');
let context = canvas.getContext('2d');
let audio = document.getElementById('song')
let spectgram = []
let wave_amp = []
let window_ms = 50
let song_url = audio.src
song_url = song_url.split('0/')[1]

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

$.ajax({
   type: "POST",
   url: "processed",
   data: { csrfmiddlewaretoken: csrftoken, song_url: song_url, window_ms: window_ms},
   success: storeData,
   error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         console.log('Error - ' + errorMessage)
     }
});

function storeData(response){
	spectgram = response['spectgram']
	wave_amp = response['wave_amp']
}
