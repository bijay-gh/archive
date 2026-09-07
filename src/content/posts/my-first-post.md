---
title: "My First Test Markdown File"
description: "This is a quick test to see how markdown files are added and displayed on the site."
pubDate: 2026-05-21
author: "The Author"
tags: ["test", "markdown"]
featured: false
draft: false
---

# Welcome to my first markdown post!

This is a test to verify that dropping a `.md` file into the `src/content/posts` folder automatically renders it onto the website.

## Why this works

Astro's content collections API automatically reads files placed inside `src/content/{collection_name}`. Once the file is saved, the Astro development server will detect the new file, compile it into HTML, and dynamically add it to the lists on the home page and the `/blog` archive.

If you can see this post on the site, that means everything is working perfectly!
