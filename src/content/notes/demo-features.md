---
title: "Feature Demonstration: TOC & Images"
description: "A showcase of the new TOC sidebar and advanced image formatting features."
pubDate: 2026-05-27
subject: "Demo"
toc: true
toc_depth: 3
---

Welcome to the feature demonstration! This page showcases the new Table of Contents (TOC) sidebar and advanced image formatting capabilities.

## Introduction to the TOC

Notice the sidebar on the right (if you're on a desktop). It automatically extracts headings from this document! Try scrolling down, and you will see the active section highlighted. On mobile devices, this sidebar is hidden behind a button in the bottom-right corner.

### Nested Headings

This is an `H3` heading. Because we set `toc_depth: 3` in the frontmatter, it will show up indented in the sidebar.

## Image Formatting

You can now use custom directives to float images and wrap text around them. Let's see some examples.

### Floating Left

::image{src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=400&q=80" float="left" width="300px" rounded="true" border="true" caption="A beautifully wrapped image"}

This text will naturally wrap around the image floating on the left. The image uses the `rounded` and `border` attributes to give it a polished, premium look. Because we specified `width="300px"`, it won't take up the full screen, allowing this paragraph to sit nicely alongside it. This is incredibly useful for reports or blog posts where you want to include diagrams or illustrations without breaking the flow of reading.

::clearfix

Using `::clearfix` ensures that the float is cleared, and any subsequent content starts on a fresh line below the image!

### Centered and Wide

::image{src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=400&q=80" align="center" width="80%" rounded="true" caption="A wide, centered landscape image"}

Sometimes you want an image to break up the text entirely. By setting `align="center"` and `width="80%"`, the image spans comfortably across the content area.

## Sub-Pages (Deep Dives)

Finally, you can link out to unlisted "Sub-pages". These pages won't clutter your main Notes directory. Below is a link to a sub-page that goes into more detail.

::subpage{slug="demo-features/demo-subpage" label="Explore the sub-page features"}
