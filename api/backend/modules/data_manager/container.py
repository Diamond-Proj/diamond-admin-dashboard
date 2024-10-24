from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Container(db.Model):
    container_task_id = db.Column(db.String, primary_key=True)
    identity_id = db.Column(db.String(255), db.ForeignKey('profile.identity_id'))
    base_image = db.Column(db.String)
    name = db.Column(db.String)
    location = db.Column(db.String)
    description = db.Column(db.Text)
    dependencies = db.Column(db.Text)
    environment = db.Column(db.Text)
    commands = db.Column(db.Text)
