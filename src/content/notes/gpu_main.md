---
title: "History of GPU"
tags: ["gpu", "history", "computer graphics"]
author: "Bijaya Ghimire"
pubDate: 2025-12-07
description: "History of GPUs: How Display Devices Slowly Evolved into Mathematical Machines"
subject: "Computing"
toc: true
toc_depth: 3
draft: false
---

From 1970 to 1990, graphics hardware evolved through a series of specialized, task-specific accelerators that gradually shaped the modern GPU. Early systems like Evans & Sutherland’s vector displays used display lists to draw lines directly for flight simulation, proving hardware graphics was feasible but limited to wireframes. In 1982, Silicon Graphics’ Geometry Engine moved expensive 4×4 matrix math into dedicated silicon using pipelined VLSI chips, enabling real-time 3D transformations for professional workstations and film effects. At the pixel level, the Amiga’s Blitter (1985) revolutionized 2D graphics by offloading fast block image transfers, fills, and raster operations from the CPU, a concept later mirrored by PC 2D accelerators such as ATI Mach and S3 chips. Consoles like the NES took a different path with tile- and sprite-based rendering using a PPU to avoid full framebuffers, an idea echoed today in mobile tile-based GPUs. By the mid-1990s, first consumer 3D accelerators such as 3dfx Voodoo introduced fixed-function triangle rasterization and texture mapping, while others like S3 ViRGE and NVIDIA NV1 showed the risks of weak performance and non-standard primitives. Late-1990s chips like NVIDIA RIVA/TNT, Voodoo2/3, ATI Rage, and Matrox G200 brought mature raster pipelines to PCs but still relied on the CPU for all geometry and lighting. Together, these developments show how geometry, rasterization, and pixel movement were accelerated separately for decades before finally merging into the unified, programmable GPU with hardware T&L at the dawn of the 2000s.
::subpage{slug="gpu_main/pre_gpu_era" label="Deep Dive: The Pre-GPU Era"}

## The Nvidia GeForce 256(1999)
::image{src="/media/notes/gpu/visiontek_geforce_256.jpg" float="right" width="500px" border="false" rounded="false" caption="The Nvidia GeForce 256"}

GeForce 256 turned PC graphics from “a fast raster card” into a true graphics processor by moving geometry math (T&L) onto the chip and defining what a GPU is. It offloaded a whole stage of the 3D pipeline from the CPU, changed how games were written, and set the template for later programmable, CUDA‑style GPUs

##### New idea: “GPU” with hardware T&L

- NVIDIA defined **GPU** as a single chip that does **transform, lighting, triangle setup/clipping and rendering**, capable of at least 10M polygons/s, and marketed GeForce 256 as the first product that fits this definition.
- Previous cards (Voodoo, TNT2, Rage, etc.) mainly did rasterization; the CPU still handled transforms and lighting in software, so they were called “3D accelerators” or “video cards,” not GPUs.

##### Moving geometry from CPU to GPU

- GeForce 256 added a **hardware Transform & Lighting (T&L) engine**, the first in a consumer PC chip, to perform matrix transforms (model → world → view → clip) and per‑vertex lighting calculations on the card instead of the CPU.
- This reduced CPU load and let developers increase polygon counts and lighting complexity without stalling the pipeline, especially in games with simple AI/physics but heavy graphics.

##### More complete, faster pipeline

- The chip integrated **triangle setup/clipping and a 4‑pipe (QuadPipe) pixel engine**, able to render up to 4 pixels per clock in single‑textured workloads, a step up from TNT2’s configuration.
- It also added support for more advanced effects such as **cube environment mapping** and **Dot3 bump mapping**, which improved reflections and per‑pixel lighting quality relative to earlier cards.

##### System‑level impact

- By offloading T&L, GeForce 256 let the **CPU focus on non‑graphics work** (AI, physics, game logic) while the GPU handled virtually the entire fixed‑function graphics pipeline.
- This shifted performance bottlenecks away from the CPU and encouraged **shorter GPU upgrade cycles**: gamers started caring more about their graphics card generation than their CPU generation.

> *After the GeForce 256, GPUs evolved from "configurable" fixed-function chips into fully programmable parallel computers. This evolution happened in three distinct phases: Programmable Shaders, Unified Architecture, and the AI/Tensor Era.*

