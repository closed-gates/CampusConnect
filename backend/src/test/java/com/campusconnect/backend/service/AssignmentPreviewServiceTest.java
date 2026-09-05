package com.campusconnect.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import static org.assertj.core.api.Assertions.*;

class AssignmentPreviewServiceTest {
    private final AssignmentPreviewService service = new AssignmentPreviewService();
    private byte[] zip(String name, String content) throws Exception {
        var bytes = new ByteArrayOutputStream();
        try (var zip = new ZipOutputStream(bytes)) {
            zip.putNextEntry(new ZipEntry(name));
            zip.write(content.getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
        }
        return bytes.toByteArray();
    }
    @Test void extractsDocxTextWithParagraphs() throws Exception {
        String xml = "<w:document xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'><w:body><w:p><w:r><w:t>Hello &amp; world</w:t></w:r></w:p></w:body></w:document>";
        assertThat(service.preview("work.DOCX", zip("word/document.xml", xml))).contains("Hello & world\n");
    }
    @Test void listsZipFilesWithoutExecutingThem() throws Exception {
        assertThat(service.preview("work.zip", zip("main.py", "print('hello')"))).contains("File: main.py").doesNotContain("print(");
    }
    @Test void rejectsMalformedDocxAndOversizedXml() throws Exception {
        byte[] malformed = zip("word/document.xml", "<broken");
        byte[] oversized = zip("word/document.xml", "a".repeat(2 * 1024 * 1024 + 1));
        assertThatThrownBy(() -> service.preview("work.docx", malformed)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.preview("work.docx", oversized)).isInstanceOf(ResponseStatusException.class);
    }
    @Test void doesNotResolveExternalEntities() throws Exception {
        String xml = "<!DOCTYPE doc [<!ENTITY secret SYSTEM 'file:///not-a-real-file'>]><doc><t>&secret;</t></doc>";
        byte[] data = zip("word/document.xml", xml);
        assertThatThrownBy(() -> service.preview("work.docx", data)).isInstanceOf(ResponseStatusException.class);
    }
}
