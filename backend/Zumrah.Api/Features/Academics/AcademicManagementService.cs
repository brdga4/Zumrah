
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using Zumrah.Api.Data;
using Zumrah.Api.Models;
using Zumrah.Api.Models.Enums;
using Zumrah.Api.Features.Academics.DTOs;

namespace Zumrah.Api.Features.Academics;

public class AcademicManagementService
{
    private readonly ZumrahDbContext _db;

    public AcademicManagementService(ZumrahDbContext db)
    {
        _db = db;
    }

    public async Task<CreateCollegeResponse?> CreateCollegeAsync(
        string collegeName,
        Guid adminId)
    {
        collegeName = collegeName.Trim();

        if (string.IsNullOrWhiteSpace(collegeName) ||
            collegeName.Length > 200)
        {
            throw new ArgumentException("Invalid college name.");
        }

        bool exists = await _db.Colleges
            .AnyAsync(c => c.CollegeName == collegeName);

        if (exists)
        {
            return null;
        }

        var college = new College
        {
            CollegeId = Guid.NewGuid(),
            CollegeName = collegeName,
            CreatedByAdminId = adminId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Colleges.Add(college);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1062 })
        {
            _db.Entry(college).State = EntityState.Detached;
            return null;
        }

        return new CreateCollegeResponse
        {
            CollegeId = college.CollegeId,
            CollegeName = college.CollegeName,
            CreatedAt = college.CreatedAt
        };
    }

    public async Task<(College? College, bool Duplicate)> UpdateCollegeAsync(
        Guid collegeId,
        string collegeName,
        Guid adminId)
    {
        collegeName = collegeName.Trim();

        if (string.IsNullOrWhiteSpace(collegeName) ||
            collegeName.Length > 200)
        {
            throw new ArgumentException("Invalid college name.");
        }

        var college = await _db.Colleges
            .FirstOrDefaultAsync(c => c.CollegeId == collegeId);

        if (college is null)
        {
            return (null, false);
        }

        bool exists = await _db.Colleges
            .AnyAsync(c =>
                c.CollegeId != collegeId &&
                c.CollegeName == collegeName);

        if (exists)
        {
            return (null, true);
        }

        college.CollegeName = collegeName;
        college.UpdatedByAdminId = adminId;
        college.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1062 })
        {
            _db.Entry(college).State = EntityState.Detached;
            return (null, true);
        }

        return (college, false);
    }

    public async Task<(CreateMajorResponse? Major, bool CollegeNotFound, bool Duplicate)> CreateMajorAsync(
        Guid collegeId,
        string majorName,
        Guid adminId)
    {
        majorName = majorName.Trim();

        if (string.IsNullOrWhiteSpace(majorName) ||
            majorName.Length > 200)
        {
            throw new ArgumentException("Invalid major name.");
        }

        bool collegeExists = await _db.Colleges
            .AnyAsync(c => c.CollegeId == collegeId);

        if (!collegeExists)
        {
            return (null, true, false);
        }

        bool majorExists = await _db.Majors
            .AnyAsync(m =>
                m.CollegeId == collegeId &&
                m.MajorName == majorName);

        if (majorExists)
        {
            return (null, false, true);
        }

        var majorId = Guid.NewGuid();
        var chatRoomId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var major = new Major
        {
            MajorId = majorId,
            CollegeId = collegeId,
            MajorName = majorName,
            CreatedByAdminId = adminId,
            CreatedAt = createdAt
        };

        var chatRoom = new ChatRoom
        {
            ChatRoomId = chatRoomId,
            RoomType = RoomType.MAJOR,
            MajorId = majorId,
            CourseId = null,
            IsActive = true,
            CreatedAt = createdAt
        };

        _db.Majors.Add(major);
        _db.ChatRooms.Add(chatRoom);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1062 })
        {
            _db.Entry(major).State = EntityState.Detached;
            _db.Entry(chatRoom).State = EntityState.Detached;

            return (null, false, true);
        }

        return (new CreateMajorResponse
        {
            MajorId = majorId,
            CollegeId = collegeId,
            MajorName = majorName,
            ChatRoomId = chatRoomId,
            CreatedAt = createdAt
        }, false, false);
    }

    public async Task<(Major? Major, bool Duplicate)> UpdateMajorAsync(
        Guid majorId,
        string majorName,
        Guid adminId)
    {
        majorName = majorName.Trim();

        if (string.IsNullOrWhiteSpace(majorName) ||
            majorName.Length > 200)
        {
            throw new ArgumentException("Invalid major name.");
        }

        var major = await _db.Majors
            .FirstOrDefaultAsync(m => m.MajorId == majorId);

        if (major is null)
        {
            return (null, false);
        }

        bool exists = await _db.Majors
            .AnyAsync(m =>
                m.MajorId != majorId &&
                m.CollegeId == major.CollegeId &&
                m.MajorName == majorName);

        if (exists)
        {
            return (null, true);
        }

        major.MajorName = majorName;
        major.UpdatedByAdminId = adminId;
        major.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1062 })
        {
            _db.Entry(major).State = EntityState.Detached;
            return (null, true);
        }

        return (major, false);
    }
}
