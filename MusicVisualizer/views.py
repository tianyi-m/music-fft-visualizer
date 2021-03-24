from django.shortcuts import render, redirect
import librosa
import numpy as np

from .forms import MusicVisualizerForm
from .models import MusicVisualizer


def lastSong(request):
    MusicVisualizers = MusicVisualizer.objects.all()
    MusicVisualizer_last = MusicVisualizers[len(MusicVisualizers)-1]
    return render(request, 'MusicVisualizer.html', { 'MusicVisualizer' : MusicVisualizer_last})


def uploadSong(request):
    if request.method == 'POST':  
        form = MusicVisualizerForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('play_last_song')
    else:
        form = MusicVisualizerForm()
    return render(request, 'uploadSong.html', {'form' : form})

def processSong(request):
    song_url = request.POST['song_url']
    window_ms = request.POST['window_ms']
    print("====")
    print(song_url, window_ms)
    y, sr = librosa.core.load(song_url)
    spectgram = spectrogram(y, sr, window_ms/2, window_ms)
    wave_amp = wave_amp(y, sr, window_ms)
    return HttpResponse({'spectgram':spectgram, 'wave_amp':wave_amp})

def spectrogram(samples, sample_rate, stride_ms = 25.0, 
                          window_ms = 50.0, max_freq = None, eps = 1e-14):

    stride_size = int(0.001 * sample_rate * stride_ms)
    window_size = int(0.001 * sample_rate * window_ms)
    print(window_size)
    max_freq = int(sample_rate/2)

    # Extract strided windows
    truncate_size = (len(samples) - window_size) % stride_size
    samples = samples[:len(samples) - truncate_size]
    total_seg = (len(samples) - window_size) // stride_size + 1
    nshape = (window_size, total_seg)
    nstrides = (samples.strides[0], samples.strides[0] * stride_size)
    windows = np.lib.stride_tricks.as_strided(samples, 
                                          shape = nshape, strides = nstrides)
    
    assert np.all(windows[:, 1] == samples[stride_size:(stride_size + window_size)])

    # Window weighting, squared Fast Fourier Transform (fft), scaling
    weighting = np.hanning(window_size)[:, None]
    inner_pad = np.zeros(window_size)
    specgram = np.empty(nshape, dtype=np.float32) 
    
    for i in range(total_seg):
        window = windows[:, i]
        window_smooth = window * weighting[:,0]
        padded = np.append(window_smooth, inner_pad)
        fft = np.fft.rfft(padded)/window_size
        autopower = np.abs(fft * np.conj(fft))
        specgram[:, i] = autopower[:window_size]  
    
    # add this line if you want to amplify sounds with lower amplitutdes
    # specgram = 20*np.log10(specgram)
    return specgram

def wave_amp(samples, sample_rate, window_ms):
    stride_ms = window_ms/2
    stride_size = int(0.001 * sample_rate * stride_ms)
    total_seg = (len(samples) - window_size)
    wave_amp = np.empty((stride_size, total_seg), dtype=np.float32)

    for i in range(total_seg):
        weighting = np.hanning(stride_size)[:, None]
        y = samples[i*stride_size:(i+1)*stride_size]*weighting[:, 0]
        wave_amp[:, i] = y

    return wave_amp

