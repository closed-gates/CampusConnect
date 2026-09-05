package com.campusconnect.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import java.io.ByteArrayInputStream;
import java.util.Locale;
import java.util.zip.ZipInputStream;

/** Extracts passive text previews without executing content or sending student files to third parties. */
@Service
public class AssignmentPreviewService {
    private static final int MAX_XML_BYTES = 2 * 1024 * 1024;

    public String preview(String name, byte[] data) {
        String lower = name == null ? "" : name.toLowerCase(Locale.ROOT);
        boolean docx = lower.endsWith(".docx");
        if (!docx && !lower.endsWith(".zip")) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Text extraction is available for DOCX and ZIP files.");
        }
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(data))) {
            StringBuilder listing = new StringBuilder("Archive contents (up to 200 entries):\n\n");
            int entries = 0;
            long expandedBytes = 0;
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                if (++entries > 200) break;
                if (docx && "word/document.xml".equals(entry.getName())) {
                    byte[] xml = zip.readNBytes(MAX_XML_BYTES + 1);
                    if (xml.length > MAX_XML_BYTES) throw new IllegalArgumentException("Document is too large to preview.");
                    XMLInputFactory factory = XMLInputFactory.newFactory();
                    factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
                    factory.setProperty("javax.xml.stream.isSupportingExternalEntities", false);
                    var reader = factory.createXMLStreamReader(new ByteArrayInputStream(xml));
                    StringBuilder text = new StringBuilder();
                    boolean inText = false;
                    try {
                        while (reader.hasNext()) {
                            int event = reader.next();
                            if (event == XMLStreamConstants.START_ELEMENT) {
                                String tag = reader.getLocalName();
                                inText = "t".equals(tag);
                                if ("tab".equals(tag)) text.append('\t');
                                if ("br".equals(tag)) text.append('\n');
                            } else if (event == XMLStreamConstants.CHARACTERS && inText) {
                                text.append(reader.getText());
                            } else if (event == XMLStreamConstants.END_ELEMENT) {
                                inText = false;
                                if ("p".equals(reader.getLocalName())) text.append('\n');
                            }
                        }
                    } finally { reader.close(); }
                    return "Document text (formatting and embedded images omitted):\n\n" + text;
                }
                listing.append(entry.isDirectory() ? "Folder: " : "File: ").append(entry.getName()).append('\n');
                // Bound decompression, including entries skipped while locating document.xml.
                byte[] buffer = new byte[8192];
                int read;
                while ((read = zip.read(buffer)) != -1) {
                    expandedBytes += read;
                    if (expandedBytes > 20 * 1024 * 1024) throw new IllegalArgumentException("Archive is too large to preview.");
                }
            }
            if (docx || entries == 0) throw new IllegalArgumentException("No readable document content found.");
            return listing.toString();
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Unable to preview this document or archive.");
        }
    }
}
