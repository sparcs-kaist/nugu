from core import nugu_list, nugu_get, nugu_search, nugu_edit, nugu_remove
from models import create_session, User, NUGU_FIELDS
import argparse
import json
import string
import random
import subprocess
import os


def _print_user(users):
    fmt = '{:10s}{:5s}{:6s}{:6s}{:10s}{:20s}'
    print('=' * 50)
    print(fmt.format('학번', '이름', '아이디', 'Github ID', '휴대폰', '소속'))
    print('-' * 50)
    for user in users:
        print(fmt.format(user.ent_year, user.name, user.id, user.github_id, user.phone, user.org))
    print('=' * 50)


def _nugu_list(session):
    _print_user(nugu_list(session))


def _nugu_get(session, target):
    if not target:
        print('nugu/get: target is not specified')
        exit(1)

    user = nugu_get(session, target)
    if not user:
        print('nugu/get: no such user')
        exit(1)

    for i in NUGU_FIELDS:
        value = getattr(user, i['id'])
        print('%s: %s' % (i['name'], value))


def _nugu_search(session, target):
    if not target:
        print('nugu/search: target is not specified')
        exit(1)

    users = nugu_search(session, target)
    print('Found %d users' % len(users))
    _print_user(users)


def _nugu_edit(session, target):
    logged_user = os.getlogin()
    is_root = os.getuid() == 0
    id = target if target else logged_user

    user = nugu_get(session, id)
    if not user and not is_root:
        print('nugu/add: root permission is required')
        exit(1)

    if not user and not target:
        print('nugu/add: user id is required')
        exit(1)

    if user and not is_root and id != logged_user:
        print('nugu/edit: root permission is required to edit others')
        exit(1)


    json_str = user.to_json() if user else User.default_json()
    random_str = ''.join(random.choice(string.digits) for _ in range(6))
    filename = '/tmp/nugu.%s.json' % random_str
    with open(filename, 'w') as f:
        f.write(json_str)

    subprocess.run('vi %s' % filename, shell=True)
    with open(filename, 'r') as f:
        result = f.read()
    os.remove(filename)

    try:
        info = json.loads(result)
    except:
        print('nugu/edit: invalid format')
        exit(1)

    nugu_edit(session, id, info)
    print('nugu/edit: successfully updated')


def _nugu_remove(session, target):
    if not target:
        print('nugu/remove: target is not specified')
        exit(1)

    if os.getuid() != 0:
        print('nugu/remove: root permission is required')
        exit(1)

    user = nugu_get(session, target)
    if not user:
        print('nugu/remove: no such user')
        exit(1)

    nugu_remove(session, target)
    print('nugu/remove: successfully removed')


def main():
    parser = argparse.ArgumentParser(description='SPARCS nugu by samjo, netj')
    parser.add_argument('target', nargs='?', help='검색할 ID 또는 이름입니다.')
    parser.add_argument('-l', '--list', action='store_true', help='전체 사용자의 목록을 출력합니다.')
    parser.add_argument('-s', '--search', action='store_true', help='ID/이름에 검색어가 들어있는 사용자를 찾습니다.')
    parser.add_argument('-e', '--edit', action='store_true', help='사용자의 정보를 수정합니다.')
    parser.add_argument('-r', '--remove', action='store_true', help='사용자를 삭제합니다. (sudo 필요)')
    args = parser.parse_args()
    session = create_session()

    print('SPARCS nugu v0.5 by samjo, netj')
    print()

    if args.list:
        return _nugu_list(session)
    elif args.search and args.target:
        return _nugu_search(session, args.target)
    elif args.edit:
        return _nugu_edit(session, args.target)
    elif args.remove:
        return _nugu_remove(session, args.target)
    return _nugu_get(session, args.target)


if __name__ == '__main__':
    main()
