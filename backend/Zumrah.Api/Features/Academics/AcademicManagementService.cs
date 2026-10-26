
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using Zumrah.Api.Data;
using Zumrah.Api.Models;
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
}
