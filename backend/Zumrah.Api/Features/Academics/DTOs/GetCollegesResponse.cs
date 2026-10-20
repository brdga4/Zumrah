namespace Zumrah.Api.Features.Academics.DTOs;

public class GetCollegesResponse
{
    public List<CollegeItemResponse> Colleges { get; set; } = [];
}

public class CollegeItemResponse
{
    public Guid CollegeId { get; set; }
    public string CollegeName { get; set; } = string.Empty;
    public List<MajorItemResponse> Majors { get; set; } = [];
}

public class MajorItemResponse
{
    public Guid MajorId { get; set; }
    public string MajorName { get; set; } = string.Empty;
}
