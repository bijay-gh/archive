---
title: "Multimedia Demo Report"
description: "Demonstrates video, image, and audio embeds"
pubDate: 2026-05-26
tags: ["demo", "multimedia"]
media:
  hasVideo: true
  hasAudio: true
  hasImages: true
---

This report showcases the various multimedia embedding features supported by the design system. 

## 1. Local Video Embed
We can embed local videos using the `::video` directive.

::video{src="/media/reports/sample-multimedia/demo.mp4" caption="Demo walkthrough of a flower blooming"}

## 2. YouTube Embed
YouTube videos are automatically parsed and displayed with a privacy-friendly embed.

::video{url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" caption="Example YouTube Embed"}

## 3. Local Image with Caption
Images can be embedded with captions and a lightbox feature.

::image{src="/media/reports/sample-multimedia/chart.png" caption="A slice of grapefruit" alt="Grapefruit slice"}

## 4. Image Gallery
Multiple images can be grouped into a responsive grid.

::gallery{images="/media/reports/sample-multimedia/chart.png,/media/reports/sample-multimedia/chart.png" captions="Image 1,Image 2"}

## 5. Audio Player
We have a custom-styled, accessible audio player for local audio files.

::audio{src="/media/reports/sample-multimedia/audio.mp3" caption="T-Rex Roar Recording"}
