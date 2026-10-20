using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Academics.DTOs;

namespace Zumrah.Api.Features.Academics;

public static class GetCollegesEndpoint
{
    public static IEndpointRouteBuilder MapGetCollegesEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/colleges", GetColleges)
            .AllowAnonymous();

        return app;
    }

    private static async Task<IResult> GetColleges(
        ZumrahDbContext db)
    {
        // Get all colleges and their majors
        var colleges = await db.Colleges
            .Include(c => c.Majors)
            .AsNoTracking()
            .OrderBy(c => c.CollegeName)
            .ToListAsync();

        // Fill the response DTO
        var response = new GetCollegesResponse
        {
            Colleges = colleges.Select(c => new CollegeItemResponse
            {
                CollegeId = c.CollegeId,
                CollegeName = c.CollegeName,

                Majors = c.Majors
                    .OrderBy(m => m.MajorName)
                    .Select(m => new MajorItemResponse
                    {
                        MajorId = m.MajorId,
                        MajorName = m.MajorName
                    })
                    .ToList()
            }).ToList()
        };

        return Results.Ok(response);
    }
}
