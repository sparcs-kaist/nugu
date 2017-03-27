from datetime import datetime

from sqlalchemy import (Column, String, DateTime)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from .settings import DB_URL


NUGU_FIELDS = [
    {'id': 'name', 'name': '이름', 'hint': '뀨냥이'},
    {'id': 'ent_year', 'name': '학번', 'hint': '14'},
    {'id': 'org', 'name': '소속'},
    {'id': 'email', 'name': '이메일'},
    {'id': 'phone', 'name': '전화번호', 'hint': '010-xxxx-xxxx'},
    {'id': 'birth', 'name': '생일', 'hint': '1996-01-01'},
    {'id': 'dorm', 'name': '기숙사'},
    {'id': 'lab', 'name': '랩'},
    {'id': 'home_add', 'name': '집주소'},
    {'id': 'facebook_id', 'name': 'Facebook ID'},
    {'id': 'twitter_id', 'name': 'Twitter ID'},
    {'id': 'github_id', 'name': 'Github ID'},
    {'id': 'battlenet_id', 'name': 'Battlenet ID'},
    {'id': 'website', 'name': '홈페이지'},
    {'id': 'blog', 'name': '블로그'},
    {'id': 'created_on', 'name': '생성일', 'readonly': True},
    {'id': 'updated_on', 'name': '수정일', 'readonly': True},
]

NUGU_FIELD_NAMES = [field['id'] for field in NUGU_FIELDS
                    if not field.get('readonly', False)]

Base = declarative_base()


class User(Base):
    __tablename__ = 'user'

    id = Column(String(30), primary_key=True)
    name = Column(String(255), nullable=True)
    ent_year = Column(String(255), nullable=True)
    org = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(255), nullable=True)
    birth = Column(String(255), nullable=True)
    dorm = Column(String(255), nullable=True)
    lab = Column(String(255), nullable=True)
    home_add = Column(String(255), nullable=True)
    facebook_id = Column(String(255), nullable=True)
    twitter_id = Column(String(255), nullable=True)
    github_id = Column(String(255), nullable=True)
    battlenet_id = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    blog = Column(String(255), nullable=True)
    created_on = Column(DateTime, default=datetime.utcnow)
    updated_on = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @staticmethod
    def _gen_json(value_func):
        result = ['{', ]
        for i in NUGU_FIELDS:
            if i.get('readonly', False):
                continue
            result.append('    "%s": "%s",' % (i['id'], value_func(i)))
        result[-1] = result[-1][:-1]
        result.append('}')
        return '\n'.join(result)

    @staticmethod
    def default_json():
        return User._gen_json(lambda i: i.get('hint', ''))

    def to_json(self):
        return self._gen_json(lambda i: getattr(self, i['id']) or "")

    def __str__(self):
        return u'%s (%s, %s)' % (self.id, self.name, self.ent_year)


def create_session():
    engine = create_engine(DB_URL, pool_recycle=100)
    if not engine.dialect.has_table(engine, User.__tablename__):
        Base.metadata.create_all(engine)
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    return DBSession()