### Phase 1: The Birth of Programmability (2001–2005)
This era (2001–2005) is where the "graphics card" died and the "programmable GPU" was born. It explains *why* CUDA looks like C code and *how* the hardware evolved to support logic, not just pixels.

#### 1. The  **Vertex Processor** : GeForce 3 and Vertex Shaders (2001)

Before 2001, the "T&L" engine was a black box. You fed it data, and it spat out triangles. You couldn't change the math.

- **The Innovation:** **Vertex Shader 1.0 (DirectX 8.0)**.
    - NVIDIA replaced the fixed T&L unit with a **Vertex Processor**.
    - This processor had **128 instruction slots** for your code. It wasn't general-purpose (no loops, no branching), but it was *programmable*.
    - **Architecture:** It was a **SIMD (Single Instruction, Multiple Data)** machine. One instruction (like **`ADD`**) operated on 4 numbers (x, y, z, w) at once. This 4-wide vector design is still the DNA of modern GPU cores.
#### 2. The "Pixel" Revolution: Radeon 9700 and Floating Point (2002)

While NVIDIA started with vertices, ATI (now AMD) revolutionized pixels.

- **The Innovation:** **Radeon 9700 Pro (R300)**.
    - It introduced **Pixel Shader 2.0 (DirectX 9.0)**.
    - **Critical Breakthrough:** Before this, pixel colors were integers (0–255). ATI introduced **Floating Point (FP24)** precision for pixels.
    - **Why this matters :** You can't simulate physics or train a neural network with integers 0–255. You need **`0.12345`**. By making the pixel pipeline process *floats*, ATI accidentally created a math processor that could solve partial differential equations (like fluid dynamics) if you tricked it.

#### 3. The "Hacker" Era: GPGPU (General Purpose GPU)

Between 2003–2005, clever researchers realized: *"If a pixel is just a floating-point number, why can't it be a velocity? Or a stock price?"*

- **The Hack:** They would take a math problem (like heat simulation), store the data in a **Texture** (instead of an image), and write a **Pixel Shader** to solve the equation.
- **The Limitation:** It was painful. You had to know graphics APIs (OpenGL/DirectX). You couldn't just say **`a + b`**. You had to "draw a quad" to trigger the calculation. This awkwardness created the demand for something better (CUDA).

#### 4. The Language: Cg ("C for Graphics")

NVIDIA saw researchers struggling with assembly code and released **Cg** in 2002.

- **Significance:** It was the first high-level language for GPUs that looked like C.
- **Legacy:** Cg is dead, but its syntax (**`float4`**, **`struct`**, **`half`**) was copied almost verbatim into **HLSL** (Microsoft) and **CUDA**. If you know Cg, you can read CUDA code today.

### Phase 2: The Unified Architecture & CUDA (2006–2010)

The G80 architecture (GeForce 8800 GTX, 2006) was the "Big Bang" that created the CUDA universe.

#### 1. The Architecture Shift: "Unified Shaders" (The G80)

Before 2006, GPUs had separate physical areas for "Vertex Shaders" and "Pixel Shaders." If your game had millions of vertices but few pixels (or vice versa), half the GPU sat idle.

- **The Innovation:** NVIDIA merged them into a single unit called the **Streaming Multiprocessor (SM)**.
- **How it works:** The hardware scheduler (the "GigaThread" engine) sees a backlog of work—whether it's vertex math, pixel colors, or *physics calculations*—and assigns it to any available core.
- **Teaching Analogy:**
    - *Old GPU:* A restaurant with 5 chefs for appetizers and 10 chefs for entrees. If no one orders appetizers, 5 chefs do nothing.
    - *G80/CUDA GPU:* A restaurant with 15 "universal" chefs who can cook anything. 100% utilization.

#### 2. The Birth of the "CUDA Core" (Scalar vs Vector)

This is a subtle but massive change for programming.

