"""
프롬프트 템플릿. 실제 문구 튜닝은 이 파일에서만 진행하면 됨
(config.py의 가방/시대 데이터와 조합되어 최종 프롬프트가 만들어짐).
"""


def build_prompt(bag_name: str, era_label: str, era_mood: str) -> str:
    return (
        f"Image 1: a photo of a person (identity reference), to be shown carrying a {bag_name}.\n"
        f"Image 2: a style/scene reference photo representing the mood of {era_label} — {era_mood}.\n"
        "\n"
        f"Generate a photorealistic photo where the person from Image 1 appears naturally in the "
        f"setting, era, and atmosphere shown in Image 2 ({era_label}). "
        "Do not change the person's face, facial features, skin tone, or identity in any way. "
        "Preserve their exact likeness, expression, and body proportions from Image 1. "
        "Do NOT copy body shape, pose, or gender presentation from Image 2 - only use Image 2 for "
        "clothing style, color palette, lighting, and background atmosphere. "
        f"The person should be naturally carrying or wearing the {bag_name}. "
        "Use natural, believable photographic lighting, not an overly stylized or cinematic look. "
        "Subtly reflect MCM's signature cognac brown color in the clothing or an accessory if it fits naturally.\n"
        "\n"
        "Constraints: preserve identity and facial geometry exactly, no watermark, no extra text, "
        "no logos or trademarks, no unrelated added elements."
    )