param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,
    [string]$Branch = "main",
    [switch]$Force
)

function Write-Log($msg){ Write-Host "[deploy] $msg" }

Write-Log "检查 git 是否可用..."
try{ git --version > $null } catch { Write-Log "git 未安装或不可用，请先安装 git."; exit 1 }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if(-not (Test-Path .git)){
    Write-Log "初始化本地 git 仓库..."
    git init
} else { Write-Log "已有 .git 目录，跳过 git init。" }

Write-Log "添加全部文件到索引..."
git add .

Write-Log "创建提交（如果有更改）..."
try{ git commit -m "initial commit: add web game and streamlit app" -q } catch { Write-Log "提交时没有变更或提交失败（可能已提交过）。继续..." }

Write-Log "设置主分支为 $Branch"
git branch -M $Branch

Write-Log "配置远程 origin -> $RepoUrl"
$existing = $null
try{ $existing = git remote get-url origin 2>$null } catch {}
if($existing){
    if($existing -ne $RepoUrl){
        if($Force){
            Write-Log "强制替换已存在的 origin（$existing）。"
            git remote remove origin
            git remote add origin $RepoUrl
        } else {
            Write-Log "远程 origin 已存在且不同: $existing 。若要替换请加 -Force 参数。"; exit 1
        }
    } else { Write-Log "远程 origin 已指向相同 URL，跳过添加。" }
} else {
    git remote add origin $RepoUrl
}

Write-Log "推送到远程仓库...（可能需要输入 GitHub 凭据或 PAT）"
try{
    git push -u origin $Branch --force
    Write-Log "推送成功。"
} catch {
    Write-Log "推送失败：$($_.Exception.Message)"
    Write-Log "如果使用 HTTPS，请使用 GitHub 用户名与 Personal Access Token (PAT) 作为密码，或先配置凭据管理器。"
    exit 1
}

Write-Log "操作完成。"
