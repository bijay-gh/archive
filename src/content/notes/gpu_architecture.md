---
    title: "Internal Architecture of Modern GPUs v1.1"
    description: "A deep dive into NVIDIA's GA102 GPU die, Graphics Processing Clusters (GPCs), Streaming Multiprocessors (SMs), CUDA Cores, and the surrounding hardware that makes the whole card work."
    pubDate: 2025-12-27
    subject: "GPU Architecture"
---

The fundamental organizational structure of modern GPUs follows a hierarchical design that scales from individual transistors to clusters of processing units. The architecture typically follows this hierarchy:

**GPU Die** → **Graphics Processing Clusters (GPCs)** → **Texture Processing Clusters (TPCs)** → **Streaming Multiprocessors (SMs)** → **CUDA Cores**

To understand the architecture of a modern GPU we use NVIDIA's [Ampere GA102 die](https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf) (used in RTX 30-series) as the reference. This die contains 28.3 billion transistors spread across 628.4 mm² of silicon — roughly the size of a postage stamp. It houses 7 GPCs, each containing 12 SMs, totalling 84 SMs on the full GPU. The H100 ([Hopper architecture](https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c)) features 144 SMs with significantly enhanced capabilities, while the newer [Blackwell](https://resources.nvidia.com/en-us-blackwell-architecture) B200 uses a dual-die design with over 208 billion transistors.

---

### Nvidia RTX 3080

::image{src="/media/notes/gpu/nvidia_rtx_3080.png" align="center" width="100%" rounded="true" border="true" caption="RTX 3080 Founders Edition — the GPU die sits under the heatsink at the center of the PCB, surrounded by GDDR6X memory chips, voltage regulators, and power connectors. (Branch Education)"}

---

## The GPU Die

A GPU **die** is the raw piece of silicon that contains every transistor, logic gate, and execution unit that makes the GPU work. Everything described in these notes — the SMs, RT Cores, Tensor Cores, caches — all lives on this one slice of silicon. The die is then mounted into a package with a heat spreader on top and placed at the center of the PCB.

#### GA102 at a glance

<div style="display: flex; gap: 2rem; align-items: start; flex-wrap: wrap; margin: 1.5rem 0;">
<div style="flex: 1 1 280px;">

| | |
|---|---|
| Process | Samsung 8nm custom ("8N") |
| Transistors | 28.3 billion |
| Die size | 628.4 mm² |
| GPCs | 7 |
| SMs | 84 (full die) |
| CUDA Cores | 10,752 (full die) |
| RT Cores | 84 × 2nd gen |
| Tensor Cores | 336 × 3rd gen |
| Memory bus | 384-bit GDDR6X |
| L2 Cache | 6,144 KB (6 MB) |

> **Note:** Consumer cards (RTX 3080, RTX 3090) use slightly binned versions of GA102 with some SMs disabled. The complete 84-SM die appears in the professional RTX A6000 and NVIDIA A40.

</div>
<div style="flex: 1 1 280px;">

::image{src="/media/notes/gpu/DIE.png" width="100%" rounded="true" border="true" caption="GA102 die photograph. The seven large rectangular blocks are the GPCs. The L2 cache slices and memory controllers run along the left and right edges, directly adjacent to where the GDDR6X chips connect."}

</div>
</div>

---

## How the chip is organized

Work flows from the CPU down this hierarchy, gets divided at each level, and results bubble back out.

```
CPU → PCIe 4.0 interface (on-die)
        ↓
  Gigathread Engine          ← top-level scheduler; distributes thread blocks across SMs
        ↓
  GPC × 7                    ← Graphics Processing Cluster
  ├── Raster Engine
  ├── 16 ROPs (2 partitions × 8 units)
  └── TPC × 6                ← Texture Processing Cluster
      ├── PolyMorph Engine
      └── SM × 2             ← Streaming Multiprocessor
          ├── 128 CUDA Cores
          ├── 4 Tensor Cores (3rd gen)
          ├── 1 RT Core (2nd gen)
          ├── 4 Texture Units
          ├── 256 KB Register File
          └── 128 KB L1 Cache / Shared Memory (unified, configurable)
        ↓
  L2 Cache (512 KB per memory controller slice = 6,144 KB total)
        ↓
  12 × 32-bit Memory Controllers (384-bit total) → GDDR6X chips
```

