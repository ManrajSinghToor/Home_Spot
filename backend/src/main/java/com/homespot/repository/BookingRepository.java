package com.homespot.repository;

import com.homespot.model.Booking;
import com.homespot.model.Property;
import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByTenant(User tenant);
    List<Booking> findByTenantId(String tenantId);
    List<Booking> findByPropertyIn(List<Property> properties);
    List<Booking> findByPropertyIdAndIdNotAndStatusIn(String propertyId, String id, List<String> statuses);
}
