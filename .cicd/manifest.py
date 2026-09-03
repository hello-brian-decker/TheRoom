#!/usr/bin/env python3
"""Read .cicd/project.yml and emit shell assignments.

IDENTICAL IN EVERY REPO — part of the fleet operations standard. Do not add
per-project logic here; project-specific behaviour belongs in .cicd/bindings.sh.

  manifest.py <file> [env]

Emits POSIX-shell assignments on stdout:

  P_<KEY>=...            top-level scalars (project, slug, kind, repo, ...)
  E_<PATH>=...           the chosen environment's keys, nested paths joined by _
  E_ENVIRONMENTS=...     space-separated list of declared environments

No dependencies: PyYAML is not installed on this fleet's default interpreters,
so this parses the restricted YAML subset the manifest schema allows —
two-space indented mappings, block and inline lists, bare and quoted scalars,
and # comments. Anchors, multi-line scalars and flow mappings are rejected
rather than silently misread.
"""
from __future__ import annotations

import re
import shlex
import sys


class ManifestError(Exception):
    pass


def _strip_comment(line: str) -> str:
    """Drop a trailing # comment that is not inside quotes."""
    out, quote = [], None
    for i, ch in enumerate(line):
        if quote:
            out.append(ch)
            if ch == quote and line[i - 1 : i] != "\\":
                quote = None
            continue
        if ch in "\"'":
            quote = ch
            out.append(ch)
            continue
        if ch == "#" and (i == 0 or line[i - 1].isspace()):
            break
        out.append(ch)
    return "".join(out).rstrip()


def _scalar(raw: str):
    raw = raw.strip()
    if not raw:
        return ""
    if raw[0] == raw[-1] and raw[0] in "\"'" and len(raw) > 1:
        return raw[1:-1]
    if raw.startswith("[") and raw.endswith("]"):
        inner = raw[1:-1].strip()
        if not inner:
            return []
        return [_scalar(p) for p in inner.split(",")]
    if raw in ("true", "True", "yes"):
        return True
    if raw in ("false", "False", "no"):
        return False
    if raw in ("null", "~", "None"):
        return None
    if raw.startswith("{"):
        raise ManifestError(f"flow mappings are not supported: {raw!r}")
    if raw.startswith(("&", "*")):
        raise ManifestError(f"anchors/aliases are not supported: {raw!r}")
    if raw in ("|", ">", "|-", ">-"):
        raise ManifestError("multi-line scalars are not supported")
    return raw


def parse(text: str):
    """Parse the supported subset into nested dicts/lists."""
    root: dict = {}
    # Each frame: [indent, container, parent, key_in_parent]. parent/key let a
    # placeholder dict be swapped for a list the moment a "- " item shows up.
    stack: list[list] = [[-1, root, None, None]]
    key_re = re.compile(r"^[A-Za-z0-9_.-]+:(\s|$)")

    for lineno, raw_line in enumerate(text.splitlines(), 1):
        line = _strip_comment(raw_line)
        if not line.strip():
            continue
        lead = line[: len(line) - len(line.lstrip())]
        if "\t" in lead:
            raise ManifestError(f"line {lineno}: tab indentation is not allowed")
        indent = len(lead)
        body = line.strip()

        while len(stack) > 1 and indent <= stack[-1][0]:
            stack.pop()
        frame = stack[-1]
        container = frame[1]

        try:
            if body.startswith("- ") or body == "-":
                if isinstance(container, dict) and not container:
                    # Placeholder opened by "key:" turns out to be a list.
                    container = []
                    if frame[2] is not None:
                        frame[2][frame[3]] = container
                    frame[1] = container
                if not isinstance(container, list):
                    raise ManifestError("list item where a mapping was expected")
                item = body[2:].strip() if body != "-" else ""
                if key_re.match(item):
                    d: dict = {}
                    container.append(d)
                    # The mapping's keys sit at the column after "- ".
                    stack.append([indent + 1, d, None, None])
                    k, _, v = item.partition(":")
                    k, v = k.strip(), v.strip()
                    if v:
                        d[k] = _scalar(v)
                    else:
                        child: dict = {}
                        d[k] = child
                        stack.append([indent + 2, child, d, k])
                else:
                    container.append(_scalar(item))
                continue

            if ":" not in body:
                raise ManifestError(f"expected 'key: value', got {body!r}")

            key, _, value = body.partition(":")
            key, value = key.strip(), value.strip()
            if not isinstance(container, dict):
                raise ManifestError("mapping key inside a list")

            if value:
                container[key] = _scalar(value)
            else:
                nxt: dict = {}
                container[key] = nxt
                stack.append([indent, nxt, container, key])
        except ManifestError as exc:
            raise ManifestError(f"line {lineno}: {exc}") from None

    return root


def _emit(name: str, value) -> str:
    if isinstance(value, bool):
        value = "true" if value else "false"
    elif value is None:
        value = ""
    elif isinstance(value, list):
        value = " ".join(str(v) for v in value)
    return f"{name}={shlex.quote(str(value))}"


def flatten(prefix: str, node, out: list[str]) -> None:
    if isinstance(node, dict):
        for k, v in node.items():
            key = str(k).replace("-", "_").replace(".", "_").upper()
            flatten(f"{prefix}_{key}" if prefix else key, v, out)
    elif isinstance(node, list) and any(isinstance(i, (dict, list)) for i in node):
        for i, v in enumerate(node):
            flatten(f"{prefix}_{i}", v, out)
    else:
        out.append(_emit(prefix, node))


def main(argv: list[str]) -> int:
    if not 2 <= len(argv) <= 3:
        sys.stderr.write("usage: manifest.py <project.yml> [env]\n")
        return 2
    path = argv[1]
    want_env = argv[2] if len(argv) == 3 else None

    try:
        with open(path, encoding="utf-8") as fh:
            doc = parse(fh.read())
    except FileNotFoundError:
        sys.stderr.write(f"manifest not found: {path}\n")
        return 1
    except ManifestError as exc:
        sys.stderr.write(f"{path}: {exc}\n")
        return 1

    if not isinstance(doc, dict) or "project" not in doc:
        sys.stderr.write(f"{path}: missing required key 'project'\n")
        return 1

    lines: list[str] = []
    for key, value in doc.items():
        if key == "environments":
            continue
        flatten(f"P_{str(key).replace('-', '_').upper()}", value, lines)

    envs = doc.get("environments") or {}
    if not isinstance(envs, dict):
        sys.stderr.write(f"{path}: 'environments' must be a mapping\n")
        return 1
    lines.append(_emit("E_ENVIRONMENTS", " ".join(envs.keys())))

    if want_env is not None:
        if want_env not in envs:
            sys.stderr.write(
                f"{path}: environment '{want_env}' is not declared "
                f"(declared: {', '.join(envs) or 'none'})\n"
            )
            return 1
        block = envs[want_env] or {}
        lines.append(_emit("E_NAME", want_env))
        if isinstance(block, dict):
            for key, value in block.items():
                flatten(f"E_{str(key).replace('-', '_').upper()}", value, lines)

    sys.stdout.write("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
