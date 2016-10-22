from models import User, NUGU_FIELDS
import json


MSG_FORMAT = '''{"name": "뀨냥이", "ent_year": 14, "org": "KAIST SoC",
"phone": "010-xxxx-xxxx", "birth": "1996-01-01", "dorm": "미르관 101호",
"facebook_id": "abc", "twitter_id": "@abc", "github_id": "abc",
"battlenet_id": "abc#12345", "website": "https://abc.com"}'''

MSG_ERROR = "!누구 아프냥... %s"
MSG_HELP = """!누구 V0.1 by samjo
\t!누구 <id>: id가 정확히  text인 사람의 정보를 보여줍니다.
\t!누구 검색 <text>: 이름 또는 id에 text가 포함된 사람의 정보를 보여줍니다.
\t!누구 수정 <json>: 본인의 정보를 업데이트합니다.
\t!누구 도움: 이 도움말을 표시합니다."""
MSG_MODIFY_ERROR = "등록 / 수정할 사용자를 찾을 수 없냥!"
MSG_MODIFY_REQ_ARG = "name과 ent_year는 반드시 입력해야 하냥!"
MSG_MODIFY_ARG_REQ = "인자가 필요하냥! 인자는 %s 형식이냥!" % MSG_FORMAT
MSG_MODIFY_ARG_INV = "인자가 잘못되었냥! 인자는 %s 형식이냥!" % MSG_FORMAT
MSG_MODIFY_SUCCESS = "업데이트되었냥!"
MSG_SEARCH_ARG_REQ = "검색할 문자열이 필요하냥!"
MSG_SEARCH_NO_RESULT = "결과가 없냥.. 뀨..."
MSG_SEARCH_RESULT = "%s 명을 찾았냥!"
MSG_SEARCH_MANY_RESULT = " (결과가 너무 많아 10명만 표시되냥!)"


def _parse_email(email):
    e = email.split('@')
    if len(e) != 2:
        return False, ''
    if e[1] == 'sparcs.org':
        return True, e[0]
    return False, ''


def _nugu_modify(session, email, args):
    if len(args) < 3:
        return MSG_MODIFY_ARG_REQ

    try:
        info = json.loads(' '.join(args[2:]))
    except:
        return MSG_MODIFY_ARG_INV

    success, id = _parse_email(email)
    if not success:
        return MSG_MODIFY_ERROR

    users = session.query(User).filter(User.id==id).all()
    if len(users) == 0:
        if 'name' not in info or 'ent_year' not in info:
            return MSG_MODIFY_REQ_ARG
        user = User(id=id, email=email)
    else:
        user = users[0]

    for k, v in info.items():
        MSG_MODIFY_ERROR = "등록 / 수정할 사용자를 찾을 수 없냥!"
        if k in NUGU_FIELDS:
            setattr(user, k, v)

    session.add(user)
    session.commit()
    return MSG_MODIFY_SUCCESS


def _nugu_search(session, email, args):
    if len(args) < 3:
        return MSG_SEARCH_ARG_REQ

    query = '%%%s%%' % args[2]
    users = session.query(User).filter(User.id.like(query) |
                                       User.name.like(query)).all()
    if len(users) == 0:
        return MSG_SEARCH_NO_RESULT

    if len(users) == 1:
        return users[0].all_info()

    resp = [MSG_SEARCH_RESULT % len(users), ]
    if len(users) > 10:
        resp[0] += MSG_SEARCH_MANY_RESULT

    for user in users[:10]:
        resp.append(user.short_info())
    return '\n'.join(resp)


def _nugu_get(session, email, args):
    if len(args) < 2:
        return MSG_SEARCH_ARG_REQ

    users = session.query(User).filter(User.id==args[1]).all()
    if len(users) == 0:
        return MSG_SEARCH_NO_RESULT
    return users[0].all_info()


def _nugu_core(session, text, email):
    args = text.split(' ')
    if len(args) < 2:
        return MSG_HELP

    if args[1].startswith('검색'):
        return _nugu_search(session, email, args)
    elif args[1].startswith('수정'):
        return _nugu_modify(session, email, args)
    elif args[1].startswith('도움'):
        return MSG_HELP
    return _nugu_get(session, email, args)


def nugu(session, text, email):
    try:
        return _nugu_core(session, text, email)
    except Exception as e:
        return MSG_ERROR % str(e)
