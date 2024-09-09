namespace CremealServer.Models.Requests
{
    public class DeleteUserRequest
    {
        public int UserId { get; set; }
        public string? Email { get; set; }
    }
}
