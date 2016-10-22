from slacker import Slacker
from core import nugu
from models import create_session
from settings import TOKEN
import asyncio
import json
import websockets
import os


slack = Slacker(TOKEN)
session = create_session(DB_PATH)

def nugu_core(session, text, email):
    args = text.split(' ')
    if len(args) < 2:
        return MSG_HELP

    if args[1].startswith('검색'):
        return _nugu_search(session, email, args)
    elif args[1].startswith('수정'):
        return _nugu_modify(session, email, args)
    elif args[1].startswith('목록'):
        return _nugu_list(session)
    elif args[1].startswith('뀨냥'):
        return '냥><'
    elif args[1].startswith('도움'):
        return MSG_HELP
    return _nugu_get(session, email, args)


def nugu(session, text, email):
    try:
        return _nugu_core(session, text, email)
    except Exception as e:
        return MSG_ERROR % str(e)

def _parse_email(email):
    e = email.split('@')
    if len(e) != 2:
        return False, ''
    if e[1] == 'sparcs.org':
        return True, e[0]
    return False, ''


def _get_email(userid):
    result = slack.users.info(userid).body
    return result['user']['profile']['email']


def handle(message):
    resp = ''

    if message['type'] == 'message' and \
            'user' in message and 'text' in message:
        text = message['text']
        channel = message['channel']
        if text.startswith('!누구'):
            email = _get_email(message['user'])
            resp = nugu(session, text, email)

    if resp != '':
        slack.chat.post_message(channel=channel, text=resp)


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