> **The math:** 7 GPCs × 6 TPCs × 2 SMs = **84 SMs**. Each SM has 128 CUDA Cores → 84 × 128 = **10,752 CUDA Cores** total.

<div style="display: flex; gap: 1rem; align-items: start; flex-wrap: wrap; margin: 1rem 0;">
<div style="flex: 1 1 280px;">

::image{src="/media/notes/gpu/GPU.png" width="100%" rounded="true" border="true" caption="GA102 die annotated — the seven shaded regions are the seven GPCs. Each takes up roughly 1/7 of the die area and operates largely independently."}

</div>
<div style="flex: 1 1 280px;">

::image{src="/media/notes/gpu/GPC.png" width="100%" rounded="true" border="true" caption="A single GPC zoomed in, showing its 12 SMs arranged across 6 TPCs (2 SMs per TPC), plus the Raster Engine and ROP units at the boundary."}

</div>
</div>

::image{src="/media/notes/gpu/nvidia-ampere-ga-102-gpu-architecture.png" align="center" width="100%" rounded="true" border="true" caption="GA102 logical block diagram from NVIDIA's whitepaper. The seven GPCs (top and bottom halves) are flanked on all sides by memory controllers and L2 cache slices. The Gigathread Engine and PCIe/NVLink interfaces sit at the top center."}

---

## Inside the SM
The SM is where all actual computation happens. It's split into **4 identical processing partitions**, each with its own warp scheduler that issues instructions to 32 threads simultaneously. The four partitions run in parallel, giving 128 threads executing per clock cycle across the full SM.

``
SM
├── Partition 1 — Warp Scheduler | 32 CUDA Cores | Tensor Core | 4 LD/ST | SFU
├── Partition 2 — Warp Scheduler | 32 CUDA Cores | Tensor Core | 4 LD/ST | SFU
├── Partition 3 — Warp Scheduler | 32 CUDA Cores | Tensor Core | 4 LD/ST | SFU
├── Partition 4 — Warp Scheduler | 32 CUDA Cores | Tensor Core | 4 LD/ST | SFU
└── Shared across all 4:
    ├── 128 KB L1 / Shared Memory (unified, reconfigurable)
    ├── 4 × Texture Units
    ├── 1 × RT Core (2nd gen)
    └── 256 KB Register File (64 KB per partition)
``

Each partition also contains an **L0 instruction cache** that holds recently fetched instructions, reducing fetch latency for tight loops common in shader code.

> Each partition has **two arithmetic datapaths**. In Turing, datapath B handled only INT32. Ampere made datapath B also capable of FP32, doubling peak FP32 throughput without adding extra CUDA Cores — just repurposing existing silicon.

<div style="display: flex; gap: 1rem; align-items: start; flex-wrap: wrap; margin: 1rem 0;">

<div style="flex: 1 1 280px; display: flex; flex-direction: column; gap: 5rem;">

::image{src="/media/notes/gpu/SM.png" width="100%" rounded="true" border="true" caption="A single SM on the GA102 die, showing the four warp processing partitions (the four large square blocks) and the RT Core at the bottom of the SM region."}

::image{src="/media/notes/gpu/warp.png" width="100%" rounded="true" border="true" caption="One warp partition zoomed in on the die: 32 CUDA Core cells (left columns) and the single 3rd-gen Tensor Core block (right). All 32 CUDA Cores execute the same instruction in lockstep across 32 threads."}

</div>

<div style="flex: 1 1 280px;">

::image{src="/media/notes/gpu/nvidia-ampere-ga-102-gpu-architecture-sm.png" width="100%" rounded="true" border="true" caption="GA10x SM logical diagram: four identical processing partitions (orange headers) each with a warp scheduler, two FP32/INT32 datapaths, one 3rd-gen Tensor Core, and LD/ST units. The 128 KB L1/shared memory and RT Core are shared at the bottom."}

