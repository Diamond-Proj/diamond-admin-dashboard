from sqlalchemy import func

from api.backend.modules.data_manager.db import db


class Task(db.Model):
    task_id = db.Column(db.String, primary_key=True)
    task_name = db.Column(db.String)
    identity_id = db.Column(db.String(255), db.ForeignKey('profile.identity_id'))
    task_status = db.Column(db.String)
    task_create_time = db.Column(db.TIMESTAMP, default=func.now())
    log_path = db.Column(db.String)
    endpoint = db.Column(db.String)
