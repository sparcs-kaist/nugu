from slacker import Slacker
from nugu import nugu
from models import create_session
from settings import TOKEN
import asyncio
import json
import websockets
import os


BASE_PATH = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_PATH, 'db.sqlite3')
slack = Slacker(TOKEN)
session = create_session(DB_PATH)


def _get_email(userid):
    result = slack.users.info(userid).body
    return result['user']['profile']['email']


def handle(message):
    resp = ''

    if message['type'] == 'message' and \
            message.get('subtype', '') != 'bot_message':
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