</div>

</div>

---

### The three core types inside every SM

These aren't interchangeable — each has a narrow job it does 10–100× faster than general CUDA Cores could.

**CUDA Cores** `128 / SM`\
General-purpose scalar ALUs. Run all programmable shader stages — vertex, pixel, geometry, and general compute kernels. Every rendered frame is primarily computed here. In Ampere, both arithmetic datapaths per partition can now do FP32 (vs. Turing where one was INT32-only), which is the primary reason for Ampere's 2× shader throughput improvement over Turing at the same SM count.

**Tensor Cores** `4 / SM · 3rd gen`\
Specialized matrix multiply-accumulate engines that compute D = A×B + C where A, B, C, D are small matrices. Used for DLSS denoising and super-resolution, AI inference, and scientific matrix math. Ampere adds TF32 precision (transparent AI training speedup with no code changes) and BF16. The 2:4 structured sparsity feature effectively doubles inference throughput on pruned networks by skipping zero-value weights.

**RT Core** `1 / SM · 2nd gen`\
Dedicated ray tracing hardware. Handles BVH (Bounding Volume Hierarchy) traversal and ray-triangle intersection testing, returning a hit or miss result to the SM. This completely frees CUDA Cores from ray traversal work. In Ampere: 2× intersection throughput vs Turing, and RT work can now run concurrently with shading — in Turing these had to take turns.

---

## Other components on the die

The GPU die contains much more than just SMs. The following fixed-function blocks handle memory access, scheduling, display output, video encode/decode, and the interfaces that connect the GPU to the rest of the system.

---
::image{src="/media/notes/gpu/details_comp.png" float="right" width="800px" rounded="true" border="true" caption="GA102 die showing all major on-chip blocks: the seven orange Graphics Processing Clusters (GPCs) dominate the center, flanked on both sides by teal memory controllers. At the bottom, the two pink L2 Cache slices sit on either side of the gold Gigathread Engine — the top-level thread scheduler. The blue PCIe Interface block runs along the very bottom edge, and the NVLink interface is visible in green at the top right."}


### Gigathread Engine

The Gigathread Engine is NVIDIA's top-level hardware thread scheduler. It sits between the PCIe host interface and all the GPCs, and its job is purely organizational — it does not execute any threads itself.

When the CPU launches a GPU workload (a compute kernel or a draw call), the driver packages it as a grid of thread blocks. The Gigathread Engine receives this grid and distributes thread blocks to SMs across all GPCs, load-balancing so no SM sits idle while others are overloaded. It also handles fast context switching between graphics and compute workloads, which is how Async Compute (running multiple independent workloads simultaneously) is managed at the top level.

Without the Gigathread Engine, programmers would have to manually assign work to specific SMs — instead, you just define the grid and block size, and the hardware figures out the rest.

---

### L1 Cache and Shared Memory

Each SM has a **128 KB unified on-chip memory block** that serves as both the L1 data cache and the shared memory scratchpad. "Unified" means the same physical SRAM is partitioned dynamically between the two roles depending on what the workload needs.

**L1 data cache** acts like a traditional CPU cache — it automatically retains recently accessed data so future reads hit fast on-chip memory instead of slow GDDR6X. The GPU hardware manages what goes in and out.

**Shared memory** is explicitly programmer-controlled scratchpad memory. Threads within the same thread block can write data here and read each other's results, enabling fast communication between threads without going to GDDR6X.

In **compute mode**, the split is configurable:

| L1 Cache | Shared Memory |
|---|---|
| 128 KB | 0 KB |
| 96 KB | 32 KB |
| 64 KB | 64 KB |
| 28 KB | 100 KB |

In **graphics mode**, the allocation is fixed: 64 KB L1/texture cache + 48 KB shared memory + 16 KB reserved for graphics pipeline state.

GA102 doubled the L1 per SM versus Turing (from 96 KB to 128 KB) and also doubled shared memory bandwidth to **128 bytes per clock per SM** (vs 64 bytes/clock in Turing). Total L1 bandwidth for the RTX 3080 is 219 GB/s, versus 116 GB/s on the RTX 2080 Super.

