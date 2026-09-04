package com.campusconnect.backend.service;

import com.campusconnect.backend.model.Application;
import com.campusconnect.backend.model.ClubNotice;
import com.campusconnect.backend.model.Recruitment;
import com.campusconnect.backend.repository.ApplicationRepository;
import com.campusconnect.backend.repository.ClubNoticeRepository;
import com.campusconnect.backend.repository.RecruitmentRepository;
import com.campusconnect.backend.repository.ClubPanelAssignmentRepository;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.model.ClubPanelAssignment;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.Club;
import com.campusconnect.backend.repository.ClubRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ClubService – Business logic for club notices, recruitment, and applications.
 *
 * MVC Role: Service (sits between Controller and Repository)
 *
 * Phase 3: Persisted via JPA to Neon PostgreSQL.
 * Tables: "club_notices", "recruitments", "club_applications"
 *
 * Seed data is inserted once on first startup using @PostConstruct with count() guards.
 */
@Service
public class ClubService {

    private final ClubNoticeRepository   noticeRepo;
    private final RecruitmentRepository  recruitRepo;
    private final ApplicationRepository  appRepo;
    private final ClubPanelAssignmentRepository panelRepo;
    private final AppUserRepository userRepo;
    private final ClubRepository clubRepo;

    public ClubService(ClubNoticeRepository noticeRepo,
                       RecruitmentRepository recruitRepo,
                       ApplicationRepository appRepo,
                       ClubPanelAssignmentRepository panelRepo,
                       AppUserRepository userRepo,
                       ClubRepository clubRepo) {
        this.noticeRepo  = noticeRepo;
        this.recruitRepo = recruitRepo;
        this.appRepo     = appRepo;
        this.panelRepo   = panelRepo;
        this.userRepo    = userRepo;
        this.clubRepo    = clubRepo;
    }

