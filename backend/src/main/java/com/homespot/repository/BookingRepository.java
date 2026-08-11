package com.homespot.repository;

import com.homespot.model.Booking;
import com.homespot.model.Property;
import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByTenant(User tenant);

    @Query("SELECT b FROM Booking b WHERE b.tenant.id = :tenantId")
    List<Booking> findByTenantId(@Param("tenantId") String tenantId);

    List<Booking> findByPropertyIn(List<Property> properties);

    @Query("SELECT b FROM Booking b WHERE b.property.id = :propertyId AND b.id <> :bookingId AND b.status IN :statuses")
    List<Booking> findByPropertyIdAndIdNotAndStatusIn(@Param("propertyId") String propertyId,
                                                     @Param("bookingId") String bookingId,
                                                     @Param("statuses") List<String> statuses);
}