---

### L2 Cache

The L2 cache is shared by all SMs on the die. In GA102, **512 KB of L2 cache is paired with each of the 12 memory controllers**, giving a total of **6,144 KB (6 MB)** of L2. Each slice sits physically adjacent to its memory controller on the die.

The L2 acts as a second-level buffer between the SMs and GDDR6X. When an SM's L1 misses, it checks L2 before going all the way to GDDR6X. A cache hit in L2 is much faster than a GDDR6X access (tens of cycles vs hundreds of cycles) and draws far less power. For workloads with good data reuse — like texture sampling — a large L2 dramatically reduces how much traffic hits the memory bus.

---

### Graphics Memory Controllers and GDDR6X

GA102 has **12 memory controllers, each 32-bit wide**, giving a **384-bit total memory interface**. These controllers are the hardware that physically sends and receives data to and from the GDDR6X chips soldered on the PCB around the die.

**GDDR6X** is a new memory standard developed with Micron Technology. The key innovation is **PAM4 (Pulse Amplitude Modulation, 4-level) signaling**.

Regular GDDR6 uses NRZ (Non-Return-to-Zero) signaling — each signal wire carries one bit per clock edge (high = 1, low = 0). PAM4 uses **four discrete voltage levels** (separated by ~250 mV steps), where each level represents two bits: 00, 01, 10, or 11. Same wire, same frequency — but **twice the data per clock transition**.

Because four voltage levels are much closer together than two, PAM4 signals are more sensitive to noise. NVIDIA addressed this with **MTA (Maximum Transition Avoidance)** encoding, which prevents the signal from jumping between the highest and lowest level in a single transition — the hardest move for the receiver to distinguish reliably.

GDDR6X also introduces **pseudo-independent memory channels**, where each 32-bit controller can effectively operate its two 16-bit sub-channels independently. This helps RT Core BVH traversal, which accesses memory in irregular, non-sequential patterns that benefit from more independent channels.

| Card | Memory | Data Rate | Bus | Bandwidth |
|---|---|---|---|---|
| RTX 2080 Super | GDDR6 | 15.5 Gbps | 256-bit | 496 GB/s |
| RTX 3080 10GB | GDDR6X | 19 Gbps | 320-bit | 760 GB/s |
| RTX 3090 | GDDR6X | 19.5 Gbps | 384-bit | **936 GB/s** |
| RTX A6000 | GDDR6 | 16 Gbps | 384-bit | 768 GB/s |

> GDDR6X on the RTX 3090 was the first consumer GPU memory to exceed 900 GB/s — the biggest generational bandwidth leap in ten years, since the GeForce 200 series.

---

### Raster Operations Units (ROPs)

ROPs are fixed-function hardware blocks that handle the final step of the rendering pipeline: writing finished pixel data to the framebuffer in GDDR6X. They handle depth testing (is this pixel behind something already drawn?), alpha blending (transparency), and anti-aliasing sample accumulation.

In every GPU generation before Ampere, ROPs were physically located next to the memory controllers because they write directly to GDDR6X. GA102 moves the ROPs **into the GPC**, with 16 ROP units per GPC (two partitions of 8 each).

This matters because: the scan conversion frontend (which generates pixels to shade) is inside the GPC, while the ROPs (which write the shaded pixels) were previously far away at the memory controller. Moving them into the GPC eliminates the throughput mismatch between how fast pixels are generated versus how fast they can be written out. It also allows more ROPs for the same memory bus width — **112 ROPs** in GA102 versus 96 in TU102, on the same 384-bit bus.

---

### PCIe Interface

The PCIe (Peripheral Component Interconnect Express) interface is the physical connection between the GPU and the CPU/system. It is implemented directly on the GA102 die as a **PCIe 4.0 x16 host interface**.

PCIe 4.0 doubles the per-lane bandwidth compared to PCIe 3.0:

| Version | Per-lane bandwidth | x16 slot total |
|---|---|---|
| PCIe 3.0 | 1 GB/s each direction | ~16 GB/s |
| PCIe 4.0 | 2 GB/s each direction | **~32 GB/s each way / 64 GB/s total** |

