from pathlib import Path
import csv
import zipfile

from docx import Document
from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DOC_PATH = ROOT / "artifacts" / "BRACU_CSE_Faculty_and_Staff_Directory.docx"
OUTPUT = ROOT / "backend" / "src" / "main" / "resources" / "faculty-directory.tsv"
REL_NS = {"pr": "http://schemas.openxmlformats.org/package/2006/relationships"}
DOC_NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def hyperlink_targets():
    with zipfile.ZipFile(DOC_PATH) as archive:
        document = etree.fromstring(archive.read("word/document.xml"))
        relationships = etree.fromstring(archive.read("word/_rels/document.xml.rels"))
    rels = {
        node.get("Id"): node.get("Target")
        for node in relationships.xpath("//pr:Relationship", namespaces=REL_NS)
    }
    targets = {}
    for row in document.xpath("//w:tr", namespaces=DOC_NS):
        cells = row.xpath("./w:tc", namespaces=DOC_NS)
        if len(cells) < 2:
            continue
        name = "".join(cells[1].xpath(".//w:t/text()", namespaces=DOC_NS)).strip()
        links = cells[1].xpath(".//w:hyperlink/@r:id", namespaces=DOC_NS)
        if name and links and links[0] in rels:
            targets[name] = rels[links[0]]
    return targets


def main():
    doc = Document(DOC_PATH)
    profiles = hyperlink_targets()
    rows = []
    for table in doc.tables:
        category = ""
        table_xml = table._tbl
        previous = table_xml.getprevious()
        while previous is not None:
            texts = previous.xpath(".//w:t/text()")
            if texts:
                heading = "".join(texts).strip()
                category = heading.rsplit("  ", 1)[0]
                break
            previous = previous.getprevious()
        for row in table.rows[1:]:
            values = [cell.text.strip() for cell in row.cells]
            status_lines = values[4].splitlines() if len(values) > 4 else ["Not listed"]
            rows.append(
                {
                    "category": category,
                    "name": values[1],
                    "position": values[2],
                    "email": values[3],
                    "profile_url": profiles.get(values[1], ""),
                    "thesis_status": status_lines[0],
                    "thesis_level": status_lines[1] if len(status_lines) > 1 else "",
                }
            )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=rows[0].keys(), delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} records to {OUTPUT}")


if __name__ == "__main__":
    main()
