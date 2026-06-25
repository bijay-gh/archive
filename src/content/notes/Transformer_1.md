---
title: Transformer Architecture
description: A deep dive into the attention mechanism and multi-head attention in transformer models.
pubDate: 2025-12-01
subject: "Transformer"
tags: ["transformer", "attention", "multi-head attention"]
draft: false
toc: true
toc_depth: 3
---


## Attention

Attention is the mechanism in the transformer that weighs and combines the
representations from appropriate other tokens in the context from layer k to build
the representation for tokens in layer k+1. In casual Left-to-Right language model contex is any of the prior words. So, while processing $x_{\text{i}}$ the model has to access $x_{\text{i}}$ as well as all the representation of prior words innthe context window. So, Attention map input sequence $(x_{\text{1}},x_{\text{2}},x_{\text{3}},....,x_{\text{n}})_{\text{N}}$ to output sequence of same length $(a_{\text{1}},a_{\text{2}},a_{\text{3}},....,a_{\text{n}})_{\text{N}}$.



### Simplified version of attention

At its heart, attention is really just a weighted sum of context vectors, with a lot of complications added to how the weights are computed and what gets summed. For pedagogical purposes, let’s first describe a simplified intuition of attention, in which the attention output $a_i$ at token position $i$ is simply the weighted sum of all the representations $x_j$, for all $j \leq i$; we will use $\alpha_{ij}$ to mean how much $x_j$ should contribute to $a_i$(simply, weight for contex vector $a_i$).
$$
Simplified\;version: a_i = \sum_{j \le i} \alpha_{ij}\: x_j 
$$
In attention we weight each propr embedding propotionally to how similar it is to current token. Similarity score is computed as a dot product of two vectors, then normalize these vectors with softmax.
$$
\begin{aligned}
Simplified\; version:\;score(x_i,x_j) &= x_i \cdot x_j \\
\alpha_{ij} &= softmax(score(x_i, x_j)) \ \forall j \le i
\end{aligned}
$$

### Attention Head
In practice, the attention mechanism is more complicated than the simplified version described above. The attention head allow us to distinctly represent three different role that each input embedding can play in the attention mechanism: **Query, Key and Value**. 

* **Query**: The query vector represents the current token for which we are computing the attention output. It is used to compute the similarity scores with the key vectors of all tokens in the context.
* **Key**: The key vector represents each token in the context. It is used to compute the similarity scores with the query vector of the current token.
* **Value**: The value vector also represents each token in the context, but it is used to compute the weighted sum that produces the attention output. The value vectors are weighted by the attention weights derived from the similarity scores between the query and key vectors.

To capture these different roles, the transformer uses three separate linear projections(which can also be understaned as weights) to transform the input embedings into query, key and value vectors. This allows the model to learn different representations for the same input token depending on whether it is being used as a query, key, or value in the attention mechanism.
$$
q_i = W^Q x_i \quad
k_i = W^K x_i \quad
v_i = W^V x_i
$$
To compute similarity between current element $x_i$ and prior element $x_j$, we use the **dot product** between
 **Query vector** $q_i$ (current element) and **Key vector** $k_j$ (preceding elements)

Since dot products can produce arbitrarily large values — causing numerical instability and vanishing gradients — we **scale by dividing by** $\sqrt{d_k}$ (square root of query/key dimensionality):



$W^O$ is the output projection matrix to map the head output back to the same dimension as input embedding.

::image{src="/media/notes/transformer/attention_01.png" float="right" display="inline" width="600px" border="true" rounded="true" caption="Attention Mechanism, calculating the third element  of sequence."}


The input to attention $x_i$ and the output from attention $a_i$ both have the same dimensionality $[1 ×d]$. We often call $d$ the model dimensionality. Lets see the dimensions of the matrices involved in the attention mechanism:
* $x_i$: $[1 × d]$ (input embedding)
* $q_i$, $k_i$: $[1 × d_k]$ (query, key vectors)
* $v_i$: $[1 × d_v]$ (value vector)
* $W^Q$, $W^K$: $[d × d_k]$ (projection matrices for query and key)
* $W^V$: $[d × d_v]$ (projection matrix for value)
* $\alpha_{ij}$: scalar (attention weight)
* $\text{head}_i$: $[1 × d_v]$ (weighted sum of value vectors)
* $W^O$: $[d_v × d]$ (output projection matrix)
* $a_i$: $[1 × d]$ (final attention output)

But almost always, we have $d_k = d_v = d_{model}$, so the dimensions of query, key, and value vectors are the same as the input embedding dimension. This allows for efficient computation and simplifies the architecture of the transformer model.





### Multi-Head Attention

In practice, the transformer uses multiple attention heads aiming to learn different representations and capture different aspects of the input data by using different set of linear projections(weight matrices) for each head. The outputs of all attention heads are then concatenated and projected back to the original embedding dimension using an output projection matrix. 
So in multi-head attention we have $A$ separate attention heads that reside in parallel layers at the same depth in a model.Thus 
each head $c$ has its own set of projection matrices $W^{Qc}$, $W^{Kc}$, and $W^{Vc}$ to compute its own query, key, and value vectors. The outputs of all heads are then concatenated and projected back to the original embedding dimension using an output projection matrix $W^O$.
So the computation for multi-head attention can be expressed as

::image{src="/media/notes/transformer/multi-head_attention.png"  float="right" display="inline" width="500px" border="true" rounded="true" caption="Multi-head attention computation for input $x_i$, producing output $a_i$." margine="10px"}

$$
q_i^c = W^{Qc} x_i \quad
k_j^c = W^{Kc} x_j \quad
v_j^c = W^{Vc} x_j  \quad \forall c \quad 1\leq c \leq A \\


\text{score}^c(x_i,x_j) = \frac{q_i^c \cdot k_j^c}{\sqrt{d_k}} \\
\alpha_{ij}^c = softmax(score^c(x_i, x_j)) \ \forall j \le i \\
\text{head}_i^c = \sum_{j \le i} \alpha_{ij}^c v_j^c \\
a_i = (head_i^1\oplus head_i^2 ...\oplus head_i^A) W^O
$$

* Each of the $A$ heads produces an output of shape $[1 \times d_v]$
* All $A$ outputs are <strong>concatenated</strong> → $[1 \times Ad_v]$
* Then projected via $W^O \in \mathbb{R}^{Ad_v \times d}$ → final output $[1 \times d]$

