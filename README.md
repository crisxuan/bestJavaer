[English](./README.md) | [中文](./README.zh-CN.md)

<div align="center">
  <img src="./assets/cxuan-ai-labs-logo.png" alt="cxuan-ai-labs" width="70%">
</div>

# cxuan-ai-labs

An open-source lab for AI coding workflows, Agent experiments, and developer education.

This repository documents practical AI-assisted development workflows, Agent experiments, tool evaluations, curated resources, reproducible notes, and real failure cases. It is not a news mirror and it is not a giant tutorial collection. The focus is on what was actually tried, what broke, what worked, and what can help developers build better workflows with AI.

<div class="home-sponsor-badge" align="center">
  <a href="https://vercel.com/open-source-program">
    <img alt="Vercel OSS Program" src="./assets/vercel-oss-program-badge.svg" width="220">
  </a>
</div>

<div class="home-primary-links">
  <a href="https://cxuan-labs.vercel.app/">Live Preview</a>
  <span>·</span>
  <a href="./en/ai-articles/README.md">AI Articles</a>
  <span>·</span>
  <a href="./en/ai-resources/README.md">AI Resources</a>
  <span>·</span>
  <a href="./en/works/README.md">Works & Open Source</a>
  <span>·</span>
  <a href="./en/development-guidelines/README.md">Development Guidelines</a>
  <span>·</span>
  <a href="./archive-bestjavaer/README.md">Legacy Archive</a>
  <span>·</span>
  <a href="./OPEN_SOURCE_IMPACT.md">Open Source Impact</a>
</div>

## Start Here

* [Grok Build Was Widely Criticized, Then Elon Open-Sourced It](./en/ai-articles/01-agent-and-coding/grok-build-was-criticized-then-open-sourced.md)

  2026-07-22
* [Qoder + Qwen 3.8: A Hands-On Test](./en/ai-articles/02-models-and-research/qoder-qwen-3-8-hands-on-test.md)

  2026-07-22
* [Claude Design's System Prompt Leaked: The Essential Lessons](./en/ai-articles/02-models-and-research/claude-design-system-prompt-essential-lessons.md)

  2026-07-22
* [OpenAI Broke Through Hugging Face's Infrastructure](./en/ai-articles/04-industry-and-business/openai-broke-through-hugging-face-infrastructure.md)

  2026-07-22
* [Still Learning Loops? Graph Engineering Is Already Taking Off](./en/ai-articles/01-agent-and-coding/graph-engineering-is-already-taking-off.md)

  2026-07-21
* [OpenAI's Official Prompting Guide](./en/ai-articles/02-models-and-research/openai-official-prompting-guide.md)

  2026-07-20

## Main Sections

* [AI Articles](./en/ai-articles/README.md)

  Real AI tool usage, model observations, industry notes, failure records, and practical workflow writeups.
* [AI Resources](./en/ai-resources/README.md)

  GitHub projects, tools, and resources mentioned in the articles and worth bookmarking or trying.
* [Works & Open Source](./en/works/README.md)

  Products, tools, content projects, and open-source work maintained or built by the author.
* [Development Guidelines](./en/development-guidelines/README.md)

  Notes on AI coding, project maintenance, collaboration, and Agent workflow practices.
* [Legacy Archive](./archive-bestjavaer/README.md)

  The older bestJavaer materials covering Java, concurrency, JVM, operating systems, networking, MySQL, Spring, and interview topics.

## Recent Updates

* 2026-07-22 · [Grok Build Was Widely Criticized, Then Elon Open-Sourced It](./en/ai-articles/01-agent-and-coding/grok-build-was-criticized-then-open-sourced.md)
* 2026-07-22 · [Qoder + Qwen 3.8: A Hands-On Test](./en/ai-articles/02-models-and-research/qoder-qwen-3-8-hands-on-test.md)
* 2026-07-22 · [Claude Design's System Prompt Leaked: The Essential Lessons](./en/ai-articles/02-models-and-research/claude-design-system-prompt-essential-lessons.md)
* 2026-07-22 · [OpenAI Broke Through Hugging Face's Infrastructure](./en/ai-articles/04-industry-and-business/openai-broke-through-hugging-face-infrastructure.md)
* 2026-07-21 · [Still Learning Loops? Graph Engineering Is Already Taking Off](./en/ai-articles/01-agent-and-coding/graph-engineering-is-already-taking-off.md)
* 2026-07-20 · [OpenAI's Official Prompting Guide](./en/ai-articles/02-models-and-research/openai-official-prompting-guide.md)
* 2026-07-18 · [Kimi K3 Stole the Show](./en/ai-articles/02-models-and-research/kimi-k3-stole-the-show.md)
* 2026-07-18 · [LibTV Helped Me Get Past My Creative Anxiety](./en/ai-articles/05-ai-creation-and-media/libtv-helped-me-get-past-creative-anxiety.md)
* 2026-07-16 · [GPT-5.6 Ran rm -rf in the Background](./en/ai-articles/01-agent-and-coding/gpt-5-6-ran-rm-rf-in-the-background.md)

## Why Follow

* The content comes from real usage instead of rewritten product announcements.
* Failure paths and debugging notes are kept because, in the AI era, the troubleshooting process is often more valuable than the final answer.
* The resource pages are intentionally curated instead of trying to be exhaustive.
* The older bestJavaer materials remain available, while the active project direction moves toward AI tools, Agent workflows, and personal experiments.

## Build & SEO

```bash
pnpm install
pnpm build
pnpm test
```

The production build keeps the interactive Docsify experience and generates clean, crawlable HTML under `/articles/` and `/en/articles/`. It also rebuilds RSS feeds, `sitemap.xml`, canonical URLs, hreflang alternates, Open Graph metadata, and Article JSON-LD for every indexed article.

## Legacy Content

bestJavaer used to be a Chinese learning repository for Java developers, covering Java, concurrency, JVM, operating systems, computer networks, MySQL, Spring, interview topics, and related developer education material.

That material is not removed. It has been preserved in [archive-bestjavaer](./archive-bestjavaer/README.md). The current main line is now cxuan-ai-labs: AI coding workflows, Agent experiments, open-source resources, and practical developer education.

## License

This repository uses a dual-license model:

* Documentation, articles, tutorials, images, and curated content are licensed under [CC BY-SA 4.0](./LICENSE).
* Code, scripts, tools, and software examples are licensed under [MIT](./LICENSE-MIT).

If a subdirectory or file declares a separate license, that local declaration takes precedence.
