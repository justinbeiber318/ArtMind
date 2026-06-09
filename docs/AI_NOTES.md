# AI Notes — Image Recognition with TensorFlow.js

This document explains how ArtMind's `recognition` module works today and how to upgrade it
to a properly trained art-style classifier.

## How it works now

`backend/src/modules/recognition/recognition.service.js` does two independent things:

1. **Dominant color extraction** (`colorExtractor.js`) — uses `sharp` to downsample the image,
   quantize pixels into color buckets, and return the top hex swatches. This is exact,
   deterministic, and has no external dependencies beyond `sharp`. It always runs.

2. **Style / category classification** — loads **MobileNet** (an ImageNet-trained CNN) via
   `@tensorflow/tfjs-node`, runs the uploaded image through it, and maps the predicted ImageNet
   labels onto gallery buckets (Abstract, Landscape, Portrait, Still Life, Baroque, …) using a
   small keyword-matching table (`STYLE_HINTS`).

The endpoint always returns the documented shape:

```json
{ "style": "...", "category": "...", "colors": ["#...", ...], "confidence": 0.0, "recommendations": [...] }
```

## Why a mapping table instead of a trained head

MobileNet's 1000 ImageNet classes (golden retriever, espresso, castle, …) don't correspond to
art styles. The keyword map is an honest, dependency-light heuristic: it produces sensible,
explainable guesses without requiring a labelled art dataset or a training run. Confidence
reflects MobileNet's probability for the matched class, so it's transparent about uncertainty.

## Graceful degradation

`@tensorflow/tfjs-node` relies on native bindings that don't compile in every environment. The
service is written so that if the model fails to load, it logs the issue and returns
**color-only** results with a low-confidence "Contemporary / Mixed Media" guess. The API
contract never breaks. Color extraction and recommendations still work.

## Upgrading to a real art-style classifier

To get genuine style accuracy, fine-tune a classification head on top of MobileNet's features:

1. **Collect a labelled dataset.** Public options include WikiArt (style/genre labels) or
   Painter-by-Numbers. Organize as `dataset/<style>/<image>.jpg`.

2. **Extract features + train a head.** Use MobileNet as a frozen feature extractor and train a
   small dense classifier over your style labels (transfer learning). This can be done in
   Python (TF/Keras) or in Node with `@tensorflow/tfjs-node`. Export the trained head to the
   TensorFlow.js `model.json` + weights format.

3. **Load your weights.** Replace the MobileNet-only `loadModel()` step so it also loads your
   fine-tuned head, and run features → head → softmax over *your* style labels. Drop the
   `STYLE_HINTS` keyword fallback once the head is reliable (keep it as a safety net).

4. **Calibrate confidence + thresholds.** Decide a minimum confidence below which you return
   "uncertain" rather than a forced label.

The module boundaries are designed so this is a localized change: the controller, color
extraction, recommendation lookup, logging, and response shape all stay the same — only the
classification step inside the service changes.

## Where results are stored

Each analysis is recorded in the `uploaded_images` table (detected style/category, colors,
confidence) and an `analytics` row with metric `recognition`, which feeds the admin dashboard.
