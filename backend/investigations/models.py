from django.db import models


class Investigation(models.Model):
    session_key = models.CharField(max_length=40, db_index=True)
    scenario = models.CharField(max_length=40)
    mode = models.CharField(max_length=12)
    result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
