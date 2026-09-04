package com.campusconnect.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "clubs")
public class Club {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;
    @Column(name = "active", nullable = false)
    private boolean active = true;

    public Club() {}
    public Club(String name) { this.name = name; this.active = true; }
    public Long getId() { return id; }
    public void setId(Long value) { id = value; }
    public String getName() { return name; }
    public void setName(String value) { name = value; }
    public boolean isActive() { return active; }
    public void setActive(boolean value) { active = value; }
}
