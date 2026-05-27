---
title: "Deep Dive: The Pre-GPU Era"
description: "What was happening before the GPU"
pubDate: 2026-05-27
subject: "Computer Vision"
listed: false
parent: "gpu_main"
toc: true
toc_depth: 3
---

## Deep Dive: The Pre-GPU Era (1970–1990)
Before the modern GPU existed, computer graphics faced two distinct challenges: computing where objects should be (geometry) and filling pixels on screen (rasterization). These were solved separately by specialized hardware, each innovation building toward the unified GPU architecture we use today.

### The Vector Era (1970s): Evans & Sutherland and Display Lists
The earliest graphics accelerators didn't use pixels at all. **Evans & Sutherland (E&S)**, founded by Ivan Sutherland (the father of computer graphics), pioneered the concept of specialized graphics hardware for simulation.

**The Innovation:** The company built the **Picture System (1974)** and later the **LDS-1 (Line Drawing System)**, which used vector displays—CRT monitors that drew lines directly by deflecting an electron beam, rather than filling a grid of pixels. This approach had infinite resolution and no aliasing, but couldn't efficiently display solid-filled surfaces.

**Architecture:** These systems used **display lists**—a program stored in memory describing what to draw (e.g., "draw a line from (10,20) to (50,70)"). The hardware interpreted this list and rendered it every frame. This is conceptually the ancestor of modern command buffers in GPUs.

**Usage:** Commercial flight simulators for pilot training (the primary market). E&S also provided graphics tools for the 1982 film *Tron*, making it the first movie(***) to use computer-generated imagery at scale.

**Key limitation:** Vector graphics were slow for dense geometry. As 3D scenes grew more complex, this approach hit a wall.

### The Geometry Engine (1982): Silicon Graphics and Hardware Matrix Math
Jim Clark, a Stanford professor, realized the bottleneck was **mathematical**: transforming 3D coordinates into screen space required matrix multiplication, a computationally expensive operation. His insight was revolutionary: put this math in silicon.

**The Innovation:** The **Geometry Engine** was a VLSI (Very Large Scale Integration) chip that implemented the graphics pipeline in hardware. It performed 4×4 matrix operations (used for 3D transformations and projections) at hardware speed—capable of completing a full floating-point transformation in **15 microseconds**, yielding approximately 66,000 vertices per second.

**Architecture:** The system used **twelve copies of the Geometry Engine chips arranged in a pipeline**. Data flowed through like an assembly line:

- Stage 1: Matrix multiply (model-view transformation)
- Stage 2: Clipping (remove geometry outside screen bounds)
- Stage 3: Perspective division and viewport scaling

This **pipelining** approach achieved throughput by overlapping operations—a different warp of instructions executed at each stage simultaneously.

**Technology Context:** This was a breakthrough because the math was now hardware-dedicated, not fought over by the CPU. The pipeline concept would later evolve into warp scheduling in CUDA.

**Usage:** SGI workstations (the **IRIS** line, launched 1984) became the standard for professional graphics, CAD, and movie special effects. Industrial Light & Magic used SGI systems for *Terminator 2: Judgment Day* (1991) and *Jurassic Park* (1993), establishing GPUs as essential for Hollywood.

**Connection to CUDA:** The Geometry Engine proved that specialized hardware for matrix operations was revolutionary. CUDA cores do exactly this—they're optimized for the same 4×4 matrix operations, just now programmable by the user.

### The Blitter (1985): Amiga and Hardware Pixel Movement

While SGI solved geometry, the **Amiga** (released 1985) solved a different bottleneck: moving pixel data fast. The problem was **memory bandwidth**—copying a block of pixels from one place to another (for animation, scrolling, or compositing) consumed precious CPU cycles and memory bus cycles.

**The Innovation:** The **Blitter** (Block Image Transferer) was a dedicated coprocessor on the Amiga's **Agnus** chip. It could perform **bit-block transfers** (BitBLT) using **DMA (Direct Memory Access)**, bypassing the CPU entirely. While the CPU executed code, the Blitter quietly "stole" memory bus cycles to move pixel data.

