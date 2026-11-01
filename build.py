"""issues/ 以下の号（issue.json）を全部読み、ブラウザ用の data.js にまとめる。"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ISSUES_DIR = ROOT / "issues"
OUT = ROOT / "data.js"


def load_issues():
    issues = []
    for path in sorted(ISSUES_DIR.glob("*/issue.json"), reverse=True):
        try:
            issue = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"[skip] {path}: JSON の書き方が壊れています ({e})", file=sys.stderr)
            continue
        folder = path.parent.name
        issue.setdefault("date", folder)
        for i, story in enumerate(issue.get("stories", []), start=1):
            image = story.get("image")
            # 画像ファイルが実在するときだけ、index.html から見た相対パスにする
            if image and (path.parent / image).exists():
                story["image"] = f"issues/{folder}/{image}"
            else:
                story["image"] = None
            story["no"] = i
        issues.append(issue)
    return issues


def main():
    issues = load_issues()
    js = "window.AI_DAILY_ISSUES = " + json.dumps(issues, ensure_ascii=False, indent=1) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"{len(issues)} 号を data.js にまとめました")


if __name__ == "__main__":
    main()