- **Old Way (Vector):** Pre-2006 GPUs were "SIMD-4." One instruction (**`ADD`**) added four numbers (**`x,y,z,w`**) at once. Writing code for non-graphics math was hard because you had to pack your data into groups of 4 manually.
- **New Way (Scalar):** The G80 introduced **ScalarALU** (Scalar Arithmetic Logic Unit).
    - The "CUDA Core" executes instructions on **one** number at a time (Scalar).
    - **The Magic (SIMT):** The hardware groups 32 threads together into a **Warp**. All 32 threads execute the same scalar instruction on different data.
    - **Result:** To the programmer, it looks like you are writing simple C code for *one* thread. The hardware handles the parallelism automatically. This is why CUDA is so much easier than writing vector assembly.

#### 3. Shared Memory: The "User-Managed Cache"

This is the feature that made GPGPU (General Purpose GPU) viable.

- **The Problem:** Accessing main memory (VRAM) is slow (hundreds of cycles). If threads need to talk to each other (e.g., averaging neighbors for a blur filter), reading/writing to VRAM kills performance.
- **The Solution:** NVIDIA added a small, super-fast chunk of memory (16KB on G80) inside each SM called **Shared Memory**.
    - It is as fast as a register.
    - Threads in a block can use it to exchange data without touching global VRAM.
    - **Teaching Point:** This is the *single most important optimization* in CUDA programming. It allows you to implement algorithms like matrix multiplication 10x faster by reusing data loaded into this "cache."

#### 4. The Driver API vs Runtime API

When CUDA launched (2007), NVIDIA realized writing driver-level code was too hard for scientists.

- **Driver API:** Low-level. You load binary kernel files (**`.cubin`**) manually, manage contexts, and push arguments onto the stack. Powerful but tedious (like writing DirectX/OpenGL host code).
- **Runtime API:** High-level. This is what you will learn (**`cudaMalloc`**, **`kernel<<<...>>>`**). It sits on top of the Driver API and handles the messy details (loading kernels, setting up parameters) automatically.
- **Why it matters:** The Runtime API made GPU programming accessible to non-graphics experts (biologists, financiers).

#### 5. Bank Conflicts (The New Headache)

With Shared Memory came a new type of bug.

- **Concept:** Shared memory is divided into **32 banks** (lanes). If 32 threads in a warp access 32 *different* banks, it's instant.
- **The Conflict:** If multiple threads try to access the *same* bank (e.g., Thread 0 and Thread 16 both access bank 0) at the same time, the hardware must **serialize** the requests. The parallel access becomes sequential.
- **Teaching Point:** This is a classic "CUDA Optimization" topic. You must arrange your data access patterns to avoid "stepping on toes" in shared memory

## Special Mention: Nvidia RTX
The re-introduction of specialized hardware for graphics, but this time for **Ray Tracing**. This happened with the **Turing Architecture (GeForce RTX 20 Series, 2018)**. It’s an essential bridge because it introduced the **RT Core**, which sits alongside the CUDA Core and Tensor Core.

Up until 2018, GPUs were "Rasterization Engines" (drawing triangles) that we hacked into "Compute Engines" (CUDA). With RTX, NVIDIA added a **third pillar**—hardware that solves the physics of light (Ray Tracing) much like the original Geometry Engine solved the math of shapes.

#### 1. The Problem: Rasterization vs. Ray Tracing

- **Rasterization (Old Way):** "Is this object visible?" → Project 3D triangle to 2D screen. Fast, but fake. Shadows and reflections are "hacks" (shadow maps, cube maps).
- **Ray Tracing (New Way):** "Where does this light ray go?" → Shoot a ray from the camera, bounce it off walls, calculate physics. Realistic, but expensive.
- **The Cost:** Ray tracing requires checking if a ray hits *any* of the millions of triangles in a scene. On a standard CUDA Core (SM), this involves traversing a massive tree structure (BVH - Bounding Volume Hierarchy) which consumes thousands of clock cycles per ray.

#### 2. The Solution: The RT Core (Ray Tracing Core)

With Turing (2018), NVIDIA added a new dedicated circuit called the **RT Core**.

- **Function:** It offloads two specific, expensive tasks from the main SM:
    1. **Box Intersection:** Checking if a ray hits a bounding box (BVH traversal).
    2. **Triangle Intersection:** Checking exactly where a ray hits a triangle.
