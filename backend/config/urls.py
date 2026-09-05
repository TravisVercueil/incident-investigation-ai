from django.urls import path
from investigations import views

urlpatterns = [
    path("api/scenarios", views.scenarios),
    path("api/investigations", views.investigations),
]
