package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCaseAndActiveTrue(String name);
}
