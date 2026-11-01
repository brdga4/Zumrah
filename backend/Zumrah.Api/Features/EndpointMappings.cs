using Zumrah.Api.Features.Auth.Student.Registration;
using Zumrah.Api.Features.Auth.Admin.Login;
using Zumrah.Api.Features.Auth.Student.Login;
using Zumrah.Api.Features.Academics;
using Zumrah.Api.Features.Students;
using Zumrah.Api.Features.Courses;
using Zumrah.Api.Features.Materials;
using Zumrah.Api.Features.Chat;
using Zumrah.Api.Features.Moderation;


namespace Zumrah.Api.Features;

public static class EndpointMappings
{
    public static IEndpointRouteBuilder MapAllEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapRegisterStudentEndpoints();
        app.MapAdminLoginEndpoint();
        app.MapLoginStudentEndpoint();
        app.MapGetCollegesEndpoint();
        app.MapStudentProfileEndpoints();
        app.MapGetAvailableCoursesEndpoint();
        app.MapGetEnrolledCoursesEndpoint();
        app.MapCreateEnrollmentEndpoint();
        app.MapDeleteEnrollmentEndpoint();
        app.MapAdminAcademicEndpoints();
        app.MapCourseFileEndpoints();
        app.MapAdminFileReviewEndpoints();
        app.MapChatHistoryEndpoints();
        app.MapReportMessageEndpoints();

        return app;
    }
}