    // ── Seed data on first startup ────────────────────────────────
    /**
     * Inserts seed data if the tables are empty.
     * Uses count() == 0 guards so it only runs once per fresh database.
     */
    @PostConstruct
    @Transactional
    public void seedData() {
        if (clubRepo.count() == 0) {
            clubRepo.saveAll(List.of(
                    new Club("Coding Club"), new Club("Debate Society"), new Club("Music Club"),
                    new Club("Photography Club"), new Club("Robotics Club")
            ));
        }
        // ── Seed Notices ────────────────────────────────────────
        if (noticeRepo.count() == 0) {
            ClubNotice n1 = new ClubNotice();
            n1.setClubName("Robotics Club");
            n1.setTitle("Annual Robo-Wars Competition 2026");
            n1.setBody("We are excited to announce the Annual Robo-Wars Competition! All students are welcome to participate. Teams of 2–4 members. Register before August 10th at the club office.");
            n1.setPostedBy("Admin");
            n1.setPostedAt("2026-07-20T10:00:00");
            n1.setPinned(true);
            noticeRepo.save(n1);

            ClubNotice n2 = new ClubNotice();
            n2.setClubName("Photography Club");
            n2.setTitle("Campus Photo Walk – This Saturday");
            n2.setBody("Join us for a guided photo walk around the campus grounds this Saturday at 7:00 AM. Bring your cameras or smartphones. All skill levels welcome!");
            n2.setPostedBy("Admin");
            n2.setPostedAt("2026-07-21T14:30:00");
            n2.setPinned(false);
            noticeRepo.save(n2);

            ClubNotice n3 = new ClubNotice();
            n3.setClubName("Debate Society");
            n3.setTitle("Inter-University Debate — Call for Participants");
            n3.setBody("The Debate Society is representing our university at the National Inter-University Debate Championship. Tryouts will be held on July 28th in Auditorium A. Prepare a 3-minute speech on the topic: 'AI in Education'.");
            n3.setPostedBy("Admin");
            n3.setPostedAt("2026-07-22T09:15:00");
            n3.setPinned(true);
            noticeRepo.save(n3);

            ClubNotice n4 = new ClubNotice();
            n4.setClubName("Coding Club");
            n4.setTitle("Hackathon 2026 — Team Registration Open");
            n4.setBody("CampusConnect Hackathon 2026 registrations are now open! Form teams of 2–4 and compete to build the best university app in 24 hours. Prizes worth 50,000 BDT! Register at the Coding Club booth.");
            n4.setPostedBy("Admin");
            n4.setPostedAt("2026-07-25T10:00:00");
            n4.setPinned(true);
            noticeRepo.save(n4);

            ClubNotice n5 = new ClubNotice();
            n5.setClubName("Music Club");
            n5.setTitle("Jamming Session – Open to All");
            n5.setBody("The Music Club is hosting an open jamming session this Friday at 5:00 PM in the Cultural Center. Bring your instruments or just your love of music. All genres welcome!");
            n5.setPostedBy("Admin");
            n5.setPostedAt("2026-07-26T16:00:00");
            n5.setPinned(false);
            noticeRepo.save(n5);
        }

        // ── Seed Recruitments ───────────────────────────────────
        if (recruitRepo.count() == 0) {
            Recruitment r1 = new Recruitment();
            r1.setClubName("Robotics Club");
            r1.setRole("Mechanical Engineer");
            r1.setDescription("Looking for students with hands-on experience in mechanical design, CAD tools, or 3D printing. Work on real competition robots!");
            r1.setDeadline("2026-08-25");
            r1.setSlots(5);
            r1.setPostedAt("2026-07-19T11:00:00");
            r1.setActive(true);
            recruitRepo.save(r1);

            Recruitment r2 = new Recruitment();
            r2.setClubName("Photography Club");
            r2.setRole("Event Photographer");
            r2.setDescription("We need passionate photographers to cover university events. Basic DSLR knowledge required. Equipment provided for official events.");
            r2.setDeadline("2026-08-30");
            r2.setSlots(3);
            r2.setPostedAt("2026-07-20T16:00:00");
            r2.setActive(true);
            recruitRepo.save(r2);

            Recruitment r3 = new Recruitment();
            r3.setClubName("Coding Club");
            r3.setRole("Full Stack Developer");
            r3.setDescription("Building a university app? Join us! We need React & Spring Boot developers. Contribute to real projects used by students.");
            r3.setDeadline("2026-08-28");
            r3.setSlots(8);
            r3.setPostedAt("2026-07-21T12:00:00");
            r3.setActive(true);
            recruitRepo.save(r3);

            Recruitment r4 = new Recruitment();
            r4.setClubName("Debate Society");
            r4.setRole("Debater / Speaker");
            r4.setDescription("Sharpen your critical thinking and public speaking skills by joining the competitive debate team. Represent our university at national championships.");
            r4.setDeadline("2026-08-20");
            r4.setSlots(6);
            r4.setPostedAt("2026-07-22T09:00:00");
            r4.setActive(true);
            recruitRepo.save(r4);

            Recruitment r5 = new Recruitment();
            r5.setClubName("Music Club");
            r5.setRole("Guitarist / Keyboardist");
            r5.setDescription("Looking for talented musicians to join our performance band. Must be able to read sheet music or tabs. Practice sessions twice a week.");
            r5.setDeadline("2026-08-15");
            r5.setSlots(2);
            r5.setPostedAt("2026-07-23T14:00:00");
            r5.setActive(true);
            recruitRepo.save(r5);
        }
    }

    // ── Notice operations ──────────────────────────────────────────

    /**
     * Returns all notices sorted: pinned first, then by posted date descending.
     */
    public List<ClubNotice> getAllNotices() {
        return noticeRepo.findAllByOrderByPinnedDescPostedAtDesc();
    }

    /**
     * Creates and stores a new club notice.
     *
     * @param clubName  Club posting the notice
     * @param title     Notice title
     * @param body      Full notice content
     * @return The newly created ClubNotice
     */
    @Transactional
    public ClubNotice postNotice(String clubName, String title, String body, String postedBy) {
        requireClub(clubName);
        ClubNotice notice = new ClubNotice();
        notice.setClubName(clubName != null ? clubName : "Unknown Club");
        notice.setTitle(title       != null ? title    : "Untitled Notice");
        notice.setBody(body         != null ? body     : "");
        notice.setPostedBy(postedBy);
        notice.setPostedAt(LocalDateTime.now().toString());
        notice.setPinned(false);
        return noticeRepo.save(notice);
    }

    @Transactional
    public ClubNotice updateNotice(Long id, String title, String body) {
        ClubNotice notice = noticeRepo.findById(id).orElseThrow(() -> notFound("Notice"));
        if (title != null && !title.isBlank()) notice.setTitle(title.trim());
        if (body != null && !body.isBlank()) notice.setBody(body.trim());
        return noticeRepo.save(notice);
    }

    @Transactional public void deleteNotice(Long id) { noticeRepo.delete(noticeRepo.findById(id).orElseThrow(() -> notFound("Notice"))); }
    public ClubNotice getNotice(Long id) { return noticeRepo.findById(id).orElseThrow(() -> notFound("Notice")); }
    @Transactional public ClubNotice pinNotice(Long id, boolean pinned) { ClubNotice n=getNotice(id); n.setPinned(pinned); return noticeRepo.save(n); }

