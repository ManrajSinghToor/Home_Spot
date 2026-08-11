package com.homespot.repository;

import com.homespot.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    @Query("{ 'tenant': ?0 }")
    List<Booking> findByTenantId(String tenantId);

    @Query("{ 'property': { $in: ?0 } }")
    List<Booking> findByPropertyIdIn(List<String> propertyIds);

    @Query("{ 'property': ?0, '_id': { $ne: ?1 }, 'status': { $in: ?2 } }")
    List<Booking> findByPropertyIdAndIdNotAndStatusIn(String propertyId, String bookingId, List<String> statuses);
}
