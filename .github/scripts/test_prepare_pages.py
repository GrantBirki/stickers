"""Offline tests for the boundary between build output and Pages packaging."""

import importlib.util
import io
from pathlib import Path
import tarfile
import shutil
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("prepare_pages", Path(__file__).with_name("prepare-pages.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
SELECTED = "a" * 40
WORKFLOW = "b" * 40


class PreparePagesTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root / "site.tar"
        self.output = self.root / "output"

    def write_archive(self, entries):
        with tarfile.open(self.archive, "w") as archive:
            for name, kind, content in entries:
                member = tarfile.TarInfo(name)
                member.type = kind
                member.mode = 0o777
                member.size = len(content) if kind == tarfile.REGTYPE else 0
                if kind in (tarfile.SYMTYPE, tarfile.LNKTYPE):
                    member.linkname = "../../outside"
                archive.addfile(member, io.BytesIO(content) if member.isfile() else None)

    def prepare(self, selected=SELECTED, workflow=WORKFLOW):
        module.prepare(self.archive, self.output, selected, workflow)

    def test_preserves_static_routes_assets_and_overwrites_candidate_stamps(self):
        self.write_archive([
            (".", tarfile.DIRTYPE, b""),
            ("./index.html", tarfile.REGTYPE, b"<h1>home</h1>"),
            ("./stickers/card/index.html", tarfile.REGTYPE, b"card"),
            ("./assets/.keep", tarfile.REGTYPE, b"asset"),
            ("./version.txt", tarfile.REGTYPE, b"wrong revision"),
        ])
        self.prepare()
        self.assertEqual((self.output / "stickers/card/index.html").read_bytes(), b"card")
        self.assertEqual((self.output / "assets/.keep").read_bytes(), b"asset")
        self.assertEqual((self.output / "version.txt").read_text(), SELECTED + "\n")
        self.assertEqual((self.output / "workflow-version.txt").read_text(), WORKFLOW + "\n")
        self.assertEqual((self.output / "index.html").stat().st_mode & 0o777, 0o644)

    def test_rejects_links_special_files_traversal_and_duplicate_paths(self):
        cases = [
            ("../outside", tarfile.REGTYPE),
            ("/outside", tarfile.REGTYPE),
            ("assets/../../outside", tarfile.REGTYPE),
            ("assets\\outside", tarfile.REGTYPE),
            ("bad\nname", tarfile.REGTYPE),
            ("/".join(["deep"] * 65), tarfile.REGTYPE),
            ("link", tarfile.SYMTYPE),
            ("hardlink", tarfile.LNKTYPE),
            ("pipe", tarfile.FIFOTYPE),
            ("device", tarfile.CHRTYPE),
            ("./index.html", tarfile.REGTYPE),
        ]
        for name, kind in cases:
            with self.subTest(name=name, kind=kind):
                self.write_archive([("index.html", tarfile.REGTYPE, b"ok"), (name, kind, b"bad")])
                with self.assertRaises((ValueError, OSError)):
                    self.prepare()
                self.assertFalse((self.root / "outside").exists())
                shutil.rmtree(self.output)

    def test_rejects_missing_index_and_artifact(self):
        with self.assertRaises(FileNotFoundError):
            self.prepare()
        self.output.rmdir()
        self.write_archive([("asset.css", tarfile.REGTYPE, b"body{}")])
        with self.assertRaises(ValueError):
            self.prepare()

    def test_rejects_invalid_identities_before_creating_output(self):
        for revision in ("", "main", "a" * 39, "g" * 40, "../main", "a" * 40 + "\n"):
            for selected, workflow in ((revision, WORKFLOW), (SELECTED, revision)):
                with self.subTest(selected=selected, workflow=workflow):
                    with self.assertRaises(ValueError):
                        self.prepare(selected, workflow)
                    self.assertFalse(self.output.exists())

    def test_rejects_oversized_entry_before_writing_it(self):
        member = tarfile.TarInfo("huge.bin")
        member.size = 1024**3 + 1
        with self.archive.open("wb") as archive:
            archive.write(member.tobuf())
        with self.assertRaises(ValueError):
            self.prepare()
        self.assertFalse((self.output / "huge.bin").exists())

    def test_rejects_preexisting_output_or_symlink(self):
        self.output.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(FileExistsError):
            self.prepare()
        self.output.unlink()
        self.output.mkdir()
        with self.assertRaises(FileExistsError):
            self.prepare()


if __name__ == "__main__":
    unittest.main()
