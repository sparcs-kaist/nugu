from slacker import Slacker
from core import nugu_list, nugu_get, nugu_search, nugu_edit, nugu_battlenet
from models import create_session, NUGU_FIELDS, NUGU_FIELD_NAMES
from msg import *
from settings import TOKEN
from datetime import datetime, timedelta
import asyncio
import json
import websockets
import os


slack = Slacker(TOKEN)
session = create_session()


def _user_list(users):
    result = list(map(lambda x: '- %s' % str(x), users))
    return '\n'.join(result)


def _user_info(user):
    result = [SL_MSG_USER_HEADER % user.id, ]
    for i in NUGU_FIELDS:
        value = getattr(user, i['id'])
        if not value:
            continue
        if type(value) == datetime:
            value = (value + timedelta(hours=9)).isoformat() + 'KST'
        result.append('- %s: %s' % (i['name'], value))
    return '\n'.join(result)


def _nugu_get(session, args):
    user = nugu_get(session, args[0])
    if not user:
        return SL_MSG_SEARCH_NO_RESULT
    return _user_info(user)


def _nugu_search(session, args):
    if len(args) < 1:
        return SL_MSG_SEARCH_ARG_REQ

    users = nugu_search(session, args[0])
    result = SL_MSG_SEARCH_RESULT % len(users)
    if len(users) == 0:
        return SL_MSG_SEARCH_NO_RESULT
    elif len(users) == 1:
        return _user_info(users[0])
    elif len(users) > 10:
        result += ' %s' % SL_MSG_SEARCH_MANY_RESULT
        users = users[:10]
    result += '\n\n%s' % _user_list(users)
    return result


def _nugu_edit(session, id, args):
    if len(args) < 2:
        return SL_MSG_MODIFY_KEY_REQ

    user = nugu_get(session, id)
    if not user:
        return SL_MSG_MODIFY_NO_USER

    key, value = args[0], ' '.join(args[1:])
    if key not in NUGU_FIELD_NAMES:
        return SL_MSG_MODIFY_KEY_INV

    nugu_edit(session, id, {key: value})
    return SL_MSG_MODIFY_SUCCESS


def _nugu_battlenet(session):
    users = nugu_battlenet(session)
    result = list(map(lambda x: '%s (%s, %s)' % (x.battlenet_id, x.name, x.ent_year), users))
    return '%s\n%s' % (SL_MSG_BATTLENET, ', '.join(result))


def _nugu_core(session, id, text):
    args = text.split(' ')[1:]
    if len(args) < 1:
        return SL_MSG_HELP

    if args[0].startswith('뀨냥'):
        return _nugu_get(session, ['samjo', ])
    elif args[0].startswith('검색'):
        return _nugu_search(session, args[1:])
    elif args[0].startswith('수정'):
        return _nugu_edit(session, id, args[1:])
    elif args[0].startswith('배틀넷'):
        return _nugu_battlenet(session)
    elif args[0].startswith('도움'):
        return SL_MSG_HELP
    return _nugu_get(session, args)


def _nugu(session, text, email):
    try:
        return _nugu_core(session, text, email)
    except Exception as e:
        return SL_MSG_ERROR % str(e)


def _get_id(userid):
    result = slack.users.info(userid).body
    email = result['user']['profile'].get('email', '')
    email_part = email.split('@')
    if len(email_part) != 2 or email_part[1] != 'sparcs.org':
        return None
    return email_part[0]


def handle(message):
    resp = ''
    if message['type'] != 'message' or \
            ('user' not in message or 'text' not in message):
        return

    text, channel = message['text'], message['channel']
    if not text.startswith('!누구') and not text.startswith('!nugu'):
        return

    id = _get_id(message['user'])
    if not id:
        return

    resp = _nugu(session, id, text)
    if resp:
        slack.chat.post_message(channel=channel, text=resp, as_user=True)


async def bot(endpoint):
    ws = await websockets.connect(endpoint)
    while True:
        message = await ws.recv()
        message = json.loads(message)
        handle(message)


def main():
    response = slack.rtm.start()
    endpoint = response.body.get('url', '')
    if not endpoint:
        print('main: cannot get endpoint; server sent=%s' % response)
        exit(1)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.get_event_loop().run_until_complete(bot(endpoint))
    asyncio.get_event_loop().run_forever()


if __name__ == '__main__':
    main()
