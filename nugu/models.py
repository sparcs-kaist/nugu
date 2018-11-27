from datetime import datetime

from sqlalchemy import (Boolean, Column, DateTime, String)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from .settings import DB_URL

NUGU_FIELDS = [
    {
        'id': 'name',
        'name': '이름',
        'hint': '뀨냥이',
        'type': String(255),
        'nullable': True,
    },
    {
        'id': 'is_private',
        'name': '외부 비공개',
        'hint': 'y or n',
        'type': Boolean,
        'default': True
    },
    {
        'id': 'is_developer',
        'name': '개발자인가',
        'hint': 'y or n',
        'type': Boolean,
        'default': False
    },
    {
        'id': 'is_designer',
        'name': '디자이너인가',
        'hint': 'y or n',
        'type': Boolean,
        'default': False
    },
    {
        'id': 'is_undergraduate',
        'name': '학부생인가',
        'hint': 'y or n',
        'type': Boolean,
        'default': True
    },
    {
        'id': 'ent_year',
        'name': '학번',
        'hint': '2018',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'org',
        'name': '소속',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'email',
        'name': '이메일',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'phone',
        'name': '전화번호',
        'hint': '010-xxxx-xxxx',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'birth',
        'name': '생일',
        'hint': '1996-01-01',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'dorm',
        'name': '기숙사',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'lab',
        'name': '랩',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'home_add',
        'name': '집주소',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'github_id',
        'name': 'Github ID',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'linkedin_url',
        'name': 'LinkedIn URL',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'behance_url',
        'name': 'Behance URL',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'facebook_id',
        'name': 'Facebook ID',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'twitter_id',
        'name': 'Twitter ID',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'battlenet_id',
        'name': 'Battlenet ID',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'website',
        'name': '홈페이지',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'blog',
        'name': '블로그',
        'type': String(255),
        'nullable': True
    },
    {
        'id': 'created_on',
        'name': '생성일',
        'type': DateTime,
        'readonly': True,
        'default': datetime.utcnow
    },
    {
        'id': 'updated_on',
        'name': '수정일',
        'type': DateTime,
        'readonly': True,
        'default': datetime.utcnow,
        'onupdate': datetime.utcnow
    },
]

NUGU_FIELD_NAMES = [field['id'] for field in NUGU_FIELDS
                    if not field.get('readonly', False)]

Base = declarative_base()


class User(Base):
    __tablename__ = 'user'

    id = Column(String(30), primary_key=True)

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
        return self._gen_json(lambda i: self.get_attr_as_string(i['id']) or "")

    def __str__(self):
        return u'%s (%s, %s)' % (self.id, self.name, self.ent_year)

    def get_attr_as_string(self, field_id):
        value = getattr(self, field_id)
        column_type = next(x for x in NUGU_FIELDS if x['id'] == field_id)['type']
        if column_type == Boolean:
            return 'y' if value else 'n'

        return value
        # print(isinstance(column_type, String))

    def set_attr_by_string(self, field_id, value):
        column_type = next(x for x in NUGU_FIELDS if x['id'] == field_id)['type']

        if column_type == Boolean:
            if value in ['TRUE', 'True', 'true', 'T', 't', 'YES', 'Yes', 'yes', 'Y', 'y', '1']:
                value = True
            elif value in ['FALSE', 'False', 'false', 'F', 'f', 'NO', 'No', 'no', 'N', 'n', '0']:
                value = False
            else:
                value = value != ""

        setattr(self, field_id, value)


for field in NUGU_FIELDS:
    kwargs = {}
    for kwarg in ['nullable', 'default', 'onupdate']:
        if kwarg in field:
            kwargs[kwarg] = field[kwarg]
    setattr(User, field['id'], Column(field['type'], **kwargs))


def create_session():
    engine = create_engine(DB_URL, pool_recycle=100)
    if not engine.dialect.has_table(engine, User.__tablename__):
        Base.metadata.create_all(engine)
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    return DBSession()
