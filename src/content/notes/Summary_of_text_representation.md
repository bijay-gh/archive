---
# Summary of Text Representation
title: Summary of Text Representation
description: A concise overview of the evolution of text representation methods in NLP.
pubDate: 2025-12-01
subject: "Transformer"
tags: ["transformer", "text-representation", "embedding", "context"]
draft: false
listed: true
toc: true
toc_depth: 3
---



### The Context Problem in NLP

To understand the evolution of NLP architectures, we must first distinguish between parsing a word and parsing meaning. Meaning in natural language is rarely compositional; it is relational. Understanding individual words is insufficient because human language relies heavily on polysemy, syntax, and long-range dependencies. The meaning of a token dynamically depends on the surrounding words that constrain it.

The fundamental challenge is representing sentence-level context in a computable format. We must clearly distinguish between two concepts:
* **Word Representation:** Mapping an atomic token from a vocabulary to a mathematical object (usually a vector).
* **Context Representation:** Mapping a token *in its specific sequence environment* to a mathematical object.

Early methods failed to capture dynamic contextual meaning:
* **One-Hot Encoding:** Represents a word as a sparse vector orthogonal to all other words. It assumes all words are equally dissimilar and lacks any context.
* **Bag of Words (BoW):** Represents context merely as the frequency distribution of words in a document, completely destroying word order and syntax.
* **TF-IDF:** Weights BoW by inverse document frequency, but still relies on orderless aggregation.
* **Word Embeddings:** Map words to dense vectors based on distributional semantics, but these representations remain entirely static.

### Word Embeddings Are Not Context

Word embeddings (like Word2Vec or GloVe) represent *lexical co-occurrence priors*. They project words into a dense vector space where geometric distance correlates with semantic similarity. 

However, Word2Vec assigns exactly **one vector per word type**. The word "bank" receives the exact same representation $v_{\text{bank}} \in \mathbb{R}^d$ whether it appears in the sentence "I sat by the river bank" or "I deposited money in the bank." 

Because the representation is fetched via a static lookup table, embeddings encode average semantic similarity and historical connotations, but they offer zero contextual understanding of how the word is being used in a specific instance.

### RNN – The First Neural Context Representation

Recurrent Neural Networks (RNNs) introduced the first true context representation by modeling text sequentially. The core innovation was the **Hidden State** ($h_t$), acting as a context memory.

As the RNN reads a sequence word by word, each new word updates the hidden state. The context is accumulated over time, meaning $h_t$ is a function of the current input $x_t$ and the previous hidden state $h_{t-1}$:

$$h_t = f(W_{hx} x_t + W_{hh} h_{t-1} + b)$$

*[Image Placeholder: Diagram showing an unfolded Vanilla RNN where the hidden state h is passed sequentially from time step t-1 to t]*

Information stored in $h_t$ can be interpreted as a heavily compressed, fixed-dimensional representation of *everything seen so far* up to time $t$. This moved NLP from static point-representations to dynamic, sequence-aware context representations.

| Feature | Word Embedding | RNN Context |
| :--- | :--- | :--- |
| **Representation Type** | Static | Dynamic |
| **Source of Vector** | Dictionary Lookup | Temporal Calculation |
| **Aware of Word Order?** | No | Yes |
| **Vector for "bank"** | Identical every time | Different based on prefix sequence |

### Why RNN Context Fails

Representing an entire sentence prefix using a single evolving hidden state creates a severe **information bottleneck**. 

Because the hidden state has a fixed dimensionality, compressing a 50-word sentence into the same size vector as a 3-word sentence causes information loss. Furthermore, RNNs suffer from the **vanishing gradient** problem during Backpropagation Through Time (BPTT). Repeated multiplication of the weight matrix $W_{hh}$ causes gradients to decay exponentially. 

As a result, standard RNNs exhibit a strong "recency bias." By the time the model processes the 20th word, the context of the 1st word has been largely overwritten or diluted. Long-range information is lost, making it difficult to resolve dependencies like subject-verb agreement across long clauses.

### LSTM – Explicit Context Memory

Long Short-Term Memory (LSTM) networks addressed the vanishing gradient problem by explicitly splitting context management into two streams:
1. **Cell State ($C_t$):** The long-term context storage. It acts as an information highway running straight down the entire chain with only minor linear interactions.
2. **Hidden State ($h_t$):** The working memory, containing the context immediately relevant to the current time step.

LSTMs control context preservation using gating mechanisms:
* **Forget Gate ($f_t$):** Decides which information from the past context ($C_{t-1}$) is no longer relevant and should be erased.
* **Input Gate ($i_t$):** Decides which new information from the current token should be added to the cell state.
* **Output Gate ($o_t$):** Decides what parts of the long-term context ($C_t$) should be exposed to the working memory ($h_t$).

