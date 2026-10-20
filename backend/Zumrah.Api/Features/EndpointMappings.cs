using Zumrah.Api.Features.Auth.Student.Registration;
using Zumrah.Api.Features.Auth.Student.Login;

namespace Zumrah.Api.Features;

public static class EndpointMappings
{
    public static IEndpointRouteBuilder MapAllEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapRegisterStudentEndpoint();
        app.MapLoginStudentEndpoint();
        return app;
    }
}
