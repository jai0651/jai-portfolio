import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "headshot-generator",
  match: { github: "https://github.com/jai0651/on-device-headshot-generator" },
  title: "On-device headshot generator",
  oneLiner:
    "A generator that turns a selfie into a professional headshot on Apple hardware, with nothing uploaded.",
  overview: [
    "Most AI headshot apps upload 10–20 photos and train a model per customer on a server. I wanted to measure how much of that can happen on the device, with no upload and no per-user training.",
    "It's built in stages on Stable Diffusion 1.5. I started with DDPM written from scratch (a 6.5M-param UNet with DDPM and DDIM samplers), then rewrote SD 1.5's sampling loop by hand until it matched diffusers pixel for pixel, then built the eval harness before training anything. Every stage after that (a face LoRA, zero-shot FaceID, Core ML conversion, quantisation and few-step sampling) is judged by the same numbers.",
  ],
  highlights: [
    { value: "0.67 vs 0.49", label: "identity from one selfie with IP-Adapter FaceID, against a LoRA trained on 17 photos" },
    { value: "3,057 / 3,057", label: "UNet ops on the Neural Engine after Core ML conversion" },
    { value: "9.9 s vs 18.5 s", label: "per image on an M4, Neural Engine against GPU (FP16, 25 steps)" },
    { value: "1.34 s", label: "per image on the M4 Neural Engine with an 8-bit UNet and 4-step LCM" },
  ],
  how: [
    {
      title: "Measure first",
      body: "Identity is scored by two independent face recognizers (buffalo_l and antelopev2, AUC 0.993 and 0.992 on 1,000 LFW pairs), prompt adherence by CLIP ViT-L/14, and passport framing by 13 checks built on MediaPipe landmarks. A cosine of 0.30 is the same-person line.",
    },
    {
      title: "Teach it the face",
      body: "A LoRA on the SD 1.5 UNet learns one face from 17 audited photos (rank 16, 2,000 steps, about 13.5 min on a rented RTX 3090). Every checkpoint is scored by the harness and the pick is made by the curve.",
    },
    {
      title: "Fold and convert",
      body: "The face LoRA and an LCM-LoRA are folded into the UNet weights and converted to Core ML. All 3,057 UNet ops land on the Neural Engine with no switches to other devices.",
    },
    {
      title: "Frame the head",
      body: "A pose ControlNet with a skeleton placed from the passport geometry spec keeps the head in frame. Without it the head was cut off in 5 of 6 images; with it, 0 of 8.",
    },
    {
      title: "Shrink and speed up",
      body: "The UNet is palettised to 8 bits (1,721 MB to 862 MB) and LCM cuts sampling from 25 steps to 4. On the M4 Neural Engine that is 1.34 s per image.",
    },
  ],
  decisions: [
    {
      title: "One selfie beat 17 photos",
      body: "Zero-shot IP-Adapter FaceID from one selfie scored 0.67 identity against 0.49 for the trained LoRA, with no training at all, which is the property an on-device product needs. The costs: unprompted desaturated outputs, a non-commercial licence, and no blind human test yet.",
    },
    {
      title: "Fewer steps kept the face better",
      body: "I expected 4-step LCM to lose the face. It went the other way: identity rose from 0.45 to 0.63, because strong guidance in the 25-step baseline pulled faces toward a generic 'corporate man'. The cost is less variety of expression and a smoother, airbrushed look.",
    },
    {
      title: "How small before it stops being you",
      body: "8-bit is free: half the size, same identity. 4-bit per-tensor breaks the face (identity 0.33) while CLIP and the compliance count barely move, so I added image PSNR against the FP16 output to catch texture damage the other metrics miss.",
    },
  ],
  stack: [
    { group: "Models", items: ["Stable Diffusion 1.5", "LoRA", "IP-Adapter FaceID", "OpenPose ControlNet", "LCM-LoRA"] },
    { group: "Evaluation", items: ["InsightFace (buffalo_l, antelopev2)", "CLIP ViT-L/14", "MediaPipe"] },
    { group: "On-device", items: ["Core ML", "coremltools 9.0", "Apple Neural Engine"] },
    { group: "Training", items: ["PyTorch", "Diffusers", "RunPod GPUs"] },
    { group: "Tooling", items: ["uv"] },
  ],
  status: "Open source. Measured on an M4 Mac; the iPhone run is still to be measured.",
  sources: [
    "http://localhost:3100/api/admin/projects (database entry)",
    "https://github.com/jai0651/on-device-headshot-generator (README)",
    "https://github.com/jai0651/on-device-headshot-generator/blob/main/stage2_eval/README.md",
    "https://github.com/jai0651/on-device-headshot-generator/blob/main/stage3_lora/README.md",
    "https://github.com/jai0651/on-device-headshot-generator/blob/main/stage5_zeroshot/README.md",
    "https://github.com/jai0651/on-device-headshot-generator/blob/main/stage6_coreml/README.md",
    "https://github.com/jai0651/on-device-headshot-generator/blob/main/stage7_quantize/README.md",
    "https://github.com/jai0651/on-device-headshot-generator/blob/main/stage8_lcm/README.md",
  ],
};

export default detail;
