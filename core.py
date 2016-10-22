from models import User, NUGU_FIELD_NAMES
import json
import os


BASE_PATH = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_PATH, 'db.sqlite3')


def nugu_list(session):
    return session.query(User).all()


def nugu_get(session, id):
    users = session.query(User).filter(User.id==id).all()
    if len(users) == 0:
        return None
    return users[0]


def nugu_search(session, text):
    query = '%%%s%%' % text
    users = session.query(User).filter(User.id.like(query) |
                                       User.name.like(query)).all()
    return users


def nugu_edit(session, id, info):
    users = session.query(User).filter(User.id==id).all()
    if len(users) == 0:
        user = User(id=id)
    else:
        user = users[0]

    for k, v in info.items():
        if k in NUGU_FIELD_NAMES:
            setattr(user, k, v)

    session.add(user)
    session.commit()


def nugu_remove(session, id):
    users = session.query(User).filter(User.id==id).all()
    if len(users) == 0:
        return

    session.delete(users[0])
    session.commit()
