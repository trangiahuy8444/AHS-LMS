"""Render approved official packages locally with stubbed cloud; no production writes."""
import argparse, json, os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--private-dir',required=True);parser.add_argument('--report',default='/private/tmp/ahs-official-browser-smoke.json');args=parser.parse_args()
secret={'correctAnswer','answerLetter','modelAnswer','rubric','explanation'}
def public(value):
    if isinstance(value,dict):return {k:public(v) for k,v in value.items() if k not in secret}
    if isinstance(value,list):return [public(v) for v in value]
    return value
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('AHS_CHROME_EXECUTABLE','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'))
    for grade in (8,9,10):
        package=json.loads((Path(args.private_dir)/f'ma_de_chinh_thuc_khoi_{grade}.json').read_text())
        for code,raw in package['officialExams'].items():
            exam=public(raw);context=browser.new_context(viewport={'width':1440,'height':1000});context.route('**/*',lambda route:route.continue_() if urlparse(route.request.url).hostname in ('127.0.0.1','localhost') else route.abort())
            context.add_init_script("localStorage.setItem('asian_school_exam_config_v1',JSON.stringify({defaultClassMode:'both_open',classAccessControl:{},examDurationMinutes:45,lockOnExamViolation:false}));")
            page=context.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
            page.goto('http://127.0.0.1:4173/AHS-LMS/test/',wait_until='networkidle')
            page.get_by_role('button',name='Khối '+str(grade),exact=True).click()
            page.get_by_role('button',name='THI GIỮA HK1',exact=False).click()
            page.get_by_placeholder('Ví dụ: Nguyễn Văn An').fill('Hoc Sinh Gia')
            page.get_by_placeholder('Ví dụ: 123456 (chỉ nhập số)').fill('100001')
            page.get_by_placeholder('Nhập mật khẩu phòng thi...').fill('fake-room')
            page.evaluate("""exam=>{
                window.AsianSchoolCloud.startExam=async()=>({exam,examCode:exam.code,durationMinutes:45,startedAtMs:Date.now(),violations:0,locked:false});
                window.AsianSchoolCloud.reportViolation=async()=>{};
                window.AsianSchoolAuth.uid=()=> 'local-smoke-fake-owner';
            }""",exam)
            page.get_by_role('button',name='BẮT ĐẦU VÀO PHÒNG THI',exact=False).click()
            sidebar=page.locator('button[title^="Câu "]');sidebar.first.wait_for()
            mc=exam.get('mcqQuestions',exam.get('part1_mcq',[]));tf=exam.get('part2_tf',[]);es=exam.get('essayQuestions',exam.get('part3_essay',[]))
            expected=len(mc)+len(tf)+len(es)
            assert sidebar.count()==expected,(grade,code,'sidebar count')
            for idx,q in enumerate(tf):
                sidebar.nth(len(mc)+idx).click()
                assert page.get_by_text(q['context'],exact=True).is_visible(),(grade,code,'TF context missing')
                assert page.get_by_role('button',name='✓ ĐÚNG',exact=True).count()==4
            for idx,q in enumerate(es):
                sidebar.nth(len(mc)+len(tf)+idx).click()
                assert page.get_by_text(q.get('context') or q.get('question'),exact=True).is_visible(),(grade,code,'essay stem missing')
                assert page.get_by_role('textbox').is_visible()
            assert not errors,(grade,code,errors)
            results.append({'grade':grade,'code':code,'question_count':expected,'tf_contexts_visible':len(tf),'essay_stems_visible':len(es),'page_errors':0,'cloud':'stubbed; external requests blocked'})
            context.close()
    browser.close()
Path(args.report).write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False))
