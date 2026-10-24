using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Models;

namespace Zumrah.Api.Features.Students;

public class StudentService
{
    private readonly ZumrahDbContext _db;

    public StudentService(ZumrahDbContext db)
    {
        _db = db;
    }

    public async Task<Student?> GetProfileAsync(Guid studentId)
    {
        return await _db.Students
            .Include(s => s.Major)
                .ThenInclude(m => m.College)
            .Include(s => s.Major)
                .ThenInclude(m => m.ChatRoom)
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.StudentId == studentId);
    }
}
