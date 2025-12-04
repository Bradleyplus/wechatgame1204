import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(page_title='魂斗罗 简化版 (Web)', layout='wide')
st.title('魂斗罗 — 简化版 (Embedded Web Game)')

# 使用当前文件位置计算仓库根目录，稳健读取 web-game/index.html
base_dir = Path(__file__).resolve().parent.parent
html_path = base_dir / 'web-game' / 'index.html'

if not html_path.exists():
    st.error(f"找不到 web 游戏文件：{html_path}\n请确认 `web-game/index.html` 已存在并已提交到仓库。")
else:
    # 读取 index.html 并把同目录下的 style.css 与 game.js 内联，保证在 Streamlit 中能正确加载
    html = html_path.read_text(encoding='utf-8')
    web_dir = html_path.parent

    # inline CSS
    css_path = web_dir / 'style.css'
    if css_path.exists():
        css_text = css_path.read_text(encoding='utf-8')
        # replace <link ... href="style.css">（简单替换）
        html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>{css_text}</style>")

    # inline JS
    js_path = web_dir / 'game.js'
    if js_path.exists():
        js_text = js_path.read_text(encoding='utf-8')
        # replace external script tag
        html = html.replace('<script src="game.js"></script>', f"<script>{js_text}</script>")

    components.html(html, height=640, scrolling=True)

st.markdown('''
- 控制：方向键左右移动，空格跳跃，Z 射击
- 将此仓库连接到 Streamlit Cloud，然后部署 `streamlit_app/app.py`
''')
