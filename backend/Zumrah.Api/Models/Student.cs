namespace Zumrah.Api.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public string Email { get; set; } = "";
    public decimal Gpa { get; set; }
}
