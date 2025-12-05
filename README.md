# 魂斗罗（简化版）

这是一个用 HTML5 Canvas + 原生 JavaScript 编写的简化版横版射击游戏，已打包为可以嵌入到 Streamlit 的 Web 页面。

部署到 Streamlit Cloud（推荐步骤）

1. 将此仓库推送到你的 GitHub 账户（已包含 `streamlit_app/app.py`）。
2. 登录 https://share.streamlit.io 并点击 "New app"。
3. 选择你的 GitHub 仓库和分支（`main`），并将 "File path" 设置为 `streamlit_app/app.py`。
4. 点击 Deploy。Streamlit 会读取 `streamlit_app/requirements.txt`（已包含 `streamlit`）。

本地运行

1. 安装依赖：
   ```powershell
   Set-Location -LiteralPath "D:\VS code\VScode\微信小游戏\streamlit_app"
   python -m pip install -r requirements.txt
   ```
2. 本地运行 Streamlit：
   ```powershell
   streamlit run app.py
   ```
3. 或者直接启动静态服务器调试 `web-game` 页面：
   ```powershell
   Set-Location -LiteralPath "D:\VS code\VScode\微信小游戏\web-game"
   python -m http.server 8000
   # 浏览器打开 http://localhost:8000/index.html
   ```

注意事项

- `streamlit_app/app.py` 会把 `web-game/index.html` 中的 CSS/JS 与 `web-game/assets` 下的图片（SVG/PNG/JPG）内联为 data-urls，避免外部请求失败。若游戏资源较大，Streamlit 嵌入可能会受限。
- 如果要发布到微信小程序，需要另外转换为微信小游戏项目（目前仓库中为 Web 版本）。

如果你希望我替你把仓库设置为 Streamlit Cloud（例如我可以在仓库里加上 `.streamlit` 配置或演示页面），告诉我你想要的默认分辨率和是否需要自动缩放到移动屏幕。
# 微信小游戏  魂斗罗（简化版）

项目包含三个部分：

- `web-game/`：可在浏览器运行的 HTML5 Canvas 游戏（简化版魂斗罗）。
- `wechat-mini-game/`：微信小游戏的骨架，包含说明和可移植的核心逻辑（需在微信开发者工具中适配和测试）。
- `streamlit_app/`：用于在 Streamlit Cloud 上部署的简单封装，直接嵌入 `web-game/index.html`。

使用步骤（本地）：

1. 在项目根目录打开 PowerShell。
2. 初始化 git 并提交：

```powershell
git init ; git add . ; git commit -m "initial commit: add web game and streamlit app"
```

3. 创建 GitHub 仓库并推送（见下文示例命令）。

Streamlit 部署：

- 将整个仓库推到 GitHub 后，用 Streamlit Cloud 连接该仓库并部署 `streamlit_app/app.py`。

微信小游戏：

- 打开 `wechat-mini-game/README.md` 查看如何在微信开发者工具中导入并适配游戏资源。

---

如果你愿意，我可以继续帮你：
- 生成并运行测试（需要你在本地运行 git 与推送）
- 帮你生成 GitHub 仓库的示例 `git remote add` 命令
- 在需要时把代码进一步优化、增加关卡/音效/资源
