"""Turn an untrusted build archive into static Pages files on a fresh runner."""

from pathlib import Path, PurePosixPath
import re
import shutil
import sys
import tarfile


def prepare(archive_path, output, selected_sha, workflow_sha):
    for revision in (selected_sha, workflow_sha):
        if not re.fullmatch(r"[0-9a-f]{40}", revision):
            raise ValueError("Expected an exact commit SHA")

    output = Path(output)
    # Never reuse candidate-controlled or partially prepared output.
    output.mkdir(mode=0o700)
    with tarfile.open(archive_path, mode="r:") as archive:
        seen = set()
        total_size = 0
        for member in archive:
            path = PurePosixPath(member.name)
            if path == PurePosixPath(".") and member.isdir():
                continue
            if (
                not path.parts
                or path.is_absolute()
                or ".." in path.parts
                or "\\" in member.name
                or any(ord(char) < 32 for char in member.name)
                or path in seen
                or len(path.parts) > 64
                or not (member.isfile() or member.isdir())
                or member.issparse()
            ):
                raise ValueError("Invalid static site archive entry")
            seen.add(path)
            total_size += member.size
            if len(seen) > 100000 or total_size > 1024**3:
                raise ValueError("Static site archive exceeds packaging limits")
            target = output.joinpath(*path.parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                # No tar extraction API: links, ownership, and executable modes are never restored.
                with archive.extractfile(member) as source, target.open("xb") as destination:
                    shutil.copyfileobj(source, destination)
                target.chmod(0o644)

    if not (output / "index.html").is_file():
        raise ValueError("Static site is missing index.html")
    (output / "version.txt").write_text(selected_sha + "\n", encoding="utf-8")
    (output / "workflow-version.txt").write_text(workflow_sha + "\n", encoding="utf-8")


if __name__ == "__main__":
    prepare(*sys.argv[1:])
