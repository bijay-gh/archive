---
title: "Deep Dive: Sub-page Magic"
description: "Demonstrating how sub-pages and breadcrumbs work."
pubDate: 2026-05-27
subject: "Demo"
listed: false
parent: "demo-features"
toc: true
toc_depth: 3
---

Welcome to the sub-page! 

## Notice the Breadcrumbs

At the very top of this page, you should see a breadcrumb navigation trail: `Notes > Feature Demonstration: TOC & Images > Deep Dive: Sub-page Magic`. This allows you to easily navigate back to the parent document.

## Hidden from Index

Because we added `listed: false` and `parent: "demo-features"` to the frontmatter of this file, it will **not** appear on the main `/notes` index page. It's completely hidden unless someone navigates to it directly or clicks the sub-page link from the parent document.

This is extremely powerful for organizing massive study guides, where you only want the main overview to be listed, and have deep technical explorations tucked away in sub-pages!

## URL Structure

Look at your URL bar! The route naturally reflects the hierarchy: `/notes/demo-features/demo-subpage`. This is handled seamlessly by the new `[...slug].astro` dynamic route logic.
