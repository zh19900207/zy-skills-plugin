---
description: 将 Markdown 文件转换为带样式的 HTML，支持多种主题、代码高亮、图表渲染。适用于微信公众号、文档发布等场景。当用户询问 "markdown to html"、"md 转 html"、"Markdown 转 HTML" 或需要生成样式化 HTML 输出时使用此 skill。
---

# Markdown to HTML Skill

将 Markdown 转换为支持主题的样式化 HTML，支持代码高亮、Mermaid 图表、脚注、警告框等扩展语法。

## 使用方式

```bash
bun scripts/main.ts <markdown_file> [options]
# 或使用 npx
npx zy-markdown-to-html <markdown_file> [options]
```

## 选项说明

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--theme <name>` | 主题名称 | default |
| `--color <name\|hex>` | 主色调 | theme default |
| `--font-family <name>` | 字体：sans, serif, mono | theme default |
| `--font-size <N>` | 字号：14-18px | 16px |
| `--title <title>` | 覆盖标题 | |
| `--cite` | 外链转底部引用 | false |
| `--keep-title` | 保留第一个标题 | false |
| `--mermaid-theme <name>` | Mermaid 主题 | default |
| `--mermaid-scale <N>` | Mermaid 缩放比例 | 2 |
| `--mermaid-width <N>` | Mermaid 宽度 px | 860 |
| `--mermaid-bg <value>` | Mermaid 背景色 | white |
| `--no-mermaid` | 跳过 Mermaid 渲染 | false |

## 主题

| 主题 | 描述 |
|------|------|
| `default` | 经典风格，中心标题带底部边框 |
| `grace` | 优雅风格，文字阴影，圆角卡片 |
| `simple` | 极简风格，现代简约，干净留白 |
| `modern` | 现代风格，大圆角，药丸标题 |

## 配色方案

| 名称 | 色值 | 标签 |
|------|------|------|
| blue | #0F4C81 | 经典蓝 |
| green | #009874 | 翡翠绿 |
| vermilion | #FA5151 | 朱红 |
| yellow | #FECE00 | 柠檬黄 |
| purple | #92617E | 薰衣草紫 |
| sky | #55C9EA | 天蓝 |
| rose | #B76E79 | 玫瑰金 |
| black | #333333 | 石墨黑 |
| orange | #D97757 | 暖橙 |

## 支持的 Markdown 特性

| 特性 | 语法 |
|------|------|
| 标题 | `# H1` 到 `###### H6` |
| 粗体/斜体 | `**bold**`, `*italic*` |
| 代码块 | ` ```lang ` 带语法高亮 |
| 行内代码 | `` `code` `` |
| 表格 | GitHub Flavored Markdown 表格 |
| 图片 | `![alt](src)` |
| 链接 | `[text](url)` |
| 引用 | `> quote` |
| 列表 | `-` 无序, `1.` 有序 |
| 警告框 | `> [!NOTE]`, `> [!WARNING]` 等 |
| 脚注 | `[^1]` |
| 注音 | `{base\|annotation}` |
| Mermaid | ` ```mermaid ` 图表 |
| PlantUML | ` ```plantuml ` 图 |

## 使用示例

### 基础转换

```bash
bun scripts/main.ts article.md
```

### 指定主题和颜色

```bash
bun scripts/main.ts article.md --theme modern --color blue
```

### 外链转底部引用

```bash
bun scripts/main.ts article.md --cite --keep-title
```

### 跳过 Mermaid 渲染

```bash
bun scripts/main.ts article.md --no-mermaid
```

## 输出

- 输出文件：与输入文件同目录的 `.html` 文件
- 冲突处理：自动备份为 `.html.bak-YYYYMMDDHHMMSS`
