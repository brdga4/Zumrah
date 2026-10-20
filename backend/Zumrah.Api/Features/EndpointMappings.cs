using Zumrah.Api.Features.Auth.Student.Registration;
using Zumrah.Api.Features.Auth.Admin.Login;
using Zumrah.Api.Features.Auth.Student.Login;
using Zumrah.Api.Features.Academics;


namespace Zumrah.Api.Features;

public static class EndpointMappings
{
    public static IEndpointRouteBuilder MapAllEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapRegisterStudentEndpoint();
        app.MapAdminLoginEndpoint();
        app.MapLoginStudentEndpoint();
        app.MapGetCollegesEndpoint();

        return app;
    }
}