Unlike the standard RNN that completely rewrites its hidden state, the LSTM selectively remembers and forgets, allowing vital context (like a plural subject) to bypass intermediate steps unchanged until it is needed.

### GRU – Simplified Context Management

The Gated Recurrent Unit (GRU) simplifies the LSTM by merging the cell state and hidden state into a single vector $h_t$, while still preventing vanishing gradients.

It uses fewer gates to manage context:
* **Reset Gate ($r_t$):** Controls how much past context to ignore when evaluating the new candidate state.
* **Update Gate ($z_t$):** A combined forget/input gate. It strictly balances how much of the past context $h_{t-1}$ to retain versus how much new candidate context to adopt.

Despite discarding the explicit cell state, GRUs preserve context highly effectively by explicitly learning when to pass $h_{t-1}$ forward unmodified.

### BiLSTM – Context from Both Directions

Standard RNNs/LSTMs are causally masked—they only know the words that came *before* the current word. However, in natural language, future words often disambiguate current words (e.g., "I saw a bat flying" vs "I saw a bat hitting").

Bidirectional LSTMs (BiLSTMs) solve this by running two independent LSTMs:
1. **Forward Context ($\overrightarrow{h}_t$):** Reads the sentence left-to-right.
2. **Backward Context ($\overleftarrow{h}_t$):** Reads the sentence right-to-left.

*[Image Placeholder: Diagram illustrating BiLSTM architecture with separate forward and backward LSTM layers processing the input sequence]*

The final representation for a word is the concatenation of both states: $h_t = [\overrightarrow{h}_t ; \overleftarrow{h}_t]$. This ensures that the context representation for token $x_t$ is informed by the *entire* surrounding sentence, making the representation significantly richer.

| Architecture | Context Mechanism | Strengths | Weaknesses |
| :--- | :--- | :--- | :--- |
| **RNN** | Hidden State ($h_t$) | First temporal model | Severe gradient vanishing, recency bias |
| **LSTM** | Cell State ($C_t$) + Gates | Preserves long-term dependencies | Computationally heavy, still sequential |
| **GRU** | Update & Reset Gates | Faster than LSTM, good memory | Merges memory types, strictly sequential |
| **BiLSTM** | Concatenated $[\overrightarrow{h}_t ; \overleftarrow{h}_t]$ | Full-sentence context | Cannot be used for autoregressive generation |

### The Fundamental Limitation of Recurrent Context

Despite the sophisticated gating of LSTMs and the dual-directionality of BiLSTMs, they all share a fundamental, fatal flaw: **Context is still represented through sequential hidden states.**

* **Context Compression:** The model is still trying to squeeze the entire meaning of a sentence into a fixed-width vector. 
* **Information Dilution:** Even with cell states, accessing information from step 1 at step 50 requires the data to survive 49 gating operations.
* **Sequential Processing Bottleneck:** Because $h_t$ strictly depends on $h_{t-1}$, processing cannot be parallelized. You cannot compute the context of word 10 without first computing words 1 through 9.

### The Computational & Parallelization Bottleneck
* **Strict Sequential Dependency:** Because $h_t = f(x_t, h_{t-1})$, calculating the hidden state at step $t$ is strictly blocked until step $t-1$ is fully computed. For a sequence of length $N$, this requires $O(N)$ sequential operations.
* **Poor Hardware Utilization:** Modern deep learning hardware (GPUs and TPUs) is designed to perform massive, highly parallelized matrix multiplications. Recurrent architectures fundamentally underutilize this hardware. The model spends more time waiting for the previous hidden state to arrive in memory (memory-bandwidth bound) than it does performing actual computation. 
* **Scaling Ceiling:** This strictly sequential nature makes it computationally unfeasible to train RNNs/LSTMs on the massive corpus sizes and massive sequence lengths required for modern foundational models.

### Motivation for Attention

Researchers realized that forcing a network to compress an entire sequence into a single hidden bottleneck was not only semantically destructive, but computationally paralyzing. 

The motivation for Attention (and eventually the Transformer) was a dual-purpose paradigm shift:
1. **Representational:** **Instead of remembering everything, directly access the relevant parts of the sequence whenever needed.** Rather than relying on $h_{t-1}$ to perfectly pass along the meaning of $x_1$, an attention mechanism allows the network at step $t$ to look back directly at the representations of all previous words and compute a weighted sum based on relevance. 
2. **Computational:** **Replace $O(N)$ sequential steps with $O(1)$ parallel operations.** By abandoning recurrence entirely, Attention architectures process all tokens in a sequence simultaneously. This turns the context-gathering process into a series of massive, parallel matrix multiplications—exactly what GPUs are optimized to calculate. 

This eliminated the sequential path length, replacing recurrent compression with instantaneous, heavily parallelized context routing.