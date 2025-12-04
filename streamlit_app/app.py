import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title='魂斗罗 简化版 (Web)', layout='wide')
st.title('魂斗罗  简化版 (Embedded Web Game)')

# 直接读取本地的 web-game/index.html 并嵌入
with open('../web-game/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# components.html 会把 HTML 嵌入到 Streamlit 页面
components.html(html, height=560)

st.markdown('''
- 控制：方向键左右移动，空格跳跃，Z 射击
- 将此仓库连接到 Streamlit Cloud，然后部署 `streamlit_app/app.py`
''')
