package com.campusconnect.backend.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

/**
 * VideoLectureMultipartConfig – allows lecture video uploads up to 200 MB.
 *
 * MVC Role: Config (video lecture feature only)
 *
 * Replaces the default MultipartConfigElement so large lecture files
 * can be accepted. Existing features still enforce their own size
 * checks in their services (for example profile pictures at 2 MB).
 */
@Configuration
public class VideoLectureMultipartConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(200));
        factory.setMaxRequestSize(DataSize.ofMegabytes(210));
        factory.setFileSizeThreshold(DataSize.ofMegabytes(1));
        return factory.createMultipartConfig();
    }
}
