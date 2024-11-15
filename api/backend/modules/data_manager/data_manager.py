"""Manage access to the database."""

import logging
from flask_sqlalchemy import SQLAlchemy
from flask import Flask

from api.backend.modules.data_manager.db import db
from api.backend.modules.data_manager.container import Container
from api.backend.modules.data_manager.profile import Profile
from api.backend.modules.data_manager.task import Task

logging.basicConfig(
    level=logging.INFO,
    datefmt="%Y-%m-%dT%H:%M:%S",
    format="%(asctime)-15s.%(msecs)03dZ %(levelname)-7s : %(name)s - %(message)s",
)
log = logging.getLogger(__name__)


class Database:

    def __init__(self, app: Flask):
        self.app = app
        db.init_app(app)

        @app.teardown_appcontext
        def close_connection(exception):
            if exception:
                db.session.rollback()
            db.session.remove()

    def ensure_tables_exist(self):
        with self.app.app_context():
            db.create_all()

    def save_profile(self, identity_id=None, name=None, email=None, institution=None):
        log.info(f"Saving profile: {name}, {email}, {institution}")
        profile = Profile(identity_id=identity_id, name=name, email=email, institution=institution)
        db.session.merge(profile)
        db.session.commit()

    def load_profile(self, identity_id):
        log.info(f"Loading profile: {identity_id}")
        return Profile.query.filter_by(identity_id=identity_id).first()

    def save_task(self, task_id=None, identity_id=None, task_status=None, task_create_time=None):
        log.info(f"Saving task: {task_id}, {identity_id}")
        task = Task(task_id=task_id, identity_id=identity_id, task_status=task_status, task_create_time=task_create_time)
        db.session.merge(task)
        db.session.commit()

    def load_tasks(self, identity_id):
        log.info(f"Loading task data for identity_id: {identity_id}")
        return Task.query.filter_by(identity_id=identity_id).all()

    def delete_task(self, task_id):
        log.info(f"Deleting task: {task_id}")
        Task.query.filter_by(task_id=task_id).delete()
        db.session.commit()

    def save_container(self, container_task_id=None, identity_id=None, base_image=None, name=None, location=None, description=None, dependencies=None, environment=None, commands=None):
        log.info(f"Saving container: {container_task_id}, {identity_id}")
        container = Container(
            container_task_id=container_task_id,
            identity_id=identity_id,
            base_image=base_image,
            name=name,
            location=location,
            description=description,
            dependencies=dependencies,
            environment=environment,
            commands=commands
        )
        db.session.merge(container)
        db.session.commit()

    def load_containers(self, identity_id):
        log.info(f"Loading container data for identity_id: {identity_id}")
        return Container.query.filter_by(identity_id=identity_id).all()

    def delete_container(self, container_task_id):
        log.info(f"Deleting container: {container_task_id}")
        Container.query.filter_by(container_task_id=container_task_id).delete()
        db.session.commit()
