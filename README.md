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
