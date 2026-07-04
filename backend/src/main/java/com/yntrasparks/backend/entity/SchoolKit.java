package com.yntrasparks.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "school_kit")
public class SchoolKit {

    @EmbeddedId
    private SchoolKitId id = new SchoolKitId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("schoolId")
    @JoinColumn(name = "school_id")
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("kitId")
    @JoinColumn(name = "kit_id")
    private Kit kit;

    @Column(name = "purchased_at", nullable = false)
    private LocalDateTime purchasedAt;

    public SchoolKit() {}

    public SchoolKit(School school, Kit kit) {
        this.school = school;
        this.kit = kit;
        this.id.setSchoolId(school.getId());
        this.id.setKitId(kit.getId());
        this.purchasedAt = LocalDateTime.now();
    }

    public SchoolKitId getId() { return id; }
    public School getSchool() { return school; }
    public Kit getKit() { return kit; }
    public LocalDateTime getPurchasedAt() { return purchasedAt; }

    @Embeddable
    public static class SchoolKitId implements java.io.Serializable {
        @Column(name = "school_id")
        private Long schoolId;

        @Column(name = "kit_id")
        private Long kitId;

        public SchoolKitId() {}

        public Long getSchoolId() { return schoolId; }
        public Long getKitId() { return kitId; }
        public void setSchoolId(Long schoolId) { this.schoolId = schoolId; }
        public void setKitId(Long kitId) { this.kitId = kitId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof SchoolKitId)) return false;
            SchoolKitId that = (SchoolKitId) o;
            return java.util.Objects.equals(schoolId, that.schoolId) &&
                   java.util.Objects.equals(kitId, that.kitId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(schoolId, kitId);
        }
    }
}