**Capabilities:**

- Copy rectangular blocks of pixels (faster than CPU loops)
- Fill areas with a color
- Perform **boolean operations** on pixels (A AND B, A OR B, etc.)—called **raster operations (ROPs)**
- Draw lines
- Work during CPU idle time via cycle stealing

**Usage:** The Amiga became famous for real-time graphics and animation. The **Copper** (another coprocessor) synchronized hardware actions to the video beam, enabling scanline-by-scanline color and sprite effects. Games like *Lemmings* and professional software like the **Video Toaster** (desktop video editing in 1990) relied on this hardware.

**Key insight:** The Blitter proved that offloading pixel operations to hardware was worth the silicon cost. Modern GPUs still have ROPs (Render Output Units) that do similar operations—they're the spiritual descendants of the Amiga Blitter.

### The Console Approach (1983): NES PPU and Tile-Based Rendering

The **Nintendo Entertainment System** (NES/Famicom, 1983) took a fundamentally different approach: instead of drawing arbitrary pixels, it used **tile-based rendering** with precomputed sprites.

**The Innovation:** The **PPU (Picture Processing Unit)** used a scanline renderer that composed the display from:

- **CHR-ROM** (character ROM): Pre-drawn 8×8 tile graphics
- **Nametables** (maps): Which tile appears at each position
- **Sprite tables**: Moving objects (enemies, player)
- **Palette**: Color lookups

This avoided storing a full framebuffer (expensive in 1983 RAM) by computing pixels on-the-fly during rasterization.

**Architecture:** The PPU ran independently from the CPU, fetching tilemap data and sprite data every scanline. This is a **retained-mode** graphics system (you set state, hardware renders), unlike modern GPUs which are **immediate-mode** (you send commands, they execute).

**Usage:** Every NES game relied on this hardware. *Super Mario Bros.* (1985), *The Legend of Zelda* (1986), and thousands of others were designed around this tile + sprite model.

**Legacy:** While modern GPUs are framebuffer-based, mobile GPUs sometimes use **Tile-Based Deferred Rendering (TBDR)**, a modern echo of this approach—dividing the screen into tiles to reduce memory bandwidth.

### Early PC 2D accelerators (late 1980s–early 1990s)
Purpose‑built “GPU‑like” chips on PCs started as **2D GUI accelerators**, not 3D engines.

- **Paradigm:** The CPU still computed everything; the card accelerated only bitmaps and GUI drawing (BitBLT, line draw, rectangle fill, pattern fills).
- **Examples:**
    - ATI Mach8/Mach32 (early 1990s) and S3 86C911/Trio series added bit‑block transfers and hardware line/rectangle drawing to speed up Windows and X11 GUIs.
    - These cards are conceptually similar to the Amiga Blitter: they remove “pixel shoveling” from the CPU, but have no concept of triangles or 3D transforms.

Use this to connect to your earlier “Blitter” discussion: these chips are the PC world finally copying what the Amiga did for 2D.
### First consumer 3D accelerators (mid‑1990s)

As games like *Doom* and *Quake* showed the demand for 3D, vendors began to bolt **fixed‑function 3D pipelines** onto 2D chips or design dedicated 3D boards.

#### 3dfx Voodoo Graphics (Voodoo 1, 1996)

- **Architecture & innovation:**
    - Pure 3D **rasterizer**: it only did textured, Z‑buffered triangles; it had no 2D output, so it used a VGA **pass‑through cable** to a separate 2D card.
    - Introduced strong **Texture Mapping Units (TMUs)** with bilinear filtering and perspective‑correct texturing, delivering a huge visual and performance jump over CPU software rendering.
- **Usage:**
    - PC games like *Quake*, *Tomb Raider*, *Unreal* shipped with special “Glide” renderers (3dfx’s proprietary API) because Voodoo was so dominant.
- **Limitations:**
    - No geometry/T&L; the CPU still did all vertex processing.
    - Proprietary API (Glide) and single‑purpose design (3D only).