The PCIe interface carries:
- **Command buffers** — draw calls and compute kernels sent from the CPU driver
- **Texture and geometry data** — asset uploads from system RAM to GDDR6X
- **GPU-to-CPU readbacks** — results of compute workloads being read back by the CPU
- **RTX IO transfers** — compressed game data streamed directly from NVMe SSD to GPU memory via DirectStorage, bypassing system RAM and the CPU decompressor entirely

The GPU also uses the PCIe bus for **GPUDirect for Video**, which allows video capture cards and network cards to DMA data directly into GPU memory without going through the CPU — important for live broadcast and streaming workflows.

---

### NVLink

NVLink is NVIDIA's proprietary high-speed direct GPU-to-GPU interconnect, designed for workloads that need more memory than a single GPU can provide, or that need to share data between GPUs faster than PCIe allows.

GA102 uses **third-generation NVLink**, implemented as **four x4 NVLink links**:

| Metric | Value |
|---|---|
| Links | 4 × x4 |
| Bandwidth per link (each direction) | 14.0625 GB/s |
| Total per direction | 56.25 GB/s |
| **Total bidirectional bandwidth** | **112.5 GB/s** |

Compare that to PCIe 4.0 x16: 64 GB/s total bidirectional. NVLink is nearly **2× faster** than PCIe for GPU-to-GPU traffic.

With NVLink, two RTX A6000 or two NVIDIA A40 GPUs can be bridged to expose **96 GB of combined GPU memory** as a single unified address space. This lets applications transparently allocate data across both GPUs without manually managing which data lives where. For the RTX 3090, NVLink supports 2-way SLI (3- and 4-way SLI are not supported on GA102).

NVLink connects via a physical **bridge connector** that sits on top of both GPUs. GA102's NVLink connector is more compact than the previous generation, enabling use in a wider range of servers and workstations.

---

## Card specs — GA102 lineup

| Card | SMs | CUDA Cores | VRAM | Bandwidth | FP32 TFLOPS | TGP |
|---|---|---|---|---|---|---|
| RTX 2080 Super *(Turing, prev gen)* | 48 | 3,072 | 8 GB GDDR6 | 496 GB/s | 11.2 | 250W |
| RTX 3080 10GB | 68 | 8,704 | 10 GB GDDR6X | 760 GB/s | 29.8 | 320W |
| RTX 3090 | 82 | 10,496 | 24 GB GDDR6X | 936 GB/s | 35.6 | 350W |
| RTX A6000 *(full die · pro)* | 84 | 10,752 | 48 GB GDDR6 | 768 GB/s | 38.7 | 300W |

---


## Components on the physical PCB

The GPU die is only one part of the graphics card. The PCB (printed circuit board) surrounding it contains several other critical components.

### GDDR6X Memory chips

The GDDR6X chips are soldered directly around the die on the PCB. On the RTX 3080, there are 10 Micron GDDR6X chips, each 1 GB, connected directly to the die's 12 memory controllers via extremely short PCB traces to preserve signal integrity at 19 Gbps speeds. Their physical placement around the die perimeter is dictated by the need for equal-length traces to each memory controller.

### Voltage Regulators (VRMs)

Modern GPUs like the RTX 3080 draw up to 320W of power but the PCIe slot and power connectors supply 12V. The onboard **VRM (Voltage Regulator Module)** converts this 12V input down to the much lower voltages the GPU die actually uses — typically around 0.8–1.1V for the core, with separate rails for memory and I/O.

The RTX 3080 Founders Edition uses a 20-phase power delivery system. More phases means each phase handles less current, which generates less heat and allows more precise voltage regulation. Clean, stable voltage is critical for GDDR6X's PAM4 signaling and for the GPU core running reliably at boost clocks.

The voltage is controlled by a **GPU power controller chip** (a small IC usually near the VRM inductors) that communicates with the GPU die over a low-speed control bus. The GPU can request voltage changes in real time as it ramps clock speeds up and down.

