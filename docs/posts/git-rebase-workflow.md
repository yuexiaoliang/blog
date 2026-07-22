---
title: Git rebase 工作流与团队协作约定
date: 2026-02-27
tags: [Git, 工程化]
description: merge 还是 rebase？这道选择题背后其实是团队提交历史的审美问题。分享我们团队跑了两年的一套约定。
---

「要不要用 rebase」大概能引发前端团队里最持久的争论。我们团队两年前统一切换到 rebase 工作流，至今没有翻过车——前提是约定足够清晰。这篇把约定全文和背后的思考分享出来。

## 先看两种历史长什么样

同一个需求，merge 工作流的历史：

```text
*   a1b2c3 merge: feature/payment into main
|\
| * d4e5f6 fix: 修复支付回调超时
| * g7h8i9 feat: 支付结果页
* | j0k1l2 其他人的提交……
```

rebase 工作流的历史：

```text
* d4e5f6 fix: 修复支付回调超时
* g7h8i9 feat: 支付结果页
* j0k1l2 其他人的提交……
```

前者忠实记录了「发生过什么」，后者回答「代码是怎么来的」。对需要频繁 `git bisect` 和 `git log` 的团队，线性历史的价值是实打实的。

## 我们的三条铁律

### 第一条：只 rebase 自己的分支

```bash
# 把 main 的更新变基到自己的特性分支上
git checkout feature/payment
git rebase main
```

**永远不要 rebase 已经推到远端、别人正在使用的分支。** 这是 rebase 唯一的红线，踩了就是给全组人制造冲突。

### 第二条：合入主干用 fast-forward 或 squash

小改动直接 fast-forward：

```bash
git checkout main
git merge --ff-only feature/payment
```

大需求用 squash merge，一个需求一个提交，主干干净得像教科书：

```bash
git merge --squash feature/payment
git commit -m "feat: 支持微信支付"
```

### 第三条：冲突当场解决，不留过夜

rebase 过程中遇到冲突：

```bash
# 解决冲突后
git add <冲突文件>
git rebase --continue

# 实在搞不定，随时可以全身而退
git rebase --abort
```

`--abort` 是最好的安全网——rebase 的任何阶段都能无损回到操作前。很多人怕 rebase，其实是怕「回不去」，而它恰恰是最容易回退的操作。

## 交互式 rebase：整理自己的提交

推 PR 之前，先用 `rebase -i` 把提交捋顺：

```bash
git rebase -i HEAD~5
```

```text
pick g7h8i9 feat: 支付结果页
squash x2y3z4 fix: 样式调整      # 并入上一条
pick d4e5f6 fix: 修复支付回调超时
```

「fix typo」「wip」「按 review 意见修改」这类过程性提交，不应该进入主干历史。提交信息是给未来同事的信，值得花三分钟写好。

## 常见疑虑的回应

> rebase 改写了历史，是不是很危险？

改写的是**你自己分支的私有历史**。私有历史的改写没有受害者。就像写文章先打草稿再交终稿，没人会指责你「改写」了草稿。

> merge 不是更真实吗？

真实不等于有用。`git log --graph` 里盘根错节的 merge 提交，十年后没人看得懂当时为什么合并。历史的价值在于**可导航**，线性历史让 bisect、cherry-pick、回滚都变得简单。

::: warning
CI 上如果配置了基于 merge 的自动化流程（如 merge commit 触发部署），切换工作流前要一并调整，否则会出现「代码合了但没部署」的悬案。
:::

## 工具层面的保障

约定靠人记不如靠工具强制：

```ini
# .gitconfig
[pull]
  rebase = true        # git pull 默认 rebase，不产生 merge 提交
[rebase]
  autoSquash = true    # 自动整理 fixup! 提交
```

配合 commitlint + husky 校验提交信息格式，整套约定就跑在轨道上了。

## 小结

merge 与 rebase 没有绝对的对错，但**一个团队只能有一种答案**。我们的实践证明：只要守住「只 rebase 私有分支」这条红线，线性历史带来的可维护性收益远大于学习成本。
