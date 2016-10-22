MSG_FORMAT = '''{"name": "뀨냥이", "ent_year": 14, "org": "KAIST SoC",
"phone": "010-xxxx-xxxx", "birth": "1996-01-01", "dorm": "미르관 101호",
"facebook_id": "abc", "twitter_id": "@abc", "github_id": "abc",
"battlenet_id": "abc#12345", "website": "https://abc.com"}'''

SL_MSG_ERROR = "!누구 아프냥... %s"
SL_MSG_HELP = """!누구 V0.1 by samjo
\t!누구 <id>: id가 정확히  text인 사람의 정보를 보여주냥!
\t!누구 목록: 등록된 모든 사용자의 목록을 보여주냥!
\t!누구 검색 <text>: 이름 또는 id에 text가 포함된 사람을 보여주냥!
\t!누구 수정 <json>: 본인의 정보를 업데이트하냥!.
\t!누구 도움: 이 도움말을 표시하냥!"""
SL_MSG_MODIFY_ERROR = "등록 / 수정할 사용자를 찾을 수 없냥!"
SL_MSG_MODIFY_REQ_ARG = "name과 ent_year는 반드시 입력해야 하냥!"
SL_MSG_MODIFY_ARG_REQ = "인자가 필요하냥! 인자는 %s 형식이냥!" % MSG_FORMAT
SL_MSG_MODIFY_ARG_INV = "인자가 잘못되었냥! 인자는 %s 형식이냥!" % MSG_FORMAT
SL_MSG_MODIFY_SUCCESS = "업데이트되었냥!"
SL_MSG_SEARCH_ARG_REQ = "검색할 문자열이 필요하냥!"
SL_MSG_SEARCH_NO_RESULT = "결과가 없냥.. 뀨..."
SL_MSG_SEARCH_RESULT = "%s 명을 찾았냥!"
SL_MSG_SEARCH_MANY_RESULT = " (결과가 너무 많아 10명만 표시되냥!)"
