# zy-skills-plugin

郑义的个人 Claude Code 插件，包含自定义 skills 和 hooks。

## 安装

```bash
npx skills add <your-github>/zy-skills-plugin -g -y
```

## 结构

```
zy-skills-plugin/
├── .claude-plugin/
│   └── plugin.json    # 插件清单
├── skills/            # 自定义 skills
├── hooks/             # 事件钩子
├── agents/            # 自定义 agents
└── bin/               # 可执行文件
```

## 使用

安装后通过 `/zy-skills-plugin:skill-name` 调用各 skill。
