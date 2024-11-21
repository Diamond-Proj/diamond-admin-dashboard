from api.backend.modules.data_manager.db import db


class Profile(db.Model):
    identity_id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    institution = db.Column(db.Text)
