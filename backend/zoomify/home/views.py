
# Create your views here.
# urlpatterns = [
#     path('name/<str:sessionName>', views.parseSessionName, name="parseSessionName")
# ]
import requests
from django.shortcuts import render

from django.http import HttpResponse

# This is a route.
def index(request):
    return HttpResponse("ok")

def parseSessionName(request, sessionName):
    resp = requests.post("http://localhost:4000", json={"sessionName":sessionName, "role":1})
    print(resp.json())
    return render(request, 'session_name.html', {'sessionName':resp.json()})