### Power Connectors

The RTX 3080 uses a single 12-pin connector (or two 8-pin connectors via an adapter on non-FE cards) to receive up to 320W from the PSU. The PCIe slot itself provides a maximum of 75W, so the power connectors supply the remainder. The GPU die continuously monitors power consumption and throttles clock speed if the board exceeds its power limit, a process called power capping or TDP limiting.

### Display Outputs

The RTX 3080 Founders Edition has three DisplayPort 1.4a outputs and one HDMI 2.1 output. These connect to the **display engine** on the GA102 die, which is separate from the shader and compute hardware — it handles compositing the final frame and driving the physical display signals at the correct resolution and refresh rate. The display engine supports up to 8K @ 60Hz via HDMI 2.1 with DSC (Display Stream Compression).

### PCIe Edge Connector

The gold-plated edge connector at the bottom of the card is the physical PCIe x16 interface that slots into the motherboard. It carries 16 PCIe 4.0 lanes — the communication channel between the GPU and the CPU for all command, data, and control traffic (outside of NVLink GPU-to-GPU traffic).

### NVLink Connector (on select cards)

The RTX 3090 and professional cards (A6000, A40) have a gold NVLink bridge connector on the top edge of the card. This is where the NVLink bridge accessory physically attaches to connect two GPUs. Cards without NVLink (RTX 3080, RTX 3070) have this connector either absent or covered.

---

## Architecture evolution after Ampere

### Ada Lovelace — 2022 · RTX 40 series
`AD102 · TSMC 4nm · 76.3B transistors · 16,384 CUDA Cores`

- **DLSS 3 Frame Generation** — AI generates entire intermediate frames, not just upscales pixels. Up to 4× effective frame rate in supported games.
- **FP8 Tensor Core (4th gen)** — 2× throughput of FP16. RTX 4090 hits ~1,321 AI TOPS.
- **Shader Execution Reordering (SER)** — reorders divergent RT shader work across the SM to reduce warp stalls. A significant ray tracing performance improvement.
- 3rd gen RT Cores with faster BVH traversal
- Dual AV1 encoders (8th gen NVENC) — AV1 encode added for the first time
- NVLink removed on consumer cards

### Hopper — 2022 · data center only
`GH100 · TSMC 4nm · 80B transistors · H100/H200`

- **Transformer Engine** — automatically switches precision between FP8 and FP16 layer-by-layer during LLM training. The defining Hopper feature.
- **FP8 support** — nearly 4× the TFLOPS of FP16
- **HBM3 memory** — 3.35 TB/s bandwidth (vs ~2 TB/s on A100)
- NVLink 4th gen + NVSwitch — 900 GB/s between GPUs for large AI clusters
- No consumer card — purely a data center product

### Blackwell — 2025 · RTX 50 series
`GB202 · TSMC 4nm · GDDR7 · RTX 5090/5080/5070`

- **DLSS 4 Multi-Frame Generation** — up to 3 AI frames per rendered frame (vs 1 in Ada). Up to 8× effective frame rate vs native.
- **FP4 Tensor Core (5th gen)** — 2× throughput of FP8, half the memory footprint. Critical for running large AI models locally.
- **Neural Shaders** — neural networks embedded directly inside GLSL/HLSL shaders. AI becomes part of the material model itself.
- **4th gen RT Core + Mega Geometry** — hardware RT of subdivision surfaces and procedural geometry. No more pre-baking geometric detail into polygons.
- **GDDR7** (PAM3 signaling) — ~1.8 TB/s on RTX 5090
- **AI Management Processor (AMP)** — dedicated chip that schedules AI workloads alongside graphics
- 2× INT32 throughput per clock vs Ada

> The main thread from Ampere → now: each generation made AI more central to rendering. Ampere put Tensor Cores in gaming GPUs seriously (DLSS 2). Ada made AI generate entire frames. Blackwell embeds AI directly inside the shader programs themselves.

---

*Sources: NVIDIA Ampere GA102 GPU Architecture Whitepaper v2.0 · NVIDIA RTX Blackwell GPU Architecture Whitepaper*