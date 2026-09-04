package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CourseMaterialRepository – persistence for course_materials.
 *
 * MVC Role: Repository
 */
@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findAllByOrderByCreatedAtDesc();
}
