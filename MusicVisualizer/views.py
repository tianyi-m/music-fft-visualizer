from django.shortcuts import render

from .forms import MusicVisualizerForm
from .models import MusicVisualizer


def lastSong(request):
    MusicVisualizers = MusicVisualizer.objects.all()
    MusicVisualizer_last = MusicVisualizers[len(MusicVisualizers)-1]
    return render(request, 'MusicVisualizer/templates/MusicVisualizer.html', { 'MusicVisualizer' : MusicVisualizer_last})


def uploadSong(request):
    if request.method == 'POST':  
        form = MusicVisualizerForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
    else:
        form = MusicVisualizerForm()
    return render(request, 'MusicVisualizer/templates/MusicVisualizer.html', {'form' : form})
