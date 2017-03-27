import os
from pathlib import Path
import sys

from yarl import URL

SLACK_TOKEN = os.environ.get('NUGU_SLACK_TOKEN')

DEBUG = bool(int(os.environ.get('DEBUG', '0')))

if DEBUG:
    DB_TYPE = 'sqlite'
    try:
        DB_HOST = Path(os.environ['NUGU_DB_PATH'])
        DB_HOST = '/' + str(DB_HOST.parent.resolve() / DB_HOST.name)
    except KeyError:
        print('Please set NUGU_DB_PATH environment variable for sqlite3 database file.',
              file=sys.stderr)
        sys.exit(1)
    DB_USER_ID = None
    DB_USER_PW = None
    DB_NAME = None
    DB_OPTS = None
else:
    DB_TYPE = 'mysql'
    try:
        DB_HOST    = os.environ['NUGU_DB_HOST']
        DB_USER_ID = os.environ['NUGU_DB_USER']
        DB_USER_PW = os.environ['NUGU_DB_PASSWORD']
    except KeyError:
        print('Please set NUGU_DB_HOST, NUGU_DB_USER, NUGU_DB_PASSWORD environment variables.',
              file=sys.stderr)
        sys.exit(1)
    DB_NAME = 'nugu'
    DB_OPTS = {'charset': 'utf8'}

if DB_TYPE == 'sqlite':
    DB_URL = URL('{}'.format(DB_HOST))
elif DB_TYPE == 'mysql':
    DB_URL = URL('{}://{}'.format(DB_TYPE, DB_HOST))

if DB_USER_ID:
    DB_URL = DB_URL.with_user(DB_USER_ID)
if DB_USER_PW:
    DB_URL = DB_URL.with_password(DB_USER_PW)
if DB_NAME:
    DB_URL = DB_URL / DB_NAME
if DB_OPTS:
    DB_URL = DB_URL.with_query(DB_OPTS)

if DB_TYPE == 'sqlite':
    DB_URL = '{}://'.format(DB_TYPE) + str(DB_URL)
elif DB_TYPE == 'mysql':
    DB_URL = str(DB_URL)
