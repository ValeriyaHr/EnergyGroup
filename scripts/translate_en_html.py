import re
from pathlib import Path
from deep_translator import GoogleTranslator

CYRILLIC_RE = re.compile(r"[А-Яа-яІіЇїЄєҐґ]")
TEXT_NODE_RE = re.compile(r">([^<]*[А-Яа-яІіЇїЄєҐґ][^<]*)<")
ATTR_RE = re.compile(
    r"(\b(?:aria-label|placeholder|title|alt|value)=['\"])([^'\"]*[А-Яа-яІіЇїЄєҐґ][^'\"]*)(['\"])",
    re.IGNORECASE,
)


def has_cyrillic(text: str) -> bool:
    return bool(CYRILLIC_RE.search(text))


def translate_factory():
    translator = GoogleTranslator(source="uk", target="en")
    cache: dict[str, str] = {}

    def translate_text(text: str) -> str:
        if not text or not has_cyrillic(text):
            return text

        stripped = text.strip()
        if not stripped:
            return text
        if "{{" in stripped or "}}" in stripped:
            return text

        if stripped in cache:
            translated = cache[stripped]
        else:
            translated = translator.translate(stripped)
            cache[stripped] = translated

        prefix_len = len(text) - len(text.lstrip())
        suffix_len = len(text) - len(text.rstrip())
        return f"{text[:prefix_len]}{translated}{text[len(text) - suffix_len:]}"

    return translate_text


def process_file(file_path: Path, translate_text):
    content = file_path.read_text(encoding="utf-8")
    original = content

    def text_replacer(match: re.Match[str]) -> str:
        inner = match.group(1)
        return f">{translate_text(inner)}<"

    content = TEXT_NODE_RE.sub(text_replacer, content)

    def attr_replacer(match: re.Match[str]) -> str:
        prefix, value, suffix = match.group(1), match.group(2), match.group(3)
        return f"{prefix}{translate_text(value)}{suffix}"

    content = ATTR_RE.sub(attr_replacer, content)

    if content != original:
        file_path.write_text(content, encoding="utf-8")
        return True
    return False


def main():
    root = Path(__file__).resolve().parents[1] / "en"
    translate_text = translate_factory()

    changed = 0
    for html_file in sorted(root.rglob("*.html")):
        if process_file(html_file, translate_text):
            changed += 1
            print(html_file)

    print(f"Changed files: {changed}")


if __name__ == "__main__":
    main()

