"""
프롬프트 템플릿. 실제 문구 튜닝은 이 파일에서만 진행하면 됨
(config.py의 가방/시대 데이터와 조합되어 최종 프롬프트가 만들어짐).
"""


def build_prompt(bag_name: str, era_label: str, era_mood: str) -> str:
    return (
        "Image 1: a reference photo of a person's face and hairstyle (identity source).\n"
        f"Image 2: the target photo — a {era_label} era MCM photo already showing the {bag_name}. "
        "Reproduce Image 2's composition, background, clothing, pose, body, and bag with maximum fidelity. "
        "Only the face and hairstyle should change.\n"
        "\n"
        "Task: replace the face AND the hairstyle of the person in Image 2 with the face and hairstyle "
        "from Image 1. Naturally adapt the angle, orientation, and size/scale of the new face and hair to "
        "match the head in Image 2 — if the head in Image 2 is turned, tilted, or angled, the replaced face "
        "and hair must follow that same angle realistically, not look flat or front-facing when the original "
        "pose is angled, and the face must be scaled to fit the head size and proportions shown in Image 2 "
        "relative to the body, not the scale it happens to be at in Image 1 — make the replaced face slightly "
        "smaller than the head size shown in Image 2 rather than an exact 1:1 match, so it never looks "
        "oversized in the frame. Blend the new face and hair into "
        "Image 2 so the skin tone, lighting direction, color grading, and film grain match Image 2 "
        "seamlessly — the result should look like one single, untouched photograph, not a collage.\n"
        "\n"
        "Preserve the facial identity, bone structure, and distinctive features from Image 1 exactly, and "
        "preserve Image 1's hairstyle (length, texture, color, and style) exactly.\n"
        "\n"
        "Do NOT change anything else in Image 2: keep the exact same body shape, pose, and background as "
        "shown. Reproduce the outfit's fabric texture and color exactly, and reproduce the bag exactly as it "
        "appears in Image 2 — same shape, same monogram/pattern, same hardware, same stitching and material "
        "texture, with no simplification or redesign of any of these details.\n"
        "\n"
        "Constraints: seamless blending at the face/hair boundary (no visible seams, no mismatched edges), "
        "photorealistic result, natural head angle matching Image 2's pose, no watermark, no extra text, "
        "no new logos or trademarks beyond what is already visible in Image 2, no unrelated added elements."
    )