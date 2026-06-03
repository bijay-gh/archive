---
title: "Modern NVIDIA GPU Architecture: GA102 (Ampere)"
tags: ["gpu", "architecture", "hardware", "nvidia"]
author: "Bijaya Ghimire"
pubDate: 2026-06-03
description: "An in-depth look at the architecture of modern NVIDIA GPUs, focusing on the GA102 (Ampere) design, SMs, Tensor Cores, and RT Cores."
subject: "Computing"
toc: true
toc_depth: 2
---

The fundamental organizational structure of modern GPUs follows a hierarchical design that scales from individual transistors to clusters of processing units. The architecture typically follows this hierarchy:

<!-- **GPU Die** → **Graphics Processing Clusters (GPCs)** → **Streaming Multiprocessors (SMs)** → **CUDA Cores** -->

To understand the architecture of modern GPU we use NVIDIA's GA102 die (used in RTX 30-series) contains 28.3 billion transistors spread across just a few square centimeters.This die houses 7 GPCs, each containing 12 SMs, totaling 84 SMs on the full GPU. The H100 (Hopper architecture) features 144 SMs with significantly enhanced capabilities, while the newer Blackwell B200 uses a dual-die design with over 208 billion transistors.