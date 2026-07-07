---
description: 介绍 zy-skills-plugin 插件的功能和使用方法
---

# zy-skills-plugin

郑义的个人 Claude Code 插件。

## 包含内容

- **skills/** - 自定义 skills
- **hooks/** - 事件钩子配置
- **agents/** - 自定义 agents

## 安装方式

```bash
npx skills add <your-github>/zy-skills-plugin -g -y
```

## 使用方法

安装后在 Claude Code 中使用：
- `/zy-skills-plugin:skill-name` 调用具体 skill
