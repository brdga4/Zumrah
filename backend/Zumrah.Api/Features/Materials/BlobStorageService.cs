using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Zumrah.Api.Features.Materials;

public class BlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(BlobServiceClient blobServiceClient, IConfiguration configuration)
    {
        var containerName = configuration["BlobStorage:ContainerName"]
            ?? throw new InvalidOperationException(
                "Blob storage container name is missing.");

        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
    }

    public async Task UploadAsync(Stream content, string blobPath, string contentType,
    CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(blobPath);

        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            },
            Conditions = new BlobRequestConditions
            {
                IfNoneMatch = ETag.All
            }
        };

        await blobClient.UploadAsync(content, options, cancellationToken);
    }

    public async Task<Stream> DownloadAsync(string blobPath, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(blobPath);

        var download = await blobClient.DownloadStreamingAsync(
            cancellationToken: cancellationToken);

        return download.Value.Content;
    }

    public async Task DeleteAsync(string blobPath, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(blobPath);

        await blobClient.DeleteIfExistsAsync(
            cancellationToken: cancellationToken);
    }
}
