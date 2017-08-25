import argparse
from datetime import datetime, timedelta
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unicodedata

from . import __version__ as _version, __author__ as _author
from .core import nugu_list, nugu_get, nugu_search, nugu_edit, nugu_remove
from .models import create_session, User, NUGU_FIELDS


def _pad(s, p, r=True):
    s = '' if s is None else s
    l = 0
    for c in s:
        w = unicodedata.east_asian_width(c)
        l += 2 if w == 'W' else 1
    if not r:
        return ' ' * (p - l) + s
    return s + ' ' * (p - l)


def _print_list(users):
    def fmt(ent_year, name, id, github_id, phone, org):
        return '{:s}{:s}{:s}{:s}{:s}{:s}'.format(
            _pad(ent_year, 6), _pad(name, 12), _pad(id, 16),
            _pad(github_id, 16), _pad(phone, 20), org)
    print('=' * 80)
    print(fmt('학번', '이름', '아이디', 'Github ID', '휴대폰', '소속'))
    print('-' * 80)
    for user in users:
        print(fmt(user.ent_year, user.name, user.id, user.github_id, user.phone, user.org))
    print('=' * 80)


def do_list(session):
    _print_list(nugu_list(session))


def do_get(session, target):
    if not target:
        print('nugu/get: target is not specified')
        exit(1)

    user = nugu_get(session, target)
    if not user:
        print('nugu/get: no such user')
        exit(1)

    print('=' * 60)
    for idx, i in enumerate(NUGU_FIELDS):
        value = getattr(user, i['id'])
        value = '' if value is None else value
        if type(value) == datetime:
            value = (value + timedelta(hours=9)).isoformat() + 'KST'
        print('{:3d}. {:s}: {:s}'.format(idx + 1, _pad(i['name'], 15), str(value)))
    print('=' * 60)


def do_search(session, target):
    if not target:
        print('nugu/search: target is not specified', file=sys.stderr)
        exit(1)

    _print_list(nugu_search(session, target))


def do_edit(session, target):
    logged_user = os.getlogin()
    is_root = (os.getuid() == 0)
    id = target if target else logged_user

    user = nugu_get(session, id)
    if not user and not is_root:
        print('nugu/add: root permission is required', file=sys.stderr)
        exit(1)

    if not user and not target:
        print('nugu/add: user id is required', file=sys.stderr)
        exit(1)

    if user and not is_root and id != logged_user:
        print('nugu/edit: root permission is required to edit others', file=sys.stderr)
        exit(1)

    json_str = user.to_json() if user else User.default_json()

    changed = False
    try:
        editor = os.environ.get('EDITOR', 'vi')
        _, fpath = tempfile.mkstemp()
        fpath = Path(fpath)
        fpath.write_text(json_str, encoding='utf8')
        mtime = fpath.stat().st_mtime

        subprocess.run([editor, str(fpath)])

        changed = (fpath.stat().st_mtime > mtime)
        if changed:
            new_content = fpath.read_text(encoding='utf8')
    except IOError:
        print('nugu/edit: could not run editor', file=sys.stderr)
        exit(1)
    finally:
        fpath.unlink()

    if changed:
        try:
            info = json.loads(new_content)
        except:
            print('nugu/edit: invalid format', file=sys.stderr)
            exit(1)

        nugu_edit(session, id, info)
        print('nugu/edit: successfully updated')
    else:
        print('nugu/edit: not changed')


def do_remove(session, target):
    if not target:
        print('nugu/remove: target is not specified', file=sys.stderr)
        exit(1)

    if os.getuid() != 0:
        print('nugu/remove: root permission is required', file=sys.stderr)
        exit(1)

    user = nugu_get(session, target)
    if not user:
        print('nugu/remove: no such user', file=sys.stderr)
        exit(1)

    nugu_remove(session, target)
    print('nugu/remove: successfully removed')


def main():
    title = 'SPARCS nugu v{} by {}'.format(_version, _author)

    parser = argparse.ArgumentParser(description=title)
    parser.add_argument('target', nargs='?', help='검색할 ID 또는 이름입니다.')
    parser.add_argument('-l', '--list', action='store_true', help='전체 사용자의 목록을 출력합니다.')
    parser.add_argument('-s', '--search', action='store_true', help='ID/이름에 검색어가 들어있는 사용자를 찾습니다.')
    parser.add_argument('-e', '--edit', action='store_true', help='사용자의 정보를 수정합니다.')
    parser.add_argument('-r', '--remove', action='store_true', help='사용자를 삭제합니다. (sudo 필요)')
    args = parser.parse_args()
    session = create_session()

    print(title)
    print()

    if args.list:
        return do_list(session)
    elif args.search and args.target:
        return do_search(session, args.target)
    elif args.edit:
        return do_edit(session, args.target)
    elif args.remove:
        return do_remove(session, args.target)
    return do_get(session, args.target)


if __name__ == '__main__':
    main()