    // ── Recruitment operations ─────────────────────────────────────

    /**
     * Returns all active recruitment postings.
     */
    public List<Recruitment> getActiveRecruitments() {
        return recruitRepo.findByActiveTrue().stream()
                .sorted(java.util.Comparator.comparing(Recruitment::isPinned).reversed()
                        .thenComparing(Recruitment::getPostedAt, java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .toList();
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
    @Transactional
    public Recruitment postRecruitment(String clubName, String role,
                                       String description, String deadline, int slots) {
        requireClub(clubName);
        Recruitment posting = new Recruitment();
        posting.setClubName(clubName       != null ? clubName    : "Unknown Club");
        posting.setRole(role               != null ? role        : "Member");
        posting.setDescription(description != null ? description : "");
        posting.setDeadline(deadline       != null ? deadline    : LocalDate.now().plusWeeks(2).toString());
        posting.setSlots(slots);
        posting.setPostedAt(LocalDateTime.now().toString());
        posting.setActive(true);
        posting.setPinned(false);
        return recruitRepo.save(posting);
    }

    public Recruitment getRecruitment(Long id) { return recruitRepo.findById(id).orElseThrow(() -> notFound("Recruitment")); }
    @Transactional public Recruitment updateRecruitment(Long id, String role, String description, String deadline, Integer slots) {
        Recruitment r=getRecruitment(id);
        if(role!=null&&!role.isBlank()) r.setRole(role.trim()); if(description!=null&&!description.isBlank()) r.setDescription(description.trim());
        if(deadline!=null&&!deadline.isBlank()) r.setDeadline(deadline); if(slots!=null&&slots>0) r.setSlots(slots);
        return recruitRepo.save(r);
    }
    @Transactional public void deleteRecruitment(Long id) { recruitRepo.delete(getRecruitment(id)); }
    @Transactional public Recruitment pinRecruitment(Long id, boolean pinned) { Recruitment r=getRecruitment(id); r.setPinned(pinned); return recruitRepo.save(r); }

    public List<ClubPanelAssignment> getAssignments() { return panelRepo.findAll(); }
    public List<ClubPanelAssignment> getAssignments(String studentId) { return panelRepo.findByStudentIdIgnoreCaseOrderByClubName(studentId); }
    public boolean managesClub(String userId, String clubName) { return panelRepo.existsByStudentIdIgnoreCaseAndClubNameIgnoreCase(userId, clubName); }
    @Transactional public ClubPanelAssignment assign(String studentId, String clubName, String adminId) {
        AppUser user=userRepo.findByUserId(studentId.toUpperCase()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Student not found."));
        if(!"STUDENT".equalsIgnoreCase(user.getRole())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Only students can be panel members.");
        if(clubName==null||clubName.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Club name is required.");
        requireClub(clubName);
        if(managesClub(user.getUserId(),clubName)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Student is already assigned to this club.");
        ClubPanelAssignment a=new ClubPanelAssignment(); a.setStudentId(user.getUserId()); a.setClubName(clubName.trim()); a.setAssignedBy(adminId); a.setAssignedAt(LocalDateTime.now().toString()); return panelRepo.save(a);
    }
    @Transactional public void removeAssignment(Long id) { panelRepo.deleteById(id); }
    public List<Application> getApplications(String clubName) { return appRepo.findByClubNameIgnoreCaseOrderByAppliedAtDesc(clubName); }
    public List<Club> getClubs() { return clubRepo.findByActiveTrueOrderByNameAsc(); }

    private void requireClub(String clubName) {
        if (clubName == null || !clubRepo.existsByNameIgnoreCaseAndActiveTrue(clubName.trim()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a valid active club.");
    }

    private ResponseStatusException notFound(String kind) { return new ResponseStatusException(HttpStatus.NOT_FOUND, kind+" not found."); }

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
    @Transactional
    public Application applyToClub(String recruitmentId, String clubName, String role,
                                   String studentName, String studentEmail, String motivation) {
        Application app = new Application();
        app.setRecruitmentId(recruitmentId != null ? recruitmentId : "");
        app.setClubName(clubName           != null ? clubName      : "");
        app.setRole(role                   != null ? role          : "");
        app.setStudentName(studentName     != null ? studentName   : "");
        app.setStudentEmail(studentEmail   != null ? studentEmail  : "");
        app.setMotivation(motivation       != null ? motivation    : "");
        app.setAppliedAt(LocalDateTime.now().toString());
        app.setStatus("PENDING");
        return appRepo.save(app);
    }
}
