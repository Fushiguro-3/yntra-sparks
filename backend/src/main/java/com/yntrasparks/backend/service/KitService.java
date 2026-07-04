package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.KitRequest;
import com.yntrasparks.backend.dto.request.VideoRequest;
import com.yntrasparks.backend.dto.response.KitResponse;
import com.yntrasparks.backend.entity.*;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.exception.UnauthorizedException;
import com.yntrasparks.backend.repository.*;
import com.yntrasparks.backend.security.filter.JwtAuthDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class KitService {

    private final KitRepository kitRepository;
    private final CategoryRepository categoryRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolKitRepository schoolKitRepository;

    public KitService(KitRepository kitRepository,
                      CategoryRepository categoryRepository,
                      SchoolRepository schoolRepository,
                      SchoolKitRepository schoolKitRepository) {
        this.kitRepository = kitRepository;
        this.categoryRepository = categoryRepository;
        this.schoolRepository = schoolRepository;
        this.schoolKitRepository = schoolKitRepository;
    }

    // Super Admin — see all active kits
    public Page<KitResponse> getAllKits(Pageable pageable) {
        return kitRepository.findByStatus(Kit.KitStatus.ACTIVE, pageable)
                .map(KitResponse::from);
    }

    // Principal / Teacher — see only their school's purchased kits
    public Page<KitResponse> getSchoolKits(Pageable pageable) {
        Long schoolId = getCurrentUserSchoolId();
        return kitRepository.findBySchoolId(schoolId, pageable)
                .map(KitResponse::from);
    }

    // Single kit detail — enforces school boundary for Principal/Teacher
    public KitResponse getKitById(Long kitId) {
        Kit kit = findKitById(kitId);
        String role = getCurrentUserRole();

        if (!role.equals("SUPER_ADMIN")) {
            Long schoolId = getCurrentUserSchoolId();
            if (!kitRepository.existsBySchoolIdAndKitId(schoolId, kitId)) {
                throw new UnauthorizedException(
                        "You do not have access to this kit");
            }
        }

        return KitResponse.from(kit);
    }

    @Transactional
    public KitResponse createKit(KitRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category", request.getCategoryId()));

        Kit kit = new Kit();
        kit.setTitle(request.getTitle());
        kit.setDescription(request.getDescription());
        kit.setThumbnailUrl(request.getThumbnailUrl());
        kit.setCategory(category);

        if (request.getVideos() != null) {
            List<Video> videos = buildVideos(request.getVideos(), kit);
            kit.setVideos(videos);
        }

        return KitResponse.from(kitRepository.save(kit));
    }

    @Transactional
    public KitResponse updateKit(Long id, KitRequest request) {
        Kit kit = findKitById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category", request.getCategoryId()));

        kit.setTitle(request.getTitle());
        kit.setDescription(request.getDescription());
        kit.setThumbnailUrl(request.getThumbnailUrl());
        kit.setCategory(category);

        // Replace videos entirely — clear existing, add new ones
        kit.getVideos().clear();
        if (request.getVideos() != null) {
            List<Video> videos = buildVideos(request.getVideos(), kit);
            kit.getVideos().addAll(videos);
        }

        return KitResponse.from(kitRepository.save(kit));
    }

    @Transactional
    public void archiveKit(Long id) {
        Kit kit = findKitById(id);
        kit.setStatus(Kit.KitStatus.ARCHIVED);
        kitRepository.save(kit);
    }

    // Assign a kit to a school (Super Admin)
    @Transactional
    public void assignKitToSchool(Long schoolId, Long kitId) {
        if (schoolKitRepository.existsBySchoolIdAndKitId(schoolId, kitId)) {
            throw new IllegalArgumentException(
                    "School already has access to this kit");
        }

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School", schoolId));

        Kit kit = findKitById(kitId);

        schoolKitRepository.save(new SchoolKit(school, kit));
    }

    // Revoke a school's access to a kit (Super Admin)
    @Transactional
    public void revokeKitFromSchool(Long schoolId, Long kitId) {
        if (!schoolKitRepository.existsBySchoolIdAndKitId(schoolId, kitId)) {
            throw new ResourceNotFoundException(
                    "School does not have access to kit with id: " + kitId);
        }
        schoolKitRepository.deleteBySchoolIdAndKitId(schoolId, kitId);
    }

    // Private helpers
    private Kit findKitById(Long id) {
        return kitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kit", id));
    }

    private List<Video> buildVideos(List<VideoRequest> videoRequests, Kit kit) {
        List<Video> videos = new ArrayList<>();
        for (VideoRequest vr : videoRequests) {
            Video video = new Video();
            video.setKit(kit);
            video.setTitle(vr.getTitle());
            video.setYoutubeVideoId(vr.getYoutubeVideoId());
            video.setSequence(vr.getSequence());
            videos.add(video);
        }
        return videos;
    }

    private JwtAuthDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (JwtAuthDetails) auth.getDetails();
    }

    private Long getCurrentUserSchoolId() {
        Long schoolId = getCurrentUserDetails().getSchoolId();
        if (schoolId == null) {
            throw new UnauthorizedException("No school associated with this account");
        }
        return schoolId;
    }

    private String getCurrentUserRole() {
        return getCurrentUserDetails().getRole();
    }
}