#### S3 ViRGE (1995–1996)

- **Architecture:** A 2D accelerator with a basic 3D pipeline added (texture mapping, Z‑buffering), but with very low fill‑rate and weak design.
- **Reputation:** Often called a “3D *decelerator*” because many games ran faster in software mode on the CPU than using its 3D hardware path.
- **Teaching point:** Shows that **bad** hardware acceleration can underperform optimized software, and that bandwidth/fill‑rate matter as much as “having 3D features.”

#### NVIDIA NV1 (1995)

- **Architecture & experiment:**
    - NVIDIA’s first consumer 3D chip used **quadratic texture‑mapped surfaces** instead of triangles.
    - It integrated 2D, 3D, sound, and gamepad I/O on one PCI card—ambitious but over‑complex.
- **Why it failed:**
    - DirectX and OpenGL standardized on **triangles**, so NV1’s quadratic approach didn’t map well to emerging APIs; developers had to write special code for it.
    - This failure pushed NVIDIA to abandon exotic primitives and fully embrace triangle‑based geometry in later chips (e.g., RIVA 128, TNT).

Good story to illustrate why **conforming to software standards (APIs)** matters as much as hardware cleverness.

---

### Console/Workstation style 3D (early–mid 1990s)

At the same time, consoles and high‑end workstations showed *different* ideas about 3D acceleration.

#### SGI‑derived console GPUs: Nintendo 64 (1996)

- **Architecture:** The N64’s **Reality Co‑Processor (RCP)**, designed with SGI, put a mini‑workstation‑class 3D pipeline into a console.
    - It had a **programmable microcode** interface for low‑level control of the geometry and rasterization units, allowing developers to trade off vertex complexity vs fill‑rate.
- **Usage:** Games like *Super Mario 64* and *The Legend of Zelda: Ocarina of Time* exploited this flexibility for advanced lighting and effects on fixed hardware.
- **Teaching angle:** This is an early example of *programmability* in the graphics pipeline (microcode), conceptually on the road toward shaders and CUDA.

#### Workstation 3D (SGI, Intergraph, etc.)

- High‑end systems continued to refine **pipelined geometry engines and rasterizers** with full OpenGL support (RealityEngine, InfiniteReality). These were direct ancestors of what GeForce 256 brought—much more cheaply—to PCs.

PCs in 1995 could only dream of what SGI workstations did in 1990, but the *ideas* were the same—matrix pipelines and triangle rasterizers..

---

### Late‑1990s PC 3D: closer to “real GPUs” (pre‑GeForce 256)

By the late 1990s, several PC chips looked very much like modern GPUs, just without hardware T&L.

#### NVIDIA RIVA 128 and TNT series (1997–1999)

- **RIVA 128 (1997):**
    - Triangle‑based 3D accelerator with integrated 2D and good Direct3D/OpenGL support, moving NVIDIA away from the failed NV1 design.
- **TNT / TNT2 (1998–1999):**
    - Multi‑texturing (two textures per pass), improved 32‑bit color, larger framebuffers, better OpenGL compliance.
    - These still relied on the CPU for all geometry but had a reasonably modern‑looking raster pipeline.

#### 3dfx Voodoo2 / Voodoo3 (1998–1999)

- **Voodoo2:** Added multi‑texturing and scalable performance via SLI (Scan‑Line Interleave: two cards rendering alternate lines).
- **Voodoo3:** Integrated 2D and 3D on one chip, but 3dfx doubled down on Glide and raster performance rather than moving toward T&L and standards compliance.

#### Other notable chips

- **Matrox Mystique / G200:** Known for sharp 2D and decent 3D; early focus on image quality and multi‑monitor, rather than raw 3D speed.
- **ATI Rage series:** Incremental move from 2D accelerators to integrated 2D/3D with TV‑out and DVD features, again with fixed‑function triangle pipelines.

Most of these late‑90s chips **still** left geometry (matrix transforms, lighting) to the CPU, then took over from the “post‑transform triangle” stage onward.