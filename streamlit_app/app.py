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
    html = html_path.read_text(encoding='utf-8')
    components.html(html, height=560, scrolling=True)

st.markdown('''
- 控制：方向键左右移动，空格跳跃，Z 射击
- 将此仓库连接到 Streamlit Cloud，然后部署 `streamlit_app/app.py`
''')
