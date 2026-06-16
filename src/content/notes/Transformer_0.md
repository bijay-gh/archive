---
# Transformer
title: Transformer
description: What you should know before diving into transformer architecture
pubDate: 2025-12-01
subject: "Transformer"
tags: ["transformer", "embedding"]
draft: false
---

## Transformers

There was more than single fundamental limitation of the recurrent architectural approach for textual data. Despite the sophisticated gating of LSTM and the dual-directionality of BiLSTM, they all share a fundamental, fatal flaw: **Context is still represented through sequential hidden states which leads to *Context Compression and Information Dilution***, **Strict Sequential Dependency prevent *max hardware utilization* thus *ceiling scaling*.** 

Thus both representational and computational, a dual-purpose paradigm shift was needed. Then [Attention Is All You Need](https://arxiv.org/pdf/1706.03762) redefine attention, which was already a well-established idea, but it was mainly used as an auxiliary mechanism rather than the primary architecture. First popularized by [D.Bahdanau(2014)](https://arxiv.org/abs/1409.0473) where attention allow the decoder in a neural machine translation system to dynamically focus on the most relevant parts of the source sentence during translation, rather than relying on a single fixed-length context vector.Beside this, attention was already used for *Image Captioning* ([Show, Attend and Tell: Neural Image Caption Generation with Visual Attention (2015)](https://arxiv.org/abs/1502.03044)), *Neural Machine Translation*([Luong Attention, 2015](https://arxiv.org/abs/1508.04025)), *Memory Networks*([Memory Networks, 2015](https://arxiv.org/abs/1410.3916)) and so on proving the fact that attention is not limited for textual data only. Despit that, we can all agree they all use attention as a learned soft-alignment mechanism to dynamically select and weight the most relevant parts of the input when producing each output, instead of relying on a single fixed representation. **Attention Is All You Need** showed that attention could replace recurrence altogether, enabling scalable, parallel, and highly effective language modeling the foundation of today's large language models. **THE AIM OF THIS NOTE IS TO UNDERSTAND HOW THE ATTENSION WORKS.** 

First, We will dive deep into the architecture and mathematics behind attention head then multihead attention and whole transformer block. Later we will also see how computation is parallelizing in transformer.........

NEXT UP.....  [<span style="border: 2px solid #c4bbbbff; border-radius: 20px; padding: 2px 8px;">Attention</span>](/notes/transformer_1)