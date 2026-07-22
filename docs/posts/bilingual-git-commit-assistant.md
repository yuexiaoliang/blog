---
title: "中英双语的 git commit 助手：以通义千问为例"
date: 2024-06-12
tags: [Git, AI, 效率]
description: "用通义千问加一份 prompt 打造 commit 助手，把随手写的提交信息一键转换为 Conventional Commits 规范格式并翻译为英文。"
---
1. 编写 prompt 以及上传供 AI 学习的文档。

```
我需要你作为一个 commit 助手，当我给你发送一份 commit 的时候，你需要帮我做如下工作：

1. 将其转换为符合文档中规定的规范格式。
2. 翻译为英文版本。
```

<img src="/images/bilingual-git-commit-assistant/1.png" alt="prompt" />


2. 简单编写提交信息。

<img src="/images/bilingual-git-commit-assistant/2.png" alt="chat" />

> Prompt 相关文件地址：https://github.com/yuexiaoliang/blog/blob/master/prompts/files/conventionalcommits.md