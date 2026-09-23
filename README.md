# TinySense — Edge Sensor Health & Drift Detection Lab

A polished two-page React prototype for exploring sensor health, drift detection, physical process anomalies, and TinyML resource tradeoffs.

## Live Demo

https://tinysense-edge-sensor-lab.charanvaranasi44.workers.dev/

## Features

### Sensor Health

- Animated synthetic sensor time-series
- Healthy, Sensor Drift, Sensor Noise, and Process Anomaly scenarios
- Health score, anomaly score, diagnosis, and confidence
- Clear distinction between sensor faults and physical process anomalies
- Simulated pipeline: Sensor → Features → TinyML → Health Classification

### TinyML Benchmark

Compares three fictional approaches:

- Threshold Method
- Lightweight Anomaly Model
- Tiny Neural Network

Synthetic metrics include detection rate, RAM, flash, inference time, and power estimate. An interactive Accuracy ↔ Efficiency slider recommends a model against a fictional ARM Cortex-M resource budget.

## Technology

- React
- TypeScript
- Vinext/Vite
- Cloudflare Workers
- Wrangler