- **The "Pipeline" Parallel:** Just like the SGI Geometry Engine (1982) put matrix math in hardware, the RT Core puts **tree traversal and intersection math** in hardware.
- **Performance:** A Turing GPU can calculate **10 Giga Rays/sec**, whereas a Pascal GPU (GTX 1080) doing the same math in software (CUDA cores) could only do ~1 Giga Ray/sec. It’s a 10x speedup for this specific math.

#### 3. The "Hybrid" Rendering Model

RTX didn't replace rasterization; it augmented it.

- **Rasterization:** Still draws the primary geometry (fast).
- **Ray Tracing:** Used selectively for "expensive" effects:
    - **Reflections:** (Puddles in *Battlefield V*).
    - **Global Illumination:** (Sunlight bouncing in *Metro Exodus*).
    - **Shadows:** (Soft shadows in *Shadow of the Tomb Raider*).
- **Teaching Point:** This is a perfect example of **heterogeneous computing**. You use the right tool (Core) for the right job: Raster engine for visibility, RT Core for light physics, Tensor Core for denoising (AI).

#### 4. DXR (DirectX Raytracing) & OptiX

Just as CUDA needed a language, RT Cores needed an API.

- **DXR (2018):** Microsoft standardized how games talk to RT Cores.
- **OptiX:** NVIDIA's high-level API for professional rendering (Pixar, architecture) to use RT Cores.
- **Vulkan RT:** The cross-platform standard.

## Recent Things....
The most recent advancements (2022–Present) are all about **Transformers** (the "T" in GPT) and solving the memory bottleneck. The industry has effectively decided that "Artificial Intelligence = Transformers," and the hardware is now being custom-built just to run them.

#### 1. Hopper Architecture (H100, 2022)

This chip is the workhorse of the modern AI revolution.

- **The Innovation:** **Transformer Engine**.
    - **Problem:** AI models were using FP16 (16-bit) math. It was fast, but not fast enough for trillion-parameter models.
    - **Solution:** NVIDIA added native **FP8 (8-bit floating point)** support.
    - **How it works:** The "Transformer Engine" is a software/hardware hybrid layer. It automatically analyzes your neural network layer-by-layer. If a layer is stable, it casts it to 8-bit (FP8). If it needs precision, it keeps it at 16-bit.
    - **Result:** You get **double the speed** (throughput) and **half the memory usage** of the previous generation (A100) with no loss in accuracy. This is why H100s are sold out everywhere.
- **DPX Instructions:** New hardware instructions specifically for **Dynamic Programming** (used in genomics and DNA sequencing), speeding up those algorithms by 7x.

#### 2. Grace Hopper Superchip (GH200, 2023)

For 15 years, the GPU was a "peripheral" that had to talk to an Intel/AMD CPU over a slow PCIe wire. NVIDIA decided to kill the middleman.

- **The Innovation:** **Unified CPU+GPU Memory**.
    - NVIDIA built its own CPU (Grace, based on ARM) and fused it directly to the GPU (Hopper).
    - **Chip-to-Chip (C2C) Interconnect:** Instead of PCIe (64 GB/s), they communicate at **900 GB/s**.
    - **Impact:** The GPU can now access the CPU's massive RAM (up to 480GB) as if it were its own VRAM. This allows you to run **massive models** (like Llama-70B or GPT-4 chunks) on a single chip without running out of memory.

#### 3. Blackwell Architecture (B200, Announced 2024)

This is the upcoming architecture, pushing physics to the limit.

- **The Innovation:** **Multi-Die GPU (Chiplets)**.
    - We have reached the "Reticle Limit" (the maximum size a single chip can be physically printed). You cannot make a bigger GPU.
    - **Solution:** The B200 is actually **two huge GPU dies** glued together so tightly (10 TB/s interconnect) that the software thinks it's one single chip.
- **New Math:** **FP4 (4-bit Floating Point)**.
    - Blackwell supports **4-bit** math for inference. This effectively doubles the speed again over H100's FP8.
    - **Impact:** This is designed purely for **Inference** (running the AI), aiming to make running GPT-4 cheap enough for every application.

[<span style="border: 2px solid #c4bbbbff; border-radius: 20px; padding: 2px 8px;">INTERNAL ARCHIECURE OF MORDEN GPU....AMBER ARCHITECTURE</span>](/notes/gpu_architecture)