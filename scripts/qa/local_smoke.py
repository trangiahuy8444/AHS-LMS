"""Smoke local UI; blocks every request outside localhost (no production Firebase)."""
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('AHS_CHROME_EXECUTABLE', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'))
    context = browser.new_context(viewport={'width': 1366, 'height': 900})
    blocked = []
    def route_request(route):
        if urlparse(route.request.url).hostname in ('127.0.0.1', 'localhost'):
            route.continue_()
        else:
            blocked.append(urlparse(route.request.url).hostname)
            route.abort()
    context.route('**/*', route_request)
    for route in ('', 'test/', 'admin/'):
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        response = page.goto('http://127.0.0.1:4173/AHS-LMS/' + route, wait_until='networkidle')
        page.locator('body').wait_for(state='visible')
        text = page.locator('body').inner_text()
        assert response.status == 200, (route, response.status)
        assert len(text.strip()) > 50, (route, 'empty screen')
        assert not errors, (route, errors)
        results.append({'route': '/' + route, 'status': response.status, 'text_excerpt': text[:240], 'buttons': page.get_by_role('button').all_text_contents(), 'page_errors': errors})
        page.screenshot(path='/private/tmp/ahs-smoke-' + (route.strip('/') or 'home') + '.png', full_page=True)
        page.close()
    for grade, scale in ((8, '7'), (9, '7'), (10, '7.75')):
        page = context.new_page()
        page.goto('http://127.0.0.1:4173/AHS-LMS/test/', wait_until='networkidle')
        page.evaluate('localStorage.clear(); sessionStorage.clear()')
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='Khối ' + str(grade), exact=True).click()
        page.get_by_placeholder('Ví dụ: Nguyễn Văn An').fill('Hoc Sinh Gia')
        page.get_by_placeholder('Ví dụ: 123456 (chỉ nhập số)').fill('100001')
        page.get_by_role('button', name='BẮT ĐẦU ÔN TẬP ĐỀ CƯƠNG', exact=False).click()
        page.get_by_role('button', name='NỘP BÀI & XEM ĐÁNH GIÁ', exact=True).wait_for()
        page.get_by_role('button', name='NỘP BÀI & XEM ĐÁNH GIÁ', exact=True).click()
        page.get_by_role('button', name='Đồng Ý Nộp Bài', exact=True).click()
        page.get_by_role('button', name='Làm lại bài ôn tập', exact=False).wait_for()
        body = page.locator('body').inner_text()
        assert ('/ ' + scale) in body, (grade, body[:1200])
        page.screenshot(path='/private/tmp/ahs-practice-grade' + str(grade) + '.png', full_page=True)
        results.append({'practice_grade': grade, 'expected_scale': scale, 'submitted_without_essay': True})
        page.close()
    browser.close()
Path('/private/tmp/ahs-browser-smoke.json').write_text(json.dumps({'results': results, 'external_hosts_blocked': sorted(set(blocked))}, ensure_ascii=False, indent=2))
print(json.dumps(results, ensure_ascii=False))
