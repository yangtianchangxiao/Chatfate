# Fate for OpenClaw 快速说明

这个插件目录可以直接放在本项目里维护，没问题。

当前路径：

- `old_framework/openclaw-fate-plugin/`

## 一、给 OpenClaw 用户直接使用（推荐）

公开入口：

- `https://chatfate.life/developers`

公开插件包：

- `https://chatfate.life/plugins/openclaw-fate-plugin/openclaw-fate-plugin-0.1.2.tgz`

方式 A：本地路径安装（开发联调）

```bash
openclaw plugins install -l /home/ubuntu/my-app/ziwei_ai_project/old_framework/openclaw-fate-plugin
openclaw plugins enable fateclawd
openclaw plugins doctor
```

方式 B：打包成 `.tgz` 发给别人

```bash
cd /home/ubuntu/my-app/ziwei_ai_project/old_framework/openclaw-fate-plugin
npm pack
# 产出例如: openclaw-fate-plugin-0.1.2.tgz
```

用户侧安装：

```bash
openclaw plugins install ./openclaw-fate-plugin-0.1.2.tgz
openclaw plugins enable fateclawd
```

也可以直接从网站下载后安装：

```bash
curl -fsSLO https://chatfate.life/plugins/openclaw-fate-plugin/openclaw-fate-plugin-0.1.2.tgz
openclaw plugins install ./openclaw-fate-plugin-0.1.2.tgz
openclaw plugins enable fateclawd
openclaw plugins doctor
```

方式 C：发布 npm（后续）

```bash
npm publish
```

用户侧安装：

```bash
openclaw plugins install openclaw-fate-plugin
openclaw plugins enable fateclawd
```

## 二、插件配置

至少配置：

- `plugins.entries.fateclawd.config.baseUrl`

示例：

```json5
{
  plugins: {
    entries: {
      fateclawd: {
        enabled: true,
        config: {
          baseUrl: "https://chatfate.life",
          endpointPath: "/api/fateclawd/invoke",
          timeoutMs: 120000,
          paymentMode: "off",
          upgradeUrl: "https://chatfate.life/pricing"
        }
      }
    }
  },
  agents: {
    list: [
      {
        id: "main",
        tools: { allow: ["fate_reading"] }
      }
    ]
  }
}
```

## 三、项目放置建议

建议现在先放在本项目里（便于和 `old_framework` 一起迭代），后续再独立仓库：

1. 当前阶段（快迭代）：保留在 `old_framework/openclaw-fate-plugin/`
2. 稳定后（对外发布）：拆到独立仓库 `openclaw-fate-plugin`，本项目用 git submodule 或 release 包引用

## 四、付费接口说明（当前）

已提供“付费接口占位”，用于将来平滑接入：

- 配置：`paymentMode`、`upgradeUrl`
- 调用参数：`payment_mode`、`payment_plan`、`payment_session_id`
- 现阶段行为：只返回付费状态和升级链接，不执行实际扣费
