namespace CremealServer.Models.Requests
{
    public class BulkEmailRequest
    {
        public List<string> Emails { get; set; }
        public string Body { get; set; }
        public string Subject { get; set; }
        public string Title { get; set; }
    }
}
