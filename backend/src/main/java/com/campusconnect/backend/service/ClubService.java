package com.campusconnect.backend.service;

import com.campusconnect.backend.model.Application;
import com.campusconnect.backend.model.ClubNotice;
import com.campusconnect.backend.model.Recruitment;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * ClubService – Business logic for club notices, recruitment, and applications.
 *
 * MVC Role: Service (sits between Controller and Model)
 *
 * Phase 2: In-memory data store with seeded data (no database).
 * This is the authoritative source of truth for all club-related data.
 *
 * TODO (Phase 3 – Database persistence):
 *   - Replace in-memory lists with JPA repositories:
 *       ClubNoticeRepository, RecruitmentRepository, ApplicationRepository
 *   - Add @Transactional where needed
 *   - Add RBAC validation (only ADMIN can post notices / recruitments)
 */
@Service
public class ClubService {

    // ── In-memory data stores (Model layer — Phase 2 stub) ────────
    private final List<ClubNotice>  notices      = new ArrayList<>();
    private final List<Recruitment> recruitments = new ArrayList<>();
    private final List<Application> applications = new ArrayList<>();

    private final AtomicLong noticeIdSeq      = new AtomicLong(4);
    private final AtomicLong recruitIdSeq     = new AtomicLong(4);
    private final AtomicLong applicationIdSeq = new AtomicLong(1);

    // ── Seed data ──────────────────────────────────────────────────
    public ClubService() {
        notices.add(new ClubNotice(1L, "Robotics Club",
            "Annual Robo-Wars Competition 2026",
            "We are excited to announce the Annual Robo-Wars Competition! All students are welcome to participate. Teams of 2–4 members. Register before August 10th at the club office.",
            "Admin", "2026-07-20T10:00:00", true));

        notices.add(new ClubNotice(2L, "Photography Club",
            "Campus Photo Walk – This Saturday",
            "Join us for a guided photo walk around the campus grounds this Saturday at 7:00 AM. Bring your cameras or smartphones. All skill levels welcome!",
            "Admin", "2026-07-21T14:30:00", false));

        notices.add(new ClubNotice(3L, "Debate Society",
            "Inter-University Debate — Call for Participants",
            "The Debate Society is representing our university at the National Inter-University Debate Championship. Tryouts will be held on July 28th in Auditorium A. Prepare a 3-minute speech on the topic: 'AI in Education'.",
            "Admin", "2026-07-22T09:15:00", true));

        recruitments.add(new Recruitment(1L, "Robotics Club", "Mechanical Engineer",
            "Looking for students with hands-on experience in mechanical design, CAD tools, or 3D printing. Work on real competition robots!",
            "2026-08-05", 5, "2026-07-19T11:00:00", true));

        recruitments.add(new Recruitment(2L, "Photography Club", "Event Photographer",
            "We need passionate photographers to cover university events. Basic DSLR knowledge required. Equipment provided for official events.",
            "2026-08-01", 3, "2026-07-20T16:00:00", true));

        recruitments.add(new Recruitment(3L, "Coding Club", "Full Stack Developer",
            "Building a university app? Join us! We need React & Spring Boot developers. Contribute to real projects used by students.",
            "2026-08-10", 8, "2026-07-21T12:00:00", true));
    }

    // ── Notice operations ──────────────────────────────────────────

    /**
     * Returns all notices sorted: pinned first, then by posted date descending.
     */
    public List<ClubNotice> getAllNotices() {
        return notices.stream()
            .sorted((a, b) -> Boolean.compare(b.isPinned(), a.isPinned()))
            .collect(Collectors.toList());
    }

    /**
     * Creates and stores a new club notice.
     *
     * @param clubName  Club posting the notice
     * @param title     Notice title
     * @param body      Full notice content
     * @return The newly created ClubNotice
     */
    public ClubNotice postNotice(String clubName, String title, String body) {
        ClubNotice notice = new ClubNotice(
            noticeIdSeq.getAndIncrement(),
            clubName != null ? clubName : "Unknown Club",
            title    != null ? title    : "Untitled Notice",
            body     != null ? body     : "",
            "Admin",
            LocalDateTime.now().toString(),
            false
        );
        notices.add(notice);
        return notice;
    }

    // ── Recruitment operations ─────────────────────────────────────

    /**
     * Returns all active recruitment postings.
     */
    public List<Recruitment> getActiveRecruitments() {
        return recruitments.stream()
            .filter(Recruitment::isActive)
            .collect(Collectors.toList());
    }

    /**
     * Creates and stores a new recruitment posting.
     *
     * @param clubName    Club posting the position
     * @param role        Role/position title
     * @param description Full role description
     * @param deadline    Application deadline (ISO date string)
     * @param slots       Number of open slots
     * @return The newly created Recruitment
     */
    public Recruitment postRecruitment(String clubName, String role,
                                       String description, String deadline, int slots) {
        Recruitment posting = new Recruitment(
            recruitIdSeq.getAndIncrement(),
            clubName    != null ? clubName    : "Unknown Club",
            role        != null ? role        : "Member",
            description != null ? description : "",
            deadline    != null ? deadline    : LocalDate.now().plusWeeks(2).toString(),
            slots,
            LocalDateTime.now().toString(),
            true
        );
        recruitments.add(posting);
        return posting;
    }

    // ── Application operations ─────────────────────────────────────

    /**
     * Records a student application for a recruitment posting.
     *
     * @param recruitmentId ID of the recruitment posting
     * @param clubName      Club name
     * @param role          Role applied for
     * @param studentName   Applicant's name
     * @param studentEmail  Applicant's email
     * @param motivation    Applicant's motivation statement
     * @return The newly created Application
     */
    public Application applyToClub(String recruitmentId, String clubName, String role,
                                   String studentName, String studentEmail, String motivation) {
        Application app = new Application();
        app.setId(applicationIdSeq.getAndIncrement());
        app.setRecruitmentId(recruitmentId != null ? recruitmentId : "");
        app.setClubName(clubName     != null ? clubName     : "");
        app.setRole(role             != null ? role         : "");
        app.setStudentName(studentName  != null ? studentName  : "");
        app.setStudentEmail(studentEmail != null ? studentEmail : "");
        app.setMotivation(motivation  != null ? motivation  : "");
        app.setAppliedAt(LocalDateTime.now().toString());
        app.setStatus("PENDING");
        applications.add(app);
        return app;
    }
}
