from .models import User, NUGU_FIELD_NAMES


def nugu_list(session):
    return session.query(User).order_by(User.ent_year, User.id).all()


def nugu_get(session, id):
    users = session.query(User).filter(User.id == id).all()
    if len(users) == 0:
        return None
    return users[0]


def nugu_search(session, text):
    query = '%%%s%%' % text
    users = session.query(User).\
        filter(User.id.like(query) | User.name.like(query)).\
        order_by(User.ent_year.desc(), User.id).all()
    return users


def nugu_edit(session, id, info):
    users = session.query(User).filter(User.id == id).all()
    if len(users) == 0:
        user = User(id=id)
    else:
        user = users[0]

    for k, v in info.items():
        if k in NUGU_FIELD_NAMES:
            setattr(user, k, v.strip())

    session.add(user)
    session.commit()


def nugu_remove(session, id):
    users = session.query(User).filter(User.id == id).all()
    if len(users) == 0:
        return

    session.delete(users[0])
    session.commit()


def nugu_battlenet(session):
    return session.query(User).filter(User.battlenet_id != None,
                                      User.battlenet_id != '').all()
