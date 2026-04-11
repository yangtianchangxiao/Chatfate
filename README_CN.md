# ChatFate

中文说明：`README_CN.md`  
English: `README_EN.md`

`ChatFate` 是一个把紫微斗数咨询能力暴露为远程 skill / plugin 的公共分发仓库。

这个 skill 的对外中文名，统一叫作：`算了吗`。

说明：

- 中文显示名：`算了吗`
- 内部 slug / 安装目录：`chatfate`
- 后端服务品牌：`ChatFate`

它不是把命理逻辑塞进本地 prompt，而是：

- 本地 agent 装一个轻量 skill 或 plugin
- 真正的算命与咨询由远程 ChatFate API 完成
- 记忆、额度、日志、后续收费，都放在服务端统一处理

## 现在能做什么

这个仓库目前已经包含三类接入物：

1. `Claude Code / Codex skill`
2. `OpenClaw plugin` 源码包
3. 通用远程 API 的调用约定

公开入口：

- 产品首页：`https://chatfate.life/`
- developers 页面：`https://chatfate.life/developers`
- hosted skill：`https://chatfate.life/skills/chatfate/SKILL.md`
- hosted helper：`https://chatfate.life/skills/chatfate/scripts/chatfate_query.py`

## 在 Codex 里怎么用

### 方式一：直接安装 hosted skill

```bash
mkdir -p ~/.codex/skills/chatfate/scripts && \
curl -fsSL https://chatfate.life/skills/chatfate/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
curl -fsSL https://chatfate.life/skills/chatfate/scripts/chatfate_query.py \
  -o ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.codex/skills/chatfate/SKILL.md
```

### 方式二：从 GitHub raw 安装

```bash
mkdir -p ~/.codex/skills/chatfate/scripts && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/scripts/chatfate_query.py \
  -o ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.codex/skills/chatfate/SKILL.md
```

安装完成后，还需要让本地能读到你的 ChatFate API key；之后在 Codex 对话里直接提问即可。只要已经提供出生信息，Codex 就可以调用这个 skill。

如果宿主会显示 skill 名，中文名就显示为 `算了吗`；但磁盘目录和安装路径仍保持 `chatfate`，这样不会影响现有安装与更新。

推荐的一次性配置方式：

```bash
mkdir -p ~/.chatfate && chmod 700 ~/.chatfate && \
printf '%s' 'cf_sk_xxx' > ~/.chatfate/api_key && \
chmod 600 ~/.chatfate/api_key
```

也支持：

```bash
export CHATFATE_API_KEY="cf_sk_xxx"
```

如果用户是在对话里临时把 key 发给 agent，也可以只用于当前这次调用；但更推荐一次性写入 `~/.chatfate/api_key`，后续就不用重复发。

常见问题示例：

- `分析我的事业`
- `回溯一下前十年`
- `我哪一年财运最好`
- `看看我的感情`
- `分析未来十年的家庭与房产走势`

## 普通用户怎么使用

给用户的指导应该很简单，不要教他们一堆参数。

正常流程：

1. 第一轮先把出生信息和第一个真实问题一起说出来
2. 后续直接追问，不需要每轮都重输完整信息
3. 如果想换主题但还是同一个命盘，可以新开一个线程
4. 如果想彻底清空上下文，再明确要求“重新开始一个新的咨询”

适合直接给用户的示例：

- `我是 1990-06-15 子时 男，先分析我的事业结构。`
- `那未来三年的财运呢？`
- `感情方面再展开一点。`
- `回溯一下我前十年的关键变化。`
- `单独重新开一轮，只看家庭和房产。`

也就是说，面对终端用户时，重点不是教他们命令，而是教他们：

- 先给出生信息
- 一次问一个真实问题
- 然后连续追问

## skill 需要什么输入

必须信息：

- `birth_date`：`YYYY-MM-DD`
- `birth_time`：可以是
  - 数字 `0-12`
  - `子时 / 丑时 / ... / 亥时`
  - `子 / 丑 / ... / 亥`
- `gender`：`male` 或 `female`
- `question`：自然语言问题

时辰映射：

- `0=子时`
- `1=丑时`
- `2=寅时`
- `3=卯时`
- `4=辰时`
- `5=巳时`
- `6=午时`
- `7=未时`
- `8=申时`
- `9=酉时`
- `10=戌时`
- `11=亥时`
- `12=早子时`

## 这个 helper 比裸 curl 多了什么

`Chatfate/scripts/chatfate_query.py` 不只是发一次请求，它还会自动处理连续对话：

- 本地保存 `~/.chatfate/sessions.json`
- 为当前这台 Codex / Claude 安装生成稳定的 `client_id`
- 自动创建远程 session
- 自动保存 user / assistant 消息
- 自动复用同一 profile 下的远程 session
- 匿名模式下默认把 `anonymous_id = client_id`，兼容旧服务端记忆逻辑
- 支持 `--profile`
- 支持 `--new-session`
- 支持 `--no-memory`

例如，强制开启一个新的独立线程：

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --profile annual-review \
  --new-session \
  --question "回溯一下前十年"
```

## API 形态

当前统一入口：

```text
POST https://chatfate.life/api/fateclawd/invoke
```

最小 payload：

```json
{
  "birth_date": "1990-06-15",
  "birth_time_index": 0,
  "gender": "male",
  "question": "分析我的事业"
}
```

## OpenClaw 插件

仓库里还包含：

- `openclaw-fate-plugin/`

如果宿主更偏向 plugin 机制，而不是 `SKILL.md`，可以直接看：

- `openclaw-fate-plugin/README.md`
- `openclaw-fate-plugin/QUICKSTART_CN.md`

网站托管的插件包：

- `https://chatfate.life/plugins/openclaw-fate-plugin/openclaw-fate-plugin-0.1.2.tgz`

## 环境变量

必填 / 常用：

```bash
export CHATFATE_BASE_URL="https://chatfate.life"
export CHATFATE_API_KEY="cf_sk_xxx"
export CHATFATE_API_KEY_FILE="$HOME/.chatfate/api_key"
export CHATFATE_LANG="zh-CN"
export CHATFATE_TIMEOUT_SEC="360"
export CHATFATE_PROFILE="default"
export CHATFATE_CLIENT_ID="optional-stable-client-id"
export CHATFATE_STATE_DIR="$HOME/.chatfate"
```

说明：

- 当前对外的 Codex / Claude Code / plugin 调用，默认走 API key + credits
- 每调用一次 `/api/fateclawd/invoke`，扣 1 credit
- 网站前台聊天仍然可以继续走匿名网页流，不和外部 agent key 混在一起
- helper 会按这个顺序找 key：`--api-key` -> `CHATFATE_API_KEY` -> `~/.chatfate/api_key`
- `client_id` 表示“这一台本地安装的稳定身份”；不传时 helper 会自动生成并持久化
- `session_id` 表示一条具体对话线程
- `profile` 是本地线程别名，用来隔离同命盘下的多个主题对话
- `user_id` 留给以后真实登录账户接入

如果你是高级用户或开发者，也可以直接显式控制线程：

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --question "分析我的事业结构"

python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --profile love \
  --new-session \
  --question "单独看未来十年的感情走势"
```

## 定位

这不是一个“写死 prompt 的东方神秘学模板”。

它更接近一种 agent-ready 的东方命理工具层：

- 网站可以调用
- Codex / Claude Code 可以调用
- OpenClaw 可以调用
- 以后 MCP host 也可以调用

也就是说，真正稳定的部分不是某段 prompt，而是：

- 统一 API
- 统一 skill / plugin 分发
- 统一会话记忆
- 统一服务端演进
