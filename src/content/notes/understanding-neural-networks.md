---
title: "Understanding Neural Networks: From Perceptrons to Transformers"
description: "Study notes covering the evolution of neural network architectures, from early perceptrons through convolutional networks to the transformer revolution."
pubDate: 2026-05-10
subject: "Machine Learning"
tags: ["machine-learning", "deep-learning", "study-notes"]
draft: false
---

These notes trace the lineage of neural network architectures from their earliest theoretical foundations to the transformer models that dominate contemporary research. Written as a personal reference, they emphasise conceptual understanding over mathematical formalism.

## The Perceptron (1958)

Frank Rosenblatt's perceptron was the first algorithmically described neural network. At its core, it performs a strikingly simple operation:

- Take a vector of inputs **x**
- Multiply each by a learned weight **w**
- Sum the results and add a bias **b**
- Pass through an activation function (originally a step function)

The perceptron can learn any *linearly separable* function. Minsky and Papert's famous 1969 critique demonstrated its inability to learn XOR — a limitation that contributed to the first "AI winter."

### Key Insight

The perceptron's limitation is architectural, not conceptual. Stack multiple layers of perceptrons together, and the resulting network can approximate *any* continuous function (Universal Approximation Theorem, Cybenko 1989).

## Backpropagation & Multi-Layer Networks

The backpropagation algorithm, popularised by Rumelhart, Hinton, and Williams in 1986, solved the credit assignment problem: how to determine which weights in a deep network are responsible for errors in the output.

> "Learning internal representations by error propagation" — the title of the landmark paper — remains one of the most consequential ideas in computing.

The algorithm works by:

1. Computing the output error (loss)
2. Propagating the error gradient backward through each layer
3. Updating weights proportionally to their contribution to the error

## Convolutional Neural Networks

Yann LeCun's LeNet (1998) introduced convolutions — a biologically inspired operation that exploits spatial locality. Key innovations:

- **Shared weights** reduce parameter count dramatically
- **Pooling layers** provide translation invariance
- **Hierarchical feature learning** — early layers detect edges, later layers detect complex shapes

Modern descendants (ResNet, EfficientNet) add residual connections and careful scaling, but the core insight remains LeCun's.

## The Transformer (2017)

The transformer architecture, introduced in "Attention Is All You Need" (Vaswani et al.), replaced recurrence with *self-attention*:

- Each token attends to every other token in the sequence
- Attention weights are learned, not fixed
- Multiple attention "heads" capture different relationships
- Position encodings replace the implicit ordering of RNNs

### Why Transformers Won

1. **Parallelisable** — unlike RNNs, transformers process all positions simultaneously
2. **Long-range dependencies** — attention connects any two positions directly
3. **Scalable** — performance improves predictably with data and compute (scaling laws)

## Open Questions

- What are the theoretical limits of transformer architectures?
- Can we achieve transformer-level performance with sub-quadratic attention complexity?
- How do emergent capabilities relate to scale, and is there a principled theory of emergence?
