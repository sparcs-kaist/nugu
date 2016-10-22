from sqlalchemy import Table, Column, ForeignKey, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
import os


Base = declarative_base()
NUGU_FIELDS = ['name', 'ent_year', 'org', 'phone', 'birth', 'dorm',
               'facebook_id', 'twitter_id', 'github_id', 'battlenet_id',
               'website']
NUGU_HINT = {'name': '이름', 'ent_year': '학번', 'org': '소속',
             'phone': '전화번호', 'birth': '생일', 'dorm': '기숙사',
             'facebook_id': '페북', 'twitter_id': '트위터',
             'github_id': 'Github', 'battlenet_id': '배틀넷',
             'website': '홈페이지'}

class User(Base):
    __tablename__ = 'user'

    id = Column(String(30), primary_key=True)
    email = Column(String(200))
    name = Column(String(50))
    ent_year = Column(Integer)
    org = Column(String(200), nullable=True)
    phone = Column(String(100), nullable=True)
    birth = Column(String(30), nullable=True)
    dorm = Column(String(100), nullable=True)

    facebook_id = Column(String(100), nullable=True)
    twitter_id = Column(String(100), nullable=True)
    github_id = Column(String(100), nullable=True)
    battlenet_id = Column(String(100), nullable=True)
    website = Column(String(100), nullable=True)


    def all_info(self):
        resp = ["%s's information" % self.id, ]
        for f in NUGU_FIELDS:
            v = getattr(self, f)
            if not v:
                continue
            resp.append('\t%s: %s' % (NUGU_HINT[f], v))
        return '\n'.join(resp)


    def short_info(self):
        return str(self)


    def __str__(self):
        return u'%s (%s, %s)' % (self.id, self.name, self.ent_year)


def create_session(path):
    engine = create_engine('sqlite:///%s' % path)
    if not os.path.exists(path):
        Base.metadata.create_all(engine)

    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    return DBSession()

